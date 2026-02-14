import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ZoomViewer from '@/Components/zoomreference';

export default function Disputes({ initial }) {
    const [data, setData] = useState(initial?.data ?? []);
    const [meta, setMeta] = useState(initial?.meta ?? {});
    const [status, setStatus] = useState('');
    const perPage = 20;
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [resolution, setResolution] = useState('');
    const [decisionNotes, setDecisionNotes] = useState('');
    const [newStatus, setNewStatus] = useState('resolved');

    useEffect(() => {
        refresh();
    }, []);

    async function refresh(page = 1) {
        const params = { per_page: perPage, page };
        if (status) params.status = status;
        const res = await axios.get('/admin/order-disputes', { params, headers: { Accept: 'application/json' } });
        const payload = res.data ?? {};
        const nextMeta = payload.meta ?? {
            current_page: payload.current_page ?? 1,
            last_page: payload.last_page ?? 1,
            links: payload.links ?? [],
        };
        setData(payload.data ?? []);
        setMeta(nextMeta);
    }

    function openModal(item) {
        setSelected(item);
        setResolution(item.resolution ?? '');
        setDecisionNotes('');
        setNewStatus('resolved');
        setOpen(true);
    }

    async function resolve() {
        if (!selected) return;
        const res = await axios.put(`/admin/order-disputes/${selected.id}/resolve`, {
            status: newStatus,
            resolution,
            decision_notes: decisionNotes,
        }, { headers: { Accept: 'application/json' }, withCredentials: true });
        const updated = res?.data?.data ?? {};
        setData((prev) => prev.map((d) => d.id === selected.id ? {
            ...d,
            status: updated.status ?? d.status,
            resolution: updated.resolution ?? d.resolution,
            decided_at: updated.decided_at ?? d.decided_at,
        } : d));
        setOpen(false);
        await refresh((meta && typeof meta.current_page === 'number') ? meta.current_page : 1);
    }

    return (
        <AdminLayout title="Admin · Disputes" header={<h2 className="text-xl font-semibold">Disputes</h2>}>
            <div className="mb-4 flex gap-2">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <option value="">All</option>
                    <option value="open">open</option>
                    <option value="under_review">under_review</option>
                    <option value="resolved">resolved</option>
                </select>
                <button onClick={() => refresh(1)} className="rounded bg-blue-600 px-3 py-2 text-white">Filter</button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">ID</th>
                            <th className="p-2">Order</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Reason</th>
                            <th className="p-2">Resolution</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((d) => (
                            <tr key={d.id} className="border-t border-neutral-800">
                                <td className="p-2">{d.id}</td>
                                <td className="p-2">{d.order?.order_no ?? d.order_id}</td>
                                <td className="p-2">{d.status}</td>
                                <td className="p-2">{d.reason ?? '-'}</td>
                                <td className="p-2">{d.resolution ?? '-'}</td>
                                <td className="p-2">{d.created_at}</td>
                                <td className="p-2">
                                    <button onClick={() => openModal(d)} className="rounded bg-neutral-800 px-2 py-1">Resolve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={`${open ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
                <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                    <div className="mb-3 text-lg font-semibold">Resolve Dispute</div>
                    <div className="space-y-2">
                        {selected && (
                            <div className="rounded border border-neutral-800 bg-neutral-900 p-3 text-sm">
                                <div className="mb-1">Order: <span className="font-semibold">{selected.order?.order_no ?? selected.order_id}</span></div>
                                <div className="mb-1">Status: <span className="font-semibold">{selected.status}</span></div>
                                <div className="mb-1">Reason: <span className="font-semibold">{selected.reason ?? '—'}</span></div>
                                <div className="mb-1">Description:</div>
                                <div className="text-neutral-400 whitespace-pre-wrap">{selected.description ?? '—'}</div>
                                {selected.evidence && /\.(png|jpe?g|webp|gif|svg)$/i.test(String(selected.evidence)) && (
                                    <div className="mt-2">
                                        <div className="mb-1">Evidence:</div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                                            <div className="flex justify-center">
                                                <ZoomViewer
                                                    media={[{ type: 'image', src: String(selected.evidence).startsWith('http') ? selected.evidence : `/storage/${String(selected.evidence).replace(/^\/+/, '').replace(/^storage\//, '')}` }]}
                                                    zoomPortalId="admin-disputes-zoom-portal"
                                                    zoomWidth={300}
                                                    zoomHeight={300}
                                                    title="Evidence"
                                                    className="w-[300px]"
                                                    showThumbs={false}
                                                />
                                            </div>
                                            <div className="hidden lg:flex justify-center">
                                                <div id="admin-disputes-zoom-portal" className="relative h-[300px] w-[300px] rounded-lg border border-neutral-800 bg-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selected.evidence && !(/\.(png|jpe?g|webp|gif|svg)$/i.test(String(selected.evidence))) && (
                                    <div className="mt-2">
                                        <div className="mb-1">Evidence:</div>
                                        <div className="text-neutral-400 break-all">{selected.evidence}</div>
                                    </div>
                                )}
                            </div>
                        )}
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
                            <option value="resolved">resolved</option>
                            <option value="open">open</option>
                            <option value="under_review">under_review</option>
                        </select>
                        <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
                            <option value="">Select resolution</option>
                            <option value="refund_buyer">refund_buyer</option>
                            <option value="partial_refund">partial_refund</option>
                            <option value="cancel_order">cancel_order</option>
                            <option value="release_to_seller">release_to_seller</option>
                        </select>
                        <textarea value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2" placeholder="Decision notes" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <button onClick={resolve} className="rounded bg-blue-600 px-3 py-2 text-white">Save</button>
                        <button onClick={() => setOpen(false)} className="rounded bg-neutral-800 px-3 py-2">Close</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
