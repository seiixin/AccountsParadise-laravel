import MerchantLayout from '@/Layouts/MerchantLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard({ metrics: initialMetrics }) {
  const [metrics, setMetrics] = useState(initialMetrics ?? { total_orders: 0, total_listings: 0, total_pending_orders: 0 });

  useEffect(() => {
    if (!initialMetrics) {
      axios.get('/merchant/dashboard', { headers: { Accept: 'application/json' }, withCredentials: true })
        .then(res => setMetrics(res.data?.metrics ?? metrics))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MerchantLayout
      title="Merchant Dashboard"
      header={<h2 className="text-xl font-semibold">Merchant Dashboard</h2>}
    >
      <Head title="Merchant Dashboard" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Total Orders" value={metrics.total_orders ?? 0} />
          <StatCard label="Total Listings" value={metrics.total_listings ?? 0} />
          <StatCard label="Pending Orders" value={metrics.total_pending_orders ?? 0} />
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-6">
          <div className="text-neutral-400">Quick Actions</div>
          <div className="mt-3 flex gap-3">
            <a href={route('merchant.orders.index')} className="rounded border border-neutral-700 px-3 py-2">View Orders</a>
            <a href={route('merchant.listings.index')} className="rounded border border-neutral-700 px-3 py-2">Manage Listings</a>
            <a href="/store" className="rounded border border-neutral-700 px-3 py-2">Go to Store</a>
          </div>
        </div>

        <PayoutWidget />
      </div>
    </MerchantLayout>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-6">
      <div className="text-neutral-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function PayoutWidget() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [checkingId, setCheckingId] = useState('');
  const [result, setResult] = useState(null);
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const totalSelected = selectedIds.length ? orders.filter(o => selectedIds.includes(o.id)).reduce((sum, o) => sum + Number(o.amount ?? 0), 0) : 0;

  async function create() {
    if (!amount) return;
    setCreating(true);
    try {
      const res = await axios.post('/merchant/payout-requests', { amount: Number(amount), currency }, { headers: { Accept: 'application/json' }, withCredentials: true });
      setResult(res.data ?? null);
      setAmount('');
      setCurrency('PHP');
    } finally {
      setCreating(false);
    }
  }

  async function check() {
    if (!checkingId) return;
    setChecking(true);
    try {
      const res = await axios.get(`/merchant/payout-requests/${checkingId}`, { headers: { Accept: 'application/json' }, withCredentials: true });
      setResult(res.data ?? null);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-6">
      <div className="text-lg font-semibold">Payouts</div>
      <div className="mt-3">
        <button
          onClick={async () => {
            setSelectOpen(true);
            const res = await axios.get('/merchant/orders', { params: { per_page: 100, format: 'json' }, headers: { Accept: 'application/json' }, withCredentials: true });
            const payload = res.data ?? {};
            const list = (payload.data ?? []).filter(o => (o.status ?? '') === 'completed');
            setOrders(list);
            if (list.length) setCurrency(list[0].currency ?? 'PHP');
          }}
          className="rounded border border-neutral-700 px-3 py-2"
        >
          Request Payout
        </button>
      </div>
      <div className="mt-6">
        <div className="text-neutral-400">Check Request Status</div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <input value={checkingId} onChange={(e) => setCheckingId(e.target.value)} placeholder="Enter Request ID" className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2" />
          <button onClick={check} disabled={checking} className="rounded bg-neutral-800 px-3 py-2 disabled:opacity-50">Check</button>
        </div>
      </div>
      {result && (
        <div className="mt-4 rounded border border-neutral-800 p-4">
          <div className="text-sm text-neutral-400">Latest Result</div>
          <div className="mt-1">ID: {result.id}</div>
          <div className="mt-1">Amount: {result.amount} {result.currency}</div>
          <div className="mt-1">Status: {result.status}</div>
          <div className="mt-1">Created: {result.created_at}</div>
        </div>
      )}
      <div className={`${selectOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
        <div className="w-full max-w-3xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="mb-3 text-lg font-semibold">Select completed orders</div>
          <div className="mb-2 grid grid-cols-3 gap-3">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
              <option value="PHP">PHP</option>
              <option value="USD">USD</option>
            </select>
            <div className="col-span-2 text-right text-sm">Total: {currency} {totalSelected}</div>
          </div>
          <div className="max-h-[50vh] overflow-y-auto rounded border border-neutral-800">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Pick</th>
                  <th className="p-2">Order #</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Currency</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-neutral-800">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(o.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(o.id) ? prev.filter(x => x !== o.id) : [...prev, o.id])}
                      />
                    </td>
                    <td className="p-2">{o.order_no ?? o.id}</td>
                    <td className="p-2">{o.amount}</td>
                    <td className="p-2">{o.currency}</td>
                    <td className="p-2">{o.status}</td>
                    <td className="p-2">{o.created_at}</td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td className="p-3 text-neutral-400" colSpan={6}>No completed orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={async () => {
                if (!selectedIds.length) return;
                const res = await axios.post('/merchant/payout-requests', { order_ids: selectedIds }, { headers: { Accept: 'application/json' }, withCredentials: true });
                setResult(res.data ?? null);
                setSelectOpen(false);
                setSelectedIds([]);
                setOrders([]);
              }}
              disabled={!selectedIds.length}
              className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
            >
              Submit Request
            </button>
            <button onClick={() => { setSelectOpen(false); setSelectedIds([]); }} className="rounded bg-neutral-800 px-3 py-2">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
