import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Listings({ initial }) {
  const [data, setData] = useState(initial?.data ?? []);
  const [meta, setMeta] = useState(() => {
    const p = initial ?? {};
    return p.meta ?? { current_page: p.current_page ?? 1, last_page: p.last_page ?? 1, links: p.links ?? [] };
  });
  const [q, setQ] = useState('');

  async function refresh(page = 1) {
    const res = await axios.get('/admin/listings', {
      params: { page, per_page: 20, q },
      headers: { Accept: 'application/json' },
    });
    const payload = res.data;
    setData(payload.data ?? []);
    setMeta(payload.meta ?? { current_page: payload.current_page ?? 1, last_page: payload.last_page ?? 1, links: payload.links ?? [] });
  }

  useEffect(() => {
    if (!initial?.data?.length) refresh(meta.current_page ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout title="Admin · Listings" header={<h2 className="text-xl font-semibold">Admin · Listings</h2>}>
      <Head title="Admin · Listings" />
      <div className="mb-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title..." className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2" />
        <button onClick={() => refresh(1)} className="rounded bg-blue-600 px-3 py-2 text-white">Filter</button>
      </div>
      <div className="overflow-hidden rounded-lg border border-neutral-800">
        <table className="min-w-full divide-y divide-neutral-800">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Currency</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Featured</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 bg-neutral-950">
            {data.map(l => (
              <tr key={l.id}>
                <td className="px-4 py-2">{l.id}</td>
                <td className="px-4 py-2">
                  <a href={`/admin/listings/${l.id}`} className="hover:underline">{l.title}</a>
                </td>
                <td className="px-4 py-2">{l.price}</td>
                <td className="px-4 py-2">{l.currency ?? '—'}</td>
                <td className="px-4 py-2">{l.is_featured ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td className="px-4 py-6 text-center text-neutral-400" colSpan={6}>No listings</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-2">
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
    </AdminLayout>
  );
}
