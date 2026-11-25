import React from 'react';
import { Trash2, Lock, Unlock, ShieldCheck, User } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onTabChange,
  statusData,
  onOpenResetModal,
  isAuthenticated,
  onOpenPinModal,
  onLogout
}) {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <nav className="flex items-center justify-between pb-6 sm:pb-8 border-b border-white/10 gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white shrink-0">
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            SmartSort<span className="text-blue-400">.Ai</span>
          </span>
        </div>
      </div>

      {/* Nav Menu Center (Desktop) */}
      {/* <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          Monitoring
        </button>
        <button
          onClick={() => handleTabClick('history')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          Riwayat Log
        </button>
        <button
          onClick={() => handleTabClick('diagnosis')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            activeTab === 'diagnosis' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          Kontrol Manual
        </button>
      </div> */}

      {/* Right Controls & Auth Badge */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* ESP32 Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
          <span className="font-medium text-[11px]">
            ESP32: {statusData?.devices?.esp32_controller || 'Online'}
          </span>
        </div>

        {/* Auth State Button */}
        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium backdrop-blur-sm transition cursor-pointer shadow-sm"
            title="Klik untuk mengunci kembali ke Mode Tamu"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold">Operator</span>
            <Unlock className="w-3 h-3 text-emerald-400 opacity-80" />
          </button>
        ) : (
          <button
            onClick={onOpenPinModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-medium backdrop-blur-sm transition cursor-pointer"
            title="Klik untuk membuka akses kontrol operator via PIN"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium hidden sm:inline">Mode Tamu</span>
            <Lock className="w-3 h-3 text-amber-300" />
          </button>
        )}

        {/* Reset Trigger */}
        {/* <button
          onClick={onOpenResetModal}
          className="px-3.5 sm:px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
        >
          Reset
        </button> */}
      </div>
    </nav>
  );
}
