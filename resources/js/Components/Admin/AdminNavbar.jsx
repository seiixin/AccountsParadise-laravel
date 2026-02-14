import { Link, usePage } from '@inertiajs/react';

export default function AdminNavbar() {
    const { auth } = usePage().props;
    return (
        <div className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/AccountsParadiseLogo.png" alt="AccountsParadise" className="h-9 w-9 md:h-11 md:w-11 rounded" />
                        <span className="text-lg font-semibold">AccountsParadise</span>
                    </Link>
                    <span className="rounded bg-neutral-800 px-2 py-1 text-xs">Admin Console</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/store" className="rounded glass-soft px-3 py-2 text-sm">Store</Link>
                    <Link href="/games" className="rounded glass-soft px-3 py-2 text-sm">Games</Link>
                    <Link href="/contact" className="rounded glass-soft px-3 py-2 text-sm">Contact</Link>
                    <Link href={route('logout')} method="post" as="button" className="rounded bg-neutral-800 px-3 py-2 text-sm">
                        Logout
                    </Link>
                </div>
            </div>
        </div>
    );
}
