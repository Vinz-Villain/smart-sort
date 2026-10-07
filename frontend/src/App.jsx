import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Trash2,
  Thermometer,
  Droplets,
  Wind,
  Cpu,
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
  ArrowRight
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
      showToast(`Flap berhasil digerakkan ke ${angle}° (${category})`);
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
      showToast(`Berhasil menyuntikkan sampah ${category} (${res.data.entry.confidence}%)`);
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
      showToast(category ? `Kapasitas wadah ${category} direset ke 0%` : 'Semua wadah berhasil dikosongkan!');
      fetchStatus();
    } catch (err) {
      showToast('Gagal mereset wadah', true);
    }
  };

  // Refresh latest camera image
  const handleRefreshCamera = () => {
    setLastImageKey(Date.now());
    showToast('Foto snapshot diperbarui');
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
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
        borderColor: ['#15803d', '#1d4ed8', '#b45309'],
        borderWidth: 2,
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
          color: '#cbd5e1',
          font: { size: 12, weight: 'bold' }
        }
      }
    },
    cutout: '70%'
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
    if (val <= 50) return { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Aman / Kosong' };
    if (val <= 80) return { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Waspada' };
    return { bar: 'bg-rose-500', text: 'text-rose-400', label: 'Penuh / Segera Angkut' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium transition-all animate-bounce ${
            actionMessage.isError ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {actionMessage.isError ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{actionMessage.msg}</span>
        </div>
      )}

      {/* Confirmation Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Konfirmasi Reset Data
            </h3>
            <p className="text-slate-300 mt-3 text-sm leading-relaxed">
              Apakah Anda yakin ingin mengosongkan semua riwayat dan mereset counter sampah ke 0?
              Tindakan ini sangat berguna untuk memulai sesi demo dari awal.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition"
              >
                Batal
              </button>
              <button
                onClick={handleResetHistory}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-sm font-semibold shadow-lg shadow-rose-600/30 transition"
              >
                Ya, Reset ke Nol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trash2 className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white m-0">SmartSort</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  SIJA IoT v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Tempat Sampah Pintar Pemilah Otomatis Berbasis IoT & AI</p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  statusData?.devices?.esp32_controller === 'Online' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300">ESP32: {statusData?.devices?.esp32_controller || 'Online'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  statusData?.devices?.esp32_cam === 'Online' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300">ESP32-CAM: {statusData?.devices?.esp32_cam || 'Online'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-300">AI: {statusData?.devices?.ai_engine || 'Standby'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 text-slate-400 border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Update: {statusData?.summary?.last_update || '--:--:--'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex border-b border-slate-800 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 flex items-center gap-2 transition border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            1. Live Monitoring
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`pb-3 flex items-center gap-2 transition border-b-2 ${
              activeTab === 'history'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            2. Riwayat & Log
          </button>
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`pb-3 flex items-center gap-2 transition border-b-2 ${
              activeTab === 'diagnosis'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            3. Kontrol Manual & Diagnosis (Plan B)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-6 flex-1 space-y-6">
        {/* ============================== TAB 1: DASHBOARD UTAMA ============================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Total Sampah */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sampah Masuk</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Trash2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {statusData?.summary?.total_items ?? 0}
                  </span>
                  <span className="text-sm font-medium text-slate-400">Item tersortir</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="text-emerald-400 block font-bold">{statusData?.summary?.counts?.Organik ?? 0}</span>
                    <span className="text-slate-400 text-[11px]">Organik</span>
                  </div>
                  <div>
                    <span className="text-blue-400 block font-bold">{statusData?.summary?.counts?.Anorganik ?? 0}</span>
                    <span className="text-slate-400 text-[11px]">Anorganik</span>
                  </div>
                  <div>
                    <span className="text-amber-400 block font-bold">{statusData?.summary?.counts?.Residu ?? 0}</span>
                    <span className="text-slate-400 text-[11px]">Residu</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Kondisi Wadah (DHT11) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kondisi Lingkungan (DHT11)</span>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Thermometer className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white">
                      {statusData?.environment?.temperature ?? 30.2}°C
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Suhu Ruang Wadah
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-cyan-300">
                      {statusData?.environment?.humidity ?? 68}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-end">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Kelembapan (RH)
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">● Kondisi Stabil</span> - Wadah dalam sirkulasi ideal
                </div>
              </div>

              {/* Card 3: Kualitas Udara (MQ-135) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kualitas Udara & Bau (MQ-135)</span>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Wind className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-white">
                      {statusData?.environment?.gas_value ?? 380}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5">ADC PPM</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      statusData?.environment?.gas_status === 'Normal'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : statusData?.environment?.gas_status === 'Bau Sedang'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {statusData?.environment?.gas_status ?? 'Normal'}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Sensor gas mencegah pembusukan sampah organik tak terkontrol.
                </div>
              </div>
            </div>

            {/* Middle Section: Kapasitas Wadah & Proporsi AI Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kapasitas Wadah (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-bold text-white m-0">Kapasitas Keterisian Wadah</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Dihitung akumulatif per pemilahan sampah masuk ke kompartemen masing-masing
                      </p>
                    </div>
                    <button
                      onClick={() => handleResetBin(null)}
                      title="Kosongkan semua tong"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Kosongkan Wadah
                    </button>
                  </div>

                  {/* 3 Progress Bars */}
                  <div className="space-y-5">
                    {/* Wadah Organik */}
                    {['Organik', 'Anorganik', 'Residu'].map((cat) => {
                      const cap = statusData?.capacities?.[cat] ?? 0;
                      const statusColor = getCapacityColor(cap);
                      const catBadge =
                        cat === 'Organik'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : cat === 'Anorganik'
                          ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                          : 'border-amber-500/30 text-amber-400 bg-amber-500/10';

                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${catBadge}`}>
                              Wadah {cat}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${statusColor.text}`}>
                                {statusColor.label}
                              </span>
                              <span className="font-extrabold text-white">{cap}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/60">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`}
                              style={{ width: `${Math.min(100, Math.max(cap, 3))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info Flap Mekanik */}
                <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                      ⚙️
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-300">Posisi Servo Flap Terakhir</div>
                      <div className="text-sm font-bold text-teal-400">
                        {statusData?.devices?.servo_current_angle ?? 30}° (Diverter Flap)
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    Organik (0°) • Residu (30°) • Anorganik (70°)
                  </div>
                </div>
              </div>

              {/* Proporsi AI Doughnut Chart (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white m-0">Proporsi Sampah Tersortir</h2>
                  <p className="text-xs text-slate-400 mt-1">Distribusi hasil klasifikasi model AI</p>
                </div>
                <div className="h-56 relative my-4 flex items-center justify-center">
                  {statusData?.summary?.total_items > 0 ? (
                    <Doughnut data={chartData} options={chartOptions} />
                  ) : (
                    <div className="text-center text-slate-500 text-sm">
                      <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada data sampah masuk
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-800">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold block">{statusData?.summary?.percentages?.Organik ?? 0}%</span>
                    <span className="text-slate-400 text-[10px]">Organik</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-blue-400 font-bold block">{statusData?.summary?.percentages?.Anorganik ?? 0}%</span>
                    <span className="text-slate-400 text-[10px]">Anorganik</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-amber-400 font-bold block">{statusData?.summary?.percentages?.Residu ?? 0}%</span>
                    <span className="text-slate-400 text-[10px]">Residu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Aktivitas Pemilahan Terakhir (Mini Table) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white m-0">Aktivitas Pemilahan Terbaru (Real-Time)</h2>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                >
                  Lihat Semua Log <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">WAKTU</th>
                      <th className="py-2.5 px-3">JENIS SAMPAH</th>
                      <th className="py-2.5 px-3">SKOR AI</th>
                      <th className="py-2.5 px-3">AKSI MEKANIK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {statusData?.recent_activity?.length > 0 ? (
                      statusData.recent_activity.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3 font-mono text-slate-400">{item.timestamp}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                                item.category === 'Organik'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : item.category === 'Anorganik'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-200">
                            <span className="text-teal-400">{item.confidence}%</span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                            {item.action || `Flap belok ke ${item.servo_angle}°`}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-slate-500">
                          Belum ada aktivitas terekam. Masukkan sampah atau gunakan simulasi.
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
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white m-0">Riwayat Log Pemilahan Sampah</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Basis data lengkap untuk pengujian dan evaluasi performa model AI (Total {filteredHistory.length} data)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`${API_BASE}/api/history/export`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Download className="w-4 h-4" /> Unduh CSV / Excel
                  </a>
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Log Data
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold mr-1">Filter Kategori:</span>
                  {['All', 'Organik', 'Anorganik', 'Residu'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        filterCategory === cat
                          ? 'bg-slate-700 text-white shadow'
                          : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari ID / tanggal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold z-10">
                    <tr>
                      <th className="py-3 px-4">NO / ID</th>
                      <th className="py-3 px-4">WAKTU & TANGGAL</th>
                      <th className="py-3 px-4">KATEGORI TERDETEKSI</th>
                      <th className="py-3 px-4">CONFIDENCE SCORE AI</th>
                      <th className="py-3 px-4">SUDUT SERVO FLAP</th>
                      <th className="py-3 px-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-400">#{row.id}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{row.timestamp}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-md font-bold text-[11px] ${
                                row.category === 'Organik'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : row.category === 'Anorganik'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {row.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {row.confidence}%
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {row.servo_angle}°
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil Tersortir
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500">
                          Tidak ada data yang cocok dengan pencarian / filter.
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
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber-300 m-0">Fitur Diagnosis & Plan B Demo</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Panel ini berfungsi untuk menguji komponen fisik satu per satu dan menjadi penyelamat jika terjadi kendala sensor / Wi-Fi saat demonstrasi langsung ke penguji.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Uji Manual Servo (Override Controls) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white m-0">1. Uji Manual Flap Servo</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Override langsung sudut motor servo SG90</p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-xs">
                    Sudut Aktif: {statusData?.devices?.servo_current_angle ?? 30}°
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => handleServoControl(0, 'Organik')}
                    className="p-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-center transition group flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl font-black">0°</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Flap Organik</span>
                    <span className="text-[10px] text-emerald-400/80">(Arah Kiri)</span>
                  </button>

                  <button
                    onClick={() => handleServoControl(30, 'Residu')}
                    className="p-4 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-center transition group flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl font-black">30°</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Flap Residu</span>
                    <span className="text-[10px] text-amber-400/80">(Posisi Tengah/Netral)</span>
                  </button>

                  <button
                    onClick={() => handleServoControl(70, 'Anorganik')}
                    className="p-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-center transition group flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl font-black">70°</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Flap Anorganik</span>
                    <span className="text-[10px] text-blue-400/80">(Arah Kanan)</span>
                  </button>
                </div>
              </div>

              {/* Box 2: Uji Snapshot Kamera ESP32-CAM */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white m-0">2. Uji Kamera ESP32-CAM</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Frame snapshot foto terakhir yang dikirim kamera</p>
                  </div>
                  <button
                    onClick={handleRefreshCamera}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Frame
                  </button>
                </div>

                <div className="aspect-video w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center relative group">
                  <img
                    src={`${API_BASE}/api/camera/latest?t=${lastImageKey}`}
                    alt="Latest ESP32-CAM Frame"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>OV2640 Resolution Mode: QVGA / VGA</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Quick Data Injector (Demo Saver) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 lg:col-span-2">
                <div>
                  <h3 className="text-base font-bold text-white m-0 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    3. Simulasi Sampah Masuk (Data Injector - Live Demo Saver)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Jika saat demonstrasi sensor ultrasonik tidak mendeteksi sampah karena pantulan sudut atau pencahayaan ruangan, Anda dapat mengklik tombol ini secara instan di depan penguji untuk membuktikan seluruh sistem tetap berjalan mulus.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <button
                    disabled={isLoading}
                    onClick={() => handleInjectTrash('Organik')}
                    className="py-4 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    + Suntik Sampah Organik (0°)
                  </button>

                  <button
                    disabled={isLoading}
                    onClick={() => handleInjectTrash('Anorganik')}
                    className="py-4 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    + Suntik Sampah Anorganik (70°)
                  </button>

                  <button
                    disabled={isLoading}
                    onClick={() => handleInjectTrash('Residu')}
                    className="py-4 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    + Suntik Sampah Residu (30°)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        SmartSort IoT System • SIJA Project • ESP32-CAM OV2640 & HC-SR04 & SG90 Flap Controller
      </footer>
    </div>
  );
}
