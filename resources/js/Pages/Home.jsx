import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Home() {
  const { auth } = usePage().props;
  const user = auth?.user;
  const role = user?.role;

  const ctaHref = user
    ? role === 'buyer'
      ? '/buyer/dashboard'
      : role === 'merchant'
      ? '/merchant/dashboard'
      : role === 'admin'
      ? '/admin/dashboard'
      : role === 'midman'
      ? '/midman/dashboard'
      : '/dashboard'
    : route('login');

  return (
    <PublicLayout fullWidth>
      <Head title="Home · AccountsParadise" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden">
        <img
          src="/HomeBanner-mobile.png"
          alt="Gaming Marketplace"
          className="w-full h-[60vh] object-cover sm:hidden" // Mobile banner
        />
        <img
          src="/HomeBanner-mobile.png"
          alt="Gaming Marketplace"
          className="w-full h-[60vh] object-cover hidden sm:block" // Desktop banner
        />

        {/* LEFT-ALIGNED HERO CONTENT */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full pl-6 sm:pl-10 lg:pl-20 pr-6 sm:pr-10 lg:pr-20 text-white max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Level Up Your Game
            </h1>

            <p className="mt-2 text-lg sm:text-xl text-gray-200">
              Trusted Philippine Gaming Marketplace for buying, selling,
              boosting, and top-ups.
            </p>

            <Link
              href={ctaHref}
              className="inline-block mt-4 px-8 py-3 rounded-full bg-white text-black font-semibold 
              hover:bg-amber-500 transition duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ================= MODEL SECTION ================= */}
      <section className="bg-neutral-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 grid md:grid-cols-2 gap-8 items-center md:justify-items-center">
          <img
            src="/AccountsParadiseModel.png"
            alt="AccountsParadise Model"
            className="w-full max-w-xl mx-auto rounded"
          />
          <div className="md:pr-8">
            <h2 className="text-2xl sm:text-4xl font-bold">
              Experience a user friendly and secure game shopping
            </h2>
            <p className="mt-2 text-gray-400 text-base sm:text-lg">
              Designed for smooth buying and selling, with safety-first features and a clean interface.
            </p>
          </div>
        </div>
      </section>

      {/* ================= STEPS SECTION ================= */}
      <section className="bg-neutral-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-4xl font-bold">
              introduction on steps and systematic process
            </h2>
            <p className="mt-2 text-gray-400 text-base sm:text-lg">
              A clear overview of how transactions work, from browsing to secure checkout.
            </p>
          </div>
          <StepsCarousel />
        </div>
      </section>

      {/* ================= STORE SECTION ================= */}
      <section className="bg-neutral-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 grid md:grid-cols-2 gap-8 items-center md:justify-items-center">
          <img
            src="/AccountsStore.png"
            alt="Game Accounts"
            className="w-full max-w-md mx-auto"
          />

          <div className="md:pr-8">
            <h2 className="text-2xl sm:text-4xl font-bold">
              No More Back to Zero
            </h2>

            <p className="mt-2 text-gray-400 text-base sm:text-lg">
              Start strong with high-quality game accounts. Skip the grind and
              dominate from day one.
            </p>

            <Link
              href="/store"
              className="inline-block mt-4 px-8 py-3 rounded-full bg-white text-black font-semibold 
              hover:bg-amber-500 transition duration-300"
            >
              Visit Store
            </Link>
          </div>
        </div>
      </section>

      {/* ================= BOOSTING SECTION ================= */}
      <section className="bg-blue py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 grid md:grid-cols-2 gap-8 items-center md:justify-items-center">
          <div className="w-full max-w-md md:pl-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              Stuck at Your Rank?
            </h2>

            <p className="mt-2 text-white/80 text-base sm:text-lg">
              Get boosted by experienced and professional players.
            </p>

            <Link
              href="/store?type=boosting#listings"
              className="inline-block mt-4 px-8 py-3 rounded-full bg-white text-black font-semibold 
              hover:bg-amber-500 transition duration-300"
            >
              Boost Now
            </Link>
          </div>

          <img
            src="/BoostingService.png"
            alt="Boosting Service"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </section>

      {/* ================= TOP-UP SECTION ================= */}
      <section className="bg-neutral-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 grid md:grid-cols-2 gap-8 items-center md:justify-items-center">
          <img
            src="/top-up.png"
            alt="Top Up Service"
            className="w-full max-w-md mx-auto"
          />

          <div className="w-full max-w-md md:pr-8">
            <h2 className="text-2xl sm:text-4xl font-bold">
              Need Diamonds or Credits Fast?
            </h2>

            <p className="mt-2 text-gray-400 text-base sm:text-lg">
              Instant and secure top-up services trusted nationwide.
            </p>

            <Link
              href="/store?type=topup#listings"
              className="inline-block mt-4 px-8 py-3 rounded-full bg-white text-black font-semibold 
              hover:bg-amber-500 transition duration-300"
            >
              Top-Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-3">
          <h3 className="text-white text-lg font-semibold">Contact Us</h3>

          <p>
            Email:{' '}
            <a
              href="mailto:blackaxis2026@gmail.com"
              className="text-amber-400 hover:underline"
            >
              blackaxis2026@gmail.com
            </a>
          </p>

          <p>
            Phone:{' '}
            <span className="text-amber-400">09928041384</span>
          </p>
        </div>
      </footer>
    </PublicLayout>
  );
}

function StepsCarousel() {
  const items = [
    { label: 'Step 0', text: 'Verify the product details with the seller.' },
    { label: 'Step 1', text: 'Purchase the desired product.' },
    { label: 'Step 2', text: 'Confirm the payment through Midman.' },
    { label: 'Step 3', text: 'Midman will acquire the account/item from the seller.' },
    { label: 'Step 4', text: 'Midman will thoroughly test the item to ensure the accuracy and integrity of the transaction.' },
    { label: 'Step 5', text: 'The buyer will receive the verified item/product from Midman.' },
    { label: 'Step 6', text: 'The seller may then request a payout.' },
  ];
  const [idx, setIdx] = useState(0);
  const [enter, setEnter] = useState(true);
  const [dir, setDir] = useState(1);
  useEffect(() => {
    const t = setInterval(() => goto((idx + 1) % items.length, 1), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);
  useEffect(() => {
    setEnter(false);
    const k = setTimeout(() => setEnter(true), 20);
    return () => clearTimeout(k);
  }, [idx, dir]);
  function goto(newIdx, d) {
    setDir(d);
    setIdx(newIdx);
  }
  const prev = () => goto((idx - 1 + items.length) % items.length, -1);
  const next = () => goto((idx + 1) % items.length, 1);
  const it = items[idx];
  return (
    <div className="relative">
      <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 md:p-8 shadow-lg text-center transform transition-all duration-500 ${enter ? 'opacity-100 translate-x-0' : (dir === 1 ? 'opacity-0 translate-x-6' : 'opacity-0 -translate-x-6')}`}>
        <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400">
          <StepIcon index={idx} size={28} />
        </div>
        <div className="mt-3 text-sm text-amber-400 font-semibold">{it.label}</div>
        <div className="mt-2 text-xl sm:text-2xl font-semibold">{it.text}</div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          className="rounded-full border border-neutral-700 px-3 py-2 hover:bg-neutral-800"
          aria-label="Previous"
          onClick={prev}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goto(i, i > idx ? 1 : -1)}
            className={`h-2 w-2 rounded-full ${i === idx ? 'bg-amber-400' : 'bg-neutral-700'}`}
            aria-label={`Go to step ${i}`}
          />
        ))}
        <button
          className="rounded-full border border-neutral-700 px-3 py-2 hover:bg-neutral-800"
          aria-label="Next"
          onClick={next}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StepIcon({ index, size = 20 }) {
  if (index === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 5h3l2 10h9l2-7H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="19" r="1.5" fill="currentColor" />
        <circle cx="17" cy="19" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M8 12l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 10c2 0 3-2 5-2l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 10c-2 0-3-2-5-2l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 4) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 3l2 2-7 7-2-2 7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M16 13v3h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 5) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="7" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 12l3 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 7c2-2 8-2 10 0-1 2-1 4-5 4s-4-2-5-4z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11c3 0 6 2 6 5-2 3-10 3-12 0 0-3 3-5 6-5z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
