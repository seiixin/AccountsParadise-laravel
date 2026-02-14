import BuyerLayout from '@/Layouts/BuyerLayout';
import WalletSummary from '@/Components/Buyer/WalletSummary';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ balance: 0, currency: 'PHP', total_orders: 0, pending_orders: 0 });
  useEffect(() => {
    axios.get('/buyer/orders', { headers: { Accept: 'application/json' }, withCredentials: true, params: { format: 'json' } })
      .then(res => {
        const list = res.data?.data ?? [];
        setMetrics({ total_orders: list.length, pending_orders: list.filter(o => o.status === 'pending').length });
      })
      .catch(() => {});
  }, []);
  return (
    <BuyerLayout
      title="Buyer Dashboard"
      header={<div className="text-xl font-semibold">Buyer · Dashboard</div>}
    >
      <Head title="Buyer · Dashboard" />
      <div className="space-y-4">
        <WalletSummary
          total_orders={metrics.total_orders}
          pending_orders={metrics.pending_orders}
        />
        <div className="ap-card p-4">
          <div className="text-neutral-300">Quick actions</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href="/buyer/orders" className="ap-pill border border-neutral-700 px-3 py-2">My Orders</a>
            <a href="/buyer/payment-proof" className="ap-pill border border-neutral-700 px-3 py-2">Submit Payment Proof</a>
            <a href="/store" className="ap-pill border border-neutral-700 px-3 py-2">Browse Store</a>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
