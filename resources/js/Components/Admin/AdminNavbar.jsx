import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminNavbar() {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false); // To toggle the mobile menu

    return (
        <div className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
                {/* Logo and Admin Label */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/AccountsParadiseLogo.png"
                            alt="AccountsParadise"
                            className="h-9 w-9 md:h-11 md:w-11 rounded"
                        />
                        <span className="text-lg font-semibold">AccountsParadise</span>
                    </Link>
                    <span className="rounded bg-neutral-800 px-2 py-1 text-xs">Admin Console</span>
                </div>

                {/* Desktop Navbar Links */}
                <div className="hidden lg:flex items-center gap-3">
                    <Link href="/store" className="rounded glass-soft px-3 py-2 text-sm">
                        Store
                    </Link>
                    <Link href="/games" className="rounded glass-soft px-3 py-2 text-sm">
                        Games
                    </Link>
                    <Link href="/contact" className="rounded glass-soft px-3 py-2 text-sm">
                        Contact
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded bg-neutral-800 px-3 py-2 text-sm"
                    >
                        Logout
                    </Link>
                </div>

                {/* Mobile Hamburger Menu Button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden text-white focus:outline-none"
                    aria-label="Open Menu"
                >
                    <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden absolute inset-0 bg-neutral-900 bg-opacity-90 z-50">
                    <div className="flex flex-col items-center py-4 space-y-4">
                        <Link
                            href="/store"
                            className="rounded glass-soft px-4 py-2 text-sm text-white"
                            onClick={() => setMobileOpen(false)}
                        >
                            Store
                        </Link>
                        <Link
                            href="/games"
                            className="rounded glass-soft px-4 py-2 text-sm text-white"
                            onClick={() => setMobileOpen(false)}
                        >
                            Games
                        </Link>
                        <Link
                            href="/contact"
                            className="rounded glass-soft px-4 py-2 text-sm text-white"
                            onClick={() => setMobileOpen(false)}
                        >
                            Contact
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded bg-neutral-800 px-4 py-2 text-sm text-white"
                            onClick={() => setMobileOpen(false)}
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
