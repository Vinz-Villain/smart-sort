import { useEffect, useRef, useState } from 'react';
import { smartSortApi } from '../api/smartSortApi';

export function useCameraSnapshot() {
  const [frame, setFrame] = useState({ url: '', status: 'loading' });
  const [refreshVersion, setRefreshVersion] = useState(0);
  const etag = useRef();

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function load() {
      try {
        const next = await smartSortApi.fetchCameraFrame(etag.current, controller.signal);
        if (controller.signal.aborted) return;
        if (next) {
          etag.current = next.etag;
          setFrame({ ...next, status: next.url ? 'ready' : 'empty' });
        } else {
          setFrame((current) => ({ ...current, status: 'ready' }));
        }
      } catch {
        if (!controller.signal.aborted) setFrame((current) => ({ ...current, status: 'error' }));
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(load, 10000);
      }
    }
    load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [refreshVersion]);

  return { frame, refresh: () => setRefreshVersion((current) => current + 1) };
}

export function cameraSnapshotLabel(frame) {
  if (frame.status === 'error') return 'Gagal memuat foto';
  if (frame.status === 'loading') return 'Memuat foto…';
  if (!frame.url) return 'Belum ada foto klasifikasi';
  const capturedAt = new Date(frame.timestamp);
  const source = frame.legacy ? 'Snapshot kamera' : 'Waktu tangkap';
  if (!frame.timestamp || Number.isNaN(capturedAt.getTime())) return source;
  const localTime = capturedAt.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  return `${source} ${localTime} WIB`;
}
