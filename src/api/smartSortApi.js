import { api, API_BASE } from './client';
import { normalizeHistoryItem } from '../utils/formatters';

export const smartSortApi = {
  // Fetch system status & telemetry in parallel
  fetchDashboardStatus: async () => {
    const [statusRes, telemetryRes] = await Promise.all([
      api.get('/api/status'),
      api.get('/api/telemetry')
    ]);

    const status = statusRes.data?.data ?? statusRes.data;
    const telemetry = telemetryRes.data?.data ?? telemetryRes.data;

    return {
      capacities: {
        Organik: status.bin_capacity?.organik ?? status.capacities?.Organik ?? 0,
        Anorganik: status.bin_capacity?.anorganik ?? status.capacities?.Anorganik ?? 0,
        Residu: status.bin_capacity?.residu ?? status.capacities?.Residu ?? 0
      },
      environment: {
        temperature: telemetry.temperature_celsius ?? telemetry.temperature,
        humidity: telemetry.humidity_percent ?? telemetry.humidity,
        gas_value: telemetry.gas_mq135_raw ?? telemetry.gas_value,
        gas_status: telemetry.air_quality_status ?? telemetry.gas_status
      },
      devices: {
        esp32_controller: status.esp32_controller || 'Online',
        servo_current_angle: status.current_servo_angle ?? status.servo_current_angle ?? 90
      }
    };
  },

  // Fetch sorting history dataset
  fetchHistory: async (limit = 100) => {
    const res = await api.get('/api/history', { params: { limit } });
    const history = res.data?.data ?? res.data;
    const entries = (history.history ?? history.data ?? []).map(normalizeHistoryItem);
    const counts = { Organik: 0, Anorganik: 0, Residu: 0 };
    
    entries.forEach(({ category }) => {
      if (category in counts) counts[category] += 1;
    });

    const total = Number(history.total_records ?? history.total ?? entries.length);
    const percentages = Object.fromEntries(
      Object.entries(counts).map(([category, count]) => [
        category,
        total ? Math.round((count / total) * 1000) / 10 : 0
      ])
    );

    return {
      entries,
      total,
      counts,
      percentages,
      recentActivity: entries.slice(0, 5)
    };
  },

  // Fetch camera snapshot (returns blob or base64)
  fetchCameraFrame: async (timestampKey) => {
    const res = await api.get('/api/camera/latest', {
      params: { t: timestampKey },
      responseType: 'blob'
    });

    if (res.data.type && res.data.type.includes('json')) {
      const payload = JSON.parse(await res.data.text());
      return { isBase64: true, url: payload.data?.image_base64 ?? '' };
    }

    const objectUrl = URL.createObjectURL(res.data);
    return { isBase64: false, url: objectUrl };
  },

  // Move servo flap manually
  setServoAngle: async (angle) => {
    const res = await api.post('/api/manual/servo', { angle });
    return res.data;
  },

  // Inject trash simulation sample
  injectTrashSample: async (category) => {
    const res = await api.post('/api/manual/inject', { category: category.toLowerCase() });
    return res.data;
  },

  // Reset bin container capacities
  resetBins: async (category = null) => {
    const payload = category ? { category: category.toLowerCase() } : {};
    const res = await api.post('/api/bins/reset', payload);
    return res.data;
  },

  // Export history to CSV file download
  exportHistoryCsv: async () => {
    const res = await api.get('/api/history/export', { params: { format: 'csv' } });
    const payload = res.data?.data ?? res.data;
    const content = typeof payload === 'string' ? payload : (payload.content || '');
    const filename = payload.filename || 'smartsort_history.csv';
    const downloadBlob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  },

  getHistoryExportUrl: () => `${API_BASE}/api/history/export?format=csv`
};
