# Pedoman AI Coding Agent (AGENTS.md)

Dokumen ini merupakan panduan instruksi utama untuk Autonomous Coding Agents (seperti Hermes Agent, Claude Code, Cursor, Copilot Workspace, Antigravity) saat berinteraksi, membaca, memelihara, dan mengembangkan codebase `smart-sort`.

---

## 1. Identitas & Ikhtisar Proyek

- **Nama Repositori**: `smart-sort`
- **Fungsi Utama**: Web Dashboard SPA (Single Page Application) untuk visualisasi telemetri, pemantauan kapasitas wadah sampah real-time, penelusuran riwayat pemilahan, dan kontrol manual sistem IoT Smart Waste Sorter berbasis ESP32-CAM & AI Classifier.
- **Arsitektur Proyek**: **100% Pure Frontend Web Dashboard** (Decoupled / terpisah dari backend dan firmware mikrokontroler).
- **Stack Teknologi**: React 19, Vite, Tailwind CSS v3, Chart.js (react-chartjs-2), Lucide React Icons, Axios.
- **Repositori Terkait dalam Ekosistem**:
  - `smartsort-backend`: Backend REST API (FastAPI, YOLOv8 nano, PostgreSQL Neon, Docker).
  - `smartsort-firmware`: Firmware Arduino ESP32-CAM (`smart_sort_esp32_cam.ino`).
- **Endpoint Backend**:
  - Produksi: `https://smartsort.ezzar.my.id` (dikonfigurasi via `.env` atau Vite proxy `/api`).
  - Lokal: `http://localhost:8088` atau `http://localhost:8000`.

---

## 2. Aturan Emas Penulisan Kode (Golden Rules)

### 1. Kepatuhan Wajib pada Spesifikasi Desain (`docs/DESIGN.md`) — *Hard Rule*
- Setiap perubahan tampilan, penambahan komponen baru, atau penataan ulang layout **WAJIB mematuhi spesifikasi desain resmi di [docs/DESIGN.md](file:///home/naufal/Documents/my-projects/iot_ken/smart-sort/docs/DESIGN.md)**.
- **Dilarang keras**:
  - Mengubah skema warna kategori sampah (Organik: `emerald-500` / 0°, Anorganik: `amber-500` / 90°, Residu: `rose-500` / 180°).
  - Menghapus atau mengganti identitas visual **AirLume Modern Minimalist** (`bg-fluted-blue`, `shadow-airlume-card`, `glass-airlume-dark`, `shadow-airlume-glow`).
  - Mengubah font utama `Plus Jakarta Sans` ke font generik lain.
  - Mengabaikan responsivitas *mobile-first* (breakpoint `sm:`, `md:`, `lg:`).

### 2. Batas Panjang File (File Length Limits) — *Hard Rule*
- **Maksimal panjang per file adalah ~300 baris kode (dengan batas toleransi mutlak di 400 baris)**.
- **Dilarang keras** membuat file monolitik atau menumpuk ratusan baris kode baru ke dalam file yang sudah ada.
- Jika sebuah file mendekati atau melebihi 300 baris:
  - Ekstraksi bagian komponen menjadi sub-komponen baru di folder terkait.
  - Pindahkan logika manipulasi data/format ke `src/utils/`.
  - Pindahkan konfigurasi atau konstanta ke `src/constants/`.
  - Pindahkan pemanggilan HTTP ke `src/api/`.

### 3. Modularitas Komponen & Fitur Baru — *Hard Rule*
- Setiap kali menambahkan halaman (*page*), tab, panel, atau fitur baru, komponen **wajib dipecah secara modular**:
  - Komponen tampilan (*Presentational Component*) harus terisolasi dan hanya menerima data via `props`.
  - Komponen orkestrator/kontainer mengelola state dan mendelegasikan aksi.
  - Komponen UI kecil yang dapat digunakan ulang (seperti Badge, Modal, Card, Button) harus ditempatkan di `src/components/common/` atau `src/components/ui/`.

### 4. Pemisahan API Service Layer
- **Dilarang** memanggil `axios.get(...)` atau `axios.post(...)` secara mentah di dalam file komponen UI.
- Semua interaksi jaringan wajib melalui `src/api/smartSortApi.js` yang memanfaatkan konfigurasi instance terpusat di `src/api/client.js`.
- Semua request yang memerlukan otentikasi wajib menyertakan header `X-API-Key` yang diambil dari environment variable `VITE_API_KEY`.

### 5. Praktik Bersih React 19 (Clean React Practices)
- Bersihkan semua timer polling (`clearInterval`) dan URL memori blob (`URL.revokeObjectURL`) pada fungsi cleanup `useEffect`.
- Hindari inisialisasi state impure saat render (gunakan fungsi lazy callback, contoh: `useState(() => Date.now())`).
- Hindari peringatan linter *unused imports*; hapus impor ikon atau variabel yang tidak digunakan sebelum commit.

---

## 3. Struktur Direktori & Konvensi Penamaan

```text
smart-sort/
├── docs/                     # Dokumentasi arsitektur & desain resmi (DESIGN.md)
├── public/                   # Aset statis favicon dan logo SVG
├── src/
│   ├── api/                  # HTTP Client & API service layer
│   │   ├── client.js         # Axios instance, baseURL, header auth
│   │   └── smartSortApi.js   # Abstraksi endpoint (/api/status, /api/history, dll.)
│   ├── components/
│   │   ├── common/           # Komponen reusable (Navbar, Footer, Toast, Modal)
│   │   ├── hero/             # Bagian hero banner & showcase cards
│   │   └── tabs/             # View per tab (MonitoringTab, HistoryTab, DiagnosisTab)
│   ├── constants/            # Nilai konstan (sudut servo, kategori, styling)
│   ├── utils/                # Helper murni (formatters, normalizer, color calculator)
│   ├── assets/               # Aset gambar / ikon internal
│   ├── App.jsx               # View coordinator utama (State tab & polling)
│   ├── index.css             # Tailwind CSS & custom design system classes
│   └── main.jsx              # React DOM render entry
├── .env.example              # Dokumentasi variabel lingkungan
├── .env.local                # Variabel lingkungan lokal (diabaikan git)
├── .gitignore                # Aturan file yang tidak dilacak git
├── package.json              # Dependencies & npm scripts
├── run_dev.bat               # Shortcut dev server Windows
├── tailwind.config.js        # Konfigurasi Tailwind
└── vite.config.js            # Konfigurasi Vite & backend proxy
```

### Konvensi Penamaan:
- **Komponen React**: PascalCase (contoh: `ShowcaseCards.jsx`, `MonitoringTab.jsx`).
- **File Utilities / Service**: camelCase (contoh: `smartSortApi.js`, `formatters.js`).
- **Konstanta Global**: SCREAMING_SNAKE_CASE di dalam `src/constants/index.js`.

---

## 4. Prosedur Pengujian & Verifikasi Wajib

Setiap agen yang menyelesaikan tugas atau membuat perubahan kode **WAJIB** menjalankan pengujian berikut sebelum melaporkan pekerjaan selesai:

```bash
# 1. Jalankan Linter (Oxlint) untuk memastikan 0 error dan tidak ada unused imports
npm run lint

# 2. Jalankan Production Build (Vite) untuk memastikan bundling bebas kendala
npm run build

# 3. Periksa status git untuk memastikan tidak ada file credential (.env.local) yang bocor
git status
```

---

## 5. Aturan Git Workflow

1. **Format Pesan Commit (Conventional Commits)**:
   - `feat: ...` untuk penambahan fitur atau komponen baru.
   - `fix: ...` untuk perbaikan bug atau error respons API.
   - `refactor: ...` untuk pemecahan modular atau restrukturisasi kode tanpa mengubah fungsionalitas.
   - `style: ...` untuk penyesuaian styling Tailwind / CSS.
   - `docs: ...` untuk pembaruan dokumentasi.
2. **Jangan Melakukan Commit pada File Build / Environment**:
   - Direktori `dist/`, `node_modules/`, serta file `.env.local` tidak boleh di-stage atau di-commit.
