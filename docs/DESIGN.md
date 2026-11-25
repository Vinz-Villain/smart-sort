# Spesifikasi Sistem Desain UI/UX: SmartSort Dashboard (DESIGN.md)

Dokumen ini merupakan panduan resmi sistem desain, palet warna, tipografi, anatomi komponen, dan aturan tata letak antarmuka untuk **SmartSort IoT & AI Web Dashboard**. Sistem ini mengusung identitas visual **AirLume Modern Minimalist IoT Dashboard** yang menggabungkan estetika teknologi tinggi, kejelasan data telemetri, dan tata letak *bento grid* yang bersih.

---

## 1. Filosofi & Karakter Visual

- **Tema Utama**: *Light Botanical Eco-Minimalist IoT & Edge AI Dashboard*.
- **Karakter Antarmuka**:
  - **Hero Area**: *Light Botanical Fluted White* (`#fafdfb`) dengan garis arsitektural vertikal lembut (*fluted ribs*), pendaran hijau lembut (*ambient green glow*), serta tipografi dua nada (*charcoal* & hijau *sage* `#4a7c59`).
  - **Body / Konten Data**: *Clean Mint-Tinted Canvas* (`#f8fbf9`) yang menyatu mulus dengan hero, memberikan kontras tinggi dan nyaman dipantau dalam jangka waktu panjang.
- **Bentuk & Geometri**:
  - Sudut lengkung besar: `rounded-2xl` (16px) hingga `rounded-3xl` (24px) pada bingkai showcase, kartu bertumpuk, dan modal.
  - Elemen pil (*pills*): `rounded-full` untuk badge status, tombol CTA hijau *glossy* (`.btn-eco-pill`) dengan lingkaran ikon putih, dan indikator perangkat.
- **Kedalaman Visual**:
  - Perpaduan kartu putih bersih (`shadow-airlume-card`), bingkai *Before/After & Live Camera* dengan border emerald bercahaya (`shadow-botanical-glow`), dan kartu carousel bertumpuk (*glassmorphic botanical card*).

---

## 2. Palet Warna & Design Tokens

### 2.1 Warna Fondasi (Surface & Canvas)
| Token / Kelas | Kode Warna | Penggunaan |
| :--- | :--- | :--- |
| **Canvas Background** | `#f8fbf9` | Latar belakang seluruh halaman di bawah hero. |
| **Hero Background** (`bg-fluted-green`) | `#fafdfb` | Latar hero banner putih bersih dengan radial glow hijau lembut & garis vertikal (*fluted ribs*). |
| **Card White** | `#ffffff` | Latar belakang kartu monitoring, tabel, dan form. |
| **Botanical Glass Card** (`glass-botanical-card`) | `rgba(255, 255, 255, 0.94)` | Kartu carousel bertumpuk dengan border `rgba(52, 211, 153, 0.5)` dan backdrop blur (20px). |
| **Slate Borders** | `border-slate-200/80` | Garis tepi halus pemisah kartu bento dan tabel. |

### 2.2 Warna Aksen Utama
| Token | Nilai Tailwind | Penggunaan |
| :--- | :--- | :--- |
| **Glossy Eco Pill** (`.btn-eco-pill`) | Gradient `#5ed655 → #2eb344 → #1d8a34` | Tombol CTA hero & akses Operator dengan efek bevel mengilap dan lingkaran ikon putih. |
| **Sage Headline Accent** | `#4a7c59` | Penekanan kata kunci hijau alami pada judul hero dan counter dinamis. |
| **Primary Accent** | `bg-emerald-600` (`#059669`) | Tombol aksi panel data, filter aktif, dan indikator status aktif. |
| **Secondary Eco Accent** | `bg-teal-50 text-teal-900` | Badge akurasi AI pada tabel agar tetap kontras dengan kategori sampah. |

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
  - Logo SmartSort: Gambar wordmark resmi `src/assets/smartsort-logo.png` transparan (*Smart* hijau + *S[bin]rt*).
  - Menu Tengah Minimalis: 3 tautan teks bersih (`Monitoring`, `Riwayat Log`, `Diagnostik`) dengan indikator dot emerald aktif.
  - Status Controller: Pill kanan `ESP32: Online` dengan dot pulse emerald, serta badge statis non-interaktif `Admin` saat berhasil masuk ke dashboard `/adminnnn`.
- **Hero Centerpiece**:
  - Badge pill: Dot pulse emerald dengan teks *"Sistem Aktif • IoT & Edge AI"*.
  - Headline H1: Tipografi dua warna (*charcoal* + hijau *sage*) dengan ikon daun 3D mengilap di tengah kalimat.
  - Tombol CTA: *"Lihat Monitoring"* bergaya `.btn-eco-pill` dengan lingkaran ikon putih di sisi kanan.

### 4.2 Showcase Kartu Telemetri Responsif
- **Mobile (`< 768px`) — Carousel Kartu Bertumpuk & Gesture Swipe**:
  - Menampilkan 1 kartu fokus bertumpuk (`.glass-botanical-card`) dengan dukungan **touch swipe kiri/kanan** (`onTouchStart`/`onTouchMove`/`onTouchEnd`), tombol panah `<` `>`, serta indikator dot untuk berpindah antar 4 informasi:
    1. **Ringkasan Klasifikasi AI**: Total sampah terpilah dan counter kategori (Organik, Anorganik, Residu).
    2. **Scanning Kamera OV2640**: Pratinjau live stream ESP32-CAM yang dapat diakses publik dengan *scanner reticles* dan tombol refresh.
    3. **Status Aktuator Servo SG90**: Sudut flap aktif (`0°`, `90°`, `180°`) dan indikator kategori target.
    4. **Sensor Lingkungan IoT**: Pembacaan real-time suhu `DHT11` dan kadar gas `MQ-135`.
- **Tablet & Desktop (`>= 768px`) — Grid Terbuka 2×2 / 4-Kolom**:
  - Seluruh 4 kartu telemetri ditampilkan sekaligus secara berdampingan (`md:grid-cols-2 lg:grid-cols-4`) tanpa perlu menekan panah agar operator PC/laptop dapat memantau semua informasi secara langsung.

### 4.3 Navigasi Segmented Control
Di atas setiap tampilan data, terdapat kontrol pil responsif untuk beralih antara 3 mode kerja:
- **Monitoring** (`Gauge` icon)
- **Riwayat Log** (`BarChart3` icon + counter jumlah data)
- **Diagnostik** (`Sliders` icon)

### 4.4 Panel Monitoring
- **Bento 7-Kolom (Kapasitas Kompartemen)**: Progress bar dinamis 0–100% untuk ketiga wadah dengan status badge otomatis (*Tersedia, Waspada, Penuh*) dan tombol *Kosongkan Wadah* (khusus rute `/adminnnn`).
- **Bento 5-Kolom (Proporsi Sampah)**: ChartJS Doughnut dengan cutout 72%, legend di bawah berformat dot bullet, dan 3 pill persentase di footer.
- **Tabel Aktivitas Terbaru**: Tabel 5 baris terakhir yang memperbarui data secara dinamis saat ada sampah baru terdeteksi.

### 4.5 Panel Riwayat Log
- **Toolbar Filter & Search**: Tombol filter kategori instan (*All, Organik, Anorganik, Residu*), kolom input pencarian ID/waktu dengan ikon search, tombol ekspor CSV, dan tombol reset log (khusus rute `/adminnnn`).
- **Tabel Dataset**: Sticky header, pembatas baris halus, dan badge status *Tersortir* berwarna emerald.

### 4.6 Panel Diagnostik
- **Gerbang PIN Halaman `/adminnnn`**: Saat mengakses `/adminnnn` sebelum terotentikasi, modal PIN 6-digit langsung muncul sebelum halaman admin ditampilkan; setelah PIN terverifikasi, operator dapat langsung menggerakkan servo tanpa diminta PIN ulang.
- **Kotak Uji Servo (Khusus Rute `/adminnnn`)**: 3 tombol sudut besar (0° Organik, 90° Anorganik, 180° Residu) dengan animasi *active:scale-95*. Tidak ditampilkan pada website publik (`/`).
- **Kotak Frame Kamera (Publik)**: Tampilan snapshot mandiri resolusi penuh yang dapat diakses publik tanpa PIN.

### 4.7 Notifikasi & Dialog Modal
- **Floating Toast**: Muncul di sudut kanan atas dengan backdrop blur, icon penanda (Centang emerald untuk sukses, Segitiga merah untuk galat), dan animasi slide-in.
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
