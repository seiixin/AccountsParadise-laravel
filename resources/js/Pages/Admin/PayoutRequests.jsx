import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PayoutRequests({ initial }) {
    const [data, setData] = useState(initial?.data ?? []);
    const [meta, setMeta] = useState(() => {
        const payload = initial ?? {};
        return payload.meta ?? {
            current_page: payload.current_page ?? 1,
            last_page: payload.last_page ?? 1,
            links: payload.links ?? [],
        };
    });
    const [status, setStatus] = useState('');
    const perPage = 20;
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [action, setAction] = useState('approve');
    const [notes, setNotes] = useState('');
    const [ordersOpen, setOrdersOpen] = useState(false);
    const [ordersList, setOrdersList] = useState([]);
    const [ordersId, setOrdersId] = useState(null);

    useEffect(() => {
        refresh();
    }, []);

    async function refresh(page = 1) {
        const params = { per_page: perPage, page };
        if (status) params.status = status;
        const res = await axios.get('/admin/payout-requests', { params, headers: { Accept: 'application/json' } });
        const payload = res.data ?? {};
        setData(payload.data ?? []);
        setMeta(payload.meta ?? {
            current_page: payload.current_page ?? 1,
            last_page: payload.last_page ?? 1,
            links: payload.links ?? [],
        });
    }

    function openModal(item) {
        setSelected(item);
        setAction('approve');
        setNotes('');
        setOpen(true);
    }

    async function openOrders(item) {
        try {
            const res = await axios.get(`/admin/payout-requests/${item.id}`, { headers: { Accept: 'application/json' } });
            const payload = res.data ?? {};
            setOrdersId(item.id);
            setOrdersList(payload.orders_snapshot ?? []);
            setOrdersOpen(true);
        } catch {
            setOrdersList([]);
            setOrdersOpen(true);
        }
    }

    async function approve() {
        if (!selected) return;
        await axios.put(`/admin/payout-requests/${selected.id}/approve`, {
            action,
            approval_notes: notes,
        }, { headers: { Accept: 'application/json' } });
        setOpen(false);
        await refresh(meta.current_page ?? 1);
    }

    return (
        <AdminLayout title="Admin · Payout Requests" header={<h2 className="text-xl font-semibold">Payout Requests</h2>}>
            <div className="mb-4 flex gap-2">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <option value="">All</option>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                </select>
                <button onClick={() => refresh(1)} className="rounded bg-blue-600 px-3 py-2 text-white">Filter</button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">ID</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((p) => (
                            <tr key={p.id} className="border-t border-neutral-800">
                                <td className="p-2">{p.id}</td>
                                <td className="p-2">{p.amount}</td>
                                <td className="p-2">{p.status}</td>
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        <span>{p.created_at}</span>
                                        <button onClick={() => openOrders(p)} className="rounded bg-neutral-800 px-2 py-1">View Orders</button>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <button onClick={() => openModal(p)} className="rounded bg-neutral-800 px-2 py-1">Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={`${open ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
                <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                    <div className="mb-3 text-lg font-semibold">Approve / Reject Payout</div>
                    <div className="space-y-2">
                        <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
                            <option value="approve">approve</option>
                            <option value="reject">reject</option>
                        </select>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2" placeholder="Approval notes" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <button onClick={approve} className="rounded bg-blue-600 px-3 py-2 text-white">Save</button>
                        <button onClick={() => setOpen(false)} className="rounded bg-neutral-800 px-3 py-2">Close</button>
                    </div>
                </div>
            </div>
            <div className={`${ordersOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
                <div className="w-full max-w-3xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                    <div className="mb-3 text-lg font-semibold">Orders in Payout #{ordersId}</div>
                    <div className="max-h-[50vh] overflow-y-auto rounded border border-neutral-800">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left">
                                    <th className="p-2">Order #</th>
                                    <th className="p-2">Title</th>
                                    <th className="p-2">Amount</th>
                                    <th className="p-2">Currency</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersList.map(o => (
                                    <tr key={o.id} className="border-t border-neutral-800">
                                        <td className="p-2">{o.order_no ?? o.id}</td>
                                        <td className="p-2">{o.title ?? ''}</td>
                                        <td className="p-2">{o.amount}</td>
                                        <td className="p-2">{o.currency}</td>
                                        <td className="p-2">{o.status}</td>
                                        <td className="p-2">{o.created_at}</td>
                                    </tr>
                                ))}
                                {!ordersList.length && (
                                    <tr>
                                        <td className="p-3 text-neutral-400" colSpan={6}>No orders attached</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => setOrdersOpen(false)} className="rounded bg-neutral-800 px-3 py-2">Close</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
