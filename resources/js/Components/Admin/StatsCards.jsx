export default function StatsCards({ metrics }) {
    const items = [
        { title: 'Total Orders', value: metrics?.orders_total ?? 0 },
        { title: 'Pending Payouts', value: metrics?.pending_payout_requests ?? 0 },
        { title: 'Open Disputes', value: metrics?.open_order_disputes ?? 0 },
        { title: 'Users', value: metrics?.users_total ?? 0 },
    ];
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {items.map((i) => (
                <div key={i.title} className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-sm text-neutral-400">{i.title}</div>
                    <div className="text-2xl font-bold">{i.value}</div>
                </div>
            ))}
        </div>
    );
}
