import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function OrderDetails({ order, proof }) {
  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold">Buyer · Order Details</h2>}
    >
      <Head title="Buyer · Order Details" />
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
              <div className="text-neutral-400">Game Snapshot</div>
              <div className="font-mono text-sm break-all">{order.game_snapshot}</div>
            </div>
            {proof && (
              <div className="col-span-2">
                <div className="text-neutral-400 mb-2">Submitted Payment Proof</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded border border-neutral-800 bg-neutral-900 p-3">
                    <div className="text-xs text-neutral-400 mb-1">Valid ID</div>
                    {proof.id_image_path ? (
                      <img src={`/storage/${proof.id_image_path}`} alt="Valid ID" className="rounded max-h-64 object-contain w-full" />
                    ) : (
                      <div className="text-neutral-500 text-sm">No ID image</div>
                    )}
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-900 p-3">
                    <div className="text-xs text-neutral-400 mb-1">Receipt</div>
                    {proof.receipt_image_path ? (
                      <img src={`/storage/${proof.receipt_image_path}`} alt="Receipt" className="rounded max-h-64 object-contain w-full" />
                    ) : (
                      <div className="text-neutral-500 text-sm">No receipt</div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-neutral-400">Reference: {proof.payment_reference ?? '—'} · Status: {proof.status}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
