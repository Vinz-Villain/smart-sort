import React from 'react';
import { AlertTriangle, RefreshCw, Camera, Sparkles, Trash2, Lock, ShieldAlert } from 'lucide-react';

export default function DiagnosisTab({
  currentServoAngle,
  cameraImageUrl,
  isLoading,
  onServoControl,
  onRefreshCamera,
  onInjectTrash,
  isAuthenticated,
  onRequireAuth
}) {
  const handleServoClick = (angle, category) => {
    onRequireAuth(() => onServoControl(angle, category));
  };

  const handleInjectClick = (category) => {
    onRequireAuth(() => onInjectTrash(category));
  };

  const handleCameraRefreshClick = () => {
    onRequireAuth(onRefreshCamera);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Alert Card */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
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

        {!isAuthenticated && (
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-semibold">
            <Lock className="w-3 h-3 text-amber-700" />
            <span>Terproteksi PIN 6-Digit</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Box 1: Uji Servo */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                <span>1. Uji Pengarah Flap Servo</span>
                {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-600" />}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Uji coba langsung pergerakan flap SG90</p>
            </div>
            <div className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-xs tabular-nums">
              Sudut: {currentServoAngle}°
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            <button
              onClick={() => handleServoClick(0, 'Organik')}
              className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95 relative"
            >
              {!isAuthenticated && (
                <span className="absolute top-2 right-2 text-emerald-600/70">
                  <Lock className="w-3 h-3" />
                </span>
              )}
              <span className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums">0°</span>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-900 truncate w-full">Organik</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-600 font-medium">(Kiri)</span>
            </button>

            <button
              onClick={() => handleServoClick(30, 'Residu')}
              className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95 relative"
            >
              {!isAuthenticated && (
                <span className="absolute top-2 right-2 text-rose-600/70">
                  <Lock className="w-3 h-3" />
                </span>
              )}
              <span className="text-xl sm:text-2xl font-bold text-rose-700 tabular-nums">30°</span>
              <span className="text-[11px] sm:text-xs font-semibold text-rose-900 truncate w-full">Residu</span>
              <span className="text-[9px] sm:text-[10px] text-rose-600 font-medium">(Tengah)</span>
            </button>

            <button
              onClick={() => handleServoClick(70, 'Anorganik')}
              className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95 relative"
            >
              {!isAuthenticated && (
                <span className="absolute top-2 right-2 text-amber-600/70">
                  <Lock className="w-3 h-3" />
                </span>
              )}
              <span className="text-xl sm:text-2xl font-bold text-amber-700 tabular-nums">70°</span>
              <span className="text-[11px] sm:text-xs font-semibold text-amber-900 truncate w-full">Anorganik</span>
              <span className="text-[9px] sm:text-[10px] text-amber-600 font-medium">(Kanan)</span>
            </button>
          </div>
        </div>

        {/* Box 2: Camera Snapshot with Privacy Blur */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                <span>2. Frame Snapshot Kamera</span>
                {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-600" />}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tampilan foto terakhir modul ESP32-CAM</p>
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleCameraRefreshClick}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
              </button>
            ) : null}
          </div>

          <div className="aspect-video w-full bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-inner">
            <img
              src={cameraImageUrl || null}
              alt="Latest ESP32-CAM Frame"
              className={`w-full h-full object-cover transition-all duration-300 ${
                !isAuthenticated ? 'blur-md opacity-40 scale-105' : ''
              }`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            {!isAuthenticated ? (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center mb-2 border border-white/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white tracking-tight">Pratinjau Terlindungi Privasi</div>
                <p className="text-[11px] text-slate-300 mt-1 max-w-[220px]">
                  Buka kunci dengan PIN operator untuk melihat snapshot kamera OV2640.
                </p>
                <button
                  onClick={() => onRequireAuth(() => {})}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Lock className="w-3 h-3" /> Buka Kunci Kamera
                </button>
              </div>
            ) : (
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] sm:text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-blue-400" />
                <span>OV2640 Detection Stream</span>
              </div>
            )}
          </div>
        </div>

        {/* Box 3: Data Injector */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-3 sm:space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>3. Simulasi Masuk Sampah (Data Injector)</span>
              {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-600" />}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Gunakan tombol di bawah ini untuk mensimulasikan deteksi sampah langsung tanpa menunggu pembacaan sensor fisik.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
            <button
              disabled={isLoading}
              onClick={() => handleInjectClick('Organik')}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>+ Suntik Sampah Organik (0°)</span>
              {!isAuthenticated && <Lock className="w-3 h-3 opacity-80" />}
            </button>

            <button
              disabled={isLoading}
              onClick={() => handleInjectClick('Anorganik')}
              className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>+ Suntik Sampah Anorganik (70°)</span>
              {!isAuthenticated && <Lock className="w-3 h-3 opacity-80" />}
            </button>

            <button
              disabled={isLoading}
              onClick={() => handleInjectClick('Residu')}
              className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>+ Suntik Sampah Residu (30°)</span>
              {!isAuthenticated && <Lock className="w-3 h-3 opacity-80" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
