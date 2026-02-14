import { Head } from '@inertiajs/react';
import AdminNavbar from '@/Components/Admin/AdminNavbar';
import AdminSidebar from '@/Components/Admin/AdminSidebar';

export default function AdminLayout({ title, header, children }) {
    return (
        <div className="min-h-screen bg-gradient-app text-neutral-100">
            <Head title={title ?? 'Admin'} />
            <div className="glass">
                <AdminNavbar />
            </div>
            <div className="mx-auto flex max-w-7xl gap-6 p-6">
                <div className="w-64 shrink-0 glass-soft rounded-lg p-3">
                    <div className="mb-3 text-sm text-neutral-400">Admin</div>
                    <AdminSidebar />
                </div>
                <div className="flex-1">
                    {header}
                    <div className="mt-4 glass-soft rounded-lg p-4">{children}</div>
                </div>
            </div>
        </div>
    );
}
