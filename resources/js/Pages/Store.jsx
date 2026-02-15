import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import HeroSlider from '@/Components/Guest/HeroSlider';
import { useEffect, useState } from 'react';
import axios from 'axios';

function ProductCard({ id, title, price, currency, categoryName, badges = [], coverImagePath }) {
  return (
    <div className="ap-card p-3 md:p-4 cursor-pointer" onClick={() => router.visit(route('listings.show', id))}>
      <div className="landscape-box mb-2 md:mb-3 bg-neutral-800">
        {coverImagePath ? (
          <img src={`/storage/${coverImagePath}`} alt={title} />
        ) : null}
      </div>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{categoryName ?? '—'}</div>
      <Link href={route('listings.show', id)} className="mt-1 text-base font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>{title}</Link>
      <div className="mt-2 flex flex-wrap gap-2">
        {badges.map((b) => (
          <span key={b} className="ap-tag px-2 py-1 text-xs">{b}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">{currency} {price}</div>
        <Link href={`${route('listings.show', id)}?buy=1`} className="ap-btn-primary ap-pill px-4 py-2" onClick={(e) => e.stopPropagation()}>Buy Now</Link>
      </div>
    </div>
  );
}

function StoreGrid({ items, categories }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-3">
      {items.map((i) => {
        const categoryName = (categories ?? []).find(c => c.id === i.category_id)?.name;
        return (
          <ProductCard
            key={i.id ?? i.title}
            id={i.id}
            title={i.title}
            price={i.price}
            currency={i.currency}
            categoryName={categoryName}
            coverImagePath={i.cover_image_path}
          />
        );
      })}
      {!items.length && (
        <div className="col-span-1 md:col-span-3 rounded border border-neutral-800 bg-neutral-950 p-6 text-center text-neutral-400">
          No listings found
        </div>
      )}
    </div>
  );
}

export default function Store({ initial, categories, selectedType = '' }) {
  const [data, setData] = useState(initial?.data ?? []);
  const [heroItems, setHeroItems] = useState(initial?.data ?? []);
  const [meta, setMeta] = useState(() => {
    const payload = initial ?? {};
    return payload.meta ?? {
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
      links: payload.links ?? [],
    };
  });
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState(selectedType || '');

  useEffect(() => {
    try {
      if ((window.location.hash || '') === '#listings') {
        setTimeout(() => {
          const el = document.getElementById('listings');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      }
    } catch {}
  }, []);

  async function refresh(page = 1) {
    const res = await axios.get('/store', {
      params: { page, per_page: 12, q, category_id: categoryId || undefined, type: type || undefined },
      headers: { Accept: 'application/json' },
    });
    const payload = res.data.listings ?? res.data;
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

  useEffect(() => {
    if (initial?.data?.length) {
      setHeroItems(initial.data);
    } else {
      axios.get('/store', { params: { per_page: 12 }, headers: { Accept: 'application/json' } })
        .then(res => {
          const payload = res.data.listings ?? res.data;
          setHeroItems(payload.data ?? []);
        });
    }
  }, []);

  useEffect(() => {
    refresh(1);
  }, [type, categoryId]);

  useEffect(() => {
    const h = setTimeout(() => {
      refresh(1);
    }, 300);
    return () => clearTimeout(h);
  }, [q]);

  return (
    <PublicLayout fullWidth>
      <Head title="Store · AccountsParadise" />
      <HeroSlider items={heroItems} />
      <div className="mt-6">
        <div className="ap-card p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-300">Search</div>
            <div className="text-xs text-neutral-400">Search and filter by type and game.</div>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Search</div>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, seller, game, or ID..." className="ap-input ap-pill w-full h-10" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Type</div>
              <select value={type} onChange={(e) => setType(e.target.value)} className="ap-input ap-pill w-full h-10">
                <option value="">All types</option>
                <option value="item">Item</option>
                <option value="account">Account</option>
                <option value="boosting">Boosting Service</option>
                <option value="topup">Top-Up</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Game</div>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="ap-input ap-pill w-full h-10">
                <option value="">all games</option>
                {(categories ?? []).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div id="listings">
          <StoreGrid items={data} categories={categories} />
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
      </div>
    </PublicLayout>
  );
}
