import BuyerLayout from '@/Layouts/BuyerLayout';
import SettingsForm from '@/Components/Buyer/SettingsForm';
import PasswordForm from '@/Components/Buyer/PasswordForm';
import { Head } from '@inertiajs/react';

export default function Settings() {
  return (
    <BuyerLayout
      title="Buyer · Settings"
      header={<div className="text-xl font-semibold">Buyer · Settings</div>}
    >
      <Head title="Buyer · Settings" />
      <div className="space-y-4">
        <SettingsForm />
        <PasswordForm />
      </div>
    </BuyerLayout>
  );
}
