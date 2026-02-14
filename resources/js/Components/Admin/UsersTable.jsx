export default function UsersTable({ data, onOpen, onDelete }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left">
                        <th className="p-2">ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Username</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Created</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((u) => (
                        <tr key={u.id} className="border-t border-neutral-800">
                            <td className="p-2">{u.id}</td>
                            <td className="p-2">{u.name}</td>
                            <td className="p-2">{u.username}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2">{u.role}</td>
                            <td className="p-2">{u.created_at}</td>
                            <td className="p-2">
                                <div className="flex gap-2">
                                    <button onClick={() => onOpen(u.id)} className="rounded bg-neutral-800 px-2 py-1">Open</button>
                                    <button onClick={() => onDelete(u.id)} className="rounded bg-red-600 px-2 py-1 text-white">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td className="p-4 text-center text-neutral-400" colSpan={7}>No users</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
