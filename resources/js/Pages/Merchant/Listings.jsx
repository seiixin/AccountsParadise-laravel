import MerchantLayout from '@/Layouts/MerchantLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';

function csrf() {
  const m = document.querySelector('meta[name="csrf-token"]');
  if (m) return m.getAttribute('content') || '';
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function secureHeaders(extra = {}) {
  const token = csrf();
  return {
    Accept: 'application/json',
    'X-CSRF-TOKEN': token,
    'X-XSRF-TOKEN': token,
    'X-Requested-With': 'XMLHttpRequest',
    ...extra,
  };
}

function AddModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('account');
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      axios.get('/merchant/categories', { headers: { Accept: 'application/json' }, withCredentials: true })
        .then(res => setCategories(res.data ?? []))
        .catch(() => setCategories([]));
    }
  }, [open]);

  async function save() {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('currency', currency);
      fd.append('category_id', categoryId);
      fd.append('price', price);
      fd.append('description', description);
      fd.append('type', type);
      if (coverImage) fd.append('cover_image', coverImage);
      for (const f of images.slice(0, 10)) {
        fd.append('images[]', f);
      }
      const res = await axios.post('/merchant/listings/create', fd, {
        headers: secureHeaders({ 'Content-Type': 'multipart/form-data' }),
        withCredentials: true,
      });
      onCreated(res.data);
      onClose();
      setTitle(''); setCurrency('PHP'); setCategoryId(''); setPrice(''); setDescription(''); setType('account'); setCoverImage(null); setImages([]);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-5xl rounded glass-soft p-6 max-h-[80vh] overflow-y-auto text-white">
        <div className="text-sm text-white">Merchant</div>
        <div className="text-xl font-semibold">Add New Item</div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Valorant Premium Skin Bundle" className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 sm:col-span-2" />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full">
            <option>PHP</option>
            <option>USD</option>
          </select>
          <div>
            <div className="text-xs text-white mb-1">Type</div>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full">
              <option value="account">Account</option>
              <option value="item">Item</option>
              <option value="boosting">Boosting Service</option>
              <option value="topup">Top-Up</option>
            </select>
          </div>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full">
            <option value="">Select category</option>
            {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₱0.00" className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Delivery method, requirements, timeframe..." className="sm:col-span-2 rounded border border-neutral-800 bg-neutral-950 px-3 py-2" />
          <div className="sm:col-span-2">
            <div className="text-sm text-white mb-1">Cover Image</div>
            <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
          </div>
          <div className="sm:col-span-2">
            <div className="text-sm text-white mb-1">Gallery Images (up to 10)</div>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} />
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button onClick={onClose} className="rounded border border-neutral-700 px-4 py-2 w-full sm:w-auto text-white">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded bg-white px-4 py-2 text-black w-full sm:w-auto">Save</button>
        </div>
      </div>
    </div>
  , document.body);
}

function EditModal({ open, onClose, listingId, onUpdated }) {
  const [listing, setListing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('account');
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && listingId) {
      axios.get(`/merchant/listings/${listingId}/edit`, { headers: { Accept: 'application/json' }, withCredentials: true })
        .then(res => {
          const l = res.data.listing ?? res.data;
          setListing(l);
          setTitle(l.title); setCurrency(l.currency ?? 'PHP'); setCategoryId(l.category_id ?? ''); setPrice(l.price ?? ''); setDescription(l.description ?? '');
          setType(l.type ?? 'account');
          setGallery(res.data.images ?? []);
        })
        .catch(async () => {
          try {
            const res2 = await axios.get(`/merchant/listings/${listingId}`, { headers: { Accept: 'application/json' }, withCredentials: true });
            const l2 = res2.data;
            setListing(l2);
            setTitle(l2.title); setCurrency(l2.currency ?? 'PHP'); setCategoryId(l2.category_id ?? ''); setPrice(l2.price ?? ''); setDescription(l2.description ?? '');
            setType(l2.type ?? 'account');
            setGallery([]);
          } catch {}
        });
      axios.get('/merchant/categories', { headers: { Accept: 'application/json' }, withCredentials: true })
        .then(res => setCategories(res.data ?? []));
    }
  }, [open, listingId]);

  async function update() {
    setSaving(true);
    try {
      const updates = {};
      if (title && title.trim().length) updates.title = title.trim();
      if (currency && currency.trim().length) updates.currency = currency.trim();
      if (categoryId) updates.category_id = categoryId;
      if (price !== '' && price != null) updates.price = price;
      if (description != null) updates.description = description;
      if (type) updates.type = type;
      if (coverImage) {
        const coverFd = new FormData();
        coverFd.append('image', coverImage);
        await axios.post(`/merchant/listings/${listingId}/cover/replace`, coverFd, {
          headers: secureHeaders({ 'Content-Type': 'multipart/form-data' }),
          withCredentials: true,
        }).then(res => setListing(prev => ({ ...prev, cover_image_path: res.data.cover_image_path })));
      }
      if (images.length) {
        const remain = Math.max(0, 10 - gallery.length);
        const batch = images.slice(0, remain);
        for (const f of batch) {
          const fd = new FormData();
          fd.append('image', f);
          await axios.post(`/merchant/listings/${listingId}/images`, fd, {
            headers: secureHeaders({ 'Content-Type': 'multipart/form-data' }),
            withCredentials: true,
          });
        }
      }
      const res = await axios.put(`/merchant/listings/${listingId}/update`, updates, {
        headers: secureHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
      });
      onUpdated(res.data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(imageId) {
    await axios.delete(`/merchant/listings/${listingId}/images/${imageId}`, { headers: secureHeaders(), withCredentials: true });
    setGallery(gallery.filter(i => i.id !== imageId));
  }

  async function setCover(imageId) {
    const res = await axios.put(`/merchant/listings/${listingId}/cover/${imageId}`, {}, { headers: secureHeaders(), withCredentials: true });
    setListing(prev => ({ ...prev, cover_image_path: res.data.cover_image_path }));
  }

  async function replace(imageId, file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fd.append('_method', 'PUT');
    const res = await axios.post(`/merchant/listings/${listingId}/images/${imageId}/replace`, fd, {
      headers: secureHeaders({ 'Content-Type': 'multipart/form-data' }),
      withCredentials: true,
    });
    setGallery(gallery.map(i => (i.id === imageId ? res.data : i)));
  }

  async function replaceCover(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    const res = await axios.post(`/merchant/listings/${listingId}/cover/replace`, fd, {
      headers: secureHeaders({ 'Content-Type': 'multipart/form-data' }),
      withCredentials: true,
    });
    setListing(prev => ({ ...prev, cover_image_path: res.data.cover_image_path }));
  }

  async function deleteCover() {
    const res = await axios.delete(`/merchant/listings/${listingId}/cover`, { headers: secureHeaders(), withCredentials: true });
    setListing(prev => ({ ...prev, cover_image_path: res.data.cover_image_path }));
  }

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-6xl rounded glass-soft p-6 max-h-[80vh] overflow-y-auto text-white">
        <div className="text-sm text-white">Merchant</div>
        <div className="text-xl font-semibold">Edit Item</div>
        {(
          <div className="mt-4 grid grid-cols-2 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 col-span-2" placeholder="Title" />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2">
              <option>PHP</option>
              <option>USD</option>
            </select>
            <div>
              <div className="text-xs text-white mb-1">Type</div>
              <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full">
                <option value="account">Account</option>
                <option value="item">Item</option>
                <option value="boosting">Boosting Service</option>
                <option value="topup">Top-Up</option>
              </select>
            </div>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2">
              <option value="">Select category</option>
              {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <input value={price} onChange={(e) => setPrice(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2" placeholder="Price" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-2 rounded border border-neutral-800 bg-neutral-950 px-3 py-2" placeholder="Description" />
            <div className="col-span-2">
              <div className="text-sm text-white mb-1">Cover Image</div>
              <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              <div className="landscape-box bg-neutral-800 mt-2">
                {listing?.cover_image_path ? <img src={`/storage/${listing.cover_image_path}`} alt={listing?.title ?? ''} /> : null}
              </div>
              {listing?.cover_image_path && (
                <div className="mt-2 flex gap-2">
                  <label className="rounded border border-neutral-700 px-3 py-1 cursor-pointer">
                    Replace Cover
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => replaceCover(e.target.files?.[0] ?? null)} />
                  </label>
                  <button onClick={deleteCover} className="rounded border border-neutral-700 px-3 py-1">Delete Cover</button>
                </div>
              )}
            </div>
            <div className="col-span-2">
              <div className="text-sm text-white mb-1">Gallery Images (up to 10)</div>
              <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} />
              {!!images.length && (
                <div className="mt-3">
                  <div className="text-sm text-white">Pending Uploads ({images.length})</div>
                  <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {images.map((f, idx) => (
                      <div key={idx} className="rounded border border-neutral-800 bg-neutral-900 p-2">
                        <div className="landscape-box bg-neutral-800">
                          <img src={URL.createObjectURL(f)} alt="" />
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => setImages(images.filter((_, i) => i !== idx))} className="rounded border border-neutral-700 px-3 py-1">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map(img => (
                  <div key={img.id} className="rounded border border-neutral-800 bg-neutral-900 p-2">
                    <div className="landscape-box bg-neutral-800">
                      <img src={`/storage/${img.path}`} alt="" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => setCover(img.id)} className="rounded bg-white px-3 py-1 text-black">Set Cover</button>
                      <button onClick={() => deleteImage(img.id)} className="rounded border border-neutral-700 px-3 py-1">Delete</button>
                      <label className="rounded border border-neutral-700 px-3 py-1 cursor-pointer">
                        Replace
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => replace(img.id, e.target.files?.[0])} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded border border-neutral-700 px-4 py-2 text-white">Cancel</button>
          <button onClick={update} disabled={saving} className="rounded bg-white px-4 py-2 text-black">Update</button>
        </div>
      </div>
    </div>
  , document.body);
}

export default function Listings({ initial }) {
  const [data, setData] = useState(initial?.data ?? []);
  const [meta, setMeta] = useState(() => {
    const p = initial ?? {};
    return p.meta ?? { current_page: p.current_page ?? 1, last_page: p.last_page ?? 1, links: p.links ?? [] };
  });

  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  async function refresh(page = 1) {
    const res = await axios.get('/merchant/listings', {
      params: { page, per_page: 20, q, type: type || undefined },
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

  async function remove(id) {
    if (!confirm("Delete this listing?")) return;
    await axios.delete(`/merchant/listings/${id}/delete`, {
      headers: secureHeaders(),
      withCredentials: true,
    });
    refresh(meta.current_page ?? 1);
  }

  useEffect(() => {
    if (!initial?.data?.length) refresh(meta.current_page ?? 1);
  }, []);

  return (
    <MerchantLayout
      title="Merchant · Listings"
      header={<h2 className="text-xl font-semibold">Merchant · Listings</h2>}
    >
      <Head title="Merchant · Listings" />

      {/* FILTER SECTION */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title..."
          className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full"
        >
          <option value="">All types</option>
          <option value="account">Account</option>
          <option value="item">Item</option>
          <option value="boosting">Boosting Service</option>
          <option value="topup">Top-Up</option>
        </select>

        <button
          onClick={() => refresh(1)}
          className="rounded bg-blue-600 px-3 py-2 text-white w-full"
        >
          Filter
        </button>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded glass-soft px-3 py-2 w-full"
        >
          Add Listing
        </button>
      </div>

      {/* ============================= */}
      {/* DESKTOP TABLE (hidden on mobile) */}
      {/* ============================= */}
      <div className="hidden md:block rounded-lg border border-neutral-800 glass-soft overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-800">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm">ID</th>
              <th className="px-4 py-3 text-left text-sm">Cover</th>
              <th className="px-4 py-3 text-left text-sm">Title</th>
              <th className="px-4 py-3 text-left text-sm">Type</th>
              <th className="px-4 py-3 text-left text-sm">Price</th>
              <th className="px-4 py-3 text-left text-sm">Currency</th>
              <th className="px-4 py-3 text-left text-sm">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-800 bg-neutral-950">
            {data.map(l => (
              <tr key={l.id}>
                <td className="px-4 py-3">{l.id}</td>

                <td className="px-4 py-3">
                  <div className="w-32 aspect-video bg-neutral-800 rounded overflow-hidden">
                    {l.cover_image_path && (
                      <img
                        src={`/storage/${l.cover_image_path}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">{l.title}</td>
                <td className="px-4 py-3">{l.type ?? '—'}</td>
                <td className="px-4 py-3">{l.price}</td>
                <td className="px-4 py-3">{l.currency ?? '—'}</td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedId(l.id);
                        setEditOpen(true);
                      }}
                      className="rounded border border-neutral-700 px-3 py-1"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => remove(l.id)}
                      className="rounded border border-red-700 text-red-500 px-3 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-neutral-400">
                  No listings
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
        {data.map(l => (
          <div
            key={l.id}
            className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3"
          >
            <div className="w-full aspect-video bg-neutral-800 rounded overflow-hidden">
              {l.cover_image_path && (
                <img
                  src={`/storage/${l.cover_image_path}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="text-sm text-neutral-400">ID: {l.id}</div>
            <div className="font-semibold">{l.title}</div>
            <div className="text-sm">Type: {l.type ?? '—'}</div>
            <div className="text-sm">
              {l.price} {l.currency}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedId(l.id);
                  setEditOpen(true);
                }}
                className="flex-1 rounded border border-neutral-700 py-2"
              >
                Edit
              </button>

              <button
                onClick={() => remove(l.id)}
                className="flex-1 rounded border border-red-700 text-red-500 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!data.length && (
          <div className="text-center text-neutral-400 py-6">
            No listings
          </div>
        )}
      </div>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => refresh(1)} />
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} listingId={selectedId} onUpdated={() => refresh(meta.current_page ?? 1)} />
    </MerchantLayout>
  );
}
