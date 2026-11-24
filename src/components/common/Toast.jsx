import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs sm:text-sm font-semibold transition-all duration-300 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 max-w-[90vw] ${
        message.isError
          ? 'bg-white/95 text-rose-700 border-rose-200 shadow-rose-500/10'
          : 'bg-white/95 text-slate-900 border-blue-200 shadow-blue-500/10'
      }`}
    >
      {message.isError ? (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      ) : (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
        </div>
      )}
      <span className="font-medium truncate">{message.msg}</span>
    </div>
  );
}
