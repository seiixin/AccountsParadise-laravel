import MerchantLayout from '@/Layouts/MerchantLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PayoutRequests({ initial }) {
  const [data, setData] = useState(initial?.data ?? []);
  const [meta, setMeta] = useState(initial?.meta ?? {});
  const [checkingId, setCheckingId] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewOrders, setViewOrders] = useState([]);
  const [viewId, setViewId] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currency, setCurrency] = useState('PHP');

  const perPage = 20;

  const totalSelected = selectedIds.length
    ? orders
        .filter(o => selectedIds.includes(o.id))
        .reduce((sum, o) => sum + Number(o.amount ?? 0), 0)
    : 0;

  useEffect(() => {
    if (!initial?.data?.length) refresh(1);
  }, []);

  async function refresh(page = 1) {
    const res = await axios.get('/merchant/payout-requests', {
      params: { per_page: perPage, page },
      headers: { Accept: 'application/json' },
      withCredentials: true,
    });

    const payload = res.data ?? {};
    setData(payload.data ?? []);
    setMeta(payload.meta ?? {});
  }

  async function openView(p) {
    const res = await axios.get(`/merchant/payout-requests/${p.id}`, {
      headers: { Accept: 'application/json' },
      withCredentials: true,
    });

    setViewId(p.id);
    setViewOrders(res.data?.orders_snapshot ?? []);
    setViewOpen(true);
  }

  async function openSelectModal() {
    setSelectOpen(true);

    const res = await axios.get('/merchant/orders', {
      params: { per_page: 100, format: 'json', eligible_for_payout: 1 },
      headers: { Accept: 'application/json' },
      withCredentials: true,
    });

    const list = (res.data?.data ?? []);
    setOrders(list);
  }

  function toggleId(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function submitSelected() {
    if (!selectedIds.length) return;

    const res = await axios.post(
      '/merchant/payout-requests',
      { order_ids: selectedIds },
      { headers: { Accept: 'application/json' }, withCredentials: true }
    );

    const created = res.data;
    setData(prev => [created, ...prev]);
    setSelectOpen(false);
    setSelectedIds([]);
  }

  async function checkStatus() {
    if (!checkingId) return;

    const res = await axios.get(
      `/merchant/payout-requests/${checkingId}`,
      { headers: { Accept: 'application/json' }, withCredentials: true }
    );

    setCheckResult(res.data ?? null);
  }

  return (
    <MerchantLayout
      title="Merchant · Payouts"
      header={<h2 className="text-xl font-semibold">Merchant · Payouts</h2>}
    >
      <Head title="Merchant · Payouts" />

      <div className="space-y-6 px-4 sm:px-0">

        {/* REQUEST BUTTON */}
        <div className="glass-soft rounded-xl p-4">
          <button
            onClick={openSelectModal}
            className="w-full sm:w-auto rounded-lg border border-neutral-700 px-4 py-3"
          >
            Request Payout
          </button>
        </div>

        {/* MY PAYOUTS */}
        <div className="glass-soft rounded-xl p-4 space-y-4">
          <div className="text-lg font-semibold">My Payouts</div>

          {/* MOBILE CARDS */}
          <div className="space-y-4 sm:hidden">
            {data.map(p => (
              <div key={p.id} className="rounded-lg border border-neutral-800 p-4 space-y-2">
                <Row label="ID" value={p.id} />
                <Row label="Amount" value={`${p.amount} ${p.currency}`} />
                <Row label="Status" value={p.status} />
                <Row label="Created" value={p.created_at} />
                <button
                  onClick={() => openView(p)}
                  className="w-full rounded bg-neutral-800 px-3 py-2"
                >
                  View Orders
                </button>
              </div>
            ))}

            {!data.length && (
              <div className="text-center text-neutral-400 py-6">
                No payout requests
              </div>
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-900">
                <tr>
                  <Th>ID</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {data.map(p => (
                  <tr key={p.id} className="border-t border-neutral-800">
                    <Td>{p.id}</Td>
                    <Td>{p.amount} {p.currency}</Td>
                    <Td>{p.status}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {p.created_at}
                        <button
                          onClick={() => openView(p)}
                          className="rounded bg-neutral-800 px-2 py-1"
                        >
                          View
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button
              disabled={(meta.current_page ?? 1) <= 1}
              onClick={() => refresh((meta.current_page ?? 1) - 1)}
              className="w-full sm:w-auto rounded border border-neutral-800 px-3 py-2 disabled:opacity-50"
            >
              Prev
            </button>

            <div className="text-center">
              Page {meta.current_page ?? 1} of {meta.last_page ?? 1}
            </div>

            <button
              disabled={(meta.current_page ?? 1) >= (meta.last_page ?? 1)}
              onClick={() => refresh((meta.current_page ?? 1) + 1)}
              className="w-full sm:w-auto rounded border border-neutral-800 px-3 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* CHECK STATUS */}
        <div className="glass-soft rounded-xl p-4 space-y-3">
          <div className="text-lg font-semibold">Check Request Status</div>

          <input
            value={checkingId}
            onChange={(e) => setCheckingId(e.target.value)}
            placeholder="Enter Request ID"
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-3"
          />

          <button
            onClick={checkStatus}
            className="w-full sm:w-auto rounded bg-neutral-800 px-4 py-3"
          >
            Check
          </button>

          {checkResult && (
            <div className="rounded-lg border border-neutral-800 p-4 space-y-1">
              <Row label="ID" value={checkResult.id} />
              <Row label="Amount" value={`${checkResult.amount} ${checkResult.currency}`} />
              <Row label="Status" value={checkResult.status} />
              <Row label="Created" value={checkResult.created_at} />
            </div>
          )}
        </div>
      </div>

      {/* SELECT MODAL (Bottom Sheet on Mobile) */}
      {selectOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-3xl bg-neutral-950 rounded-t-xl sm:rounded-xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="text-lg font-semibold mb-4">
              Select Completed Orders
            </div>

            <div className="text-sm mb-3">
              Total: {currency} {totalSelected}
            </div>

            <div className="space-y-3">
              {orders.map(o => (
                <div
                  key={o.id}
                  className="border border-neutral-800 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      #{o.order_no ?? o.id}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {o.amount} {o.currency}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedIds.includes(o.id)}
                    onChange={() => toggleId(o.id)}
                  />
                </div>
              ))}

              {!orders.length && (
                <div className="text-neutral-400 text-center py-4">
                  No completed orders
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={submitSelected}
                disabled={!selectedIds.length}
                className="w-full rounded bg-blue-600 px-4 py-3 text-white disabled:opacity-50"
              >
                Submit Request
              </button>

              <button
                onClick={() => setSelectOpen(false)}
                className="w-full rounded bg-neutral-800 px-4 py-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-3xl bg-neutral-950 rounded-t-xl sm:rounded-xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="text-lg font-semibold mb-4">
              Orders in Payout #{viewId}
            </div>

            <div className="space-y-3">
              {viewOrders.map(o => (
                <div key={o.id} className="border border-neutral-800 rounded-lg p-3 space-y-1">
                  <Row label="Order #" value={o.order_no ?? o.id} />
                  <Row label="Amount" value={`${o.amount} ${o.currency}`} />
                  <Row label="Status" value={o.status} />
                  <Row label="Created" value={o.created_at} />
                </div>
              ))}

              {!viewOrders.length && (
                <div className="text-neutral-400 text-center py-4">
                  No orders attached
                </div>
              )}
            </div>

            <button
              onClick={() => setViewOpen(false)}
              className="mt-4 w-full rounded bg-neutral-800 px-4 py-3"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </MerchantLayout>
  );
}

/* ---------- Small Components ---------- */

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}

function Td({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}
