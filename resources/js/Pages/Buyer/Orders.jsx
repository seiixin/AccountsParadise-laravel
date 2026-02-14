import BuyerLayout from '@/Layouts/BuyerLayout';
import OrdersTable from '@/Components/Buyer/OrdersTable';
import { Head } from '@inertiajs/react';

export default function Orders() {
  return (
    <BuyerLayout
      title="Buyer · Orders"
      header={<div className="text-xl font-semibold">Buyer · Orders</div>}
    >
      <Head title="Buyer · Orders" />
      <OrdersTable />
    </BuyerLayout>
  );
}
