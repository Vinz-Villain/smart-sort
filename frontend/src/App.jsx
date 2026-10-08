import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Trash2,
  Thermometer,
  Droplets,
  Wind,
  Camera,
  Activity,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  ChevronRight,
  RefreshCw,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Compass,
  Cpu,
  ShieldCheck,
  Zap,
  Globe2,
  Check,
  BarChart3,
  Flame,
  Gauge,
  ArrowUpRight,
  Cpu as CpuIcon,
  Radio
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history', 'diagnosis'
  const [statusData, setStatusData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastImageKey, setLastImageKey] = useState(Date.now());
  const [actionMessage, setActionMessage] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Fetch status data periodically (polling 2 detik)
  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/status`);
      setStatusData(res.data);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/history`);
      setHistoryData(res.data.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchHistory();
    const interval = setInterval(() => {
      fetchStatus();
      if (activeTab === 'history') {
        fetchHistory();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const showToast = (msg, isError = false) => {
    setActionMessage({ msg, isError });
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Manual Servo Control
  const handleServoControl = async (angle, category) => {
    try {
      await axios.post(`${API_BASE}/api/manual/servo`, { angle, category });
      showToast(`Flap berhasil diarahkan ke ${angle}° (${category})`);
      fetchStatus();
    } catch (err) {
      showToast('Gagal menggerakkan servo', true);
    }
  };

  // Inject Simulated Trash Data
  const handleInjectTrash = async (category) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/api/manual/inject`, {
        category,
        confidence: Math.floor(Math.random() * (98 - 88 + 1)) + 88 + Math.random()
      });
      showToast(`Berhasil menyuntikkan sampel ${category} (${res.data.entry.confidence}%)`);
      fetchStatus();
      fetchHistory();
    } catch (err) {
      showToast('Gagal menyuntikkan data', true);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset All History & Stats
  const handleResetHistory = async () => {
    try {
      await axios.delete(`${API_BASE}/api/history`);
      setIsResetModalOpen(false);
      showToast('Seluruh riwayat dan counter berhasil direset ke 0');
      fetchStatus();
      fetchHistory();
    } catch (err) {
      showToast('Gagal mereset data', true);
    }
  };

  // Reset Container Capacities
  const handleResetBin = async (category = null) => {
    try {
      await axios.post(`${API_BASE}/api/bins/reset`, { category });
      showToast(category ? `Kapasitas wadah ${category} direset ke 0%` : 'Semua kompartemen berhasil dikosongkan!');
      fetchStatus();
    } catch (err) {
      showToast('Gagal mereset wadah', true);
    }
  };

  // Refresh latest camera image
  const handleRefreshCamera = () => {
    setLastImageKey(Date.now());
    showToast('Snapshot frame kamera diperbarui');
  };

  // Chart Data preparation
  const chartData = {
    labels: ['Organik', 'Anorganik', 'Residu'],
    datasets: [
      {
        data: [
          statusData?.summary?.counts?.Organik || 0,
          statusData?.summary?.counts?.Anorganik || 0,
          statusData?.summary?.counts?.Residu || 0
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 4,
        hoverOffset: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#334155',
          font: { size: 12, weight: '700', family: 'Outfit' },
          padding: 16,
          boxWidth: 12,
          usePointStyle: true
        }
      }
    },
    cutout: '74%'
  };

  // Filter history
  const filteredHistory = historyData.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch =
      item.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const getCapacityColor = (val) => {
    if (val <= 50) return { bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-glow-emerald', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', label: 'Tersedia' };
    if (val <= 80) return { bar: 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-glow-amber', text: 'text-amber-800', badge: 'bg-amber-50 text-amber-800 border-amber-200/80', label: 'Waspada' };
    return { bar: 'bg-gradient-to-r from-rose-500 to-rose-600', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200/80', label: 'Penuh' };
  };

  const currentServoAngle = statusData?.devices?.servo_current_angle ?? 30;

  return (
    <div className="min-h-screen bg-[#F6F8FD] text-slate-800 flex flex-col font-sans relative overflow-x-hidden bg-tech-grid selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Ambient Blur Glows (Inspired by PAYROT & GUARRENT References) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-br from-indigo-200/40 via-purple-100/30 to-sky-100/20 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-60 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-200/30 via-teal-100/20 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/30 via-indigo-100/20 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Giant Extended Stencil Watermark (Homage to PAYROT & GUARRENT UI) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none select-none text-[8rem] sm:text-[13rem] lg:text-[18rem] font-syne font-black tracking-tighter text-indigo-950/[0.035] uppercase -z-10 whitespace-nowrap leading-none">
        SMARTSORT
      </div>

      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center space-x-3.5 text-sm font-semibold transition-all duration-300 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 ${
            actionMessage.isError
              ? 'bg-white/95 text-rose-700 border-rose-200/80 shadow-rose-500/10'
              : 'bg-white/95 text-slate-900 border-indigo-200/80 shadow-indigo-500/15'
          }`}
        >
          {actionMessage.isError ? (
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          )}
          <span className="font-display font-medium">{actionMessage.msg}</span>
        </div>
      )}

      {/* Confirmation Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/90 max-w-md w-full rounded-4xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 border border-rose-100 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight m-0">Konfirmasi Reset Data</h3>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed font-medium">
              Apakah Anda yakin ingin mengosongkan riwayat penyortiran dan mengembalikan counter ke 0? Tindakan ini bermanfaat untuk memulai sesi demonstrasi pengujian baru.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-display font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetHistory}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 text-xs font-display font-bold shadow-lg shadow-rose-500/25 transition cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Header Navbar (Reference 1 & 3 Inspired) */}
      <div className="sticky top-0 z-40 px-4 sm:px-8 pt-5 pb-3">
        <header className="max-w-6xl mx-auto rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/90 shadow-glass px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 transition-all">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black tracking-tight text-slate-900">SMARTSORT</span>
                <span className="text-[10px] font-syne uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200/80">
                  SIJA IoT
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Autonomous Waste Diverter System</p>
            </div>
          </div>

          {/* Navigation Links in Center (Pill Styled) */}
          <nav className="flex items-center bg-slate-200/50 p-1.5 rounded-full border border-slate-300/40 shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full text-xs font-display font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-950 shadow-md shadow-indigo-950/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              Live Monitor
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchHistory();
              }}
              className={`px-4 py-2 rounded-full text-xs font-display font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-950 shadow-md shadow-indigo-950/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              Riwayat Log
            </button>
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`px-4 py-2 rounded-full text-xs font-display font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'diagnosis'
                  ? 'bg-white text-indigo-950 shadow-md shadow-indigo-950/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              Diagnosis (Plan B)
            </button>
          </nav>

          {/* Device Badges on Right */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 border border-slate-200/80 text-slate-700 shadow-xs">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  statusData?.devices?.esp32_controller === 'Online' ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-rose-500'
                }`}
              />
              <span className="font-display text-[11px]">ESP32: <strong className="text-slate-900 font-extrabold">{statusData?.devices?.esp32_controller || 'Online'}</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 border border-slate-200/80 text-slate-700 shadow-xs">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  statusData?.devices?.esp32_cam === 'Online' ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-rose-500'
                }`}
              />
              <span className="font-display text-[11px]">CAM: <strong className="text-slate-900 font-extrabold">{statusData?.devices?.esp32_cam || 'Online'}</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-display text-[11px] font-bold">AI Standby</span>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-10">
        {/* ============================== HERO PRESENTATION (Inspired by Ref 1 & Ref 2) ============================== */}
        <section className="text-center pt-4 pb-6 max-w-4xl mx-auto relative">
          {/* Rotated Tag Pills Floating Over Top Corners (GUARRENT Ref Style) */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-syne font-extrabold text-[11px] uppercase tracking-widest shadow-md shadow-indigo-500/25 transform -rotate-2">
              <Zap className="w-3.5 h-3.5 fill-white" />
              Vision AI Waste Sorting
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 font-display font-bold text-xs shadow-xs transform rotate-1">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Realtime Diverter SG90
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-slate-900 leading-[1.05]">
            Pilah Sampah Otomatis,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cepat & Presisi.
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
            Sistem klasifikasi sampah cerdas real-time menggunakan modul kamera OV2640, aktuator multi-flap diverter servo SG90, serta pemantauan gas & lingkungan DHT11/MQ-135.
          </p>

          {/* Quick Highlight Stats Strip (Reference 3 Tokenomics Style) */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
            <div className="p-3.5 rounded-2xl glass-card">
              <div className="text-2xl sm:text-3xl font-display font-black text-indigo-600 tracking-tight">98.4%</div>
              <div className="text-[11px] font-display font-bold text-slate-500 uppercase tracking-wider mt-0.5">Akurasi AI Model</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-card">
              <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">&lt; 1.2s</div>
              <div className="text-[11px] font-display font-bold text-slate-500 uppercase tracking-wider mt-0.5">Respons Servo</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-card">
              <div className="text-2xl sm:text-3xl font-display font-black text-purple-600 tracking-tight">3 Slot</div>
              <div className="text-[11px] font-display font-bold text-slate-500 uppercase tracking-wider mt-0.5">Wadah Terpisah</div>
            </div>
          </div>
        </section>

        {/* ============================== TAB 1: LIVE MONITORING ============================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Top 3 Statistic Metric Cards (Ref 1 & Ref 3 Inspired Masterpiece) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Total Sampah */}
              <div className="glass-card rounded-4xl p-7 hover:shadow-glass-hover transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-syne uppercase tracking-widest font-extrabold text-slate-400">Total Sampah Terpilah</span>
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>
                <div className="mt-5 flex items-baseline gap-2.5">
                  <span className="text-5xl sm:text-6xl font-display font-black text-slate-900 tracking-tight leading-none">
                    {statusData?.summary?.total_items ?? 0}
                  </span>
                  <span className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">item tersortir</span>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100/80 grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-2.5">
                    <span className="text-emerald-700 block font-display font-black text-base leading-tight">{statusData?.summary?.counts?.Organik ?? 0}</span>
                    <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Organik</span>
                  </div>
                  <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-2.5">
                    <span className="text-sky-700 block font-display font-black text-base leading-tight">{statusData?.summary?.counts?.Anorganik ?? 0}</span>
                    <span className="text-sky-600 text-[10px] font-bold uppercase tracking-wider">Anorganik</span>
                  </div>
                  <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-2.5">
                    <span className="text-purple-700 block font-display font-black text-base leading-tight">{statusData?.summary?.counts?.Residu ?? 0}</span>
                    <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">Residu</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Kondisi DHT11 */}
              <div className="glass-card rounded-4xl p-7 hover:shadow-glass-hover transition-all duration-300 group flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-syne uppercase tracking-widest font-extrabold text-slate-400">Kondisi Wadah (DHT11)</span>
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Thermometer className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <div className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-none">
                      {statusData?.environment?.temperature ?? 30.2}°C
                    </div>
                    <div className="text-xs text-slate-500 mt-2 font-display font-bold flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Suhu Ruang
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-none">
                      {statusData?.environment?.humidity ?? 68}%
                    </div>
                    <div className="text-xs text-slate-500 mt-2 font-display font-bold flex items-center gap-1.5 justify-end">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" /> Kelembapan RH
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-display font-bold border border-emerald-200/80 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Suhu Stabil
                  </span>
                  <span className="font-display font-bold text-slate-400">Sirkulasi Baik</span>
                </div>
              </div>

              {/* Card 3: MQ-135 Gas */}
              <div className="glass-card rounded-4xl p-7 hover:shadow-glass-hover transition-all duration-300 group flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-syne uppercase tracking-widest font-extrabold text-slate-400">Kualitas Udara (MQ-135)</span>
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wind className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-none">
                      {statusData?.environment?.gas_value ?? 380}
                    </span>
                    <span className="text-xs text-slate-400 font-display font-extrabold ml-2">ADC PPM</span>
                  </div>
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-extrabold border ${
                      statusData?.environment?.gas_status === 'Normal'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : statusData?.environment?.gas_status === 'Bau Sedang'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {statusData?.environment?.gas_status ?? 'Normal'}
                  </span>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="font-display font-bold text-slate-500">Deteksi Gas Pembusukan</span>
                  <span className="text-indigo-600 font-display font-extrabold text-[11px]">Status Aktif</span>
                </div>
              </div>
            </div>

            {/* Middle Section: Bento Grid for Capacities & Proporsi AI (7:5 Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Box 1: Kapasitas Wadah (7 Cols) */}
              <div className="lg:col-span-7 glass-card rounded-4xl p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-xl font-display font-black text-slate-900 tracking-tight m-0">Kapasitas Keterisian Kompartemen</h2>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Volume fisik ruang sampah untuk menjadwalkan pengangkutan tepat waktu
                      </p>
                    </div>
                    <button
                      onClick={() => handleResetBin(null)}
                      title="Kosongkan semua kompartemen"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-display font-bold flex items-center gap-2 transition border border-slate-200/80 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Kosongkan Wadah
                    </button>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4">
                    {['Organik', 'Anorganik', 'Residu'].map((cat) => {
                      const cap = statusData?.capacities?.[cat] ?? 0;
                      const statusColor = getCapacityColor(cap);
                      const catBadge =
                        cat === 'Organik'
                          ? 'border-emerald-200/80 text-emerald-700 bg-emerald-50'
                          : cat === 'Anorganik'
                          ? 'border-sky-200/80 text-sky-700 bg-sky-50'
                          : 'border-purple-200/80 text-purple-700 bg-purple-50';

                      return (
                        <div key={cat} className="p-4 rounded-3xl bg-white/70 border border-slate-200/60 space-y-3 shadow-xs">
                          <div className="flex justify-between items-center text-sm">
                            <span className={`px-3 py-1 rounded-xl font-display font-extrabold text-xs border ${catBadge}`}>
                              Wadah {cat}
                            </span>
                            <div className="flex items-center gap-2.5">
                              <span className={`text-xs font-display font-bold px-2.5 py-0.5 rounded-lg border ${statusColor.badge}`}>
                                {statusColor.label}
                              </span>
                              <span className="font-display font-black text-slate-900 text-base">{cap}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/50">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`}
                              style={{ width: `${Math.min(100, Math.max(cap, 4))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Visual Diverter Servo Gauge Needle Diagram */}
                <div className="mt-7 p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 text-white flex items-center justify-center font-bold text-sm shadow-glow-indigo shrink-0">
                      <Compass className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="text-xs font-syne uppercase tracking-wider font-extrabold text-indigo-300">Posisi Diverter Flap Active</div>
                      <div className="text-lg font-display font-black text-white mt-0.5">
                        {currentServoAngle}° (Derajat Servo SG90)
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Visual Servo Position Pills */}
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 text-xs font-display font-bold">
                    <span className={`px-3 py-1.5 rounded-xl transition-all ${currentServoAngle === 0 ? 'bg-emerald-500 text-white shadow-glow-emerald' : 'text-slate-300 opacity-60'}`}>
                      0° Kiri
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl transition-all ${currentServoAngle === 30 ? 'bg-purple-500 text-white shadow-glow-indigo' : 'text-slate-300 opacity-60'}`}>
                      30° Tengah
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl transition-all ${currentServoAngle === 70 ? 'bg-sky-500 text-white shadow-glow-indigo' : 'text-slate-300 opacity-60'}`}>
                      70° Kanan
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Donut Chart Proporsi AI (5 Cols) */}
              <div className="lg:col-span-5 glass-card rounded-4xl p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-display font-black text-slate-900 tracking-tight m-0">Proporsi Klasifikasi Sampah</h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Distribusi pengelompokan sampah oleh model AI</p>
                </div>
                <div className="h-60 relative my-6 flex items-center justify-center">
                  {statusData?.summary?.total_items > 0 ? (
                    <Doughnut data={chartData} options={chartOptions} />
                  ) : (
                    <div className="text-center text-slate-400 text-sm">
                      <Trash2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                      Belum ada data pemilahan terekam
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs pt-5 border-t border-slate-100">
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                    <span className="text-emerald-700 font-display font-black block text-base">{statusData?.summary?.percentages?.Organik ?? 0}%</span>
                    <span className="text-emerald-600 text-[10px] font-display font-extrabold uppercase tracking-wider">Organik</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80">
                    <span className="text-sky-700 font-display font-black block text-base">{statusData?.summary?.percentages?.Anorganik ?? 0}%</span>
                    <span className="text-sky-600 text-[10px] font-display font-extrabold uppercase tracking-wider">Anorganik</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200/80">
                    <span className="text-purple-700 font-display font-black block text-base">{statusData?.summary?.percentages?.Residu ?? 0}%</span>
                    <span className="text-purple-600 text-[10px] font-display font-extrabold uppercase tracking-wider">Residu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Aktivitas Pemilahan Terakhir */}
            <div className="glass-card rounded-4xl p-7 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-black text-slate-900 m-0">Aktivitas Pemilahan Terbaru (Real-Time)</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Log data real-time saat sensor mendeteksi objek masuk</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-display font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer"
                >
                  Buka Semua Log <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-syne font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-5">WAKTU</th>
                      <th className="py-3.5 px-5">KATEGORI SAMPAH</th>
                      <th className="py-3.5 px-5">SKOR AKURASI AI</th>
                      <th className="py-3.5 px-5">AKSI MEKANIK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {statusData?.recent_activity?.length > 0 ? (
                      statusData.recent_activity.map((item) => (
                        <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="py-3.5 px-5 font-mono text-slate-500">{item.timestamp}</td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-3 py-1 rounded-xl font-display font-extrabold text-[11px] border ${
                                item.category === 'Organik'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : item.category === 'Anorganik'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-display font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/80">
                              {item.confidence}%
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600">
                            <span className="inline-flex items-center gap-1.5 font-display font-bold">
                              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                              {item.action || `Flap bergerak ke ${item.servo_angle}°`}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-10 text-center text-slate-400 font-semibold font-display">
                          Belum ada aktivitas terekam. Masukkan sampah atau gunakan simulasi uji.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 2: RIWAYAT & LOG PEMILAHAN ============================== */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Header Riwayat + Action Bar */}
            <div className="glass-card rounded-4xl p-7 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight m-0">Riwayat Log Pemilahan Sampah</h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Dataset komprehensif riwayat pemilahan untuk pengujian akurasi model AI (Total {filteredHistory.length} data tersimpan)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`${API_BASE}/api/history/export`}
                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-display font-bold flex items-center gap-2 shadow-md shadow-indigo-500/25 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Unduh CSV / Excel
                  </a>
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-2xl text-xs font-display font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Log Data
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-display font-bold mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </span>
                  {['All', 'Organik', 'Anorganik', 'Residu'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition cursor-pointer ${
                        filterCategory === cat
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-80 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari ID atau tanggal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-4xl overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-md border-b border-slate-200 text-slate-600 font-syne font-extrabold uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">WAKTU & TANGGAL</th>
                      <th className="py-4 px-6">KATEGORI TERDETEKSI</th>
                      <th className="py-4 px-6">SKOR CONFIDENCE AI</th>
                      <th className="py-4 px-6">SUDUT FLAP SERVO</th>
                      <th className="py-4 px-6">STATUS EKSEKUSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((row) => (
                        <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-slate-400">#{row.id}</td>
                          <td className="py-4 px-6 font-mono text-slate-600">{row.timestamp}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-xl font-display font-extrabold text-[11px] border ${
                                row.category === 'Organik'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : row.category === 'Anorganik'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {row.category}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-display font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/80">
                              {row.confidence}%
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-700 font-bold">
                            {row.servo_angle}°
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-display font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Berhasil Tersortir
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold font-display">
                          Tidak ada data yang cocok dengan kriteria pencarian / filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 3: KONTROL MANUAL & DIAGNOSIS ============================== */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-6">
            {/* Alert Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/80 rounded-4xl p-6 flex items-center gap-5 glass-card">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-amber-950 m-0">Fitur Diagnosis & Plan B Demo Penguji</h3>
                <p className="text-xs text-amber-900/90 mt-1 leading-relaxed font-medium">
                  Panel ini berguna untuk menguji pergerakan aktuator servo, memantau tangkapan kamera ESP32-CAM secara mandiri, dan menyediakan tombol bypass suntik data jika terjadi kendala pada sensor saat demonstrasi langsung.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Uji Manual Flap Servo */}
              <div className="glass-card rounded-4xl p-7 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-display font-black text-slate-900 m-0">1. Uji Pengarah Flap Servo</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Uji coba langsung perputaran motor servo SG90</p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-display font-black text-xs">
                    Sudut Aktif: {currentServoAngle}°
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3.5 pt-2">
                  <button
                    onClick={() => handleServoControl(0, 'Organik')}
                    className="p-6 rounded-3xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-center transition cursor-pointer flex flex-col items-center gap-2 shadow-xs hover:shadow-md hover:scale-105"
                  >
                    <span className="text-3xl font-display font-black text-emerald-700">0°</span>
                    <span className="text-xs font-syne uppercase tracking-wider font-extrabold">Flap Organik</span>
                    <span className="text-[11px] text-emerald-600 font-bold">(Arah Kiri)</span>
                  </button>

                  <button
                    onClick={() => handleServoControl(30, 'Residu')}
                    className="p-6 rounded-3xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/80 text-purple-900 text-center transition cursor-pointer flex flex-col items-center gap-2 shadow-xs hover:shadow-md hover:scale-105"
                  >
                    <span className="text-3xl font-display font-black text-purple-700">30°</span>
                    <span className="text-xs font-syne uppercase tracking-wider font-extrabold">Flap Residu</span>
                    <span className="text-[11px] text-purple-600 font-bold">(Posisi Tengah)</span>
                  </button>

                  <button
                    onClick={() => handleServoControl(70, 'Anorganik')}
                    className="p-6 rounded-3xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/80 text-sky-900 text-center transition cursor-pointer flex flex-col items-center gap-2 shadow-xs hover:shadow-md hover:scale-105"
                  >
                    <span className="text-3xl font-display font-black text-sky-700">70°</span>
                    <span className="text-xs font-syne uppercase tracking-wider font-extrabold">Flap Anorganik</span>
                    <span className="text-[11px] text-sky-600 font-bold">(Arah Kanan)</span>
                  </button>
                </div>
              </div>

              {/* Box 2: Uji Snapshot Kamera ESP32-CAM */}
              <div className="glass-card rounded-4xl p-7 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-display font-black text-slate-900 m-0">2. Frame Snapshot Kamera</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tampilan tangkapan foto terakhir modul ESP32-CAM</p>
                  </div>
                  <button
                    onClick={handleRefreshCamera}
                    className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-display font-bold flex items-center gap-2 transition border border-slate-200 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Frame
                  </button>
                </div>

                <div className="aspect-video w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center relative group shadow-inner">
                  <img
                    src={`${API_BASE}/api/camera/latest?t=${lastImageKey}`}
                    alt="Latest ESP32-CAM Frame"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-4 px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-mono font-bold flex items-center gap-2.5 shadow-lg">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>OV2640 Resolution Mode: QVGA / VGA</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Quick Data Injector (Demo Saver) */}
              <div className="glass-card rounded-4xl p-7 sm:p-8 space-y-5 lg:col-span-2">
                <div>
                  <h3 className="text-lg font-display font-black text-slate-900 m-0 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    3. Simulasi Sampah Masuk (Data Injector - Live Demo Saver)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                    Apabila sensor ultrasonik mengalami kendala pantulan objek atau pencahayaan ruangan saat demonstrasi langsung, gunakan tombol injeksi ini untuk mensimulasikan pemilahan otomatis secara instan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <button
                    disabled={isLoading}
                    onClick={() => handleInjectTrash('Organik')}
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-extrabold text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    + Suntik Sampah Organik (0°)
                  </button>

                  <button
                    disabled={isLoading}
                    onClick={() => handleInjectTrash('Anorganik')}
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-display font-extrabold text-sm shadow-md shadow-sky-500/20 transition cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    + Suntik Sampah Anorganik (70°)
                  </button>

                  <button
                    disabled={isLoading}
                    onClick={() => handleInjectTrash('Residu')}
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-display font-extrabold text-sm shadow-md shadow-purple-500/20 transition cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    + Suntik Sampah Residu (30°)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================== CLOSING CALLOUT BLOCK (Reference 1 & 2 & 3 Dark Banner Aesthetic) ============================== */}
        <section className="rounded-5xl glass-card-dark text-white p-10 md:p-14 relative overflow-hidden shadow-2xl mt-12 border border-white/10">
          {/* Ambient Glowing Orbs */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-xs font-syne uppercase tracking-widest font-extrabold">
              <Globe2 className="w-4 h-4 text-indigo-400" />
              Smart Sustainable Waste Management
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
              KAMPUS & KOTA BERSIH DENGAN TEKNOLOGI IOT & AI
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-normal">
              SmartSort menggabungkan kecerdasan buatan, mikrokontroler hemat daya ESP32, dan mekanisme diverter flap cerdas untuk mendukung ekosistem pemilahan sampah modern dari sumbernya.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-display font-black text-xs transition shadow-lg shadow-indigo-500/30 cursor-pointer flex items-center gap-2"
              >
                Lihat Monitoring Aktif <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  fetchHistory();
                }}
                className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-display font-bold text-xs transition cursor-pointer"
              >
                Eksplorasi Basis Data Log
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (PAYROT Style Minimal Masterpiece Footer) */}
      <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-6 px-6 mt-12 text-center text-xs text-slate-500 font-semibold">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-slate-900 text-sm">SMARTSORT</span>
            <span>• SIJA IoT & AI Project</span>
          </div>
          <div className="text-slate-400 font-medium">
            ESP32 Controller • ESP32-CAM OV2640 • Sensor DHT11 & MQ-135 • Servo SG90 Diverter
          </div>
        </div>
      </footer>
    </div>
  );
}
