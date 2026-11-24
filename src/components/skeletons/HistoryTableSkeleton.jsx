import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export default function HistoryTableSkeleton({ rows = 6 }) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.5}>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="hover:bg-slate-50/50">
          <td className="py-3 px-4">
            <Skeleton width={30} height={12} />
          </td>
          <td className="py-3 px-4">
            <Skeleton width={120} height={12} />
          </td>
          <td className="py-3 px-4">
            <Skeleton width={80} height={18} borderRadius={6} />
          </td>
          <td className="py-3 px-4">
            <Skeleton width={45} height={18} borderRadius={6} />
          </td>
          <td className="py-3 px-4">
            <Skeleton width={35} height={12} />
          </td>
          <td className="py-3 px-4">
            <Skeleton width={85} height={18} borderRadius={9999} />
          </td>
        </tr>
      ))}
    </SkeletonTheme>
  );
}
