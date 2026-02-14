import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';

export default function OrderDetails({ order }) {
  return (
    <MerchantLayout
      title="Merchant · Order Details"
      header={<h2 className="text-xl font-semibold">Merchant · Order Details</h2>}
    >
      <Head title="Merchant · Order Details" />
      <div className="mx-auto max-w-3xl p-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-neutral-400">Order #</div>
              <div className="font-medium">{order.order_no}</div>
            </div>
            <div>
              <div className="text-neutral-400">Status</div>
              <div className="font-medium">{order.status}</div>
            </div>
            <div>
              <div className="text-neutral-400">Amount</div>
              <div className="font-medium">{order.amount} {order.currency}</div>
            </div>
            <div>
              <div className="text-neutral-400">Created</div>
              <div className="font-medium">{new Date(order.created_at).toLocaleString()}</div>
            </div>
            <div className="col-span-2">
              <div className="text-neutral-400">Listing Title</div>
              <div className="font-medium">{order.listing_title_snapshot}</div>
            </div>
            <div className="col-span-2">
              <div className="text-neutral-400">Listing Type</div>
              <div className="font-medium">{order.listing_type_snapshot ?? '—'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-neutral-400">Game Snapshot</div>
              <div className="font-mono text-sm break-all">{order.game_snapshot}</div>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
