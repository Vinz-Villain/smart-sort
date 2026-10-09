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
  Gauge,
  Send,
  Radio,
  SlidersHorizontal
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
        borderWidth: 3,
        hoverOffset: 6
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
          color: '#475569',
          font: { size: 12, weight: '600', family: 'Plus Jakarta Sans' },
          padding: 14,
          boxWidth: 10,
          usePointStyle: true
        }
      }
    },
    cutout: '72%'
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
    if (val <= 50) return { bar: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', label: 'Tersedia' };
    if (val <= 80) return { bar: 'bg-amber-500', text: 'text-amber-800', badge: 'bg-amber-50 text-amber-800 border-amber-200/80', label: 'Waspada' };
    return { bar: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200/80', label: 'Penuh' };
  };

  const currentServoAngle = statusData?.devices?.servo_current_angle ?? 30;
  const currentCategoryActive =
    currentServoAngle === 0 ? 'Organik' : currentServoAngle === 70 ? 'Anorganik' : 'Residu';

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs sm:text-sm font-semibold transition-all duration-300 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 max-w-[90vw] ${
            actionMessage.isError
              ? 'bg-white/95 text-rose-700 border-rose-200 shadow-rose-500/10'
              : 'bg-white/95 text-slate-900 border-blue-200 shadow-blue-500/10'
          }`}
        >
          {actionMessage.isError ? (
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </div>
          )}
          <span className="font-medium truncate">{actionMessage.msg}</span>
        </div>
      )}

      {/* Confirmation Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight m-0">Konfirmasi Reset Data</h3>
            <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed font-normal">
              Apakah Anda yakin ingin mengosongkan seluruh riwayat penyortiran dan mengembalikan counter ke 0?
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetHistory}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================== 1. AIRLUME DEEP BLUE HERO ======================== */}
      {/* ========================================================================= */}
      <section className="bg-fluted-blue text-white relative overflow-hidden pt-5 pb-16 sm:pb-24 border-b border-indigo-950/60">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-500/20 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          {/* Header Navbar */}
          <nav className="flex items-center justify-between pb-6 sm:pb-8 border-b border-white/10 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white shrink-0">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">SmartSort<span className="text-blue-400">.Ai</span></span>
              </div>
            </div>

            {/* Nav Menu Center (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Monitoring
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  fetchHistory();
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Riwayat Log
              </button>
              <button
                onClick={() => setActiveTab('diagnosis')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeTab === 'diagnosis' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Kontrol Manual
              </button>
            </div>

            {/* Right Status & Action */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-full backdrop-blur-sm">
                <span className="font-medium text-[11px] hidden sm:inline">ESP32: {statusData?.devices?.esp32_controller || 'Online'}</span>
                <span className="font-medium text-[11px] sm:hidden">Online</span>
              </div>
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
              >
                Reset
              </button>
            </div>
          </nav>

          {/* Hero Center Punchline */}
          <div className="text-center pt-8 sm:pt-12 pb-10 sm:pb-12 max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span>Sort Smarter With SmartSort.Ai</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Pilah Sampah Otomatis, <br className="hidden sm:inline" />
              Presisi Pada Setiap Objek
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-normal leading-relaxed px-2">
              Klasifikasi sampah cerdas real-time menggunakan kamera OV2640, aktuator flap multi-arah servo SG90, serta pemantauan sensor gas lingkungan.
            </p>

            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={() => handleInjectTrash('Organik')}
                className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-xl shadow-blue-600/40 cursor-pointer group active:scale-95"
              >
                <span>Uji Simulasi Sortir</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ==================== 3 SIGNATURE AIRLUME SHOWCASE CARDS ================= */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-1 items-stretch">
            {/* 1. LEFT CARD: Clean White Stats Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-slate-800 shadow-airlume-card flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 m-0">Total Sampah Terpilah</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pembaruan Real-Time</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {statusData?.summary?.total_items ?? 0}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
                    • Siap
                  </span>
                </div>

                {/* Sub Counter Pills */}
                <div className="mt-4 sm:mt-5 space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-600">Organik</span>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {statusData?.summary?.counts?.Organik ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      <span className="font-medium text-slate-600">Anorganik</span>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {statusData?.summary?.counts?.Anorganik ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      <span className="font-medium text-slate-600">Residu</span>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {statusData?.summary?.counts?.Residu ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Klasifikasi Model AI</span>
                <button
                  onClick={() => {
                    setActiveTab('history');
                    fetchHistory();
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                  title="Lihat Log"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. CENTER CARD: Phone / Scanner Showcase Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-slate-800 shadow-airlume-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center mb-2.5 sm:mb-3">
                  <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/60">
                    SmartSort Vision AI
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
                    Scanning Real-Time <br />
                    Kamera OV2640
                  </h3>
                </div>

                {/* Circular Percentage and Stat Block */}
                <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-700 bg-white shrink-0">
                    98%
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-semibold text-slate-800">Akurasi Klasifikasi AI</div>
                    <div className="text-[11px] text-slate-500">Waktu respons servo &lt; 1.2s</div>
                  </div>
                </div>

                {/* Camera Frame Preview Container */}
                <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative group flex items-center justify-center shadow-inner">
                  <img
                    src={`${API_BASE}/api/camera/latest?t=${lastImageKey}`}
                    alt="ESP32-CAM Frame"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 border border-blue-400/40 pointer-events-none rounded-xl sm:rounded-2xl" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={handleRefreshCamera}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer"
                      title="Refresh Frame"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-[10px] text-white backdrop-blur-md font-mono">
                    OV2640: Live Stream
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500 font-medium">
                <span>99.2% Tingkat Keberhasilan Pemilahan</span>
              </div>
            </div>

            {/* 3. RIGHT CARD: Neon Cyan Glowing Glass Card */}
            <div className="glass-airlume-dark rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-airlume-glow flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-[11px] font-medium border border-white/15">
                    ⚙ Status Aktuator
                  </span>
                </div>

                <div className="mt-3 sm:mt-4">
                  <p className="text-[11px] text-slate-300 m-0">Sudut Flap Diverter</p>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                    <span>SERVO → {currentServoAngle}°</span>
                  </div>
                  <p className="text-xs text-cyan-300 font-medium mt-1">
                    Mengarahkan: <span className="font-semibold text-white">{currentCategoryActive}</span>
                  </p>
                </div>

                {/* Dotted Trajectory Path (Mobile-Safe Layout) */}
                <div className="my-4 sm:my-5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="text-center shrink-0">
                    <div className={`font-semibold text-[11px] sm:text-xs ${currentServoAngle === 0 ? 'text-emerald-400' : 'text-slate-400'}`}>0°</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400">Organik</div>
                  </div>
                  <div className="flex-1 px-1 sm:px-2 flex items-center justify-center">
                    <div className="w-full border-t border-dashed border-cyan-400/50 relative flex items-center justify-center">
                      <Send className="w-3 h-3 text-cyan-400 absolute transform rotate-45" />
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div className={`font-semibold text-[11px] sm:text-xs ${currentServoAngle === 30 ? 'text-purple-400' : 'text-slate-400'}`}>30°</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400">Residu</div>
                  </div>
                  <div className="flex-1 px-1 sm:px-2 flex items-center justify-center">
                    <div className="w-full border-t border-dashed border-cyan-400/50 relative flex items-center justify-center">
                      <Send className="w-3 h-3 text-cyan-400 absolute transform rotate-45" />
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div className={`font-semibold text-[11px] sm:text-xs ${currentServoAngle === 70 ? 'text-sky-400' : 'text-slate-400'}`}>70°</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400">Anorganik</div>
                  </div>
                </div>

                {/* Environmental Quick Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-300">Suhu DHT11</div>
                    <div className="font-semibold text-xs sm:text-sm text-white mt-0.5">
                      {statusData?.environment?.temperature ?? 30.2}°C
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-300">Gas MQ-135</div>
                    <div className="font-semibold text-xs sm:text-sm text-white mt-0.5">
                      {statusData?.environment?.gas_value ?? 380} PPM
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="truncate pr-2">Gas: <strong className="text-white font-medium">{statusData?.environment?.gas_status ?? 'Normal'}</strong></span>
                <button
                  onClick={() => setActiveTab('diagnosis')}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                  title="Buka Diagnosis"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ==================== 2. OPERATION CONTROL & DATA SECTION ================= */}
      {/* ========================================================================= */}
      <section className="bg-[#F8FAFD] py-8 sm:py-14 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8">
          {/* View Switcher Header (Responsive Mobile Segmented Control) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                {activeTab === 'dashboard' && 'Panel Monitoring & Keterisian Wadah'}
                {activeTab === 'history' && 'Tabel Dataset Riwayat Penyortiran'}
                {activeTab === 'diagnosis' && 'Panel Diagnostik & Pengujian Manual'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'dashboard' && 'Status kapasitas fisik wadah dan proporsi klasifikasi'}
                {activeTab === 'history' && 'Log rekaman riwayat deteksi objek dan akurasi model'}
                {activeTab === 'diagnosis' && 'Kontrol sudut aktuator servo SG90 dan demonstrasi simulasi'}
              </p>
            </div>

            {/* Segmented Pill Tabs for Mobile & Desktop */}
            <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl border border-slate-300/60">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Monitoring</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  fetchHistory();
                }}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Riwayat ({historyData.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('diagnosis')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'diagnosis' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Diagnostik</span>
              </button>
            </div>
          </div>

          {/* ==================== TAB 1 CONTENT: MONITORING ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 2-Column Bento: Capacities & Donut Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* Left (7 Cols): Kapasitas Kompartemen */}
                <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Kapasitas Keterisian Kompartemen</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Pantau ketinggian sampah sebelum wadah penuh</p>
                      </div>
                      <button
                        onClick={() => handleResetBin(null)}
                        className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Kosongkan Wadah
                      </button>
                    </div>

                    <div className="space-y-3.5">
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
                          <div key={cat} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className={`px-2.5 py-0.5 rounded-lg font-semibold border ${catBadge}`}>
                                Wadah {cat}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusColor.badge}`}>
                                  {statusColor.label}
                                </span>
                                <span className="font-semibold text-slate-900 text-sm tabular-nums">{cap}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200/70 rounded-full h-2.5 sm:h-3 overflow-hidden p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${statusColor.bar}`}
                                style={{ width: `${Math.min(100, Math.max(cap, 4))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Threshold Penuh: 85%</span>
                    <span className="text-blue-600 font-semibold">Ultrasonik Aktif</span>
                  </div>
                </div>

                {/* Right (5 Cols): Donut Proporsi */}
                <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Proporsi Klasifikasi Sampah</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Distribusi pengelompokan sampah oleh AI</p>

                    <div className="h-48 sm:h-56 relative my-3 sm:my-4 flex items-center justify-center">
                      {statusData?.summary?.total_items > 0 ? (
                        <Doughnut data={chartData} options={chartOptions} />
                      ) : (
                        <div className="text-center text-slate-400 text-xs">
                          <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Belum ada data pemilahan terekam
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 sm:pt-4 border-t border-slate-100">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-emerald-700 font-semibold block text-xs sm:text-sm tabular-nums">
                        {statusData?.summary?.percentages?.Organik ?? 0}%
                      </span>
                      <span className="text-emerald-600 text-[10px] font-medium">Organik</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                      <span className="text-sky-700 font-semibold block text-xs sm:text-sm tabular-nums">
                        {statusData?.summary?.percentages?.Anorganik ?? 0}%
                      </span>
                      <span className="text-sky-600 text-[10px] font-medium">Anorganik</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                      <span className="text-purple-700 font-semibold block text-xs sm:text-sm tabular-nums">
                        {statusData?.summary?.percentages?.Residu ?? 0}%
                      </span>
                      <span className="text-purple-600 text-[10px] font-medium">Residu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Aktivitas Pemilahan Terbaru (Real-Time)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Log data objek terdeteksi masuk ke sistem</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
                  >
                    Semua Log <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Waktu</th>
                        <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Kategori Sampah</th>
                        <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Akurasi AI</th>
                        <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Aksi Mekanik Flap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {statusData?.recent_activity?.length > 0 ? (
                        statusData.recent_activity.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 font-mono text-slate-500 text-[11px] sm:text-xs">{item.timestamp}</td>
                            <td className="py-2.5 sm:py-3 px-3.5 sm:px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-lg font-semibold text-[10px] sm:text-[11px] border ${
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
                            <td className="py-2.5 sm:py-3 px-3.5 sm:px-4">
                              <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/70 tabular-nums text-[11px] sm:text-xs">
                                {item.confidence}%
                              </span>
                            </td>
                            <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-slate-600">
                              <span className="inline-flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
                                <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                {item.action || `Flap bergerak ke ${item.servo_angle}°`}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">
                            Belum ada aktivitas terekam. Masukkan objek atau gunakan tombol injeksi simulasi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2 CONTENT: RIWAYAT LOG ==================== */}
          {activeTab === 'history' && (
            <div className="space-y-5 sm:space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 m-0">Riwayat Log Pemilahan Sampah</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Dataset riwayat pemilahan untuk pengujian akurasi model AI (Total {filteredHistory.length} data tersimpan)
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <a
                      href={`${API_BASE}/api/history/export`}
                      className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh CSV
                    </a>
                    <button
                      onClick={() => setIsResetModalOpen(true)}
                      className="px-3.5 sm:px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Log
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Filter:
                    </span>
                    {['All', 'Organik', 'Anorganik', 'Residu'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          filterCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="w-full sm:w-72 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari ID atau timestamp..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Log Table */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                    <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] z-10">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Waktu & Tanggal</th>
                        <th className="py-3 px-4">Kategori Terdeteksi</th>
                        <th className="py-3 px-4">Confidence AI</th>
                        <th className="py-3 px-4">Sudut Flap</th>
                        <th className="py-3 px-4">Status Eksekusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredHistory.length > 0 ? (
                        filteredHistory.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">#{row.id}</td>
                            <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{row.timestamp}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-lg font-semibold text-[10px] sm:text-[11px] border ${
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
                            <td className="py-3 px-4">
                              <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/70 tabular-nums text-[11px]">
                                {row.confidence}%
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700 font-medium tabular-nums text-[11px]">
                              {row.servo_angle}°
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Tersortir
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">
                            Tidak ada data yang sesuai dengan kata kunci pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3 CONTENT: KONTROL MANUAL & DIAGNOSIS ==================== */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-5 sm:space-y-6">
              {/* Alert Card */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950 m-0">Panel Pengujian Manual & Live Demo</h3>
                  <p className="text-xs text-amber-800 mt-0.5 font-normal">
                    Gunakan panel ini untuk menguji putaran motor servo SG90, melihat tangkapan kamera ESP32-CAM secara mandiri, dan melakukan simulasi penyortiran instan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Box 1: Uji Servo (Mobile Friendly Button Grid) */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">1. Uji Pengarah Flap Servo</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Uji coba langsung pergerakan flap SG90</p>
                    </div>
                    <div className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-xs tabular-nums">
                      Sudut: {currentServoAngle}°
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                    <button
                      onClick={() => handleServoControl(0, 'Organik')}
                      className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95"
                    >
                      <span className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums">0°</span>
                      <span className="text-[11px] sm:text-xs font-semibold text-emerald-900 truncate w-full">Organik</span>
                      <span className="text-[9px] sm:text-[10px] text-emerald-600 font-medium">(Kiri)</span>
                    </button>

                    <button
                      onClick={() => handleServoControl(30, 'Residu')}
                      className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95"
                    >
                      <span className="text-xl sm:text-2xl font-bold text-purple-700 tabular-nums">30°</span>
                      <span className="text-[11px] sm:text-xs font-semibold text-purple-900 truncate w-full">Residu</span>
                      <span className="text-[9px] sm:text-[10px] text-purple-600 font-medium">(Tengah)</span>
                    </button>

                    <button
                      onClick={() => handleServoControl(70, 'Anorganik')}
                      className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95"
                    >
                      <span className="text-xl sm:text-2xl font-bold text-sky-700 tabular-nums">70°</span>
                      <span className="text-[11px] sm:text-xs font-semibold text-sky-900 truncate w-full">Anorganik</span>
                      <span className="text-[9px] sm:text-[10px] text-sky-600 font-medium">(Kanan)</span>
                    </button>
                  </div>
                </div>

                {/* Box 2: Camera Snapshot */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">2. Frame Snapshot Kamera</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Tampilan foto terakhir modul ESP32-CAM</p>
                    </div>
                    <button
                      onClick={handleRefreshCamera}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
                    </button>
                  </div>

                  <div className="aspect-video w-full bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-inner">
                    <img
                      src={`${API_BASE}/api/camera/latest?t=${lastImageKey}`}
                      alt="Latest ESP32-CAM Frame"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] sm:text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-blue-400" />
                      <span>OV2640 Detection Stream</span>
                    </div>
                  </div>
                </div>

                {/* Box 3: Data Injector */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-3 sm:space-y-4 lg:col-span-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      3. Simulasi Masuk Sampah (Data Injector)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-normal">
                      Gunakan tombol di bawah ini untuk mensimulasikan deteksi sampah langsung tanpa menunggu pembacaan sensor fisik.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                    <button
                      disabled={isLoading}
                      onClick={() => handleInjectTrash('Organik')}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      + Suntik Sampah Organik (0°)
                    </button>

                    <button
                      disabled={isLoading}
                      onClick={() => handleInjectTrash('Anorganik')}
                      className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      + Suntik Sampah Anorganik (70°)
                    </button>

                    <button
                      disabled={isLoading}
                      onClick={() => handleInjectTrash('Residu')}
                      className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      + Suntik Sampah Residu (30°)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ==================== 3. MINIMAL MODERN FOOTER =========================== */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-slate-900 text-sm">SmartSort<span className="text-blue-600">.Ai</span></span>
            <span>• SIJA IoT & AI Project</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            ESP32 Microcontroller • OV2640 AI Camera • DHT11 & MQ-135 • Servo SG90 Diverter
          </div>
        </div>
      </footer>
    </div>
  );
}
