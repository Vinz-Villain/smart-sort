import { cameraSnapshotLabel } from '../../hooks/useCameraSnapshot';
import React from 'react';
import { Sparkles, Camera, RefreshCw, Cpu, ThermometerSun } from 'lucide-react';

export function buildShowcaseSlides({
  statusData,
  cameraFrame,
  onRefreshCamera,
  isAdminRoute
}) {
  const totalItems = statusData?.summary?.total_items ?? 0;
  const counts = statusData?.summary?.counts ?? {};
  const currentAngle = statusData?.devices?.servo_current_angle ?? 90;
  const currentCategory =
    currentAngle === 0 ? 'Organik' : currentAngle === 90 ? 'Anorganik' : 'Residu';

  return [
    {
      id: 'summary',
      badge: 'Ringkasan Klasifikasi AI',
      icon: Sparkles,
      title: `${totalItems} Sampah Terpilah`,
      description: 'Pembaruan real-time otomatis oleh model YOLOv8 pada setiap objek terdeteksi.',
      actionLabel: 'Lihat Riwayat Log',
      targetTab: 'history',
      body: (
        <div className="grid grid-cols-3 gap-1.5 mt-3">
          <div className="px-1.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-center">
            <span className="block text-xs font-bold text-emerald-700 tabular-nums">{counts.Organik ?? 0}</span>
            <span className="block text-[9.5px] font-medium text-emerald-600 truncate">Organik</span>
          </div>
          <div className="px-1.5 py-2 rounded-xl bg-amber-50 border border-amber-200/70 text-center">
            <span className="block text-xs font-bold text-amber-700 tabular-nums">{counts.Anorganik ?? 0}</span>
            <span className="block text-[9.5px] font-medium text-amber-600 truncate">Anorganik</span>
          </div>
          <div className="px-1.5 py-2 rounded-xl bg-rose-50 border border-rose-200/70 text-center">
            <span className="block text-xs font-bold text-rose-700 tabular-nums">{counts.Residu ?? 0}</span>
            <span className="block text-[9.5px] font-medium text-rose-600 truncate">Residu</span>
          </div>
        </div>
      )
    },
    {
      id: 'camera',
      badge: 'Kamera OV2640',
      icon: Camera,
      title: 'Foto klasifikasi terakhir',
      description: 'Foto dari proses klasifikasi terakhir yang diterima backend.',
      actionLabel: 'Diagnostik Kamera',
      targetTab: 'diagnosis',
      body: (
        <div className="mt-3 rounded-2xl overflow-hidden border border-emerald-200/80 bg-slate-900 aspect-video relative flex items-center justify-center shadow-inner">
          {cameraFrame.url && (
            <img
              src={cameraFrame.url}
              alt="Foto klasifikasi dari ESP32-CAM"
              className="w-full h-full object-cover transition-all duration-300"
            />
          )}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400/80 rounded-tl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400/80 rounded-br pointer-events-none" />

          <button
            type="button"
            onClick={onRefreshCamera}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer"
            title="Muat ulang foto"
            aria-label="Muat ulang foto"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/65 text-[10px] text-white backdrop-blur-md font-mono flex items-center gap-1.5 border border-emerald-400/25">
            <span role="status">{cameraSnapshotLabel(cameraFrame)}</span>
          </div>
        </div>
      )
    },
    {
      id: 'actuator',
      badge: 'Status Aktuator Servo SG90',
      icon: Cpu,
      title: `SERVO → ${currentAngle}°`,
      description: `Flap diverter mengarahkan jalur ke wadah ${currentCategory} secara presisi.`,
      actionLabel: isAdminRoute ? 'Uji Diagnostik' : 'Lihat Kamera',
      targetTab: 'diagnosis',
      body: (
        <div className="mt-3 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/70 grid grid-cols-3 gap-1 text-center">
          <div className={`py-1 px-1 rounded-lg ${currentAngle === 0 ? 'bg-emerald-100/90 text-emerald-800' : 'text-slate-400'}`}>
            <span className="block text-[11px] font-bold tabular-nums">0°</span>
            <span className="block text-[9.5px] font-medium truncate">Organik</span>
          </div>
          <div className={`py-1 px-1 rounded-lg ${currentAngle === 90 ? 'bg-amber-100/90 text-amber-800' : 'text-slate-400'}`}>
            <span className="block text-[11px] font-bold tabular-nums">90°</span>
            <span className="block text-[9.5px] font-medium truncate">Anorganik</span>
          </div>
          <div className={`py-1 px-1 rounded-lg ${currentAngle === 180 ? 'bg-rose-100/90 text-rose-800' : 'text-slate-400'}`}>
            <span className="block text-[11px] font-bold tabular-nums">180°</span>
            <span className="block text-[9.5px] font-medium truncate">Residu</span>
          </div>
        </div>
      )
    },
    {
      id: 'environment',
      badge: 'Sensor Lingkungan IoT',
      icon: ThermometerSun,
      title: `Gas: ${statusData?.environment?.gas_status ?? 'Normal'}`,
      description: 'Pemantauan kondisi suhu kompartemen dan kadar gas amonia/metana secara kontinu.',
      actionLabel: 'Buka Monitoring',
      targetTab: 'dashboard',
      body: (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-center">
            <span className="text-[10px] text-slate-500 block">Suhu DHT11</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {statusData?.environment?.temperature ?? 30.2}°C
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-center">
            <span className="text-[10px] text-slate-500 block">Gas MQ-135</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {statusData?.environment?.gas_value ?? 380} PPM
            </span>
          </div>
        </div>
      )
    }
  ];
}
