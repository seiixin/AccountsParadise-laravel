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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <InboxList conversations={[]} />
        </div>
        <div className="md:col-span-2">
          <ChatBox onSend={(msg) => { /* integrate real send later */ }} />
        </div>
      </div>
    </BuyerLayout>
  );
}
