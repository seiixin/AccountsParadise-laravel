import { usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';

export default function AuthenticatedLayout({ header, children, fullWidth = false, hideGlobalInboxButton = false }) {
    const user = usePage().props.auth.user;
    const role = user?.role;
    const inboxHref = role === 'buyer' ? '/buyer/inbox'
        : role === 'merchant' ? '/merchant/inbox'
        : role === 'admin' ? '/admin/inbox'
        : role === 'midman' ? '/midman/inbox'
        : '/buyer/inbox';

    return (
        <div className="min-h-screen bg-gradient-app text-neutral-100">
            <div className="glass sticky top-0 z-50">
                <Navbar />
            </div>

            {header && (
                <header className="glass-soft">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className={`${fullWidth ? 'mx-0 max-w-none my-0 p-0 rounded-none' : 'mx-auto max-w-7xl my-6 p-6 rounded-lg'} glass-soft`}>{children}</main>
        </div>
    );
}
