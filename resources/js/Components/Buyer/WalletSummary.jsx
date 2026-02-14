export default function WalletSummary({ total_orders = 0, pending_orders = 0 }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="ap-card p-4">
        <div className="text-sm text-neutral-400">Total Orders</div>
        <div className="mt-1 text-2xl font-semibold">{total_orders}</div>
      </div>
      <div className="ap-card p-4">
        <div className="text-sm text-neutral-400">Pending Orders</div>
        <div className="mt-1 text-2xl font-semibold">{pending_orders}</div>
      </div>
    </div>
  );
}
