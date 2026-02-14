import BuyerLayout from '@/Layouts/BuyerLayout';
import OrdersTable from '@/Components/Buyer/OrdersTable';
import { Head } from '@inertiajs/react';

export default function Transactions() {
  return (
    <BuyerLayout
      title="Buyer · Transactions"
      header={<div className="text-xl font-semibold">Buyer · Transactions</div>}
    >
      <Head title="Buyer · Transactions" />
      <OrdersTable />
    </BuyerLayout>
  );
}
