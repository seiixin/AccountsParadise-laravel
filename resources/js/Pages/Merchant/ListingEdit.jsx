import MerchantLayout from '@/Layouts/MerchantLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function ListingEdit({ listing, images: initialImages }) {
  const [images, setImages] = useState(initialImages ?? []);
  const [uploading, setUploading] = useState(false);

  async function uploadImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files.slice(0, Math.max(0, 10 - images.length))) {
        const fd = new FormData();
        fd.append('image', f);
        const res = await axios.post(`/merchant/listings/${listing.id}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
        });
        setImages((prev) => [...prev, res.data]);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function removeImage(id) {
    await axios.delete(`/merchant/listings/${listing.id}/images/${id}`, { headers: { Accept: 'application/json' } });
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  async function makeCover(id) {
    const res = await axios.put(`/merchant/listings/${listing.id}/cover/${id}`, {}, { headers: { Accept: 'application/json' } });
    listing.cover_image_path = res.data.cover_image_path;
  }

  return (
    <MerchantLayout title="Edit Listing" header={<h2 className="text-xl font-semibold">Edit Listing</h2>}>
      <Head title={`Edit · ${listing.title}`} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-white">
          <div className="text-sm text-white">Cover Image</div>
          <div className="landscape-box bg-neutral-800 mt-2">
            {listing.cover_image_path ? <img src={`/storage/${listing.cover_image_path}`} alt={listing.title} /> : null}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-white">
          <div className="text-sm text-white">Gallery Images ({images.length}/10)</div>
          <div className="mt-2">
            <input type="file" multiple accept="image/*" onChange={uploadImages} disabled={uploading || images.length >= 10} />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="rounded border border-neutral-800 bg-neutral-900 p-2">
                <div className="landscape-box bg-neutral-800">
                  <img src={`/storage/${img.path}`} alt="" />
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => makeCover(img.id)} className="rounded bg-white px-3 py-1 text-black">Set Cover</button>
                  <button onClick={() => removeImage(img.id)} className="rounded border border-neutral-700 px-3 py-1">Delete</button>
                </div>
              </div>
            ))}
            {!images.length && <div className="text-white">No images</div>}
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
