import { useState } from 'react';

export default function SettingsForm({ initial = {} }) {
  const [name, setName] = useState(initial.name ?? '');
  const [email, setEmail] = useState(initial.email ?? '');
  return (
    <div className="ap-card p-4">
      <div className="text-sm text-neutral-400 mb-2">Profile Settings</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="ap-input px-3 py-2" placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="ap-input px-3 py-2" placeholder="Email" />
      </div>
      <div className="mt-3 flex justify-end">
        <button className="ap-btn-primary ap-pill px-4 py-2">Save</button>
      </div>
    </div>
  );
}
