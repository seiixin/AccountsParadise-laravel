import { Link, usePage } from '@inertiajs/react';

export default function AdminSidebar() {
    const current = usePage().url || (typeof window !== 'undefined' ? window.location.pathname : '');
    const items = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18h8V3h-8v0z" fill="currentColor" /></svg>
        ) },
        { href: '/admin/users', label: 'Users', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0H4z" fill="currentColor"/></svg>
        ) },
        { href: '/admin/orders', label: 'Orders', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2h12l1 4H5l1-4zm-1 6h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.5"/></svg>
        ) },
        { href: '/admin/order-disputes', label: 'Disputes', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 6-9 6-9-6 9-6z" fill="currentColor"/><path d="M3 15l9 6 9-6" stroke="currentColor" strokeWidth="1.5"/></svg>
        ) },
        { href: '/admin/inbox', label: 'Inbox', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H4V4zm0 12l4 4h8l4-4" stroke="currentColor" strokeWidth="1.5"/></svg>
        ) },
        { href: '/admin/categories', label: 'Categories', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 9v-7h7v7h-7z" fill="currentColor"/></svg>
        ) },
        { href: '/admin/payout-requests', label: 'Payouts', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M6 8h9a3 3 0 010 6H6" stroke="currentColor" strokeWidth="1.5"/></svg>
        ) },
        { href: '/profile', label: 'Profile', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm7 9H5a7 7 0 0114 0z" fill="currentColor"/></svg>
        ) },
    ];
    return (
        <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-neutral-400 px-3">Admin Menu</div>
            <ul className="space-y-1">
                {items.map((i) => {
                    const active = current.startsWith(i.href);
                    return (
                        <li key={i.href}>
                            <Link
                                href={i.href}
                                className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-neutral-900 ${active ? 'border-l-4 border-cyan-400 bg-neutral-900 text-cyan-300 font-semibold' : 'text-neutral-300'}`}
                            >
                                <span className="text-neutral-400">{i.icon}</span>
                                <span>{i.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
