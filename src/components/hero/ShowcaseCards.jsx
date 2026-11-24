import React from 'react';
import { Sparkles, RefreshCw, ArrowRight, Send, Lock } from 'lucide-react';

export default function ShowcaseCards({
  statusData,
  cameraImageUrl,
  onRefreshCamera,
  onNavigateTab,
  isAuthenticated,
  onRequireAuth
}) {
  const currentServoAngle = statusData?.devices?.servo_current_angle ?? 30;
  const currentCategoryActive =
    currentServoAngle === 0 ? 'Organik' : currentServoAngle === 70 ? 'Anorganik' : 'Residu';

  return (
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
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="font-medium text-slate-600">Anorganik</span>
              </div>
              <span className="font-semibold text-slate-900 tabular-nums">
                {statusData?.summary?.counts?.Anorganik ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
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
            onClick={() => onNavigateTab('history')}
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
              src={cameraImageUrl || null}
              alt="ESP32-CAM Frame"
              className={`w-full h-full object-cover transition-all duration-300 ${
                !isAuthenticated ? 'blur-sm opacity-50 scale-105' : ''
              }`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 border border-blue-400/40 pointer-events-none rounded-xl sm:rounded-2xl" />

            {!isAuthenticated ? (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                <button
                  onClick={() => onRequireAuth(onRefreshCamera)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20 shadow-md backdrop-blur-md transition cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-amber-300" /> Buka Kamera (PIN)
                </button>
              </div>
            ) : (
              <>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={onRefreshCamera}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer"
                    title="Refresh Frame"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-[10px] text-white backdrop-blur-md font-mono">
                  OV2640: Live Stream
                </div>
              </>
            )}
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

          {/* Dotted Trajectory Path */}
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
              <div className={`font-semibold text-[11px] sm:text-xs ${currentServoAngle === 30 ? 'text-rose-400' : 'text-slate-400'}`}>30°</div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">Residu</div>
            </div>
            <div className="flex-1 px-1 sm:px-2 flex items-center justify-center">
              <div className="w-full border-t border-dashed border-cyan-400/50 relative flex items-center justify-center">
                <Send className="w-3 h-3 text-cyan-400 absolute transform rotate-45" />
              </div>
            </div>
            <div className="text-center shrink-0">
              <div className={`font-semibold text-[11px] sm:text-xs ${currentServoAngle === 70 ? 'text-amber-400' : 'text-slate-400'}`}>70°</div>
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
          <span className="truncate pr-2">
            Gas: <strong className="text-white font-medium">{statusData?.environment?.gas_status ?? 'Normal'}</strong>
          </span>
          <button
            onClick={() => onNavigateTab('diagnosis')}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="Buka Diagnosis"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
