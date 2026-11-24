import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export default function ShowcaseCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-1 items-stretch">
      {/* 1. LEFT CARD SKELETON */}
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.5}>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-airlume-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width={140} height={14} borderRadius={6} />
                <div className="mt-1">
                  <Skeleton width={90} height={10} borderRadius={4} />
                </div>
              </div>
              <Skeleton width={32} height={32} borderRadius={12} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Skeleton width={100} height={38} borderRadius={8} />
              <Skeleton width={56} height={20} borderRadius={9999} />
            </div>

            {/* 3 Sub Counter Pill Skeletons */}
            <div className="mt-4 sm:mt-5 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton circle width={8} height={8} />
                    <Skeleton width={60} height={12} borderRadius={4} />
                  </div>
                  <Skeleton width={28} height={14} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
            <Skeleton width={110} height={10} borderRadius={4} />
            <Skeleton circle width={28} height={28} />
          </div>
        </div>
      </SkeletonTheme>

      {/* 2. CENTER CARD SKELETON */}
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.5}>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-airlume-card flex flex-col justify-between">
          <div>
            <div className="flex justify-center mb-2.5 sm:mb-3">
              <Skeleton width={130} height={18} borderRadius={9999} />
            </div>

            <div className="text-center space-y-1">
              <Skeleton width={170} height={16} borderRadius={6} />
              <Skeleton width={120} height={16} borderRadius={6} />
            </div>

            {/* Stat Block */}
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center gap-3">
              <Skeleton circle width={40} height={40} />
              <div className="space-y-1">
                <Skeleton width={130} height={12} borderRadius={4} />
                <Skeleton width={110} height={10} borderRadius={4} />
              </div>
            </div>

            {/* Camera Aspect-Video Placeholder */}
            <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 flex items-center justify-center">
              <div className="w-full h-full p-4 flex flex-col items-center justify-center space-y-2">
                <Skeleton width={44} height={44} borderRadius={12} />
                <Skeleton width={100} height={10} borderRadius={4} />
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-center">
            <Skeleton width={180} height={10} borderRadius={4} />
          </div>
        </div>
      </SkeletonTheme>

      {/* 3. RIGHT CARD SKELETON (AirLume Dark Glass Cyan) */}
      <SkeletonTheme
        baseColor="rgba(255, 255, 255, 0.08)"
        highlightColor="rgba(255, 255, 255, 0.18)"
        duration={1.5}
      >
        <div className="glass-airlume-dark rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-airlume-glow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <Skeleton width={110} height={20} borderRadius={9999} />
            </div>

            <div className="mt-3 sm:mt-4 space-y-1">
              <Skeleton width={100} height={10} borderRadius={4} />
              <Skeleton width={180} height={28} borderRadius={6} />
              <Skeleton width={130} height={12} borderRadius={4} />
            </div>

            {/* Trajectory Skeleton */}
            <div className="my-4 sm:my-5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <Skeleton width={32} height={24} borderRadius={6} />
              <div className="flex-1 mx-2">
                <Skeleton height={2} />
              </div>
              <Skeleton width={32} height={24} borderRadius={6} />
              <div className="flex-1 mx-2">
                <Skeleton height={2} />
              </div>
              <Skeleton width={32} height={24} borderRadius={6} />
            </div>

            {/* Environmental Quick Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <Skeleton width={60} height={10} borderRadius={4} />
                <Skeleton width={50} height={16} borderRadius={4} />
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <Skeleton width={60} height={10} borderRadius={4} />
                <Skeleton width={50} height={16} borderRadius={4} />
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
            <Skeleton width={110} height={12} borderRadius={4} />
            <Skeleton circle width={28} height={28} />
          </div>
        </div>
      </SkeletonTheme>
    </div>
  );
}
