import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import ZoomViewer from '@/Components/zoomreference';

export default function Orders({ initial }) {
    const [data, setData] = useState(initial?.data ?? []);
    const [meta, setMeta] = useState(initial?.meta ?? {});
    const [status, setStatus] = useState('');
    const [orderNo, setOrderNo] = useState('');
    const perPage = 20;
    const [selected, setSelected] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const role = usePage().props?.auth?.user?.role ?? 'admin';
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        refresh();
    }, []);

    async function refresh(page = 1) {
        const params = { per_page: perPage, page };
        if (status) params.status = status;
        if (orderNo) params.order_no = orderNo;
        const res = await axios.get('/admin/orders', { params, headers: { Accept: 'application/json' } });
        const payload = res.data ?? {};
        const nextMeta = payload.meta ?? {
            current_page: payload.current_page ?? 1,
            last_page: payload.last_page ?? 1,
            links: payload.links ?? [],
        };
        setData(payload.data ?? []);
        setMeta(nextMeta);
    }

    async function openDetails(id) {
        const res = await axios.get(`/admin/orders/${id}`, { headers: { Accept: 'application/json' } });
        setSelected(res.data.data);
        setNewStatus(res.data.data.status);
    }

    async function updateStatus() {
        if (!selected) return;
        await axios.put(
            `/admin/orders/${selected.id}/status`,
            { status: newStatus },
            { headers: { Accept: 'application/json' }, withCredentials: true }
        );
        await refresh(meta.current_page ?? 1);
        setSelected(null);
    }

    async function remove(id) {
        try {
            await axios.delete(`/admin/orders/${id}/delete`, { headers: { Accept: 'application/json' }, withCredentials: true });
        } finally {
            await refresh((meta && typeof meta.current_page === 'number') ? meta.current_page : 1);
        }
    }

    return (
        <AdminLayout title="Admin · Orders" header={<h2 className="text-xl font-semibold">Orders</h2>}>
            <div className="mb-4 flex gap-2">
                <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="Order No" className="w-48 rounded border px-3 py-2" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-3 py-2">
                    <option value="">All</option>
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                    <option value="refunded">refunded</option>
                    <option value="disputed">disputed</option>
                </select>
                <button onClick={() => refresh(1)} className="rounded bg-blue-600 px-3 py-2 text-white">Filter</button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">ID</th>
                            <th className="p-2">Order No</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Buyer</th>
                            <th className="p-2">Valid ID</th>
                            <th className="p-2">Receipt</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((o) => (
                            <tr key={o.id} className="border-t border-neutral-800">
                                <td className="p-2">{o.id}</td>
                                <td className="p-2 font-mono">{o.order_no}</td>
                                <td className="p-2">{o.listing_type_snapshot ?? '—'}</td>
                                <td className="p-2">#{o.buyer_id}</td>
                                <td className="p-2">
                                    {o.id_image_path ? (
                                        <img
                                            src={`/storage/${o.id_image_path}`}
                                            alt="ID"
                                            className="h-16 w-28 rounded border border-neutral-800 object-cover cursor-pointer"
                                            onClick={() => setPreview(`/storage/${o.id_image_path}`)}
                                        />
                                    ) : (
                                        <div className="h-16 w-28 rounded border border-neutral-800 bg-neutral-900"></div>
                                    )}
                                </td>
                                <td className="p-2">
                                    {o.receipt_image_path ? (
                                        <img
                                            src={`/storage/${o.receipt_image_path}`}
                                            alt="Receipt"
                                            className="h-16 w-28 rounded border border-neutral-800 object-cover cursor-pointer"
                                            onClick={() => setPreview(`/storage/${o.receipt_image_path}`)}
                                        />
                                    ) : (
                                        <div className="h-16 w-28 rounded border border-neutral-800 bg-neutral-900"></div>
                                    )}
                                </td>
                                <td className="p-2">{o.status}</td>
                                <td className="p-2">{new Date(o.created_at).toLocaleDateString()}</td>
                                <td className="p-2">
                                    <div className="relative z-10 flex gap-2">
                                        <button type="button" onClick={() => openDetails(o.id)} className="rounded bg-blue-600 px-2 py-1 text-white">Update Status</button>
                                        {role !== 'midman' && (
                                            <button type="button" onClick={() => remove(o.id)} className="rounded bg-red-600 px-2 py-1 text-white">Delete</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={`${selected ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
                <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                    <div className="mb-3 text-lg font-semibold">Order Details</div>
                    {selected && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>Order No</div><div className="font-mono">{selected.order_no}</div>
                                <div>Status</div><div>{selected.status}</div>
                                <div>Amount</div><div>{selected.amount}</div>
                                <div>Currency</div><div>{selected.currency}</div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="rounded border px-3 py-2 text-black">
                                    <option value="pending">pending</option>
                                    <option value="paid">paid</option>
                                    <option value="processing">processing</option>
                                    <option value="delivered">delivered</option>
                                    <option value="completed">completed</option>
                                    <option value="cancelled">cancelled</option>
                                    <option value="refunded">refunded</option>
                                    <option value="disputed">disputed</option>
                                </select>
                                <button onClick={updateStatus} className="rounded bg-blue-600 px-3 py-2 text-white">Update Status</button>
                                <button onClick={() => setSelected(null)} className="rounded bg-neutral-800 px-3 py-2">Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={`${preview ? 'fixed' : 'hidden'} inset-0 z-[2147483647] flex items-start justify-center bg-black/70 pt-8 sm:pt-12`} onClick={() => setPreview(null)}>
                <div className="w-full max-w-[1000px] max-h-[88vh] overflow-auto p-4 glass-soft rounded-lg" onClick={(e) => e.stopPropagation()}>
                    {preview && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            <div className="w-full flex justify-center">
                                <ZoomViewer
                                    media={[{ type: 'image', src: preview }]}
                                    zoomPortalId="admin-orders-zoom-portal"
                                    zoomWidth={360}
                                    zoomHeight={360}
                                    title="Preview"
                                    className="w-[360px]"
                                    showThumbs={false}
                                />
                            </div>
                            <div className="hidden lg:flex justify-center">
                                <div id="admin-orders-zoom-portal" className="relative h-[360px] w-[360px] rounded-lg border border-neutral-800 bg-white" />
                            </div>
                        </div>
                    )}
                    <div className="mt-3 flex justify-end">
                        <button className="rounded bg-neutral-800 px-3 py-2" onClick={() => setPreview(null)}>Close</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
