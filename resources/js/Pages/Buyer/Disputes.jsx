import BuyerLayout from '@/Layouts/BuyerLayout';
import DisputeForm from '@/Components/Buyer/DisputeForm';
import DisputeHistory from '@/Components/Buyer/DisputeHistory';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Disputes() {
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState('');
  useEffect(() => {
    axios.get('/buyer/orders?format=json&per_page=100', { headers: { Accept: 'application/json' }, withCredentials: true })
      .then((res) => {
        const list = res.data?.data ?? [];
        setOrders(list);
      })
      .catch(() => setOrders([]));
  }, []);
  return (
    <BuyerLayout
      title="Buyer · Disputes"
      header={<div className="text-xl font-semibold">Buyer · Disputes</div>}
    >
      <Head title="Buyer · Disputes" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <div className="ap-card p-4">
            <div className="text-sm text-neutral-400 mb-2">Select Order</div>
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
              <option value="">Choose an order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>#{o.order_no} • {o.listing_title_snapshot ?? 'Order'}</option>
              ))}
            </select>
          </div>
          <DisputeForm orderId={orderId ? Number(orderId) : undefined} />
        </div>
        <DisputeHistory />
      </div>
    </BuyerLayout>
  );
}
