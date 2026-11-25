import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ShowcaseSlideCard({
  slide,
  onNavigateTab,
  footerRight = null,
  className = ''
}) {
  const SlideIcon = slide.icon;

  return (
    <div
      className={`glass-botanical-card rounded-3xl p-5 shadow-botanical-glow text-left flex flex-col justify-between transition-all duration-300 ${className}`}
    >
      <div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 shadow-inner flex items-center justify-center text-emerald-600">
          <SlideIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </div>

        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-semibold border border-emerald-200/80">
          {slide.badge}
        </span>

        <h3 className="text-base font-bold text-slate-900 mt-2 tracking-tight tabular-nums">
          {slide.title}
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
          {slide.description}
        </p>

        {slide.body}
      </div>

      <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onNavigateTab(slide.targetTab)}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 transition cursor-pointer"
        >
          <span>{slide.actionLabel}</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {footerRight}
      </div>
    </div>
  );
}
