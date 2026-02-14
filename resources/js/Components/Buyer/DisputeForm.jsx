import { useState } from 'react';
import axios from 'axios';

export default function DisputeForm({ orderId }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [file, setFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  async function submit() {
    if (!orderId) return;
    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
      const fd = new FormData();
      fd.append('order_id', String(orderId));
      fd.append('status', 'under_review');
      fd.append('reason', reason);
      if (description) fd.append('description', description);
      if (evidence) fd.append('evidence', evidence);
      if (file) fd.append('evidence_image', file);
      const res = await axios.post('/buyer/order-disputes', fd, { headers: { 'X-CSRF-TOKEN': token }, withCredentials: true });
      setStatusMsg('Dispute submitted.');
      window.dispatchEvent(new CustomEvent('buyer:dispute:created', { detail: { id: res.data?.id } }));
      setReason('');
      setDescription('');
      setEvidence('');
      setFile(null);
    } catch (e) {
      setStatusMsg('Failed to submit dispute.');
    }
  }
  return (
    <div className="ap-card p-4">
      <div className="text-sm text-neutral-400 mb-2">Open Dispute</div>
      <div className="grid grid-cols-1 gap-3">
        <input value={reason} onChange={(e) => setReason(e.target.value)} className="ap-input px-3 py-2" placeholder="Reason" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="ap-input px-3 py-2" rows={3} placeholder="Description" />
        <input value={evidence} onChange={(e) => setEvidence(e.target.value)} className="ap-input px-3 py-2" placeholder="Evidence link or note (optional)" />
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="ap-input px-3 py-2" />
          {file && <div className="text-xs text-neutral-400">{file.name}</div>}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button onClick={submit} disabled={!orderId} className="ap-btn-primary ap-pill px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">Submit</button>
      </div>
      {!orderId && <div className="mt-2 text-xs text-neutral-500">Select an order first to open a dispute.</div>}
      {statusMsg && <div className="mt-2 text-xs text-neutral-400">{statusMsg}</div>}
    </div>
  );
}
