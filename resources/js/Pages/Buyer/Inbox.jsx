import BuyerLayout from '@/Layouts/BuyerLayout';
import InboxList from '@/Components/Buyer/InboxList';
import ChatBox from '@/Components/Buyer/ChatBox';
import { Head } from '@inertiajs/react';

export default function Inbox() {
  return (
    <BuyerLayout
      title="Buyer · Inbox"
      header={<div className="text-xl font-semibold">Buyer · Inbox</div>}
    >
      <Head title="Buyer · Inbox" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 min-h-0" style={{ height: 'calc(100dvh - 150px)' }}>
        <div className="md:col-span-1 min-h-0 overflow-y-auto">
          <InboxList conversations={[]} />
        </div>
        <div className="md:col-span-2 min-h-0 overflow-y-auto">
          <ChatBox onSend={(msg) => {}} />
        </div>
      </div>
    </BuyerLayout>
  );
}
