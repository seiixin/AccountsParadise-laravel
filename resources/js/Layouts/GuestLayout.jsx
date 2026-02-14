import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-app text-neutral-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    {/* Replace the ApplicationLogo with the custom logo */}
                    <img src="/AccountsParadiseLogo.png" alt="Accounts Paradise Logo" className="h-20 w-20 object-cover" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden glass-soft px-6 py-4 sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
