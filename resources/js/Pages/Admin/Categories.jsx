import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Categories({ initial }) {
    const [data, setData] = useState(initial?.data ?? []);
    const [meta, setMeta] = useState(initial?.meta ?? {});
    const perPage = 20;
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [name, setName] = useState('');
    const [approveStatus, setApproveStatus] = useState('approved');

    useEffect(() => {
        refresh();
    }, []);

    async function refresh(page = 1) {
        const params = { per_page: perPage, page };
        const res = await axios.get('/admin/categories', { params, headers: { Accept: 'application/json' } });
        setData(res.data.data);
        setMeta(res.data.meta);
    }

    async function openDetails(id) {
        const res = await axios.get(`/admin/categories/${id}`, { headers: { Accept: 'application/json' } });
        const cat = res.data;
        setSelected({ id, ...cat });
        setName(cat.name);
        setOpen(true);
    }

    async function update() {
        if (!selected) return;
        await axios.put(`/admin/categories/${selected.id}/update`, { name }, { headers: { Accept: 'application/json' } });
        setOpen(false);
        await refresh(meta.current_page ?? 1);
    }

    async function approve(id, status) {
        await axios.put(`/admin/categories/${id}/approve`, { status }, { headers: { Accept: 'application/json' } });
        await refresh(meta.current_page ?? 1);
    }

    async function remove(id) {
        await axios.delete(`/admin/categories/${id}/delete`, { headers: { Accept: 'application/json' } });
        await refresh(meta.current_page ?? 1);
    }

    return (
        <AdminLayout title="Admin · Categories" header={<h2 className="text-xl font-semibold">Categories</h2>}>
            <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">ID</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((c) => (
                            <tr key={c.id} className="border-t border-neutral-800">
                                <td className="p-2">{c.id}</td>
                                <td className="p-2">{c.name}</td>
                                <td className="p-2">{c.status}</td>
                                <td className="p-2">{c.created_at}</td>
                                <td className="p-2">
                                    <div className="flex gap-2">
                                        <button onClick={() => openDetails(c.id)} className="rounded bg-neutral-800 px-2 py-1">Open</button>
                                        <button onClick={() => approve(c.id, 'approved')} className="rounded bg-green-700 px-2 py-1 text-white">Approve</button>
                                        <button onClick={() => approve(c.id, 'rejected')} className="rounded bg-yellow-700 px-2 py-1 text-white">Reject</button>
                                        <button onClick={() => remove(c.id)} className="rounded bg-red-600 px-2 py-1 text-white">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={`${open ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
                <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                    <div className="mb-3 text-lg font-semibold">Category</div>
                    <div className="space-y-2">
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2" placeholder="Name" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <button onClick={update} className="rounded bg-blue-600 px-3 py-2 text-white">Save</button>
                        <button onClick={() => setOpen(false)} className="rounded bg-neutral-800 px-3 py-2">Close</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
