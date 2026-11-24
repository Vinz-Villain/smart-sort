import React from 'react';
import { Download, RotateCcw, Filter, Search, CheckCircle2, Lock } from 'lucide-react';
import { API_BASE } from '../../api/client';
import HistoryTableSkeleton from '../skeletons/HistoryTableSkeleton';

export default function HistoryTab({
  filteredHistory,
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
  onExportCsv,
  onOpenResetModal,
  isAuthenticated,
  onRequireAuth,
  isLoading
}) {
  const handleResetLogClick = () => {
    onRequireAuth(onOpenResetModal);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 m-0">Riwayat Log Pemilahan Sampah</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dataset riwayat pemilahan untuk pengujian akurasi model AI (Total {isLoading ? '...' : filteredHistory.length} data tersimpan)
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <a
              href={`${API_BASE}/api/history/export?format=csv`}
              onClick={onExportCsv}
              className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Unduh CSV
            </a>
            <button
              onClick={handleResetLogClick}
              className="px-3.5 sm:px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Log</span>
              {!isAuthenticated && <Lock className="w-3 h-3 text-rose-500" />}
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['All', 'Organik', 'Anorganik', 'Residu'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID atau timestamp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
            />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] z-10">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Waktu & Tanggal</th>
                <th className="py-3 px-4">Kategori Terdeteksi</th>
                <th className="py-3 px-4">Confidence AI</th>
                <th className="py-3 px-4">Sudut Flap</th>
                <th className="py-3 px-4">Status Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <HistoryTableSkeleton rows={6} />
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">#{row.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{row.timestamp}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg font-semibold text-[10px] sm:text-[11px] border ${
                          row.category === 'Organik'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.category === 'Anorganik'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/70 tabular-nums text-[11px]">
                        {row.confidence}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium tabular-nums text-[11px]">
                      {row.servo_angle}°
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Tersortir
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">
                    Tidak ada data yang sesuai dengan kata kunci pencarian.
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
