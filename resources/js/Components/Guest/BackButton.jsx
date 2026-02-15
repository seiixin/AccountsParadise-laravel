import { Link, usePage } from '@inertiajs/react';

export default function BackButton({ role }) {
  const ctxRole = usePage().props?.auth?.user?.role;
  const r = role ?? ctxRole;
  const dashboardHref = r === 'buyer' ? '/buyer/dashboard'
    : r === 'merchant' ? '/merchant/dashboard'
    : r === 'admin' ? '/admin/dashboard'
    : r === 'midman' ? '/midman/dashboard'
    : '/dashboard';

  return (
    <Link href={dashboardHref} className="text-cyan-500 hover:text-cyan-400 flex items-center gap-2">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to Dashboard</span>
    </Link>
  );
}
