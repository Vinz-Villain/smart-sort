import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection({ onInjectSimulation }) {
  return (
    <div className="text-center pt-8 sm:pt-12 pb-10 sm:pb-12 max-w-3xl mx-auto space-y-3 sm:space-y-4">
      <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-medium backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-blue-300 shrink-0" />
        <span>Sort Smarter With SmartSort.Ai</span>
      </div>

      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
        Pilah Sampah Otomatis, <br className="hidden sm:inline" />
        Presisi Pada Setiap Objek
      </h1>

      <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-normal leading-relaxed px-2">
        Klasifikasi sampah cerdas real-time menggunakan kamera OV2640, aktuator flap multi-arah servo SG90, serta pemantauan sensor gas lingkungan.
      </p>

      <div className="pt-2 flex items-center justify-center">
        <button
          onClick={onInjectSimulation}
          className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-xl shadow-blue-600/40 cursor-pointer group active:scale-95"
        >
          <span>Uji Simulasi Sortir</span>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3 h-3 text-white" />
          </span>
        </button>
      </div>
    </div>
  );
}
