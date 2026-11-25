# Spesifikasi Sistem Desain UI/UX: SmartSort Dashboard (DESIGN.md)

Dokumen ini merupakan panduan resmi sistem desain, palet warna, tipografi, anatomi komponen, dan aturan tata letak antarmuka untuk **SmartSort IoT & AI Web Dashboard**. Sistem ini mengusung identitas visual **AirLume Modern Minimalist IoT Dashboard** yang menggabungkan estetika teknologi tinggi, kejelasan data telemetri, dan tata letak *bento grid* yang bersih.

---

## 1. Filosofi & Karakter Visual

- **Tema Utama**: *Precision IoT & Edge AI Environmental Dashboard*.
- **Karakter Antarmuka**:
  - **Hero Area**: *Deep Fluted Navy* (`#060b24`) yang mencerminkan pusat kendali cerdas berteknologi tinggi dengan aksen pendaran cahaya (*ambient glow*) biru elektrik.
  - **Body / Konten Data**: *Clean Off-White Canvas* (`#f6f8fd`) yang memberikan ruang bernapas luas, kontras tinggi, dan nyaman dipantau dalam jangka waktu panjang di laboratorium atau ruang kendali.
- **Bentuk & Geometri**:
  - Sudut lengkung besar: `rounded-2xl` (16px) hingga `rounded-3xl` (24px) pada kartu bento, tombol aksi, dan modal.
  - Elemen pil (*pills*): `rounded-full` untuk badge status, tombol navigasi tab, dan indikator perangkat.
- **Kedalaman Visual**:
  - Perpaduan antara kartu putih dengan bayangan lembut berdimensi (`shadow-airlume-card`) dan kartu gelap tembus pandang (*glassmorphism*) dengan pendaran neon cyan (`glass-airlume-dark` & `shadow-airlume-glow`).

---

## 2. Palet Warna & Design Tokens

### 2.1 Warna Fondasi (Surface & Canvas)
| Token / Kelas | Kode Warna | Penggunaan |
| :--- | :--- | :--- |
| **Canvas Background** | `#f6f8fd` | Latar belakang seluruh halaman di bawah hero. |
| **Hero Background** (`bg-fluted-blue`) | `#060b24` | Latar hero banner dengan radial gradient & garis vertikal (*fluted ribs*). |
| **Card White** | `#ffffff` | Latar belakang kartu bento monitoring, tabel, dan form. |
| **Card Dark Glass** (`glass-airlume-dark`) | `rgba(10, 22, 58, 0.65)` | Kartu bento aktuator servo dengan backdrop blur (24px). |
| **Slate Borders** | `border-slate-200/80` | Garis tepi halus pemisah kartu bento dan tabel. |

### 2.2 Warna Aksen Utama
| Token | Nilai Tailwind | Penggunaan |
| :--- | :--- | :--- |
| **Primary Accent** | `bg-blue-600` (`#2563eb`) | Tombol CTA utama, badge aktif, switch tab terpilih. |
| **Primary Hover** | `bg-blue-500` / `hover:bg-blue-700` | State hover pada tombol interaktif. |
| **Neon Cyan Accent** | `text-cyan-300` / border `rgba(56, 189, 248, 0.45)` | Aksen data aktuator, sudut servo, dan garis lintasan flap. |

### 2.3 Skema Warna Kategori Sampah (Hard Rule)
Warna kategori sampah **wajib sinkron 100%** dengan sudut fisik servo SG90:

| Kategori | Sudut Servo | Warna Utama | Badge Styling | Bar Kapasitas |
| :--- | :---: | :--- | :--- | :--- |
| **Organik** | **0°** (Kiri) | `emerald-500` (`#10b981`) | `bg-emerald-50 text-emerald-700 border-emerald-200/80` | `bg-emerald-500` |
| **Anorganik** | **90°** (Tengah) | `amber-500` (`#f59e0b`) | `bg-amber-50 text-amber-700 border-amber-200/80` | `bg-amber-500` |
| **Residu** | **180°** (Kanan) | `rose-500` (`#f43f5e`) | `bg-rose-50 text-rose-700 border-rose-200/80` | `bg-rose-500` |

### 2.4 Indikator Ambang Batas Kapasitas Wadah
- **Tersedia (0% - 50%)**: `bg-emerald-500` (Aman, label *Tersedia*).
- **Waspada (51% - 80%)**: `bg-amber-500` (Hati-hati, label *Waspada*).
- **Penuh (> 80%)**: `bg-rose-500` (Kritis, label *Penuh* - threshold pengosongan di 85%).

---

## 3. Sistem Tipografi

Font resmi proyek adalah **`Plus Jakarta Sans`** (didukung oleh sistem fallbacks `-apple-system, BlinkMacSystemFont, sans-serif`).

| Level | Ukuran & Weight | Kelas Tailwind | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Display H1** | 36px–48px / Bold 700 | `text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight` | Judul utama hero banner. |
| **Stat Display** | 30px–36px / Bold 700 | `text-3xl sm:text-4xl font-bold tracking-tight tabular-nums` | Angka total sampah terpilah. |
| **Card Header** | 16px–18px / Bold 700 | `text-sm sm:text-base font-bold text-slate-900` | Judul kartu bento dan tab view. |
| **Subhead / Label**| 12px–13px / Semibold 600| `text-xs font-semibold text-slate-500` | Subjudul kartu, header tabel, label tombol. |
| **Body Text** | 12px–14px / Regular 400| `text-xs sm:text-sm text-slate-600 font-normal leading-relaxed`| Paragraf deskripsi dan teks modal. |
| **Monospace** | 10px–11px / Medium 500 | `font-mono text-[10px] sm:text-[11px] tabular-nums` | Waktu log, timestamp sensor, sudut derajat. |

---

## 4. Anatomi Komponen Antarmuka

### 4.1 Header & Hero Section
- **Navbar**:
  - Logo SmartSort.Ai: Icon `Trash2` stroke 2.2 dengan latar gradient `from-blue-600 to-indigo-500` di dalam wadah `rounded-2xl`.
  - Menu Segmented Center: 3 pill tab (`Monitoring`, `Riwayat Log`, `Kontrol Manual`) dalam wadah transparan `bg-white/5 border border-white/10 rounded-full`.
  - Status Controller: Pill kanan yang menampilkan status real-time mikrokontroler (`ESP32: Online`).
- **Hero Centerpiece**:
  - Badge pill: `Sparkles` icon dengan teks *"Sort Smarter With SmartSort.Ai"*.
  - Tombol CTA: *"Lihat Monitoring Sistem"* dengan efek *hover arrow translation* dan pendaran bayangan biru.

### 4.2 Tiga Kartu Showcase Bento (Signature AirLume)
1. **Kartu Statistik (Kiri - Putih)**:
   - Menampilkan total sampah secara masif dengan badge status *• Siap*.
   - 3 baris pill ringkasan: Organik (hijau), Anorganik (oranye), Residu (merah) dengan angka terformat tabular.
2. **Kartu Scanner Vision AI (Tengah - Putih)**:
   - Badge akurasi sirkuler 98%.
   - Pratinjau streaming rasio `aspect-video` dari modul kamera OV2640 dengan border biru tipis, tombol *refresh snapshot*, dan tag monospaced di sudut bawah.
3. **Kartu Status Aktuator (Kanan - Dark Glass Neon)**:
   - Latar kaca gelap `glass-airlume-dark` dengan pendaran `shadow-airlume-glow`.
   - Pembacaan sudut servo besar (*SERVO → X°*).
   - Jalur trajektori visual garis putus-putus dengan ikon panah meluncur menuju sudut tujuan (0°, 90°, 180°).
   - Metrik sensor lingkungan DHT11 (°C) dan Gas MQ-135 (PPM).

### 4.3 Navigasi Segmented Control
Di atas setiap tampilan data, terdapat kontrol pil responsif untuk beralih antara 3 mode kerja:
- **Monitoring** (`Gauge` icon)
- **Riwayat Log** (`BarChart3` icon + counter jumlah data)
- **Diagnostik** (`Sliders` icon)

### 4.4 Panel Monitoring
- **Bento 7-Kolom (Kapasitas Kompartemen)**: Progress bar dinamis 0–100% untuk ketiga wadah dengan status badge otomatis (*Tersedia, Waspada, Penuh*) dan tombol *Kosongkan Wadah*.
- **Bento 5-Kolom (Proporsi Sampah)**: ChartJS Doughnut dengan cutout 72%, legend di bawah berformat dot bullet, dan 3 pill persentase di footer.
- **Tabel Aktivitas Terbaru**: Tabel 5 baris terakhir yang memperbarui data secara dinamis saat ada sampah baru terdeteksi.

### 4.5 Panel Riwayat Log
- **Toolbar Filter & Search**: Tombol filter kategori instan (*All, Organik, Anorganik, Residu*), kolom input pencarian ID/waktu dengan ikon search, tombol ekspor CSV, dan tombol reset log.
- **Tabel Dataset**: Sticky header, pembatas baris halus, dan badge status *Tersortir* berwarna emerald.

### 4.6 Panel Diagnostik
- **Kotak Uji Servo**: 3 tombol sudut besar (0° Organik, 90° Anorganik, 180° Residu) dengan animasi *active:scale-95*.
- **Kotak Frame Kamera**: Tampilan snapshot mandiri resolusi penuh untuk kalibrasi posisi kamera.

### 4.7 Notifikasi & Dialog Modal
- **Floating Toast**: Muncul di sudut kanan atas dengan backdrop blur, icon penanda (Centang biru untuk sukses, Segitiga merah untuk galat), dan animasi slide-in.
- **Modal Konfirmasi**: Kotak dialog terpusat dengan backdrop overlay gelap (`bg-slate-950/50 backdrop-blur-sm`) untuk mencegah ketidaksengajaan reset data.

---

## 5. Responsivitas & Standar Mobile-First

1. **Breakpoints Tailwind**:
   - Mobile: Default (`< 640px`) — Layout 1 kolom vertikal, ukuran teks proporsional.
   - Tablet: `sm:` (`>= 640px`) & `md:` (`>= 768px`) — Showcase cards 3 kolom seimbang.
   - Desktop: `lg:` (`>= 1024px`) — Bento grid asimetris 7-kolom dan 5-kolom.
2. **Touch Targets**:
   - Seluruh tombol memiliki area sentuh minimal `py-2 px-3` (tinggi minimal ~38-44px) untuk kemudahan operasional pada layar sentuh/tablet.
3. **Table Scrolling**:
   - Seluruh tabel wajib dibungkus dalam kontainer `overflow-x-auto` dengan `min-w-[500px]` hingga `min-w-[620px]` untuk mencegah tampilan tabel terpotong pada layar ponsel.
