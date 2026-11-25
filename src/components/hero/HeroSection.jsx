import React from 'react';
import { ArrowRight } from 'lucide-react';

function GlossyLeafBadge() {
  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-1 sm:mx-1.5 -mt-1 w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.35)] border border-emerald-100"
      aria-hidden="true"
    >
      <svg viewBox="0 0 36 36" className="w-6 h-6 sm:w-8 sm:h-8" fill="none">
        <defs>
          <linearGradient id="heroLeafLeft" x1="6" y1="10" x2="18" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="55%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="heroLeafRight" x1="18" y1="8" x2="30" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
        <path d="M17.5 26C11 25.5 7 20.5 7 13.5c6 0 10.5 3.5 10.5 12.5Z" fill="url(#heroLeafLeft)" />
        <path d="M18.5 26c6.5-.5 10.5-6.5 10.5-15-6.5 0-10.5 4.5-10.5 15Z" fill="url(#heroLeafRight)" />
        <path d="M18 26.5v3" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function HeroSection({ onExplore }) {
  return (
    <div className="text-center pt-7 sm:pt-11 pb-3 sm:pb-5 max-w-3xl mx-auto space-y-3 sm:space-y-4">
      {/* Top Status Pill */}

      {/* Two-Tone Botanical Headline + Inline 3D Leaf */}
      <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.12]">
        Pilah <span className="text-[#4a7c59]">Sampah</span>
        <GlossyLeafBadge />
        Otomatis <br className="hidden sm:inline" />
        <span className="text-slate-900">Untuk </span>
        <span className="text-[#4a7c59]">Lingkungan Bersih</span>
      </h1>

      <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto font-normal leading-relaxed px-2">
        Klasifikasi sampah cerdas real-time menggunakan kamera OV2640, aktuator servo multi-arah, serta pemantauan sensor lingkungan.
      </p>

      {/* Glossy Green Pill CTA */}
      <div className="pt-1.5 flex items-center justify-center">
        <button
          onClick={onExplore}
          className="btn-eco-pill inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full text-white text-xs sm:text-sm font-semibold transition cursor-pointer group active:scale-95"
        >
          <span>Lihat Monitoring</span>
          <span className="w-7 h-7 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </button>
      </div>
    </div>
  );
}
