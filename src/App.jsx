import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Gauge, BarChart3, Sliders } from 'lucide-react';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import ResetModal from './components/common/ResetModal';
import HeroSection from './components/hero/HeroSection';
import ShowcaseCards from './components/hero/ShowcaseCards';
import MonitoringTab from './components/tabs/MonitoringTab';
import HistoryTab from './components/tabs/HistoryTab';
import DiagnosisTab from './components/tabs/DiagnosisTab';
import { smartSortApi } from './api/smartSortApi';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history', 'diagnosis'
  const [statusData, setStatusData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastImageKey, setLastImageKey] = useState(() => Date.now());
  const [cameraImageUrl, setCameraImageUrl] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const showToast = useCallback((msg, isError = false) => {
    setActionMessage({ msg, isError });
    setTimeout(() => setActionMessage(null), 3500);
  }, []);

  // Fetch production device status and sensor telemetry
  const fetchStatus = useCallback(async () => {
    try {
      const data = await smartSortApi.fetchDashboardStatus();
      setStatusData((current) => ({
        ...current,
        summary: current?.summary ?? {
          total_items: 0,
          counts: { Organik: 0, Anorganik: 0, Residu: 0 },
          percentages: { Organik: 0, Anorganik: 0, Residu: 0 }
        },
        capacities: data.capacities,
        environment: data.environment,
        devices: {
          ...current?.devices,
          ...data.devices
        }
      }));
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  }, []);

  // Fetch history dataset
  const fetchHistory = useCallback(async () => {
    try {
      const data = await smartSortApi.fetchHistory(100);
      setHistoryData(data.entries);
      setStatusData((current) => ({
        ...current,
        summary: {
          total_items: data.total,
          counts: data.counts,
          percentages: data.percentages
        },
        recent_activity: data.recentActivity
      }));
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, []);

  // Polling effect
  useEffect(() => {
    fetchStatus();
    fetchHistory();
    const statusInterval = setInterval(fetchStatus, 2000);
    const historyInterval = setInterval(fetchHistory, 10000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(historyInterval);
    };
  }, [fetchStatus, fetchHistory, activeTab]);

  // Camera preview effect
  useEffect(() => {
    let activeObjectUrl = null;
    smartSortApi
      .fetchCameraFrame(lastImageKey)
      .then(({ isBase64, url }) => {
        if (!isBase64) activeObjectUrl = url;
        setCameraImageUrl(url);
      })
      .catch((err) => console.error('Error fetching camera image:', err));

    return () => {
      if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
    };
  }, [lastImageKey]);

  // Action handlers
  const handleServoControl = async (angle, category) => {
    try {
      await smartSortApi.setServoAngle(angle);
      showToast(`Flap berhasil diarahkan ke ${angle}° (${category})`);
      fetchStatus();
    } catch {
      showToast('Gagal menggerakkan servo', true);
    }
  };

  const handleInjectTrash = async (category) => {
    try {
      setIsLoading(true);
      await smartSortApi.injectTrashSample(category);
      showToast(`Berhasil menyuntikkan sampel ${category}`);
      fetchHistory();
      fetchStatus();
    } catch {
      showToast('Gagal menyuntikkan data', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetHistory = async () => {
    setIsResetModalOpen(false);
    showToast('Endpoint reset riwayat tidak tersedia pada API production', true);
  };

  const handleResetBin = async (category = null) => {
    try {
      await smartSortApi.resetBins(category);
      showToast(
        category
          ? `Kapasitas wadah ${category} direset ke 0%`
          : 'Semua kompartemen berhasil dikosongkan!'
      );
      fetchStatus();
    } catch {
      showToast('Gagal mereset wadah', true);
    }
  };

  const handleExportHistory = async (event) => {
    event.preventDefault();
    try {
      await smartSortApi.exportHistoryCsv();
    } catch {
      showToast('Gagal mengunduh riwayat', true);
    }
  };

  const handleRefreshCamera = () => {
    setLastImageKey(Date.now());
    showToast('Snapshot frame kamera diperbarui');
  };

  // Filter history data
  const filteredHistory = historyData.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch =
      item.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

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
        backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
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

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Toast Notification */}
      <Toast message={actionMessage} />

      {/* Confirmation Reset Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetHistory}
      />

      {/* Hero Header Section */}
      <section className="bg-fluted-blue text-white relative overflow-hidden pt-5 pb-16 sm:pb-24 border-b border-indigo-950/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-500/20 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={(tab) => {
              if (tab === 'history') fetchHistory();
            }}
            statusData={statusData}
            onOpenResetModal={() => setIsResetModalOpen(true)}
          />

          <HeroSection onInjectSimulation={() => handleInjectTrash('Organik')} />

          <ShowcaseCards
            statusData={statusData}
            cameraImageUrl={cameraImageUrl}
            onRefreshCamera={handleRefreshCamera}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'history') fetchHistory();
            }}
          />
        </div>
      </section>

      {/* Operation Control & Tab Section */}
      <section className="bg-[#F8FAFD] py-8 sm:py-14 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8">
          {/* View Switcher Header */}
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

            {/* Segmented Pill Tabs */}
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

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <MonitoringTab
              statusData={statusData}
              chartData={chartData}
              chartOptions={chartOptions}
              onResetBins={() => handleResetBin(null)}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'history') fetchHistory();
              }}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              filteredHistory={filteredHistory}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExportCsv={handleExportHistory}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}

          {activeTab === 'diagnosis' && (
            <DiagnosisTab
              currentServoAngle={statusData?.devices?.servo_current_angle ?? 30}
              cameraImageUrl={cameraImageUrl}
              isLoading={isLoading}
              onServoControl={handleServoControl}
              onRefreshCamera={handleRefreshCamera}
              onInjectTrash={handleInjectTrash}
            />
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
