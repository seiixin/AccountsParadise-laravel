import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import ZoomViewer from '@/Components/zoomreference';
import IdCapture from '@/Components/Guest/IdCapture';

export default function Listing({ listing, images = [] }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const [open, setOpen] = useState(false);
  const [idImage, setIdImage] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const gallery = (images ?? []).length ? images.map(i => i.path) : (listing.cover_image_path ? [listing.cover_image_path] : []);
  const [index, setIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [cameraOpen, setCameraOpen] = useState(false);
  const [faceCamOpen, setFaceCamOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('buy') === '1' && user) {
      setOpen(true);
    }
  }, [user]);

  // allow page scroll while preview is open

  async function confirmPurchase() {
    if (!user) {
      window.location.href = route('login');
      return;
    }
    if (!paymentRef) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append('listing_id', listing.id);
    fd.append('payment_method', paymentMethod);
    fd.append('payment_reference', paymentRef);
    if (idImage) fd.append('id_image', idImage);
    if (receiptImage) fd.append('receipt_image', receiptImage);
    if (faceImage) fd.append('face_image', faceImage);
    try {
      await axios.post(route('buyer.purchase.store'), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setOpen(false);
      window.location.href = route('buyer.orders.index');
    } catch (e) {
      const payload = e?.response?.data;
      setErrors(payload?.errors ?? { message: payload?.message ?? 'Unable to submit' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout fullWidth>
      <Head title={`Listing · ${listing.title}`} />
      <div className="grid grid-cols-1 gap-3 md:gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 md:p-4 text-white">
          <div className="relative">
            <div className="square-box bg-neutral-800 overflow-hidden">
              <div className="absolute inset-0">
                <ZoomViewer
                  media={gallery[index] ? [{ type: 'image', src: `/storage/${gallery[index]}` }] : []}
                  zoomPortalId="listing-details-portal"
                  zoomWidth={420}
                  zoomHeight={420}
                  title={listing.title}
                  className="h-full w-full"
                  showThumbs={false}
                />
              </div>
            </div>
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setIndex((index - 1 + gallery.length) % gallery.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full glass-soft text-white"
                >
                  ‹
                </button>
                <button
                  onClick={() => setIndex((index + 1) % gallery.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full glass-soft text-white"
                >
                  ›
                </button>
              </>
            )}
            {gallery.length > 1 && (
              <div className="mt-2 md:mt-3 flex gap-2 overflow-x-auto">
                {gallery.map((p, i) => (
                  <button
                    key={p + i}
                    onClick={() => setIndex(i)}
                    className={`h-14 w-14 md:h-16 md:w-24 overflow-hidden rounded ${i === index ? 'ring-2 ring-yellow-500' : ''}`}
                  >
                    <img src={`/storage/${p}`} alt={`thumb-${i}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 md:p-4 text-white">
          <div id="listing-details-portal" className="hidden lg:block relative rounded-lg border border-neutral-800 bg-neutral-900 p-2" />
          <div className="text-sm text-white">ID #{listing.id}</div>
          <div className="mt-1 text-2xl font-semibold">{listing.title}</div>
          <div className="mt-2 text-white">{listing.description || 'No description'}</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold">
              {(listing.merchant_name || 'U')[0]}
            </div>
            <div>
              <div className="text-xs text-white">Seller</div>
              <button
                type="button"
                className="font-medium hover:underline"
                onClick={async () => {
                  if (!user) {
                    window.location.href = route('login');
                    return;
                  }
                  try {
                    const role = String(user.role || '').toLowerCase();
                    if (role === 'buyer') {
                      const res = await axios.post(route('buyer.chat.start'), { seller_id: listing.merchant_id }, { headers: { Accept: 'application/json' }, withCredentials: true });
                      const cid = res?.data?.conversation_id;
                      if (cid) window.location.href = `/buyer/chat/${cid}`;
                      return;
                    }
                    const payload = { target_user_id: listing.merchant_id };
                    if (role === 'merchant') {
                      if (Number(listing.merchant_id) === Number(user.id)) {
                        window.location.href = '/merchant/inbox';
                        return;
                      }
                      const res = await axios.post(route('merchant.chat.start-with'), payload, { headers: { Accept: 'application/json' }, withCredentials: true });
                      const cid = res?.data?.conversation_id;
                      if (cid) window.location.href = `/merchant/chat/${cid}`;
                      return;
                    }
                    if (role === 'admin') {
                      const res = await axios.post(route('admin.chat.start-with'), payload, { headers: { Accept: 'application/json' }, withCredentials: true });
                      const cid = res?.data?.conversation_id;
                      if (cid) window.location.href = `/admin/chat/${cid}`;
                      return;
                    }
                    if (role === 'midman') {
                      const res = await axios.post(route('midman.chat.start-with'), payload, { headers: { Accept: 'application/json' }, withCredentials: true });
                      const cid = res?.data?.conversation_id;
                      if (cid) window.location.href = `/midman/chat/${cid}`;
                      return;
                    }
                  } catch {}
                }}
              >
                {listing.merchant_name ?? 'Unknown'}
              </button>
            </div>
          </div>
          <div className="mt-4 text-xl font-semibold">{listing.currency} {listing.price}</div>
          <div className="mt-4 flex gap-3">
            <button className="rounded bg-white px-4 py-2 text-black" onClick={() => user ? setOpen(true) : window.location.href = route('login')}>Buy Now</button>
            <a href="/store" className="rounded border border-neutral-700 px-4 py-2">Back to Store</a>
          </div>
        </div>
      </div>
      {previewOpen &&
        createPortal(
          <div className="fixed inset-0 z-[2147483647] bg-black/80 backdrop-blur-sm">
            <div className="w-full h-full overflow-auto p-8 flex items-center justify-center">
              {gallery[index] ? <img src={`/storage/${gallery[index]}`} alt="preview" className="max-w-[90vw] max-h-[90vh] object-contain" /> : null}
            </div>
            <button className="fixed top-6 right-6 ap-btn-primary px-3 py-1" onClick={() => setPreviewOpen(false)}>Close</button>
          </div>,
          document.body
        )
      }
      {open && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded-2xl glass-soft p-6 max-h-[85vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="ap-card p-4">
                <div className="text-sm uppercase tracking-wide text-white">Offer</div>
                <div className="mt-2 font-semibold text-lg text-white">{listing.title}</div>
                <div className="landscape-box mt-3 bg-neutral-800">
                  {listing.cover_image_path ? <img src={`/storage/${listing.cover_image_path}`} alt={listing.title} /> : null}
                </div>
                <div className="mt-3">
                  <div className="text-white">Price</div>
                  <div className="text-xl font-semibold text-white">{listing.currency} {(() => { const a = Number(listing.price) || 0; return a.toFixed(2); })()}</div>
                  <div className="my-3 border-t border-neutral-700" />
                  <div className="text-lg text-neutral-300">Midman Fee: ₱{(() => {
                    const amt = Number(listing.price) || 0;
                    if (amt >= 100 && amt <= 999) return 20;
                    if (amt >= 1000 && amt <= 4999) return Math.round(amt * 0.05);
                    if (amt >= 5000 && amt <= 9999) return Math.round(amt * 0.04);
                    if (amt >= 10000) return Math.round(amt * 0.03);
                    return 0;
                  })()}</div>
                  <div className="my-3 border-t border-neutral-700" />
                  <div className="text-xl font-semibold text-white">Total: ₱{(() => {
                    const amt = Number(listing.price) || 0;
                    const fee = (amt >= 100 && amt <= 999) ? 20 : (amt >= 1000 && amt <= 4999) ? Math.round(amt * 0.05) : (amt >= 5000 && amt <= 9999) ? Math.round(amt * 0.04) : (amt >= 10000) ? Math.round(amt * 0.03) : 0;
                    return amt + fee;
                  })()}</div>
                </div>
              </div>
              <div className="ap-card p-4">
                <div className="text-sm uppercase tracking-wide text-white">Buy Now</div>
                <div className="mt-3">
                  <div className="text-sm text-white mb-1">Valid ID</div>
                  <div className="mb-2 flex items-center gap-2">
                    <button className="rounded border border-neutral-700 px-3 py-2" onClick={() => setCameraOpen(true)}>Use Camera</button>
                    {idImage && <div className="text-xs text-white">ID ready</div>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => setIdImage(e.target.files?.[0] ?? null)} className="ap-input w-full px-3 py-2" />
                {errors?.id_image && <div className="mt-1 text-xs text-red-400">{[].concat(errors.id_image).join(', ')}</div>}
                </div>
                <div className="mt-4">
                  <div className="text-sm text-white mb-1">Payment</div>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="ap-input w-full px-3 py-2">
                    <option>GCash</option>
                    <option>InstaPay</option>
                    <option>BDO</option>
                    <option>ShopeePay</option>
                    <option>Maya</option>
                  </select>
                  <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="Reference / Transaction ID" className="ap-input w-full px-3 py-2 mt-2" />
                {errors?.payment_reference && <div className="mt-1 text-xs text-red-400">{[].concat(errors.payment_reference).join(', ')}</div>}
                  <div className="mt-2">
                    <div className="text-sm text-white mb-1">Receipt</div>
                    <input type="file" accept="image/*" onChange={(e) => setReceiptImage(e.target.files?.[0] ?? null)} className="ap-input w-full px-3 py-2" />
                  {errors?.receipt_image && <div className="mt-1 text-xs text-red-400">{[].concat(errors.receipt_image).join(', ')}</div>}
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-white mb-1">Face</div>
                    <div className="flex items-center gap-2">
                      <button className="rounded border border-neutral-700 px-3 py-2" onClick={() => setFaceCamOpen(true)}>Use Camera</button>
                      {faceImage && <div className="text-xs text-white">Ready</div>}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button className="rounded px-4 py-2 glass-soft" onClick={() => setOpen(false)}>Cancel</button>
                  <button className="ap-btn-primary px-4 py-2" disabled={submitting || !paymentRef} onClick={confirmPurchase}>{submitting ? 'Submitting...' : 'Confirm Purchase'}</button>
                  <button className="rounded px-4 py-2 bg-amber-600 text-white" onClick={() => setQrOpen(true)}>Show QR</button>
                </div>
              {errors?.message && <div className="mt-2 text-xs text-red-400">{errors.message}</div>}
                <div className="mt-2 text-xs text-white">Your purchase goes to Admin/Midman verification.</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {qrOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/70">
            <div className="w-full max-w-xl rounded-2xl glass-soft p-6 text-white">
              <div className="text-lg font-semibold">Scan to Pay</div>
              <div className="mt-3 rounded-lg overflow-hidden bg-neutral-900">
                <img src="/QR.jpg" alt="QR" className="w-full h-auto object-contain" />
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button className="rounded px-4 py-2 glass-soft" onClick={() => setQrOpen(false)}>Cancel</button>
                <button className="ap-btn-primary px-4 py-2" onClick={() => setQrOpen(false)}>Done Payment</button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
      <IdCapture open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={(file) => setIdImage(file)} facingMode="environment" />
      <IdCapture open={faceCamOpen} onClose={() => setFaceCamOpen(false)} onCapture={(file) => setFaceImage(file)} facingMode="user" />
    </PublicLayout>
  );
}
