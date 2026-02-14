import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Midman Dashboard</h2>}
        >
            <Head title="Midman Dashboard" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <p className="text-gray-700">Review deliveries and payout approvals.</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
