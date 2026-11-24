export const getChartData = (statusData) => ({
  labels: ['Organik', 'Anorganik', 'Residu'],
  datasets: [
    {
      data: [
        statusData?.summary?.counts?.Organik || 0,
        statusData?.summary?.counts?.Anorganik || 0,
        statusData?.summary?.counts?.Residu || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
      borderColor: ['#ffffff', '#ffffff', '#ffffff'],
      borderWidth: 3,
      hoverOffset: 6
    }
  ]
});

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#475569',
        font: { size: 12, weight: '600', family: 'Plus Jakarta Sans' },
        padding: 14,
        boxWidth: 10,
        usePointStyle: true
      }
    }
  },
  cutout: '72%'
};
