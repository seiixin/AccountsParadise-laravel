import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function AuthenticatedLayout({ header, children, fullWidth = false, hideGlobalInboxButton = false }) {
    const user = usePage().props.auth.user;
    const role = user?.role;
    const dashboardHref = role === 'buyer' ? '/buyer/dashboard'
        : role === 'merchant' ? '/merchant/dashboard'
        : role === 'admin' ? '/admin/dashboard'
        : role === 'midman' ? '/midman/dashboard'
        : '/buyer/dashboard';
    const inboxHref = role === 'buyer' ? '/buyer/inbox'
        : role === 'merchant' ? '/merchant/inbox'
        : role === 'admin' ? '/admin/inbox'
        : role === 'midman' ? '/midman/inbox'
        : '/buyer/inbox';

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userBtnRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const onDocClick = (e) => {
            const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
            const inButton = userBtnRef.current && userBtnRef.current.contains(e.target);
            if (inDropdown || inButton) return;
            setUserOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setUserOpen(false);
        };
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    useEffect(() => {
        if (userOpen && userBtnRef.current) {
            const rect = userBtnRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY + 8;
            const left = rect.right + window.scrollX - 176;
            setDropdownPos({ top, left });
        }
    }, [userOpen]);

    return (
        <div className="min-h-screen bg-gradient-app text-neutral-100">
            <nav className="glass sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <img src="/AccountsParadiseLogo.png" alt="Accounts Paradise" className="block h-9 w-9 rounded-full" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={dashboardHref} active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith(dashboardHref)}>Dashboard</NavLink>
                                <NavLink href="/store" active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/store')}>
                                    Store
                                </NavLink>
                                <NavLink href="/games" active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/games')}>
                                    Games
                                </NavLink>
                                <NavLink href="/contact" active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/contact')}>
                                    Contact
                                </NavLink>
                            </div>
                        </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <button ref={userBtnRef} className="rounded px-3 py-2 text-sm glass-soft text-white" onClick={() => setUserOpen((v) => !v)} aria-expanded={userOpen}>
                                        {user.name}
                                    </button>
                                    {createPortal(
                                        <div
                                            ref={dropdownRef}
                                            className={`${userOpen ? 'block' : 'hidden'} w-44 rounded glass-soft p-2 text-sm`}
                                            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 2147483647 }}
                                        >
                                            <Link href={route('profile.edit')} className="block rounded px-2 py-1 hover:bg-neutral-800 text-white">Profile</Link>
                                            <Link href={route('logout')} method="post" as="button" className="mt-1 block w-full rounded px-2 py-1 text-left hover:bg-neutral-800 text-white">
                                                Logout
                                            </Link>
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            </div>


                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={dashboardHref} active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith(dashboardHref)}>Dashboard</ResponsiveNavLink>
                        <ResponsiveNavLink href="/store" active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/store')}>
                            Store
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/games" active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/games')}>
                            Games
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/contact" active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/contact')}>
                            Contact
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/profile" active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/profile')}>
                            Profile
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={inboxHref} active={(typeof window !== 'undefined' ? window.location.pathname : '').startsWith(inboxHref)}>
                            Inbox
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-white">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-white-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="glass-soft">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className={`${fullWidth ? 'mx-0 max-w-none my-0 p-0 rounded-none' : 'mx-auto max-w-7xl my-6 p-6 rounded-lg'} glass-soft`}>{children}</main>
            {!hideGlobalInboxButton && createPortal(
                <Link
                    href={inboxHref}
                    className="fixed bottom-4 right-4 z-[2147483647] flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white"
                    aria-label="Inbox"
                    title="Inbox"
                >
                    <img src="/message.png" alt="Inbox" className="h-6 w-6" draggable="false" />
                </Link>,
                document.body
            )}
        </div>
    );
}
