import React from 'react';
import { RotateCcw, Trash2, ChevronRight, ArrowRight, Lock } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { getCapacityColor } from '../../utils/formatters';
import MonitoringTabSkeleton from '../skeletons/MonitoringTabSkeleton';

export default function MonitoringTab({
  statusData,
  chartData,
  chartOptions,
  onResetBins,
  onNavigateTab,
  isAuthenticated,
  onRequireAuth,
  isLoading
}) {
  if (isLoading) {
    return <MonitoringTabSkeleton />;
  }

  const handleResetBinsClick = () => {
    onRequireAuth(onResetBins);
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Bento: Capacities & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left (7 Cols): Kapasitas Kompartemen */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">
                  Kapasitas Keterisian Kompartemen
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau ketinggian sampah sebelum wadah penuh
                </p>
              </div>
              <button
                onClick={handleResetBinsClick}
                className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Kosongkan Wadah</span>
                {!isAuthenticated && <Lock className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            <div className="space-y-3.5">
              {['Organik', 'Anorganik', 'Residu'].map((cat) => {
                const cap = statusData?.capacities?.[cat] ?? 0;
                const statusColor = getCapacityColor(cap);
                const categoryColor =
                  cat === 'Organik'
                    ? { badge: 'border-emerald-200/80 text-emerald-700 bg-emerald-50', bar: 'bg-emerald-500' }
                    : cat === 'Anorganik'
                    ? { badge: 'border-amber-200/80 text-amber-700 bg-amber-50', bar: 'bg-amber-500' }
                    : { badge: 'border-rose-200/80 text-rose-700 bg-rose-50', bar: 'bg-rose-500' };

                return (
                  <div key={cat} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2.5 py-0.5 rounded-lg font-semibold border ${categoryColor.badge}`}>
                        Wadah {cat}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusColor.badge}`}>
                          {statusColor.label}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm tabular-nums">{cap}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/70 rounded-full h-2.5 sm:h-3 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${categoryColor.bar}`}
                        style={{ width: `${Math.min(100, Math.max(cap, 4))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Threshold Penuh: 85%</span>
            <span className="text-blue-600 font-semibold">Ultrasonik Aktif</span>
          </div>
        </div>

        {/* Right (5 Cols): Donut Proporsi */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Proporsi Klasifikasi Sampah</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribusi pengelompokan sampah oleh AI</p>

            <div className="h-48 sm:h-56 relative my-3 sm:my-4 flex items-center justify-center">
              {statusData?.summary?.total_items > 0 ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Belum ada data pemilahan terekam
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 sm:pt-4 border-t border-slate-100">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-emerald-700 font-semibold block text-xs sm:text-sm tabular-nums">
                {statusData?.summary?.percentages?.Organik ?? 0}%
              </span>
              <span className="text-emerald-600 text-[10px] font-medium">Organik</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-amber-700 font-semibold block text-xs sm:text-sm tabular-nums">
                {statusData?.summary?.percentages?.Anorganik ?? 0}%
              </span>
              <span className="text-amber-600 text-[10px] font-medium">Anorganik</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-rose-700 font-semibold block text-xs sm:text-sm tabular-nums">
                {statusData?.summary?.percentages?.Residu ?? 0}%
              </span>
              <span className="text-rose-600 text-[10px] font-medium">Residu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Aktivitas Pemilahan Terbaru (Real-Time)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Log data objek terdeteksi masuk ke sistem</p>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
          >
            Semua Log <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Waktu</th>
                <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Kategori Sampah</th>
                <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Akurasi AI</th>
                <th className="py-2.5 sm:py-3 px-3.5 sm:px-4">Aksi Mekanik Flap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {statusData?.recent_activity?.length > 0 ? (
                statusData.recent_activity.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 font-mono text-slate-500 text-[11px] sm:text-xs">
                      {item.timestamp}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3.5 sm:px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg font-semibold text-[10px] sm:text-[11px] border ${
                          item.category === 'Organik'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.category === 'Anorganik'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3.5 sm:px-4">
                      <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/70 tabular-nums text-[11px] sm:text-xs">
                        {item.confidence}%
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        {item.action || `Flap bergerak ke ${item.servo_angle}°`}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">
                    Belum ada aktivitas terekam. Menunggu objek terdeteksi oleh sensor perangkat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
