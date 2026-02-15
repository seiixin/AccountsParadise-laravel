import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';
import axios from 'axios';

function ContactForm() {
  const [data, setData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      setStatus('');
      try {
        const res = await axios.post('/contact/send', data, { headers: { Accept: 'application/json' } });
        if (res.status === 200) setStatus('Sent');
      } catch (err) {
        setStatus('Error');
      }
    }}>
      <div className="text-lg font-semibold">Send a Message</div>
      <div>
        <div className="text-sm text-neutral-400">Full Name</div>
        <input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="Juan Dela Cruz"
          className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
      </div>
      <div>
        <div className="text-sm text-neutral-400">Email Address</div>
        <input
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder="you@example.com"
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
      <button type="submit" className="rounded bg-white px-4 py-2 text-black">Send</button>
      {status && <div className="text-sm text-neutral-400">{status}</div>}
    </form>
  );
}

export default function Contact() {
  return (
    <PublicLayout header="Contact AccountsParadise">
      <Head title="Contact · AccountsParadise" />
      <div className="mb-2 text-center text-neutral-400">Tell us about your concern and we’ll get back to you.</div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-800 glass-soft p-4">
            <div className="text-xs text-neutral-400">ADDRESS</div>
            <div className="text-lg font-semibold">Philippines</div>
          </div>
          <div className="rounded-lg border border-neutral-800 glass-soft p-4">
            <div className="text-xs text-neutral-400">PHONE</div>
            <div className="text-lg font-semibold">+63 900 000 0000</div>
          </div>
          <div className="rounded-lg border border-neutral-800 glass-soft p-4">
            <div className="text-xs text-neutral-400">EMAIL</div>
            <div className="text-lg font-semibold">support@accountsparadise.com</div>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 glass-soft p-4">
          <ContactForm />
        </div>
      </div>
    </PublicLayout>
  );
}
