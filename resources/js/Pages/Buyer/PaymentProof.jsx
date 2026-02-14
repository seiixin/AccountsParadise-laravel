import BuyerLayout from '@/Layouts/BuyerLayout';
import UploadProofForm from '@/Components/Buyer/UploadProofForm';
import { Head } from '@inertiajs/react';

export default function PaymentProof() {
  return (
    <BuyerLayout
      title="Buyer · Payment Proof"
      header={<div className="text-xl font-semibold">Buyer · Payment Proof</div>}
    >
      <Head title="Buyer · Payment Proof" />
      <UploadProofForm />
    </BuyerLayout>
  );
}
