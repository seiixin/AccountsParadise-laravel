import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';

function GamesList({ items, categories, selectedCategoryId, onSelectCategory }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory('')}
          className={`ap-tag px-3 py-1 text-sm ${selectedCategoryId ? '' : 'ap-tag-active'}`}
        >
          all
        </button>
        {(categories ?? []).map(c => (
          <button
            key={c.id}
            onClick={() => onSelectCategory(String(c.id))}
            className={`ap-tag px-3 py-1 text-sm ${String(selectedCategoryId) === String(c.id) ? 'ap-tag-active' : ''}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-3">
        {items.map(i => (
          <div key={i.id ?? i.title} className="ap-card p-3 md:p-4 cursor-pointer" onClick={() => router.visit(route('listings.show', i.id))}>
            <div className="landscape-box mb-2 md:mb-3 bg-neutral-800">
              {i.cover_image_path ? <img src={`/storage/${i.cover_image_path}`} alt={i.title} /> : null}
            </div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">
              {(categories ?? []).find(c => c.id === i.category_id)?.name ?? '—'}
            </div>
            <Link href={route('listings.show', i.id)} className="text-base font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>{i.title}</Link>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-lg font-semibold">{i.currency} {i.price}</div>
              <Link href={`${route('listings.show', i.id)}?buy=1`} className="ap-btn-primary ap-pill px-4 py-2" onClick={(e) => e.stopPropagation()}>Buy Now</Link>
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="ap-card p-6 text-center text-neutral-400">No listings found</div>
        )}
      </div>
    </>
  );
}

export default function Games({ categories, initial }) {
  const [data, setData] = useState(initial?.data ?? []);
  const [meta, setMeta] = useState(() => {
    const p = initial ?? {};
    return p.meta ?? { current_page: p.current_page ?? 1, last_page: p.last_page ?? 1, links: p.links ?? [] };
  });
  const [categoryId, setCategoryId] = useState('');
  const [q, setQ] = useState('');

  async function refresh(page = 1) {
    const res = await axios.get('/games', {
      params: { page, per_page: 12, q, category_id: categoryId || undefined },
      headers: { Accept: 'application/json' },
    });
    const payload = res.data.listings ?? res.data;
    setData(payload.data ?? []);
    setMeta(payload.meta ?? { current_page: payload.current_page ?? 1, last_page: payload.last_page ?? 1, links: payload.links ?? [] });
  }

  useEffect(() => {
    if (!initial?.data?.length) refresh(meta.current_page ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (categoryId !== undefined) {
      refresh(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  return (
    <PublicLayout fullWidth>
      <Head title="Games · AccountsParadise" />
      <div className="mb-3 text-neutral-400">Browse offers by game.</div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') refresh(1); }} placeholder="Search title..." className="ap-input px-3 py-2" />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="ap-input px-3 py-2">
          <option value="">all games</option>
          {(categories ?? []).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>
      {/* Auto-applies on change; keep button for optional manual trigger if desired */}
      <GamesList
        items={data}
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={(id) => { setCategoryId(id); refresh(1); }}
      />
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
    </PublicLayout>
  );
}
