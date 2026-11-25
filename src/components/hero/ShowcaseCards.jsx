import React from 'react';
import ShowcaseCardsSkeleton from '../skeletons/ShowcaseCardsSkeleton';
import StackedMetricCarousel from './StackedMetricCarousel';

export default function ShowcaseCards({
  statusData,
  cameraImageUrl,
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
      cameraImageUrl={cameraImageUrl}
      onRefreshCamera={onRefreshCamera}
      onNavigateTab={onNavigateTab}
      isAdminRoute={isAdminRoute}
    />
  );
}
