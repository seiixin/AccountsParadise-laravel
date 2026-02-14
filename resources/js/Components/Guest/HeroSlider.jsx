import { useEffect, useMemo, useState } from 'react';

export default function HeroSlider({ items = [] }) {
  const slides = useMemo(() => {
    const f = (items || []).filter(i => i?.is_featured);
    const base = f.length ? f : (items || []);
    return base.slice(0, 5);
  }, [items]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  return (
    <div className="relative ap-panel ap-hero-full overflow-hidden rounded-2xl">
      {current?.cover_image_path ? (
        <img
          src={`/storage/${current.cover_image_path}`}
          alt={current.title}
          className="ap-hero-image"
        />
      ) : null}
      <div className="ap-hero-dark"></div>
      <div className="relative z-10 p-5 md:p-8">
        <div className="mb-3 text-xs uppercase tracking-wide text-neutral-300">Featured</div>
        {current ? (
          <div>
            <div className="ap-hero-title text-white">{current.title}</div>
            <div className="mt-2 ap-hero-sub text-neutral-200">Seller: <span className="font-semibold">Nebula Merchant</span> · Trust: <span className="font-semibold">High</span> · Game: <span className="font-semibold">valorant</span></div>
            <div className="mt-3 ap-hero-actions">
              <span className="ap-tag px-3 py-1 text-xs">Verified Merchant</span>
              <span className="ap-tag px-3 py-1 text-xs">Instant-ready</span>
            </div>
            <div className="mt-6 ap-hero-actions">
              <a href={`/listings/${current.id}`} className="ap-btn-primary ap-pill px-5 py-2">Buy Now</a>
              <a href="/games" className="ap-pill border border-neutral-700 px-5 py-2 text-white">Browse Games</a>
            </div>
          </div>
        ) : (
          <div className="ap-card p-4 text-center text-neutral-400">No featured listings</div>
        )}
      </div>

      {slides.length > 0 && (
        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex items-center gap-3 z-20">
          <button
            onClick={() => setIndex(i => (i - 1 + slides.length) % slides.length)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-600 bg-[#1b1f27] text-neutral-200"
            aria-label="Previous"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-neutral-600'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIndex(i => (i + 1) % slides.length)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-600 bg-[#1b1f27] text-neutral-200"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
      <div className="ap-fade-bottom"></div>
    </div>
  );
}
