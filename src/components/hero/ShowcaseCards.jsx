import React from 'react';
import ShowcaseCardsSkeleton from '../skeletons/ShowcaseCardsSkeleton';
import StackedMetricCarousel from './StackedMetricCarousel';

export default function ShowcaseCards({
  statusData,
  cameraFrame,
  onRefreshCamera,
  onNavigateTab,
  isAdminRoute,
  isLoading
}) {
  if (isLoading) {
    return <ShowcaseCardsSkeleton />;
  }

  return (
    <StackedMetricCarousel
      statusData={statusData}
      cameraFrame={cameraFrame}
      onRefreshCamera={onRefreshCamera}
      onNavigateTab={onNavigateTab}
      isAdminRoute={isAdminRoute}
    />
  );
}
