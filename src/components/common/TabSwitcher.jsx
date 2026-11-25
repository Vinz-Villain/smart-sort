import React from 'react';
import { Gauge, BarChart3, Sliders } from 'lucide-react';

export default function TabSwitcher({ activeTab, setActiveTab, onTabChange, historyCount, isAdminRoute }) {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
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
          {activeTab === 'diagnosis' &&
            (isAdminRoute
              ? 'Kontrol sudut aktuator servo SG90 dan diagnostik visual kamera'
              : 'Diagnostik visual tangkapan kamera ESP32-CAM secara real-time')}
        </p>
      </div>

      <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 bg-emerald-950/[0.05] p-1 rounded-2xl border border-emerald-900/10">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500/15' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Monitoring</span>
        </button>
        <button
          onClick={() => handleTabClick('history')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500/15' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Riwayat ({historyCount})</span>
        </button>
        <button
          onClick={() => handleTabClick('diagnosis')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'diagnosis' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500/15' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Diagnostik</span>
        </button>
      </div>
    </div>
  );
}
