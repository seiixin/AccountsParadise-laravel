import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BuyerSidebar() {
  const current =
    usePage().url ||
    (typeof window !== 'undefined' ? window.location.pathname : '');

  const items = [
    {
      href: '/buyer/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18h8V3h-8v0z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      href: '/buyer/orders',
      label: 'Transactions',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 2h12l1 4H5l1-4zm-1 6h14l-1 12H6L5 8z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      href: '/buyer/inbox',
      label: 'Inbox',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4h16v12H4V4zm0 12l4 4h8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 12a5 5 0 100-10 5 5 0 000 10zm7 9H5a7 7 0 0114 0z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      href: '/buyer/disputes',
      label: 'Disputes',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l9 6-9 6-9-6 9-6z"
            fill="currentColor"
          />
          <path
            d="M3 15l9 6 9-6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">

      <div className="text-xs uppercase tracking-wide text-neutral-400 px-3">
        Menu
      </div>

      <ul className="space-y-1">
        {items.map((i) => {
          const active = current.startsWith(i.href);

          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-neutral-900 transition ${
                  active
                    ? 'text-cyan-300 border-l-2 border-cyan-400 bg-neutral-900/40'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span className="text-neutral-400">
                  {i.icon}
                </span>
                <span>{i.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
