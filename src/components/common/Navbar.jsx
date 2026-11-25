import React from 'react';
import { ShieldCheck } from 'lucide-react';
import smartsortLogo from '../../assets/smartsort-logo.png';

export default function Navbar({
  activeTab,
  setActiveTab,
  onTabChange,
  statusData,
  isAdminMode = false
}) {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
    const el = document.getElementById('control-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="flex items-center justify-between pb-5 sm:pb-7 border-b border-emerald-900/10 gap-3">
      {/* Brand Logo */}
      <div className="flex items-center shrink-0">
        <img
          src={smartsortLogo}
          alt="SmartSort Logo"
          className="h-7 sm:h-9 w-auto object-contain select-none"
        />
      </div>

      {/* Minimalist Center Navigation (Desktop) */}
      <div className="hidden md:flex items-center gap-7 text-xs font-medium">
        {[
          { id: 'dashboard', label: 'Monitoring' },
          { id: 'history', label: 'Riwayat Log' },
          { id: 'diagnosis', label: 'Diagnostik' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`transition cursor-pointer py-1 relative ${
              activeTab === item.id
                ? 'text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {item.label}
            {activeTab === item.id && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {/* Right Status Pills */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 sm:px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-medium">
            ESP32: {statusData?.devices?.esp32_controller || 'Online'}
          </span>
        </div>

        {isAdminMode && (
          <div
            aria-label="Status Admin"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-white text-[11px] sm:text-xs font-semibold select-none pointer-events-none bg-gradient-to-b from-[#5ed655] via-[#2eb344] to-[#1d8a34] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),0_8px_18px_-6px_rgba(34,197,94,0.38)]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-50 shrink-0" />
            <span>Admin</span>
          </div>
        )}
      </div>
    </nav>
  );
}
