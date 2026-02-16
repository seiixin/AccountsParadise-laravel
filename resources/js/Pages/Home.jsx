import { Head, Link, usePage } from '@inertiajs/react';
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
