import { useEffect, useState } from 'react';
import axios from 'axios';
import ZoomViewer from '@/Components/zoomreference';

export default function DisputeHistory() {
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState(null);
  const isImg = (v) => typeof v === 'string' && /\.(png|jpe?g|webp|gif|svg)$/i.test(v);
  const toUrl = (v) => {
    if (!v) return null;
    const s = String(v);
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    const clean = s.replace(/^\/+/, '');
    if (clean.startsWith('storage/')) return '/' + clean;
    return '/storage/' + clean;
  };
  function fetchDisputes() {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    axios.get('/buyer/order-disputes?per_page=100', { headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token }, withCredentials: true })
      .then(res => {
        const disputes = res.data?.data ?? [];
        setItems(disputes);
      })
      .catch(async () => {
        try {
          const res2 = await axios.get('/buyer/orders?format=json&per_page=100', { headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token }, withCredentials: true });
          const orders = res2.data?.data ?? [];
          const disputes = orders
            .filter(o => o.dispute_reason || o.dispute_description)
            .map(o => ({
              id: o.id,
              order_id: o.id,
              status: 'under_review',
              reason: o.dispute_reason,
              description: o.dispute_description,
              evidence: o.dispute_evidence,
            }));
          setItems(disputes);
        } catch {
          setItems([]);
        }
      });
  }
  useEffect(() => {
    fetchDisputes();
    const handler = () => fetchDisputes();
    window.addEventListener('buyer:dispute:created', handler);
    return () => window.removeEventListener('buyer:dispute:created', handler);
  }, []);
  return (
    <div className="ap-card p-4">
      <div className="text-sm text-neutral-400 mb-2">Your Disputes</div>
      <div className="space-y-2">
        {items.map((d) => (
          <div key={d.id} className="rounded border border-neutral-800 bg-neutral-900 p-3">
            <div className="text-sm font-semibold">Dispute #{d.id} • Order #{d.order?.order_no ?? d.order_id}</div>
            <div className="text-xs text-neutral-400">Status: {d.status}</div>
            <div className="text-xs text-neutral-400">{d.reason ?? '—'}</div>
            <div className="text-xs text-neutral-500">{d.description ?? ''}</div>
            {isImg(d.evidence) && (
              <div className="mt-2">
                <img
                  src={toUrl(d.evidence)}
                  alt="Evidence"
                  className="h-24 w-auto rounded border border-neutral-800 object-contain cursor-pointer"
                  onClick={() => setPreview(toUrl(d.evidence))}
                />
              </div>
            )}
            {d.resolution && <div className="text-xs text-neutral-500">Resolution: {d.resolution}</div>}
          </div>
        ))}
        {!items.length && <div className="text-neutral-400 text-center py-6">No disputes</div>}
      </div>
      <div className={`${preview ? 'fixed' : 'hidden'} inset-0 z-[2147483647] flex items-start justify-center bg-black/70 pt-8 sm:pt-12`} onClick={() => setPreview(null)}>
        <div className="w-full max-w-[1000px] max-h-[88vh] overflow-auto p-4 rounded-lg border border-neutral-800 bg-neutral-950" onClick={(e) => e.stopPropagation()}>
          {preview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="w-full flex justify-center">
                <ZoomViewer
                  media={[{ type: 'image', src: preview }]}
                  zoomPortalId="buyer-disputes-zoom-portal"
                  zoomWidth={360}
                  zoomHeight={360}
                  title="Evidence"
                  className="w-[360px]"
                  showThumbs={false}
                />
              </div>
              <div className="hidden lg:flex justify-center">
                <div id="buyer-disputes-zoom-portal" className="relative h-[360px] w-[360px] rounded-lg border border-neutral-800 bg-white" />
              </div>
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button className="rounded bg-neutral-800 px-3 py-2" onClick={() => setPreview(null)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
