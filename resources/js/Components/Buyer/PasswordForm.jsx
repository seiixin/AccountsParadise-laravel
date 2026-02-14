import { useState } from 'react';

export default function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  return (
    <div className="ap-card p-4">
      <div className="text-sm text-neutral-400 mb-2">Change Password</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="ap-input px-3 py-2" placeholder="Current password" />
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="ap-input px-3 py-2" placeholder="New password" />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="ap-input px-3 py-2" placeholder="Confirm password" />
      </div>
      <div className="mt-3 flex justify-end">
        <button className="ap-btn-primary ap-pill px-4 py-2">Update</button>
      </div>
    </div>
  );
}
