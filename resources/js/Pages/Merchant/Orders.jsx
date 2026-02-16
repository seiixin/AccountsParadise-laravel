import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Orders({ initial }) {
  const [data, setData] = useState(initial?.data ?? []);
  const [meta, setMeta] = useState(() => {
    const payload = initial ?? {};
    return payload.meta ?? {
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
      links: payload.links ?? [],
    };
  });

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function refresh(page = 1) {
    const res = await axios.get('/merchant/orders', {
      params: {
        page,
        per_page: 20,
        q: q || undefined,
        status: status || undefined,
        format: 'json',
      },
      headers: { Accept: 'application/json' },
    });

    const payload = res.data;

    setData(payload.data ?? []);
    setMeta(payload.meta ?? {
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
      links: payload.links ?? [],
    });
  }

  useEffect(() => {
    if (!initial?.data?.length) refresh(meta.current_page ?? 1);
  }, []);

  return (
    <MerchantLayout
      title="Merchant · Orders"
      header={<h2 className="text-xl font-semibold">Merchant · Orders</h2>}
    >
      <Head title="Merchant · Orders" />

      <div className="mx-auto max-w-6xl p-4">

        {/* FILTERS */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <div className="text-xs text-neutral-400 mb-1">Search</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order #"
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
            />
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
            >
              <option value="">All</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="processing">processing</option>
              <option value="delivered">delivered</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
              <option value="disputed">disputed</option>
              <option value="refunded">refunded</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => refresh(1)}
              className="w-full rounded bg-neutral-800 px-3 py-2"
            >
              Filter
            </button>
          </div>
        </div>

        {/* ============================= */}
        {/* DESKTOP TABLE */}
        {/* ============================= */}
        <div className="hidden md:block rounded-lg border border-neutral-800 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Order #</th>
                <th className="px-4 py-3 text-left text-sm">Type</th>
                <th className="px-4 py-3 text-left text-sm">Status</th>
                <th className="px-4 py-3 text-left text-sm">Amount</th>
                <th className="px-4 py-3 text-left text-sm">Currency</th>
                <th className="px-4 py-3 text-left text-sm">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800 bg-neutral-950">
              {data.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">{o.order_no}</td>
                  <td className="px-4 py-3">{o.listing_type_snapshot ?? '—'}</td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3">{o.amount}</td>
                  <td className="px-4 py-3">{o.currency}</td>
                  <td className="px-4 py-3">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {!data.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-neutral-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ============================= */}
        {/* MOBILE CARD VIEW */}
        {/* ============================= */}
        <div className="md:hidden space-y-4">
          {data.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2"
            >
              <div className="text-sm text-neutral-400">
                Order #{o.order_no}
              </div>

              <div className="text-sm">
                <span className="text-neutral-400">Type:</span>{' '}
                {o.listing_type_snapshot ?? '—'}
              </div>

              <div className="text-sm">
                <span className="text-neutral-400">Status:</span> {o.status}
              </div>

              <div className="text-sm">
                <span className="text-neutral-400">Amount:</span>{' '}
                {o.amount} {o.currency}
              </div>

              <div className="text-xs text-neutral-500 pt-1">
                {new Date(o.created_at).toLocaleString()}
              </div>
            </div>
          ))}

          {!data.length && (
            <div className="text-center text-neutral-400 py-6">
              No orders found
            </div>
          )}
        </div>

        {/* ============================= */}
        {/* PAGINATION */}
        {/* ============================= */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <button
            disabled={(meta.current_page ?? 1) <= 1}
            onClick={() =>
              refresh(Math.max((meta.current_page ?? 1) - 1, 1))
            }
            className="rounded border border-neutral-800 px-4 py-2 disabled:opacity-50 w-full md:w-auto"
          >
            Prev
          </button>

          <div className="text-center">
            Page {meta.current_page ?? 1} of {meta.last_page ?? 1}
          </div>

          <button
            disabled={(meta.current_page ?? 1) >= (meta.last_page ?? 1)}
            onClick={() => refresh((meta.current_page ?? 1) + 1)}
            className="rounded border border-neutral-800 px-4 py-2 disabled:opacity-50 w-full md:w-auto"
          >
            Next
          </button>
        </div>

      </div>
    </MerchantLayout>
  );
}
