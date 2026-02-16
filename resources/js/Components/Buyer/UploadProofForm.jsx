import { useState } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import IdCapture from '@/Components/Guest/IdCapture';

export default function UploadProofForm() {
  const [orderId, setOrderId] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [introOpen, setIntroOpen] = useState(true);
  const [camIdOpen, setCamIdOpen] = useState(false);
  const [camReceiptOpen, setCamReceiptOpen] = useState(false);
  const [camFaceOpen, setCamFaceOpen] = useState(false);
  const [amount, setAmount] = useState('');

  async function submit() {
    const fd = new FormData();
    fd.append('order_id', orderId);
    fd.append('payment_reference', paymentReference);
    if (idImage) fd.append('id_image', idImage);
    if (receiptImage) fd.append('receipt_image', receiptImage);
    if (faceImage) fd.append('face_image', faceImage);
    await axios.post('/buyer/order-payment-proofs', fd, {
      headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
    }).catch(() => {});
  }

  function computeFee(a) {
    const amt = Number(a) || 0;
    if (amt >= 100 && amt <= 999) return 20;
    if (amt >= 1000 && amt <= 4999) return Math.round(amt * 0.05);
    if (amt >= 5000 && amt <= 9999) return Math.round(amt * 0.04);
    if (amt >= 10000) return Math.round(amt * 0.03);
    return 0;
  }

  return (
    <>
      {introOpen && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/70 flex items-center justify-center">
          <div className="w-full max-w-lg glass-soft rounded-lg p-4">
            <div className="rounded border border-neutral-800 bg-neutral-900 p-3">
              <img src="/QR.jpg" alt="QR" className="w-full h-auto rounded" />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded px-4 py-2 glass-soft" onClick={() => setIntroOpen(false)}>Cancel</button>
              <button className="ap-btn-primary px-4 py-2" onClick={() => setIntroOpen(false)}>Done</button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {!introOpen && (
        <div className="ap-card p-4">
          <div className="text-sm text-neutral-400 mb-2">Upload Payment Proof</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="ap-input px-3 py-2" placeholder="Order ID" />
            <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className="ap-input px-3 py-2" placeholder="Payment Reference" />
            <div>
              <div className="text-xs text-neutral-400 mb-1">Valid ID</div>
              <div className="flex items-center gap-2">
                <button className="rounded border border-neutral-700 px-3 py-2" onClick={() => setCamIdOpen(true)}>Use Camera</button>
                {idImage && <div className="text-xs text-neutral-300">Ready</div>}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Receipt</div>
              <div className="flex items-center gap-2">
                <button className="rounded border border-neutral-700 px-3 py-2" onClick={() => setCamReceiptOpen(true)}>Use Camera</button>
                {receiptImage && <div className="text-xs text-neutral-300">Ready</div>}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-neutral-400 mb-1">Face</div>
              <div className="flex items-center gap-2">
                <button className="rounded border border-neutral-700 px-3 py-2" onClick={() => setCamFaceOpen(true)}>Use Camera</button>
                {faceImage && <div className="text-xs text-neutral-300">Ready</div>}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-neutral-400 mb-1">Transaction Amount</div>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} className="ap-input px-3 py-2" placeholder="Amount (PHP)" />
              <div className="mt-2 text-sm text-neutral-300">Midman Fee: ₱{computeFee(amount)} · Total: ₱{(Number(amount)||0)+computeFee(amount)}</div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={submit} className="ap-btn-primary ap-pill px-4 py-2">Submit</button>
          </div>
        </div>
      )}
      <IdCapture open={camIdOpen} onClose={() => setCamIdOpen(false)} onCapture={(file) => setIdImage(file)} facingMode="environment" />
      <IdCapture open={camReceiptOpen} onClose={() => setCamReceiptOpen(false)} onCapture={(file) => setReceiptImage(file)} facingMode="environment" />
      <IdCapture open={camFaceOpen} onClose={() => setCamFaceOpen(false)} onCapture={(file) => setFaceImage(file)} facingMode="user" />
    </>
  );
}
