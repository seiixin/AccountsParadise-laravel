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
      params: { page, per_page: 20, all: all ? 1 : undefined, format: 'json' },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MerchantLayout
      title="Merchant · Orders"
      header={<h2 className="text-xl font-semibold">Merchant · Orders</h2>}
    >
      <Head title="Merchant · Orders" />
      <div className="mx-auto max-w-5xl p-4">
        <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
            Show all orders
          </label>
          <button onClick={() => refresh(1)} className="rounded border border-neutral-700 px-3 py-2 w-full sm:w-auto">
            Apply
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Order #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Currency</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 bg-neutral-950">
              {data.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-2">{o.order_no}</td>
                  <td className="px-4 py-2">{o.listing_type_snapshot ?? '—'}</td>
                  <td className="px-4 py-2">{o.status}</td>
                  <td className="px-4 py-2">{o.amount}</td>
                  <td className="px-4 py-2">{o.currency}</td>
                  <td className="px-4 py-2">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-neutral-400" colSpan={6}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            disabled={(meta.current_page ?? 1) <= 1}
            onClick={() => refresh(Math.max((meta.current_page ?? 1) - 1, 1))}
            className="rounded border border-neutral-800 px-3 py-2 disabled:opacity-50 w-full sm:w-auto"
          >
            Prev
          </button>
          <div className="text-center sm:text-left">
            Page {meta.current_page ?? 1} of {meta.last_page ?? 1}
          </div>
          <button
            disabled={(meta.current_page ?? 1) >= (meta.last_page ?? 1)}
            onClick={() => refresh((meta.current_page ?? 1) + 1)}
            className="rounded border border-neutral-800 px-3 py-2 disabled:opacity-50 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      </div>
    </MerchantLayout>
  );
}
