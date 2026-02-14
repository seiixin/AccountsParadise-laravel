import { useState } from 'react';
import axios from 'axios';

export default function UploadProofForm() {
  const [orderId, setOrderId] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);

  async function submit() {
    const fd = new FormData();
    fd.append('order_id', orderId);
    fd.append('payment_reference', paymentReference);
    if (idImage) fd.append('id_image', idImage);
    if (receiptImage) fd.append('receipt_image', receiptImage);
    await axios.post('/buyer/order-payment-proofs', fd, {
      headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
    }).catch(() => {});
  }

  return (
    <div className="ap-card p-4">
      <div className="text-sm text-neutral-400 mb-2">Upload Payment Proof</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="ap-input px-3 py-2" placeholder="Order ID" />
        <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className="ap-input px-3 py-2" placeholder="Payment Reference" />
        <div>
          <div className="text-xs text-neutral-400 mb-1">ID Image</div>
          <input type="file" accept="image/*" onChange={(e) => setIdImage(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Receipt Image</div>
          <input type="file" accept="image/*" onChange={(e) => setReceiptImage(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button onClick={submit} className="ap-btn-primary ap-pill px-4 py-2">Submit</button>
      </div>
    </div>
  );
}
