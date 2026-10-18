# ♻️ SmartSort - IoT & AI Smart Waste Classifier

Sistem pemilah sampah pintar otomatis berbasis **ESP32-CAM**, sensor ultrasonik **HC-SR04**, **Servo Motor SG90**, dan **Computer Vision AI Server (FastAPI)** dengan **Dashboard Monitoring React (Tailwind CSS)**.

---

## 📁 Struktur Direktori

```text
D:\smart_sort\
├── backend\
│   ├── main.py              # REST API FastAPI + Handler Klasifikasi AI
│   ├── requirements.txt     # Dependensi Python
│   └── static\              # Direktori penyimpanan snapshot foto kamera terbaru
├── frontend\
│   ├── src\
│   │   ├── App.jsx          # Dashboard React 3 Tab (Live, History, Diagnosis)
│   │   ├── main.jsx         # Entry point React Vite
│   │   └── index.css        # Tailwind CSS
│   ├── package.json
│   └── tailwind.config.js
├── esp32_firmware\
│   └── smart_sort_esp32_cam.ino # Kode Arduino ESP32-CAM (Kamera + Ultrasonik + Servo)
├── run_backend.bat          # Double-click untuk jalankan server backend
├── run_frontend.bat         # Double-click untuk jalankan dashboard website
└── README.md
```

---

## 🔌 Wiring & Pinout Hardware (ESP32-CAM AI-Thinker)

| Komponen | Pin Komponen | Pin ESP32-CAM | Catatan Penting |
| :--- | :--- | :--- | :--- |
| **HC-SR04** | `VCC` | `5V` | Sumber daya sensor |
| | `GND` | `GND` | Ground bersama |
| | `TRIG` | `GPIO 13` | Sinyal pulsa trigger |
| | `ECHO` | `GPIO 12` | Gunakan voltage divider ke 3.3V jika HC-SR04 tipe 5V |
| **Servo flap SG90** | `VCC` (Merah) | `5V` eksternal | Gunakan catu daya servo yang stabil dan satukan GND dengan ESP32-CAM |
| | `GND` (Cokelat) | `GND` bersama | Ground bersama |
| | `PWM` (Oranye) | `GPIO 14` | Sinyal kendali sudut flap |
| **Servo pendorong SG90** | `VCC` (Merah) | `5V` eksternal | Sebaiknya gunakan catu daya servo yang sama dan cukup arus |
| | `GND` (Cokelat) | `GND` bersama | Ground bersama ESP32-CAM |
| | `PWM` (Oranye) | `GPIO 4` | GPIO22 dipakai kamera sebagai PCLK; GPIO4 juga terhubung ke LED flash |

> Pindahkan kabel sinyal servo pendorong dari GPIO22 ke GPIO4. Jangan gunakan GPIO22 untuk servo karena pin itu diperlukan kamera.

### Sudut Flap Diverter (Sesuai Desain 3D):
* **0°** : Menghadap ke **Organik** (Kiri)
* **30°**: Posisi **Netral / Residu** (Tengah)
* **70°**: Menghadap ke **Anorganik** (Kanan)

---

## 💻 Panduan Menjalankan Sistem

### 1. Jalankan Backend (FastAPI)
Double-click file `run_backend.bat` atau jalankan via terminal:
```bash
cd D:\smart_sort\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* **API URL**: `http://localhost:8000`
* **Swagger API Docs**: `http://localhost:8000/docs`

### 2. Jalankan Frontend (React Dashboard)
Double-click file `run_frontend.bat` atau jalankan via terminal:
```bash
cd D:\smart_sort\frontend
npm run dev
```
* Buka browser di: `http://localhost:5173`

### 3. Upload Kode ke ESP32-CAM
1. Buka Arduino IDE.
2. Buka file [smart_sort_esp32_cam.ino](file:///D:/smart_sort/esp32_firmware/smart_sort_esp32_cam.ino).
3. Install library via Library Manager:
   * **ArduinoJson** (oleh Benoit Blanchon)
   * **ESP32Servo** (oleh Kevin Harrington)
4. Pilih board: **AI Thinker ESP32-CAM**.
5. Sesuaikan SSID Wi-Fi, Password, dan IP Laptop Anda pada baris konfigurasi:
   ```cpp
   const char* ssid = "NAMA_WIFI_ANDA";
   const char* password = "PASSWORD_WIFI_ANDA";
   const char* serverUrl = "http://192.168.1.xxx:8000/api/classify";
   ```
6. Hubungkan GPIO 0 ke GND untuk mode flashing, lalu upload kode.

---

## 🎯 Fitur Dashboard Web (3 Tab Navigasi)

1. **Dashboard Utama (Live Monitoring)**:
   * 3 Kartu Metrik: Total Sampah Masuk, Suhu & Kelembapan (DHT11), Status Gas / Bau (MQ-135).
   * 3 Bilah Kapasitas Wadah Dinamis (0–100%) dengan indikator warna (Aman, Waspada, Penuh).
   * Diagram Proporsi AI (Doughnut Chart) komposisi sampah.
   * Tabel aktivitas pemilahan 5 item terakhir secara real-time.
2. **Riwayat & Log Pemilahan (History)**:
   * Tabel riwayat lengkap dengan filter kategori & pencarian.
   * Tombol **Unduh CSV / Excel** untuk bukti laporan pengujian.
   * Tombol **Reset Data / Kosongkan Log** sebelum memulai demo penguji.
3. **Kontrol Manual & Diagnosis (Plan B / Demo Saver)**:
   * **Manual Servo Override**: Tombol uji sudut 0° (Organik), 30° (Residu), 70° (Anorganik).
   * **Camera Frame Test**: Preview gambar snapshot terakhir dari kamera ESP32-CAM.
   * **Quick Data Injector**: Tombol darurat menyuntikkan sampah jika sensor fisik terkendala di depan penguji.
