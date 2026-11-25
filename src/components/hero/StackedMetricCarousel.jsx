import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildShowcaseSlides } from './useShowcaseSlides';
import ShowcaseSlideCard from './ShowcaseSlideCard';

const SWIPE_THRESHOLD_PX = 40;

export default function StackedMetricCarousel({
  statusData,
  cameraImageUrl,
  onRefreshCamera,
  onNavigateTab,
  isAdminRoute
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isHorizontalSwipe = useRef(false);

  const totalItems = statusData?.summary?.total_items ?? 0;
  const slides = buildShowcaseSlides({
    statusData,
    cameraImageUrl,
    onRefreshCamera,
    isAdminRoute
  });

  const prevSlide = () => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    if (!isHorizontalSwipe.current && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      isHorizontalSwipe.current = true;
    }

    if (isHorizontalSwipe.current) {
      setDragOffset(Math.max(-90, Math.min(90, deltaX * 0.6)));
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current) {
      if (dragOffset <= -SWIPE_THRESHOLD_PX * 0.6) {
        nextSlide();
      } else if (dragOffset >= SWIPE_THRESHOLD_PX * 0.6) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = false;
    setDragOffset(0);
  };

  const current = slides[activeSlide];

  return (
    <div className="pt-4 sm:pt-6 text-center">
      {/* Dynamic Counter Heading */}
      <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 max-w-md mx-auto leading-snug">
        Telah Memilah <span className="text-[#4a7c59] tabular-nums">{totalItems} Sampah</span>{' '}
        <br className="hidden sm:inline" />
        Secara Otomatis &amp; Real-Time
      </h2>

      {/* MOBILE: Swipeable Stacked Card Carousel (< md) */}
      <div className="mt-6 md:hidden relative max-w-md mx-auto flex items-center justify-center px-10">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Kartu sebelumnya"
          className="absolute left-0 z-20 w-8 h-8 rounded-full bg-white border border-emerald-200/80 text-slate-600 hover:text-emerald-700 hover:border-emerald-400 shadow-sm flex items-center justify-center transition cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          className="relative w-full max-w-[310px] touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl bg-white/80 border border-emerald-200/70 shadow-sm -rotate-3 -translate-x-3 scale-[0.96] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl bg-white/80 border border-emerald-200/70 shadow-sm rotate-3 translate-x-3 scale-[0.96] pointer-events-none"
          />

          <div
            className="relative z-10"
            style={{
              transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.04}deg)`,
              transition: dragOffset === 0 ? 'transform 220ms ease-out' : 'none'
            }}
          >
            <ShowcaseSlideCard
              slide={current}
              onNavigateTab={onNavigateTab}
              footerRight={
                <div className="flex items-center gap-1.5">
                  {slides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeSlide === idx ? 'w-4 bg-emerald-500' : 'w-1.5 bg-emerald-200 hover:bg-emerald-300'
                      }`}
                    />
                  ))}
                </div>
              }
            />
          </div>
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Kartu berikutnya"
          className="absolute right-0 z-20 w-8 h-8 rounded-full bg-white border border-emerald-200/80 text-slate-600 hover:text-emerald-700 hover:border-emerald-400 shadow-sm flex items-center justify-center transition cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* DESKTOP & TABLET: All 4 Information Cards Visible Simultaneously (>= md) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mt-8 items-stretch">
        {slides.map((slide) => (
          <ShowcaseSlideCard
            key={slide.id}
            slide={slide}
            onNavigateTab={onNavigateTab}
            className="hover:-translate-y-1"
          />
        ))}
      </div>
    </div>
  );
}
