import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import AdminSidebar from '@/Components/Admin/AdminSidebar';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function AdminLayout({ title, header, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUrl = usePage().url || (typeof window !== 'undefined' ? window.location.pathname : '');

  useEffect(() => {
    setMobileOpen(false);
  }, [currentUrl]);

  const user = usePage().props?.auth?.user;
  const role = user?.role;
  const inboxHref = user
    ? (role === 'buyer' ? '/buyer/inbox'
      : role === 'merchant' ? '/merchant/inbox'
      : role === 'admin' ? '/admin/inbox'
      : role === 'midman' ? '/midman/inbox'
      : '/buyer/inbox')
    : '/login';

  return (
    <div className="min-h-screen bg-gradient-app text-neutral-100">
      <Head title={title ?? 'Admin'} />

      {/* Navbar */}
      <div className="glass">
        <Navbar />
      </div>

      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <button
            type="button"
            aria-label="Open admin menu"
            onClick={() => setMobileOpen(true)}
            className="rounded glass-soft px-3 py-2 text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="text-sm text-neutral-300">{title}</div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex gap-6">
          <div className="w-64 shrink-0 glass-soft rounded-lg p-3">
            <AdminSidebar />
          </div>
          <div className="flex-1">
            {header}
            <div className="mt-4 glass-soft rounded-lg p-4">{children}</div>
          </div>
        </div>

        {/* Mobile layout: content full width */}
        <div className="lg:hidden">
          {header}
          <div className="mt-3 glass-soft rounded-lg p-4">{children}</div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[3000]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] border-r border-neutral-800 bg-neutral-950 p-3">
            <div className="space-y-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  aria-label="Close admin menu"
                  onClick={() => setMobileOpen(false)}
                  className="rounded glass-soft px-3 py-2 text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="text-sm text-neutral-300">Admin Menu</div>
              </div>
              <ul className="space-y-1">
                {/* Sidebar items dynamically mapped from array */}
                {[
                  { href: '/admin/dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18h8V3h-8v0z" fill="currentColor" /></svg> },
                  { href: '/admin/users', label: 'Users', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0H4z" fill="currentColor" /></svg> },
                  { href: '/admin/orders', label: 'Orders', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2h12l1 4H5l1-4zm-1 6h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.5" /></svg> },
                  { href: '/admin/order-disputes', label: 'Disputes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 6-9 6-9-6 9-6z" fill="currentColor" /><path d="M3 15l9 6 9-6" stroke="currentColor" strokeWidth="1.5" /></svg> },
                  { href: '/admin/inbox', label: 'Inbox', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H4V4zm0 12l4 4h8l4-4" stroke="currentColor" strokeWidth="1.5" /></svg> },
                  { href: '/admin/categories', label: 'Categories', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 9v-7h7v7h-7z" fill="currentColor" /></svg> },
                  { href: '/admin/payout-requests', label: 'Payouts', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M6 8h9a3 3 0 010 6H6" stroke="currentColor" strokeWidth="1.5" /></svg> },
                  { href: '/profile', label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm7 9H5a7 7 0 0114 0z" fill="currentColor" /></svg> }
                ].map((item) => {
                  const active = currentUrl.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-neutral-900 transition ${
                          active
                            ? 'text-cyan-300 border-l-2 border-cyan-400 bg-neutral-900/40'
                            : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        <span className="text-neutral-400">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {createPortal(
        <Link
          href={inboxHref}
          className="fixed bottom-4 right-4 z-[2147483647] flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white"
          aria-label="Inbox"
          title="Inbox"
        >
          <img src="/message.png" alt="Inbox" className="h-6 w-6 md:h-8 md:w-8" draggable="false" />
        </Link>,
        document.body
      )}
    </div>
  );
}
