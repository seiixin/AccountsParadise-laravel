import MerchantLayout from '@/Layouts/MerchantLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PayoutRequests({ initial }) {
  const [data, setData] = useState(initial?.data ?? []);
  const [meta, setMeta] = useState(initial?.meta ?? {});
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [checkingId, setCheckingId] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewOrders, setViewOrders] = useState([]);
  const [viewId, setViewId] = useState(null);
  const perPage = 20;
  const [selectOpen, setSelectOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const totalSelected = selectedIds.length ? orders.filter(o => selectedIds.includes(o.id)).reduce((sum, o) => sum + Number(o.amount ?? 0), 0) : 0;

  useEffect(() => {
    if (!initial?.data?.length) {
      refresh(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh(page = 1) {
    const res = await axios.get('/merchant/payout-requests', {
      params: { per_page: perPage, page },
      headers: { Accept: 'application/json' },
      withCredentials: true,
    });
    const payload = res.data ?? {};
    const nextMeta = payload.meta ?? {
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
      links: payload.links ?? [],
    };
    setData(payload.data ?? []);
    setMeta(nextMeta);
  }

  async function openView(p) {
    try {
      const res = await axios.get(`/merchant/payout-requests/${p.id}`, { headers: { Accept: 'application/json' }, withCredentials: true });
      const payload = res.data ?? {};
      setViewId(p.id);
      setViewOrders(payload.orders_snapshot ?? []);
      setViewOpen(true);
    } catch {
      setViewOrders([]);
      setViewOpen(true);
    }
  }

  async function createPayout() {
    const res = await axios.post('/merchant/payout-requests', {
      amount: Number(amount),
      currency,
    }, { headers: { Accept: 'application/json' }, withCredentials: true });
    const created = res.data;
    setData(prev => [{ id: created.id, amount: created.amount, currency: created.currency, status: created.status, created_at: created.created_at }, ...prev]);
    setAmount('');
    setCurrency('PHP');
  }

  async function openSelectModal() {
    setSelectOpen(true);
    const res = await axios.get('/merchant/orders', {
      params: { per_page: 100, format: 'json' },
      headers: { Accept: 'application/json' },
      withCredentials: true,
    });
    const payload = res.data ?? {};
    const list = (payload.data ?? []).filter(o => (o.status ?? '') === 'completed');
    setOrders(list);
    if (list.length) setCurrency(list[0].currency ?? 'PHP');
  }

  function toggleId(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function submitSelected() {
    if (!selectedIds.length) return;
    const res = await axios.post('/merchant/payout-requests', {
      order_ids: selectedIds,
    }, { headers: { Accept: 'application/json' }, withCredentials: true });
    const created = res.data;
    setData(prev => [{ id: created.id, amount: created.amount, currency: created.currency, status: created.status, created_at: created.created_at }, ...prev]);
    setSelectOpen(false);
    setSelectedIds([]);
    setOrders([]);
  }

  async function checkStatus() {
    if (!checkingId) return;
    try {
      const res = await axios.get(`/merchant/payout-requests/${checkingId}`, { headers: { Accept: 'application/json' }, withCredentials: true });
      setCheckResult(res.data ?? null);
    } catch {
      setCheckResult(null);
    }
  }

  return (
    <MerchantLayout
      title="Merchant · Payouts"
      header={<h2 className="text-xl font-semibold">Merchant · Payouts</h2>}
    >
      <Head title="Merchant · Payouts" />
      <div className="space-y-6">
        <div className="glass-soft rounded-lg p-4">
          <div className="text-lg font-semibold mb-3">Payouts</div>
          <div className="mt-3">
            <button onClick={openSelectModal} className="rounded border border-neutral-700 px-3 py-2">Request Payout</button>
          </div>
        </div>

        <div className="glass-soft rounded-lg p-4">
          <div className="text-lg font-semibold mb-3">My Payouts</div>
          <div className="overflow-hidden rounded-lg border border-neutral-800">
            <table className="min-w-full divide-y divide-neutral-800">
              <thead className="bg-neutral-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Currency</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {data.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3">{p.amount}</td>
                    <td className="px-4 py-3">{p.currency}</td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{p.created_at}</span>
                        <button onClick={() => openView(p)} className="rounded bg-neutral-800 px-2 py-1">View Orders</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.length && (
                  <tr>
                    <td className="px-4 py-6 text-center text-neutral-400" colSpan={5}>No payout requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              disabled={(meta.current_page ?? 1) <= 1}
              onClick={() => refresh(Math.max((meta.current_page ?? 1) - 1, 1))}
              className="rounded border border-neutral-800 px-3 py-2 disabled:opacity-50"
            >
              Prev
            </button>
            <div>Page {meta.current_page ?? 1} of {meta.last_page ?? 1}</div>
            <button
              disabled={(meta.current_page ?? 1) >= (meta.last_page ?? 1)}
              onClick={() => refresh((meta.current_page ?? 1) + 1)}
              className="rounded border border-neutral-800 px-3 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="glass-soft rounded-lg p-4">
          <div className="text-lg font-semibold mb-3">Check Request Status</div>
          <div className="grid grid-cols-3 gap-3">
            <input value={checkingId} onChange={(e) => setCheckingId(e.target.value)} placeholder="Enter Request ID" className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2" />
            <button onClick={checkStatus} className="rounded bg-neutral-800 px-3 py-2">Check</button>
          </div>
          {checkResult && (
            <div className="mt-3 rounded border border-neutral-800 p-3">
              <div className="text-sm text-neutral-400">Result</div>
              <div className="mt-1">ID: {checkResult.id}</div>
              <div className="mt-1">Amount: {checkResult.amount} {checkResult.currency}</div>
              <div className="mt-1">Status: {checkResult.status}</div>
              <div className="mt-1">Created: {checkResult.created_at}</div>
            </div>
          )}
        </div>
      </div>
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
                      <input type="checkbox" checked={selectedIds.includes(o.id)} onChange={() => toggleId(o.id)} />
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
            <button onClick={submitSelected} disabled={!selectedIds.length} className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50">Submit Request</button>
            <button onClick={() => { setSelectOpen(false); setSelectedIds([]); }} className="rounded bg-neutral-800 px-3 py-2">Close</button>
          </div>
        </div>
      </div>
      <div className={`${viewOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
        <div className="w-full max-w-3xl rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="mb-3 text-lg font-semibold">Orders in Payout #{viewId}</div>
          <div className="max-h-[50vh] overflow-y-auto rounded border border-neutral-800">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Order #</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Currency</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {viewOrders.map(o => (
                  <tr key={o.id} className="border-t border-neutral-800">
                    <td className="p-2">{o.order_no ?? o.id}</td>
                    <td className="p-2">{o.title ?? ''}</td>
                    <td className="p-2">{o.amount}</td>
                    <td className="p-2">{o.currency}</td>
                    <td className="p-2">{o.status}</td>
                    <td className="p-2">{o.created_at}</td>
                  </tr>
                ))}
                {!viewOrders.length && (
                  <tr>
                    <td className="p-3 text-neutral-400" colSpan={6}>No orders attached</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => setViewOpen(false)} className="rounded bg-neutral-800 px-3 py-2">Close</button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
