import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrdersTable() {
  const [data, setData] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    axios
      .get('/buyer/orders', {
        headers: { Accept: 'application/json' },
        withCredentials: true,
        params: { format: 'json' },
      })
      .then((res) => setData(res.data?.data ?? []))
      .catch(() => setData([]));
  }, []);

  return (
    <div className="w-full">

      {/* ===== MOBILE VIEW (Cards) ===== */}
      <div className="md:hidden space-y-3">
        {data.length > 0 ? (
          data.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border border-neutral-800 p-4 bg-neutral-900/40"
            >
              <div className="flex justify-between items-start">
                <div className="text-sm text-neutral-400">
                  Order #{o.order_no}
                </div>
                <div className="text-xs px-2 py-1 rounded bg-neutral-800">
                  {o.status}
                </div>
              </div>

              <div className="mt-2 font-medium">
                {o.listing_title_snapshot ?? '—'}
              </div>

              <div className="mt-1 text-sm text-neutral-400">
                {o.currency} {o.amount}
              </div>

              <button
                onClick={() => setOpenId(o.id)}
                className="mt-3 w-full ap-pill border border-neutral-700 px-3 py-2 text-sm"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-neutral-400 py-6">
            No orders found
          </div>
        )}
      </div>

      {/* ===== DESKTOP VIEW (Table) ===== */}
      <div className="hidden md:block overflow-x-auto rounded border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left">Order #</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o) => (
              <tr key={o.id} className="border-t border-neutral-800">
                <td className="px-4 py-3">{o.order_no}</td>
                <td className="px-4 py-3">
                  {o.listing_title_snapshot ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {o.currency} {o.amount}
                </td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setOpenId(o.id)}
                    className="ap-pill border border-neutral-700 px-3 py-1"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-neutral-400"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openId && (
        <OrderDetailsModal
          id={openId}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({ id, onClose }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios
      .get(`/buyer/orders/${id}`, {
        headers: { Accept: 'application/json' },
      })
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null));
  }, [id]);

  if (!id) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg md:max-w-2xl rounded-lg bg-neutral-900 p-6 overflow-y-auto max-h-[90vh]">
        <div className="text-lg font-semibold">
          Order Details
        </div>

        {order ? (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-neutral-400">
              Order #{order.order_no}
            </div>

            <div className="font-medium">
              {order.listing_title_snapshot ?? '—'}
            </div>

            <div className="text-neutral-400">
              {order.currency} {order.amount}
            </div>

            <div className="text-sm px-2 py-1 inline-block rounded bg-neutral-800">
              {order.status}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-neutral-400">
            Loading…
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="ap-pill border border-neutral-700 px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
