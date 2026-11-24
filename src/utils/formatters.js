export const normalizeCategory = (category) => {
  const normalized = String(category || '').toLowerCase();
  if (normalized === 'organik') return 'Organik';
  if (normalized === 'anorganik') return 'Anorganik';
  if (normalized === 'residu') return 'Residu';
  return category;
};

export const normalizeHistoryItem = (item) => ({
  ...item,
  category: normalizeCategory(item.category),
  confidence: Number(item.confidence) <= 1 ? Number(item.confidence) * 100 : item.confidence,
  action: item.action || `Flap diarahkan ke ${item.servo_angle}°`
});

export const getCapacityColor = (val) => {
  if (val <= 50) {
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      label: 'Tersedia'
    };
  }
  if (val <= 80) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-800',
      badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      label: 'Waspada'
    };
  }
  return {
    bar: 'bg-rose-500',
    text: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    label: 'Penuh'
  };
};
