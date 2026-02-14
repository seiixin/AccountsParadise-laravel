// components/BackButton.js
import { Link } from '@inertiajs/react';

export default function BackButton({ role }) {
  const dashboardHref = role === 'buyer' ? '/buyer/dashboard'
    : role === 'merchant' ? '/merchant/dashboard'
    : role === 'admin' ? '/admin/dashboard'
    : role === 'midman' ? '/midman/dashboard'
    : '/buyer/dashboard';

  return (
    <Link href={dashboardHref} className="text-cyan-500 hover:text-cyan-400 flex items-center gap-2">
      {/* Left Arrow Icon for Back Button */}
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to Dashboard</span>
    </Link>
  );
}
