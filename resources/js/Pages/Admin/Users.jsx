import AdminLayout from '@/Layouts/AdminLayout';
import UsersTable from '@/Components/Admin/UsersTable';
import UserDetailsModal from '@/Components/Admin/UserDetailsModal';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Users({ initial }) {
    const [data, setData] = useState(initial?.data ?? []);
    const [meta, setMeta] = useState(() => {
        const payload = initial ?? {};
        if (payload.meta) return payload.meta;
        return {
            current_page: payload.current_page ?? 1,
            last_page: payload.last_page ?? 1,
            links: payload.links ?? [],
        };
    });
    const [q, setQ] = useState('');
    const [role, setRole] = useState('');
    const perPage = 20;

    useEffect(() => {
        refresh();
    }, []);

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({});

    async function refresh(page = 1) {
        const params = { per_page: perPage, page };
        if (q) params.q = q;
        if (role) params.role = role;
        const res = await axios.get('/admin/users', { params, headers: { Accept: 'application/json' } });
        setData(res.data.data);
        const payload = res.data;
        setMeta(payload.meta ?? {
            current_page: payload.current_page ?? 1,
            last_page: payload.last_page ?? 1,
            links: payload.links ?? [],
        });
    }
    async function openDetails(id) {
        const res = await axios.get(`/admin/users/${id}`, { headers: { Accept: 'application/json' } });
        const user = res.data.data;
        setSelected(user);
        setForm({
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
        });
        setOpen(true);
    }


    async function save() {
        if (!selected) return;
        await axios.put(`/admin/users/${selected.id}/edit`, form, { headers: { Accept: 'application/json' } });
        setOpen(false);
        await refresh(meta.current_page ?? 1);
    }

    async function remove(id) {
        await axios.delete(`/admin/users/${id}/delete`, { headers: { Accept: 'application/json' } });
        await refresh(meta.current_page ?? 1);
    }

    return (
        <AdminLayout title="Admin · Users" header={<h2 className="text-xl font-semibold">Admin · Users</h2>}>
            <div className="p-1">
                <div className="mb-4 flex gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search name, username, email"
                        className="w-64 rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2">
                        <option value="">All roles</option>
                        <option value="admin">admin</option>
                        <option value="buyer">buyer</option>
                        <option value="merchant">merchant</option>
                        <option value="midman">midman</option>
                    </select>
                    <button onClick={() => refresh(1)} className="rounded bg-blue-600 px-3 py-2 text-white">Filter</button>
                </div>

                <UsersTable data={data} onOpen={openDetails} onDelete={remove} />

                <div className="mt-4 flex items-center gap-2">
                    <button
                        disabled={(meta.current_page ?? 1) <= 1}
                        onClick={() => refresh(Math.max((meta.current_page ?? 1) - 1, 1))}
                        className="rounded border border-neutral-800 px-3 py-2 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <div>Page {meta.current_page ?? 1} of {meta.last_page ?? 1}</div>
                    <button
                        disabled={(meta.current_page ?? 1) >= (meta.last_page ?? 1)}
                        onClick={() => refresh((meta.current_page ?? 1) + 1)}
                        className="rounded border border-neutral-800 px-3 py-2 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            <UserDetailsModal open={open} user={selected} onClose={() => setOpen(false)} onSave={save} form={form} setForm={setForm} />
        </AdminLayout>
    );
}
