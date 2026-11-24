import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export default function MonitoringTabSkeleton() {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.5}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left: Capacities Bento (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="space-y-1">
                  <Skeleton width={200} height={18} borderRadius={6} />
                  <Skeleton width={240} height={12} borderRadius={4} />
                </div>
                <Skeleton width={130} height={32} borderRadius={12} />
              </div>

              {/* 3 Progress Bars */}
              <div className="space-y-3.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton width={90} height={20} borderRadius={8} />
                      <div className="flex items-center gap-2">
                        <Skeleton width={60} height={16} borderRadius={6} />
                        <Skeleton width={32} height={18} borderRadius={4} />
                      </div>
                    </div>
                    <Skeleton height={10} borderRadius={9999} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Skeleton width={120} height={12} borderRadius={4} />
              <Skeleton width={90} height={12} borderRadius={4} />
            </div>
          </div>

          {/* Right: Proportion Doughnut Bento (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="space-y-1">
                <Skeleton width={180} height={18} borderRadius={6} />
                <Skeleton width={200} height={12} borderRadius={4} />
              </div>

              {/* Circle Placeholder */}
              <div className="h-48 sm:h-56 my-3 sm:my-4 flex items-center justify-center">
                <Skeleton circle width={150} height={150} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-3 sm:pt-4 border-t border-slate-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <Skeleton width={40} height={16} borderRadius={4} />
                  <Skeleton width={45} height={10} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Recent Activity Table Skeleton */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="space-y-1">
              <Skeleton width={230} height={18} borderRadius={6} />
              <Skeleton width={180} height={12} borderRadius={4} />
            </div>
            <Skeleton width={80} height={16} borderRadius={6} />
          </div>

          <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-4"><Skeleton width={60} height={12} /></th>
                  <th className="py-2.5 px-4"><Skeleton width={90} height={12} /></th>
                  <th className="py-2.5 px-4"><Skeleton width={70} height={12} /></th>
                  <th className="py-2.5 px-4"><Skeleton width={110} height={12} /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    <td className="py-3 px-4"><Skeleton width={70} height={12} /></td>
                    <td className="py-3 px-4"><Skeleton width={80} height={18} borderRadius={6} /></td>
                    <td className="py-3 px-4"><Skeleton width={40} height={16} borderRadius={6} /></td>
                    <td className="py-3 px-4"><Skeleton width={130} height={12} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
