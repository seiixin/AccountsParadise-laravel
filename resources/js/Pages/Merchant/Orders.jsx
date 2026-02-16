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

  const [all, setAll] = useState(false);

  async function refresh(page = 1) {
    const res = await axios.get('/merchant/orders', {
      params: {
        page,
        per_page: 20,
        all: all ? 1 : undefined,
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

        {/* FILTER */}
        <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={all}
              onChange={(e) => setAll(e.target.checked)}
            />
            Show all orders
          </label>

          <button
            onClick={() => refresh(1)}
            className="rounded border border-neutral-700 px-4 py-2 w-full md:w-auto"
          >
            Apply
          </button>
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
