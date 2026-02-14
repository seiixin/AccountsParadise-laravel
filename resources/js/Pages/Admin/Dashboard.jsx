import AdminLayout from '@/Layouts/AdminLayout';
import StatsCards from '@/Components/Admin/StatsCards';
import RecentOrdersTable from '@/Components/Admin/RecentOrdersTable';

export default function Dashboard({ metrics, recent_orders }) {
    return (
        <AdminLayout
            title="Admin Dashboard"
            header={<h2 className="text-xl font-semibold">Admin Dashboard</h2>}
        >
            <div className="space-y-8">
                <StatsCards metrics={metrics} />
                <div>
                    <div className="mb-2 text-sm text-neutral-400">Recent Orders</div>
                    <RecentOrdersTable orders={recent_orders} />
                </div>
            </div>
        </AdminLayout>
    );
}
