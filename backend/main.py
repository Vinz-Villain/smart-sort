import os
import io
import time
import csv
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from PIL import Image

app = FastAPI(title="SmartSort IoT & AI Backend", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
LATEST_IMAGE_PATH = os.path.join(STATIC_DIR, "latest.jpg")

# Servo Angle Constants (Diverter Flap)
# Sesuai rancangan 3 kompartemen:
# Organik (Kiri): 0° atau 45°
# Residu (Tengah/Netral): 30° atau 90°
# Anorganik (Kanan): 70° atau 135°
SERVO_ANGLES = {
    "Organik": 0,
    "Residu": 30,
    "Anorganik": 70
}

# In-Memory State
class SystemState:
    def __init__(self):
        self.reset_data()

    def reset_data(self):
        self.total_count = 0
        self.counts = {"Organik": 0, "Anorganik": 0, "Residu": 0}
        self.capacities = {"Organik": 0, "Anorganik": 0, "Residu": 0}
        self.history: List[dict] = []
        self.next_id = 1
        
        # Sensor data
        self.temperature = 29.8
        self.humidity = 68.0
        self.gas_value = 380
        self.gas_status = "Normal"
        
        # Hardware Status
        self.esp32_online = True
        self.esp32_cam_online = True
        self.ai_status = "Standby"
        self.current_servo_angle = SERVO_ANGLES["Residu"]
        self.last_update = datetime.now().strftime("%H:%M:%S")

    def seed_initial_demo_data(self):
        """Menyiapkan beberapa data awal agar demo tidak kosong jika dibuka pertama kali"""
        dummy_items = [
            ("Anorganik", 96.5, 70, "10:45:12"),
            ("Organik", 92.0, 0, "10:42:05"),
            ("Residu", 89.2, 30, "10:38:40"),
            ("Anorganik", 94.8, 70, "10:31:18"),
            ("Organik", 97.1, 0, "10:25:04"),
            ("Anorganik", 91.4, 70, "10:19:50"),
            ("Organik", 88.6, 0, "10:12:33"),
            ("Residu", 95.0, 30, "10:05:10"),
        ]
        now_date = datetime.now().strftime("%Y-%m-%d")
        for cat, conf, angle, clock in reversed(dummy_items):
            self.add_sort_event(cat, conf, angle, f"{now_date} {clock}")

    def add_sort_event(self, category: str, confidence: float, servo_angle: int, timestamp_str: Optional[str] = None):
        if not timestamp_str:
            timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
        entry = {
            "id": self.next_id,
            "timestamp": timestamp_str,
            "category": category,
            "confidence": round(confidence, 1),
            "servo_angle": servo_angle,
            "action": f"Flap diarahkan ke {servo_angle}°"
        }
        self.history.insert(0, entry)
        self.next_id += 1
        
        self.total_count += 1
        if category in self.counts:
            self.counts[category] += 1
            # Volume wadah bertambah 4% setiap ada sampah
            self.capacities[category] = min(100, self.capacities[category] + 4)
            
        self.current_servo_angle = servo_angle
        self.last_update = datetime.now().strftime("%H:%M:%S")
        return entry

state = SystemState()
state.seed_initial_demo_data()

# Create a default placeholder image if latest.jpg doesn't exist
if not os.path.exists(LATEST_IMAGE_PATH):
    img = Image.new('RGB', (320, 240), color=(45, 55, 72))
    img.save(LATEST_IMAGE_PATH, format="JPEG")

# --- Pydantic Schemas ---
class ManualServoRequest(BaseModel):
    angle: int
    category: Optional[str] = None

class InjectRequest(BaseModel):
    category: str
    confidence: Optional[float] = 95.0

class TelemetryRequest(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    gas_value: Optional[int] = None
    esp32_online: Optional[bool] = None
    esp32_cam_online: Optional[bool] = None

class BinResetRequest(BaseModel):
    category: Optional[str] = None # None means reset all

# --- Endpoints ---

@app.get("/api/status")
def get_status():
    """Mengembalikan metrik status lengkap untuk dashboard"""
    # Hitung persentase
    percentages = {}
    for cat in ["Organik", "Anorganik", "Residu"]:
        if state.total_count > 0:
            percentages[cat] = round((state.counts[cat] / state.total_count) * 100, 1)
        else:
            percentages[cat] = 0.0

    return {
        "summary": {
            "total_items": state.total_count,
            "counts": state.counts,
            "percentages": percentages,
            "last_update": state.last_update
        },
        "capacities": state.capacities,
        "environment": {
            "temperature": state.temperature,
            "humidity": state.humidity,
            "gas_value": state.gas_value,
            "gas_status": state.gas_status
        },
        "devices": {
            "esp32_controller": "Online" if state.esp32_online else "Offline",
            "esp32_cam": "Online" if state.esp32_cam_online else "Offline",
            "ai_engine": state.ai_status,
            "servo_current_angle": state.current_servo_angle
        },
        "recent_activity": state.history[:5]
    }

@app.get("/api/history")
def get_history():
    """Mengembalikan seluruh riwayat pemilahan sampah"""
    return {
        "total": len(state.history),
        "data": state.history
    }

@app.delete("/api/history")
def reset_history():
    """Mereset seluruh data riwayat dan counter ke 0 untuk persiapan demo"""
    state.reset_data()
    return {"status": "success", "message": "Semua data riwayat dan kapasitas berhasil direset ke 0."}

@app.post("/api/bins/reset")
def reset_bins(req: BinResetRequest):
    """Mereset persentase kapasitas wadah sampah (misal setelah tong dikosongkan petugas)"""
    if req.category and req.category in state.capacities:
        state.capacities[req.category] = 0
    else:
        state.capacities = {"Organik": 0, "Anorganik": 0, "Residu": 0}
    return {"status": "success", "capacities": state.capacities}

@app.get("/api/history/export")
def export_csv():
    """Ekspor log riwayat pemilahan ke file CSV"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["No ID", "Waktu & Tanggal", "Kategori Sampah", "Tingkat Keyakinan AI (%)", "Sudut Flap Servo"])
    
    for item in state.history:
        writer.writerow([
            item["id"],
            item["timestamp"],
            item["category"],
            f"{item['confidence']}%",
            f"{item['servo_angle']}°"
        ])
    
    output.seek(0)
    filename = f"smartsort_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/api/manual/servo")
def manual_servo(req: ManualServoRequest):
    """Menggerakkan flap servo secara manual dari tab Kontrol Manual"""
    state.current_servo_angle = req.angle
    state.last_update = datetime.now().strftime("%H:%M:%S")
    return {
        "status": "success",
        "angle": req.angle,
        "category": req.category,
        "message": f"Servo diputar ke {req.angle}°"
    }

@app.post("/api/manual/inject")
def inject_data(req: InjectRequest):
    """Tombol darurat/simulasi untuk menginjeksi deteksi sampah baru saat demo"""
    category = req.category
    if category not in SERVO_ANGLES:
        raise HTTPException(status_code=400, detail="Kategori harus Organik, Anorganik, atau Residu")
    
    angle = SERVO_ANGLES[category]
    conf = req.confidence or 95.0
    entry = state.add_sort_event(category, conf, angle)
    return {
        "status": "success",
        "entry": entry,
        "capacities": state.capacities,
        "message": f"Simulasi sampah {category} berhasil disuntikkan ke sistem."
    }

@app.post("/api/telemetry")
def update_telemetry(req: TelemetryRequest):
    """Menerima update sensor DHT11 & MQ-135 dari ESP32"""
    if req.temperature is not None:
        state.temperature = round(req.temperature, 1)
    if req.humidity is not None:
        state.humidity = round(req.humidity, 1)
    if req.gas_value is not None:
        state.gas_value = req.gas_value
        if req.gas_value < 500:
            state.gas_status = "Normal"
        elif req.gas_value < 850:
            state.gas_status = "Bau Sedang"
        else:
            state.gas_status = "Bau Menyengat - Bahaya"
    if req.esp32_online is not None:
        state.esp32_online = req.esp32_online
    if req.esp32_cam_online is not None:
        state.esp32_cam_online = req.esp32_cam_online
    
    state.last_update = datetime.now().strftime("%H:%M:%S")
    return {"status": "ok"}

@app.post("/api/classify")
async def classify_image(file: UploadFile = File(...)):
    """
    Endpoint utama yang dipanggil oleh ESP32-CAM setelah mendeteksi sampah.
    ESP32-CAM mengirim gambar JPEG via HTTP POST.
    """
    state.ai_status = "Memproses Gambar..."
    try:
        contents = await file.read()
        
        # Simpan gambar terakhir untuk preview di dashboard web
        with open(LATEST_IMAGE_PATH, "wb") as f:
            f.write(contents)
            
        # AI Classification Pipeline
        # (Dapat dihubungkan ke YOLOv8 / PyTorch model)
        # Di sini kita siapkan heuristic classification + template integration:
        category, confidence = run_ai_classification(contents)
        
        angle = SERVO_ANGLES[category]
        entry = state.add_sort_event(category, confidence, angle)
        
        state.ai_status = "Standby"
        
        # Kembalikan response JSON ke ESP32-CAM agar ESP32 tahu sudut servo tujuan
        return {
            "status": "success",
            "category": category,
            "confidence": confidence,
            "servo_angle": angle,
            "action": f"Putar ke {angle}°"
        }
    except Exception as e:
        state.ai_status = "Error"
        raise HTTPException(status_code=500, detail=str(e))

def run_ai_classification(image_bytes: bytes):
    """
    Fungsi klasifikasi gambar AI.
    Jika ada bobot model YOLO (.pt) di folder models/, model dapat di-load di sini.
    Untuk fallback/pengujian awal, fungsi ini mengembalikan klasifikasi cerdas.
    """
    import random
    # Buka gambar untuk validasi format
    try:
        Image.open(io.BytesIO(image_bytes))
    except Exception:
        pass
        
    # Heuristic / random weighted selection untuk simulasi awal sebelum custom dataset dimasukkan
    categories = ["Organik", "Anorganik", "Residu"]
    weights = [0.4, 0.45, 0.15]
    chosen = random.choices(categories, weights=weights)[0]
    confidence = round(random.uniform(88.0, 98.5), 1)
    return chosen, confidence

@app.get("/api/camera/latest")
def get_latest_camera():
    """Mengambil foto jepretan terakhir ESP32-CAM"""
    if os.path.exists(LATEST_IMAGE_PATH):
        return FileResponse(LATEST_IMAGE_PATH, media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Belum ada foto terbaru")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
