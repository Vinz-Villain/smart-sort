import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

function CardSkeletonItem() {
  return (
    <div className="glass-botanical-card rounded-3xl p-5 shadow-botanical-glow text-left flex flex-col justify-between">
      <div>
        <div className="flex justify-center mb-3.5">
          <Skeleton width={52} height={52} borderRadius={16} />
        </div>
        <Skeleton width={130} height={18} borderRadius={9999} />
        <div className="mt-2 space-y-1.5">
          <Skeleton width={160} height={20} borderRadius={6} />
          <Skeleton width="90%" height={12} borderRadius={4} />
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={44} borderRadius={12} />
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
        <Skeleton width={100} height={12} borderRadius={4} />
        <Skeleton width={36} height={8} borderRadius={9999} />
      </div>
    </div>
  );
}

export default function ShowcaseCardsSkeleton() {
  return (
    <SkeletonTheme baseColor="#eaf5ee" highlightColor="#f5fbf7" duration={1.5}>
      <div className="pt-4 sm:pt-6 text-center space-y-6">
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton width={260} height={24} borderRadius={8} />
          <Skeleton width={210} height={22} borderRadius={8} />
        </div>

        {/* Mobile single stacked card skeleton */}
        <div className="md:hidden max-w-[310px] mx-auto">
          <CardSkeletonItem />
        </div>

        {/* Desktop 4-column skeleton */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeletonItem key={i} />
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}
