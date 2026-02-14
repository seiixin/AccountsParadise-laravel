export default function RecentOrdersTable({ orders }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left">
                        <th className="p-2">ID</th>
                        <th className="p-2">Order No</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Currency</th>
                        <th className="p-2">Created</th>
                    </tr>
                </thead>
                <tbody>
                    {(orders ?? []).map((o) => (
                        <tr key={o.id} className="border-t border-neutral-800">
                            <td className="p-2">{o.id}</td>
                            <td className="p-2">{o.order_no}</td>
                            <td className="p-2">{o.listing_type_snapshot ?? '—'}</td>
                            <td className="p-2">{o.status}</td>
                            <td className="p-2">{o.amount}</td>
                            <td className="p-2">{o.currency}</td>
                            <td className="p-2">{o.created_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
