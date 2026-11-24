import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ResetModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight m-0">Konfirmasi Reset Data</h3>
        <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed font-normal">
          Apakah Anda yakin ingin mengosongkan seluruh riwayat penyortiran dan mengembalikan counter ke 0?
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            Ya, Reset Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
