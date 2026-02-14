export default function UserDetailsModal({ open, user, onClose, onSave, form, setForm }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                <div className="mb-3 text-lg font-semibold">User Details</div>
                {user ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>ID</div><div>{user.id}</div>
                            <div>Username</div><div className="font-mono">{user.username}</div>
                            <div>Email</div><div className="font-mono">{user.email}</div>
                            <div>Role</div><div>{user.role}</div>
                            <div>Created</div><div>{user.created_at}</div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2" placeholder="Name" />
                            <input value={form.username ?? ''} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2" placeholder="Username" />
                            <input value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2" placeholder="Email" />
                            <select value={form.role ?? ''} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
                                <option value="admin">admin</option>
                                <option value="buyer">buyer</option>
                                <option value="merchant">merchant</option>
                                <option value="midman">midman</option>
                            </select>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <button onClick={onSave} className="rounded bg-blue-600 px-3 py-2 text-white">Save</button>
                            <button onClick={onClose} className="rounded bg-neutral-800 px-3 py-2">Close</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-neutral-400">Loading...</div>
                )}
            </div>
        </div>
    );
}
