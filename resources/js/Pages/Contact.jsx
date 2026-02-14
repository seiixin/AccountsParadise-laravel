import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';

function ContactForm() {
  const [data, setData] = useState({ email: '', message: '' });
  return (
    <form className="space-y-3">
      <div>
        <div className="text-sm text-neutral-400">Email Support</div>
        <input
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder="support@accountsparadise.com"
          className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
      </div>
      <div>
        <div className="text-sm text-neutral-400">Message</div>
        <textarea
          value={data.message}
          onChange={(e) => setData({ ...data, message: e.target.value })}
          rows={5}
          className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
      </div>
      <button type="button" className="rounded bg-white px-4 py-2 text-black">Send</button>
    </form>
  );
}

export default function Contact() {
  return (
    <PublicLayout header="Contact AccountsParadise">
      <Head title="Contact · AccountsParadise" />
      <div className="mb-4 text-neutral-400">
        For concerns and inquiries, message us anytime. For urgent help, you can also reach us via our social links.
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-sm text-neutral-400">PHONE</div>
          <div className="text-lg font-semibold">+63 900 000 0000</div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-sm text-neutral-400">ADDRESS</div>
          <div className="text-lg font-semibold">Philippines</div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 md:col-span-2">
          <ContactForm />
        </div>
      </div>
    </PublicLayout>
  );
}
