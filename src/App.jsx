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
import { useCameraSnapshot } from './hooks/useCameraSnapshot';
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
  const { frame: cameraFrame, refresh: handleRefreshCamera } = useCameraSnapshot();
  const [actionMessage, setActionMessage] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const { isAuthenticated, verifyPin } = useAdminAuth();
  const isAdminRoute =
    typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/adminnnn';

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

  const handleClosePinModal = () => {
    if (isAdminRoute && !isAuthenticated) {
      window.location.replace('/');
      return;
    }
    setIsPinModalOpen(false);
    setPendingAction(null);
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

  const handleExploreMonitoring = () => {
    setActiveTab('dashboard');
    const el = document.getElementById('control-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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

  const filteredHistory = historyData.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch =
      item.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const isAdminLocked = isAdminRoute && !isAuthenticated;

  return (
    <div className="min-h-screen bg-[#f8fbf9] text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Toast message={actionMessage} />

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetHistory}
      />

      <PinModal
        isOpen={isPinModalOpen || isAdminLocked}
        onClose={handleClosePinModal}
        onVerify={handleVerifyPin}
        cancelLabel={isAdminLocked ? 'Halaman Publik' : 'Batal'}
      />

      {isAdminLocked ? (
        <main className="flex-1 bg-fluted-green flex items-center justify-center p-6" aria-label="Gerbang PIN Operator" />
      ) : (
        <>
          {/* Hero Header Section (Light Botanical Fluted Canvas) */}
      <section className="bg-fluted-green text-slate-900 relative overflow-hidden pt-5 pb-14 sm:pb-20 border-b border-emerald-900/10">
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[620px] h-[280px] bg-emerald-300/20 blur-[110px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative">
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={(tab) => {
              if (tab === 'history') fetchHistory();
            }}
            statusData={statusData}
            isAdminMode={isAdminRoute && isAuthenticated}
          />

          <HeroSection onExplore={handleExploreMonitoring} />

          <ShowcaseCards
            statusData={statusData}
            cameraFrame={cameraFrame}
            onRefreshCamera={handleRefreshCamera}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'history') fetchHistory();
            }}
            isAdminRoute={isAdminRoute}
            isLoading={isStatusLoading}
          />
        </div>
      </section>

      {/* Operation Control & Tab Section */}
      <section id="control-section" className="bg-[#f8fbf9] py-8 sm:py-14 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8">
          <TabSwitcher
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={(tab) => {
              if (tab === 'history') fetchHistory();
            }}
            historyCount={isHistoryLoading ? '...' : historyData.length}
            isAdminRoute={isAdminRoute}
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
              isAdminRoute={isAdminRoute}
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
              isAdminRoute={isAdminRoute}
              isAuthenticated={isAuthenticated}
              onRequireAuth={requireAuth}
              isLoading={isHistoryLoading}
            />
          )}

          {activeTab === 'diagnosis' && (
            <DiagnosisTab
              currentServoAngle={statusData?.devices?.servo_current_angle ?? 90}
              cameraFrame={cameraFrame}
              onServoControl={handleServoControl}
              onRefreshCamera={handleRefreshCamera}
              isAdminRoute={isAdminRoute}
              isAuthenticated={isAuthenticated}
              onRequireAuth={requireAuth}
            />
          )}
        </div>
      </section>

      <Footer />
        </>
      )}
    </div>
  );
}
