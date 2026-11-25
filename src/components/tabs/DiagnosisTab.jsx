import { cameraSnapshotLabel } from '../../hooks/useCameraSnapshot';
import React from 'react';
import { AlertTriangle, RefreshCw, Camera, Lock } from 'lucide-react';

export default function DiagnosisTab({
  currentServoAngle,
  cameraFrame,
  onServoControl,
  onRefreshCamera,
  isAdminRoute,
  isAuthenticated,
  onRequireAuth
}) {
  const handleServoClick = (angle, category) => {
    onRequireAuth(() => onServoControl(angle, category));
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Alert / Info Card */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 border ${
          isAdminRoute
            ? 'bg-amber-50/80 border-amber-200'
            : 'bg-emerald-50/80 border-emerald-200'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-white flex items-center justify-center shrink-0 ${
              isAdminRoute ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
          >
            {isAdminRoute ? (
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
          <div>
            <h3
              className={`text-xs sm:text-sm font-bold m-0 ${
                isAdminRoute ? 'text-amber-950' : 'text-emerald-950'
              }`}
            >
              {isAdminRoute
                ? 'Panel Pengujian Manual & Diagnostik'
                : 'Panel Diagnostik Visual Kamera'}
            </h3>
            <p
              className={`text-xs mt-0.5 font-normal ${
                isAdminRoute ? 'text-amber-800' : 'text-emerald-800'
              }`}
            >
              {isAdminRoute
                ? 'Gunakan panel ini untuk menguji putaran motor servo SG90 dan melihat tangkapan kamera ESP32-CAM secara mandiri.'
                : 'Lihat foto klasifikasi terakhir dari ESP32-CAM.'}
            </p>
          </div>
        </div>

        {isAdminRoute && !isAuthenticated && (
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-semibold">
            <Lock className="w-3 h-3 text-amber-700" />
            <span>Servo Terproteksi PIN 6-Digit</span>
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${isAdminRoute ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
        {/* Box 1: Uji Servo (Admin Route Only, PIN Protected) */}
        {isAdminRoute && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                  <span>1. Uji Pengarah Flap Servo</span>
                  {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Uji coba langsung pergerakan flap SG90</p>
              </div>
              <div className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs tabular-nums">
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
                onClick={() => handleServoClick(90, 'Anorganik')}
                className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95 relative"
              >
                {!isAuthenticated && (
                  <span className="absolute top-2 right-2 text-amber-600/70">
                    <Lock className="w-3 h-3" />
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-bold text-amber-700 tabular-nums">90°</span>
                <span className="text-[11px] sm:text-xs font-semibold text-amber-900 truncate w-full">Anorganik</span>
                <span className="text-[9px] sm:text-[10px] text-amber-600 font-medium">(Tengah)</span>
              </button>

              <button
                onClick={() => handleServoClick(180, 'Residu')}
                className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95 relative"
              >
                {!isAuthenticated && (
                  <span className="absolute top-2 right-2 text-rose-600/70">
                    <Lock className="w-3 h-3" />
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-bold text-rose-700 tabular-nums">180°</span>
                <span className="text-[11px] sm:text-xs font-semibold text-rose-900 truncate w-full">Residu</span>
                <span className="text-[9px] sm:text-[10px] text-rose-600 font-medium">(Kanan)</span>
              </button>
            </div>
          </div>
        )}

        {/* Box 2: Camera Snapshot (Publicly Accessible) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">
                Foto klasifikasi terakhir
              </h3>
            </div>
            <button
              onClick={onRefreshCamera}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Muat ulang
            </button>
          </div>

          <div className="aspect-video w-full bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-inner">
            {cameraFrame.url && (
              <img
                src={cameraFrame.url}
                alt="Foto klasifikasi dari ESP32-CAM"
                className="w-full h-full object-cover transition-all duration-300"
              />
            )}
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] sm:text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-emerald-400" />
              <span role="status">{cameraSnapshotLabel(cameraFrame)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
