 import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import BuyerSidebar from '@/Components/Buyer/BuyerSidebar';
import { useEffect, useState } from 'react';

export default function BuyerLayout({ title = 'Buyer', header, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUrl = usePage().url || (typeof window !== 'undefined' ? window.location.pathname : '');

  useEffect(() => {
    setMobileOpen(false);
  }, [currentUrl]);

  return (
    <div className="min-h-screen bg-gradient-app text-neutral-100">
      <Head title={title} />
      <div className="glass">
        <Navbar />
      </div>
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        {/* Mobile top bar: toggle sidebar */}
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <button
            type="button"
            aria-label="Open buyer menu"
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
          <div className="w-56 shrink-0 glass-soft rounded-lg p-3">
            <BuyerSidebar />
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] border-r border-neutral-800 bg-neutral-950 p-3">
            <BuyerSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
