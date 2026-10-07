/**
 * ==============================================================================
 * PROYEK: SMARTSORT IoT - ESP32-CAM + HC-SR04 + SERVO SG90
 * ==============================================================================
 * Fungsi:
 * 1. Membaca sensor Ultrasonik HC-SR04 di corong input.
 * 2. Jika objek terdeteksi dengan jarak < 20 cm:
 *    - Tunggu sesaat agar objek tenang di corong.
 *    - Ambil foto frame JPEG dari kamera OV2640.
 *    - Kirimkan foto via HTTP POST multipart/form-data ke Laptop AI Server.
 * 3. Menerima respon JSON dari server: {"category": "...", "servo_angle": 0/30/70}
 * 4. Menggerakkan Servo SG90 (Flap / Diverter) ke sudut yang ditentukan:
 *    - Organik   : 0°
 *    - Residu    : 30°
 *    - Anorganik : 70°
 * 5. Memberi jeda 2.5 detik agar sampah jatuh ke wadah, lalu mengembalikan flap ke netral.
 * ==============================================================================
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Library: ArduinoJson by Benoit Blanchon (v6 atau v7)
#include <ESP32Servo.h>  // Library: ESP32Servo by Kevin Harrington

// ==================== KONFIGURASI WIFI & SERVER ====================
const char* ssid = "NAMA_WIFI_ANDA";             // Ganti dengan SSID Wi-Fi / Hotspot HP
const char* password = "PASSWORD_WIFI_ANDA";     // Ganti dengan Password Wi-Fi
const char* serverUrl = "http://192.168.1.100:8000/api/classify"; // Ganti IP dengan IP Laptop Anda!

// ==================== PIN DEFINITIONS ====================
// HC-SR04 Ultrasonic Sensor
#define TRIG_PIN 13
#define ECHO_PIN 12

// Servo Motor SG90
#define SERVO_PIN 14

// Ambang batas jarak sensor ultrasonik (cm)
#define DISTANCE_THRESHOLD_CM 20.0
#define NEUTRAL_SERVO_ANGLE 30 // Posisi netral / tengah

Servo flapServo;

// ==================== PIN CAMERA MODEL AI THINKER ====================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Cooldown timer agar tidak spam trigger
unsigned long lastTriggerTime = 0;
const unsigned long COOLDOWN_MS = 4000; // 4 detik jeda antar pemilahan

// ==================== FUNGSI BACA JARAK ULTRASONIK ====================
float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // Timeout 30ms (~5 meter)
  if (duration == 0) return 999.0; // Tidak ada pantulan terdeteksi
  
  float distance = (duration * 0.0343) / 2.0;
  return distance;
}

// ==================== FUNGSI KIRIM FOTO KE SERVER ====================
bool sendPhotoToServer(camera_fb_t *fb, int &targetAngle, String &category) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERR] Wi-Fi terputus!");
    return false;
  }

  Serial.println("[INFO] Mengirim foto ke AI Server...");
  HTTPClient http;
  http.begin(serverUrl);
  
  String boundary = "----WebKitFormBoundarySmartSort7MA4YWxkTrZu0gW";
  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

  String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"trash.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--" + boundary + "--\r\n";

  size_t totalLen = head.length() + fb->len + tail.length();
  uint8_t *payload = (uint8_t *)malloc(totalLen);
  if (!payload) {
    Serial.println("[ERR] Gagal alokasi buffer memori untuk upload foto");
    http.end();
    return false;
  }

  memcpy(payload, head.c_str(), head.length());
  memcpy(payload + head.length(), fb->buf, fb->len);
  memcpy(payload + head.length() + fb->len, tail.c_str(), tail.length());

  int httpCode = http.POST(payload, totalLen);
  free(payload);

  if (httpCode == HTTP_CODE_OK || httpCode == 200) {
    String response = http.getString();
    Serial.println("[RES] Respon Server: " + response);

    // Parsing JSON Respon
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);
    if (!error) {
      targetAngle = doc["servo_angle"] | NEUTRAL_SERVO_ANGLE;
      category = doc["category"] | "Unknown";
      http.end();
      return true;
    } else {
      Serial.println("[ERR] Gagal parsing JSON respon");
    }
  } else {
    Serial.printf("[ERR] Gagal POST ke server! HTTP Code: %d\n", httpCode);
  }

  http.end();
  return false;
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- MEMULAI SISTEM SMARTSORT ---");

  // Inisialisasi Pin Ultrasonik
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Inisialisasi Servo
  ESP32PWM::allocateTimer(0);
  flapServo.setPeriodHertz(50); // Standar 50Hz servo
  flapServo.attach(SERVO_PIN, 500, 2400);
  flapServo.write(NEUTRAL_SERVO_ANGLE); // Set posisi netral awal
  Serial.println("[INFO] Servo diatur ke posisi Netral");

  // Inisialisasi Kamera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Format frame QVGA / CIF agar upload cepat ke laptop
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA; // 640x480
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA; // 320x240
    config.jpeg_quality = 14;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[ERR] Inisialisasi Kamera Gagal: 0x%x\n", err);
    return;
  }
  Serial.println("[INFO] Kamera OV2640 Siap");

  // Hubungkan ke Wi-Fi
  Serial.printf("[WIFI] Menghubungkan ke %s ", ssid);
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 25) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Terhubung! IP ESP32: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WIFI] Gagal terhubung Wi-Fi. Cek SSID/Password!");
  }
}

// ==================== LOOP UTAMA ====================
void loop() {
  // Cek apakah waktu saat ini sudah melewati masa cooldown
  if (millis() - lastTriggerTime > COOLDOWN_MS) {
    float dist = readUltrasonicDistance();

    // Deteksi jika sampah masuk (< 20 cm)
    if (dist > 0.5 && dist < DISTANCE_THRESHOLD_CM) {
      Serial.printf("[SENSOR] Sampah terdeteksi! Jarak: %.1f cm\n", dist);
      
      // Beri jeda 300ms agar posisi sampah stabil di corong
      delay(300);

      // Ambil snapshot gambar
      camera_fb_t *fb = esp_camera_fb_get();
      if (!fb) {
        Serial.println("[ERR] Pengambilan foto gagal");
        return;
      }

      int targetAngle = NEUTRAL_SERVO_ANGLE;
      String category = "";

      // Kirim ke server AI
      bool success = sendPhotoToServer(fb, targetAngle, category);
      esp_camera_fb_return(fb);

      if (success) {
        Serial.printf("[AKSI] Kategori: %s -> Gerakkan Flap Servo ke %d°\n", category.c_str(), targetAngle);
        flapServo.write(targetAngle);

        // Tunggu 2.5 detik agar sampah meluncur masuk ke kompartemen
        delay(2500);

        // Kembalikan ke posisi netral
        flapServo.write(NEUTRAL_SERVO_ANGLE);
        Serial.println("[AKSI] Flap dikembalikan ke posisi netral");
      }

      lastTriggerTime = millis();
    }
  }

  delay(100); // Polling ultrasonik setiap 100ms
}
