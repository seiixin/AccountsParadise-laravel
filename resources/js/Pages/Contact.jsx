import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';

function csrf() {
  const m = document.querySelector('meta[name="csrf-token"]');
  if (m) return m.getAttribute('content') || '';
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function secureHeaders(extra = {}) {
  const token = csrf();
  return {
    Accept: 'application/json',
    'X-CSRF-TOKEN': token,
    'X-XSRF-TOKEN': token,
    'X-Requested-With': 'XMLHttpRequest',
    ...extra,
  };
}

function ContactForm() {
  const [data, setData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  return (
    <>
      <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        setStatus('');
        setSending(true);
        try {
          const res = await axios.post(route('contact.send'), data, { headers: secureHeaders(), withCredentials: true });
          if (res.status === 200) setStatus('Sent');
        } catch (err) {
          setStatus('Error');
        } finally {
          setSending(false);
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
        <button type="submit" disabled={sending} className={`rounded bg-white px-4 py-2 text-black ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}>{sending ? 'Sending...' : 'Send'}</button>
        {status && <div className="text-sm text-neutral-400">{status}</div>}
      </form>
      {createPortal(
        sending ? (
          <div className="fixed inset-0 z-[2147483647] bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="glass-soft rounded-lg p-4 flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" />
              </svg>
              <div className="text-white">Sending...</div>
            </div>
          </div>
        ) : null,
        document.body
      )}
    </>
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
            <div className="text-lg font-semibold">+639928041384</div>
          </div>
          <div className="rounded-lg border border-neutral-800 glass-soft p-4">
            <div className="text-xs text-neutral-400">EMAIL</div>
            <div className="text-lg font-semibold">blackaxis2026@gmail.com</div>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 glass-soft p-4">
          <ContactForm />
        </div>
      </div>
    </PublicLayout>
  );
}
