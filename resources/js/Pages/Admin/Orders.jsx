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

        const res = await axios.get('/admin/orders', {
            params,
            headers: { Accept: 'application/json' }
        });

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
        const res = await axios.get(`/admin/orders/${id}`, {
            headers: { Accept: 'application/json' }
        });
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
            await axios.delete(`/admin/orders/${id}/delete`, {
                headers: { Accept: 'application/json' },
                withCredentials: true
            });
        } finally {
            await refresh(meta.current_page ?? 1);
        }
    }

    return (
        <AdminLayout
            title="Admin · Orders"
            header={<h2 className="text-xl font-semibold">Orders</h2>}
        >

            {/* FILTERS */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    placeholder="Order No"
                    className="w-full sm:w-48 rounded border px-3 py-2"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full sm:w-auto rounded border px-3 py-2"
                >
                    <option value="">All</option>
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                    <option value="refunded">refunded</option>
                    <option value="disputed">disputed</option>
                </select>

                <button
                    onClick={() => refresh(1)}
                    className="w-full sm:w-auto rounded bg-blue-600 px-3 py-2 text-white"
                >
                    Filter
                </button>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">Order No</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Buyer</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((o) => (
                            <tr key={o.id} className="border-t border-neutral-800">
                                <td className="p-2 font-mono">{o.order_no}</td>
                                <td className="p-2">{o.listing_type_snapshot ?? '—'}</td>
                                <td className="p-2">#{o.buyer_id}</td>
                                <td className="p-2">{o.status}</td>
                                <td className="p-2">
                                    {new Date(o.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-2 flex gap-2">
                                    <button
                                        onClick={() => openDetails(o.id)}
                                        className="rounded bg-blue-600 px-2 py-1 text-white"
                                    >
                                        Update
                                    </button>

                                    {role !== 'midman' && (
                                        <button
                                            onClick={() => remove(o.id)}
                                            className="rounded bg-red-600 px-2 py-1 text-white"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-3">
                {data.map((o) => (
                    <div
                        key={o.id}
                        className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2"
                    >
                        <div className="font-mono text-sm">{o.order_no}</div>
                        <div className="text-sm">Type: {o.listing_type_snapshot ?? '—'}</div>
                        <div className="text-sm">Buyer: #{o.buyer_id}</div>
                        <div className="text-sm">Status: {o.status}</div>
                        <div className="text-sm">
                            {new Date(o.created_at).toLocaleDateString()}
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                onClick={() => openDetails(o.id)}
                                className="w-full rounded bg-blue-600 py-2 text-white"
                            >
                                Update Status
                            </button>

                            {role !== 'midman' && (
                                <button
                                    onClick={() => remove(o.id)}
                                    className="w-full rounded bg-red-600 py-2 text-white"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* STATUS MODAL */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3">
                        <div className="text-lg font-semibold">Order Details</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>Order No</div>
                            <div className="font-mono">{selected.order_no}</div>
                            <div>Status</div>
                            <div>{selected.status}</div>
                            <div>Amount</div>
                            <div>{selected.amount}</div>
                            <div>Currency</div>
                            <div>{selected.currency}</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-3">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full rounded border px-3 py-2 text-black"
                            >
                                <option value="pending">pending</option>
                                <option value="paid">paid</option>
                                <option value="processing">processing</option>
                                <option value="delivered">delivered</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                                <option value="refunded">refunded</option>
                                <option value="disputed">disputed</option>
                            </select>

                            <button
                                onClick={updateStatus}
                                className="w-full rounded bg-blue-600 px-3 py-2 text-white"
                            >
                                Update
                            </button>

                            <button
                                onClick={() => setSelected(null)}
                                className="w-full rounded bg-neutral-800 px-3 py-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
