import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ChatSidebar from '@/Components/Guest/ChatSidebar';
import BackButton from '@/Components/Guest/BackButton'; // Import the BackButton component

export default function Inbox({ role }) {
  return (
    <AuthenticatedLayout 
      header={
        <div className="flex items-center gap-4">
          <BackButton role={role} /> {/* Use the BackButton component */}
        </div>
      }
    >
      <Head title="Inbox" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-1"><ChatSidebar /></div>
        <div className="md:col-span-2">
          <div className="ap-card p-4">
            <div className="text-sm text-neutral-400">Select a conversation from the left.</div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
