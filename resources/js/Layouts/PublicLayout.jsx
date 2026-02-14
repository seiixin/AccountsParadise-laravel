import Navbar from '@/Components/Navbar';
import { Link, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';

export default function PublicLayout({ children, header, fullWidth = false }) {
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
      <div className="glass">
        <Navbar />
      </div>
      <div className={fullWidth ? 'w-full px-0 md:px-0 lg:px-[5px]' : 'mx-auto max-w-7xl p-6'}>
        {header && (
          <div className={`mb-4 text-xl font-bold text-center glass-soft ${fullWidth ? 'rounded-none p-4 md:p-5 lg:rounded-lg lg:p-6' : 'rounded-lg p-6'} relative z-10 sm:text-2xl md:text-3xl lg:text-4xl`}>
            {header}
          </div>
        )}
        <div className={`glass-soft ${fullWidth ? 'rounded-none p-2 lg:rounded-lg lg:p-4' : 'rounded-lg p-4'} relative z-0`}>
          {children}
        </div>
      </div>
      {createPortal(
        <Link
          href={inboxHref}
          className="fixed bottom-4 right-4 z-[2147483647] flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white"
          aria-label="Inbox"
          title="Inbox"
        >
          <img src="/message.png" alt="Inbox" className="h-6 w-6" draggable="false" />
        </Link>,
        document.body
      )}
    </div>
  );
}
