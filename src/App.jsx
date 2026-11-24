import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import ResetModal from './components/common/ResetModal';
import PinModal from './components/common/PinModal';
import TabSwitcher from './components/common/TabSwitcher';
import HeroSection from './components/hero/HeroSection';
import ShowcaseCards from './components/hero/ShowcaseCards';
import MonitoringTab from './components/tabs/MonitoringTab';
import HistoryTab from './components/tabs/HistoryTab';
import DiagnosisTab from './components/tabs/DiagnosisTab';
import { smartSortApi } from './api/smartSortApi';
import { useAdminAuth } from './hooks/useAdminAuth';
import { getChartData, chartOptions } from './utils/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusData, setStatusData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastImageKey, setLastImageKey] = useState(() => Date.now());
  const [cameraImageUrl, setCameraImageUrl] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const { isAuthenticated, verifyPin, logout } = useAdminAuth();

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
        devices: { ...current?.devices, ...data.devices }
      }));
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setIsStatusLoading(false);
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
    } finally {
      setIsHistoryLoading(false);
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

  // Guard critical operations with 6-digit PIN authentication
  const requireAuth = useCallback(
    (actionCallback) => {
      if (isAuthenticated) {
        actionCallback();
      } else {
        setPendingAction(() => actionCallback);
        setIsPinModalOpen(true);
      }
    },
    [isAuthenticated]
  );

  const handleVerifyPin = (inputPin) => {
    const isSuccess = verifyPin(inputPin);
    if (isSuccess) {
      showToast('Akses Operator Berhasil Dibuka!');
      setIsPinModalOpen(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    showToast('Sesi Operator Dikunci (Mode Tamu)');
  };

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

  const filteredHistory = historyData.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch =
      item.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      <Toast message={actionMessage} />

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetHistory}
      />

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingAction(null);
        }}
        onVerify={handleVerifyPin}
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
            onOpenResetModal={() => requireAuth(() => setIsResetModalOpen(true))}
            isAuthenticated={isAuthenticated}
            onOpenPinModal={() => setIsPinModalOpen(true)}
            onLogout={handleLogout}
          />

          <HeroSection onInjectSimulation={() => requireAuth(() => handleInjectTrash('Organik'))} />

          <ShowcaseCards
            statusData={statusData}
            cameraImageUrl={cameraImageUrl}
            onRefreshCamera={handleRefreshCamera}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'history') fetchHistory();
            }}
            isAuthenticated={isAuthenticated}
            onRequireAuth={requireAuth}
            isLoading={isStatusLoading}
          />
        </div>
      </section>

      {/* Operation Control & Tab Section */}
      <section className="bg-[#F8FAFD] py-8 sm:py-14 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8">
          <TabSwitcher
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={(tab) => {
              if (tab === 'history') fetchHistory();
            }}
            historyCount={isHistoryLoading ? '...' : historyData.length}
          />

          {activeTab === 'dashboard' && (
            <MonitoringTab
              statusData={statusData}
              chartData={getChartData(statusData)}
              chartOptions={chartOptions}
              onResetBins={() => handleResetBin(null)}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'history') fetchHistory();
              }}
              isAuthenticated={isAuthenticated}
              onRequireAuth={requireAuth}
              isLoading={isStatusLoading}
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
              isAuthenticated={isAuthenticated}
              onRequireAuth={requireAuth}
              isLoading={isHistoryLoading}
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
              isAuthenticated={isAuthenticated}
              onRequireAuth={requireAuth}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
