import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Navbar() {
  const { auth } = usePage().props;
  const user = auth?.user;
  const role = user?.role;
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userBtnRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const inboxHref = !user
    ? route('login')
    : role === 'buyer'
      ? route('buyer.chat.inbox')
      : role === 'merchant'
        ? route('merchant.chat.inbox')
        : role === 'admin'
          ? route('admin.chat.inbox')
          : role === 'midman'
            ? route('midman.chat.inbox')
            : route('buyer.chat.inbox');
  const inboxActive = (typeof window !== 'undefined' ? window.location.pathname : '').includes('/inbox');

  useEffect(() => {
    const onDocClick = (e) => {
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      const inButton = userBtnRef.current && userBtnRef.current.contains(e.target);
      if (inDropdown || inButton) return;
      setUserOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setUserOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (userOpen && userBtnRef.current) {
      const rect = userBtnRef.current.getBoundingClientRect();
      const top = rect.bottom + 8;
      const left = rect.right - 176;
      setDropdownPos({ top, left });
    }
  }, [userOpen]);

  useEffect(() => {
    if (!userOpen) return;
    const onScroll = () => setUserOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [userOpen]);

  return (
    <nav className="glass sticky top-0 z-[2000]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="hidden md:flex items-center gap-2">
            <img src="/AccountsParadiseLogo.png" alt="AccountsParadise" className="h-10 w-10 md:h-12 md:w-12 rounded" />
            <span className="text-lg font-semibold hidden md:inline">AccountsParadise</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/" className={`${(typeof window !== 'undefined' ? window.location.pathname : '') === '/' ? 'text-cyan-300 border-b-2 border-cyan-400 pb-1' : 'text-neutral-300 hover:text-white'}`}>Home</Link>
            <Link href="/store" className={`${(typeof window !== 'undefined' ? window.location.pathname : '')?.startsWith('/store') ? 'text-cyan-300 border-b-2 border-cyan-400 pb-1' : 'text-neutral-300 hover:text-white'}`}>Store</Link>
            <Link href="/games" className={`${(typeof window !== 'undefined' ? window.location.pathname : '')?.startsWith('/games') ? 'text-cyan-300 border-b-2 border-cyan-400 pb-1' : 'text-neutral-300 hover:text-white'}`}>Games</Link>
            <Link href="/contact" className={`${(typeof window !== 'undefined' ? window.location.pathname : '')?.startsWith('/contact') ? 'text-cyan-300 border-b-2 border-cyan-400 pb-1' : 'text-neutral-300 hover:text-white'}`}>Contact</Link>
            <Link href={inboxHref} className={`${inboxActive ? 'text-cyan-300 border-b-2 border-cyan-400 pb-1' : 'text-neutral-300 hover:text-white'}`}>Inbox</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="md:hidden rounded glass-soft px-2 py-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!user && (
            <>
              <Link href={route('login')} className="rounded px-3 py-2 text-sm text-black bg-neutral-200 btn-primary-sleek">Login</Link>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                ref={userBtnRef}
                className="rounded px-3 py-2 glass-soft text-white"
                onClick={() => setUserOpen((v) => !v)}
                aria-expanded={userOpen}
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center text-xs font-semibold select-none">
                    {user?.avatar_path ? (
                      <img
                        src={`/storage/${user.avatar_path}`}
                        alt={user?.name || 'avatar'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (user?.name || 'U').slice(0, 1)
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[11px] text-neutral-300">{user?.email}</span>
                  </div>
                </div>
              </button>
              {createPortal(
                <div
                  ref={dropdownRef}
                  className={`${userOpen ? 'block' : 'hidden'} w-44 rounded glass-soft p-2 text-sm`}
                  style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 2147483647 }}
                >
                  {role === 'buyer' && (
                    <>
                      <Link href={route('buyer.chat.inbox')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Inbox</Link>
                      <Link href={route('buyer.dashboard')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Buyer Dashboard</Link>
                      <Link href={route('buyer.orders.index')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">My Orders</Link>
                    </>
                  )}
                  {role === 'merchant' && (
                    <>
                      <Link href={route('merchant.chat.inbox')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Inbox</Link>
                      <Link href={route('merchant.dashboard')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Merchant Dashboard</Link>
                      <Link href={route('merchant.orders.index')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Shop Orders</Link>
                      <Link href="/merchant/payout-requests" className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Payouts</Link>
                      <Link href="/store" className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">View Store</Link>
                    </>
                  )}
                  {role === 'admin' && (
                    <>
                      <Link href={route('admin.chat.inbox')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Inbox</Link>
                      <Link href={route('admin.dashboard')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Admin Console</Link>
                      <Link href="/store" className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Explore Store</Link>
                    </>
                  )}
                  {role === 'midman' && (
                    <>
                      <Link href={route('midman.chat.inbox')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Inbox</Link>
                      <Link href={route('midman.dashboard')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Midman Dashboard</Link>
                      <Link href="/store" className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Explore Store</Link>
                    </>
                  )}
                  <Link href={route('logout')} method="post" as="button" className="mt-1 block w-full rounded px-2 py-1 text-left hover:bg-neutral-800 text-white">
                    Logout
                  </Link>
                </div>,
                document.body
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`${open ? 'block' : 'hidden'} md:hidden border-t border-neutral-800`}>
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-center justify-center py-2">
              <img src="/AccountsParadiseLogo.png" alt="AccountsParadise" className="h-12 w-12 rounded" />
              <div className="mt-1 text-base font-semibold">AccountsParadise</div>
            </div>
            <Link href="/" className="rounded px-3 py-2 glass-soft">Home</Link>
            <Link href="/store" className="rounded px-3 py-2 glass-soft">Store</Link>
            <Link href="/games" className="rounded px-3 py-2 glass-soft">Games</Link>
            <Link href="/contact" className="rounded px-3 py-2 glass-soft">Contact</Link>
            <Link href={inboxHref} className="rounded px-3 py-2 glass-soft">Inbox</Link>
            {!user ? (
              <>
                <Link href={route('login')} className="rounded px-3 py-2 text-black btn-primary-sleek">Login</Link>
              </>
            ) : (
              <>
                {role === 'buyer' && <Link href={route('buyer.dashboard')} className="rounded px-3 py-2 glass-soft">Buyer Dashboard</Link>}
                {role === 'merchant' && <Link href={route('merchant.dashboard')} className="rounded px-3 py-2 glass-soft">Merchant Dashboard</Link>}
                {role === 'admin' && <Link href={route('admin.dashboard')} className="rounded px-3 py-2 glass-soft">Admin Console</Link>}
                <Link href={route('logout')} method="post" as="button" className="rounded px-3 py-2 glass-soft text-left">Logout</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
