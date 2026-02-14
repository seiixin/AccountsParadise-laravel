import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

function roleBase(role) {
  if (role === 'buyer') return '/buyer';
  if (role === 'merchant') return '/merchant';
  if (role === 'admin') return '/admin';
  if (role === 'midman') return '/midman';
  return '';
}

export default function ChatSidebar() {
  const { auth } = usePage().props;
  const role = auth?.user?.role;
  const base = roleBase(role);
  const [pinned, setPinned] = useState([]);
  const [groups, setGroups] = useState({ direct_admins: [], direct_midmen: [], direct_merchants: [], direct_buyers: [] });
  const [startRole, setStartRole] = useState('merchant');
  const [roleUsers, setRoleUsers] = useState([]);
  const [targetId, setTargetId] = useState(null);
  const [search, setSearch] = useState('');

  function csrf() {
    const m = document.querySelector('meta[name="csrf-token"]');
    if (m) return m.getAttribute('content') || '';
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  async function refresh(page = 1) {
    const res = await axios.get(`${base}/inbox`, { params: { page, per_page: 20 }, headers: { Accept: 'application/json' } });
    setPinned(res.data.pinned ?? []);
    setGroups(res.data.groups ?? { direct_admins: [], direct_midmen: [], direct_merchants: [], direct_buyers: [] });
  }

  useEffect(() => {
    const token = csrf();
    axios.post(`${base}/chat/ensure-groups`, {}, {
      headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
      withCredentials: true,
    }).finally(() => refresh(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRoleUsers(r) {
    const res = await axios.get(`${base}/chat/users`, { params: { role: r }, headers: { Accept: 'application/json' } });
    setRoleUsers(res.data ?? []);
    setTargetId(null);
  }

  useEffect(() => {
    loadRoleUsers(startRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRole]);

  async function startChat() {
    if (!targetId) return;
    const token = csrf();
    const res = await axios.post(`${base}/chat/start-with`, { target_user_id: targetId }, {
      headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
      withCredentials: true,
    });
    window.location.href = `${base}/chat/${res.data.conversation_id}`;
  }

  function Avatar({ src, name }) {
    return (
      <div className="h-8 w-8 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center">
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-neutral-300">{(name ?? '?').substring(0, 1).toUpperCase()}</span>
        )}
      </div>
    );
  }

  return (
    <div className="ap-card p-3">
      <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Start Chat</div>
      <div className="grid grid-cols-1 gap-2 items-start">
        <div className="space-y-1">
          <div className="text-xs text-neutral-400">Role</div>
          <select value={startRole} onChange={(e) => setStartRole(e.target.value)} className="ap-input w-full">
            <option value="merchant">Seller</option>
            <option value="buyer">Buyer</option>
            <option value="midman">Midman</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-neutral-400">Select a user</div>
          <select
            value={targetId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setTargetId(v === '' ? null : parseInt(v));
            }}
            className="ap-input w-full"
          >
            <option value="">{'Select a user'}</option>
            {(roleUsers ?? [])
              .filter(u => (search.trim() === '' ? true : (u.name ?? '').toLowerCase().includes(search.trim().toLowerCase())))
              .map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="ap-input w-full"
          />
        </div>
        <button onClick={startChat} disabled={!targetId} className="ap-btn-primary ap-pill disabled:opacity-50 w-full">Start</button>
      </div>
      <div className="my-3 border-t border-neutral-800" />
      <div className="text-xs uppercase tracking-wide text-neutral-400">Pinned</div>
      <div className="mt-2 space-y-1">
        {pinned.map(p => {
          const isGC = p.type === 'midman_gc' || p.type === 'admin_gc';
          const avatarSrc = isGC ? '/AccountsParadiseLogo.png' : null;
          return (
            <Link key={p.id} href={`${base}/chat/${p.id}`} className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-neutral-900">
              <div className="flex items-center gap-3">
                <Avatar src={avatarSrc} name={p.title} />
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">{p.type}</div>
                  <div className={p.unread ? 'font-bold' : 'font-medium'}>{p.title ?? (p.type === 'midman_gc' ? 'Midman GC' : 'Admin GC')}</div>
                </div>
              </div>
              {p.unread ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : <span className="h-2 w-2 rounded-full bg-transparent" />}
            </Link>
          );
        })}
      </div>
      <div className="mt-3 text-xs uppercase tracking-wide text-neutral-400">Direct with Admins</div>
      <div className="mt-2 space-y-1">
        {groups.direct_admins.map(c => {
          const avatarSrc = c.other_avatar_path ? `/storage/${c.other_avatar_path}` : null;
          return (
            <Link key={c.id} href={`${base}/chat/${c.id}`} className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-neutral-900">
              <div className="flex items-center gap-3">
                <Avatar src={avatarSrc} name={c.other_name} />
                <div>
                  <div className={c.unread ? 'font-bold' : 'font-medium'}>{c.other_name}</div>
                  <div className="text-xs text-neutral-500">Admin</div>
                </div>
              </div>
              {c.unread ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : <span className="h-2 w-2 rounded-full bg-transparent" />}
            </Link>
          );
        })}
      </div>
      <div className="mt-3 text-xs uppercase tracking-wide text-neutral-400">Direct with Midmen</div>
      <div className="mt-2 space-y-1">
        {groups.direct_midmen.map(c => {
          const avatarSrc = c.other_avatar_path ? `/storage/${c.other_avatar_path}` : null;
          return (
            <Link key={c.id} href={`${base}/chat/${c.id}`} className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-neutral-900">
              <div className="flex items-center gap-3">
                <Avatar src={avatarSrc} name={c.other_name} />
                <div>
                  <div className={c.unread ? 'font-bold' : 'font-medium'}>{c.other_name}</div>
                  <div className="text-xs text-neutral-500">Midman</div>
                </div>
              </div>
              {c.unread ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : <span className="h-2 w-2 rounded-full bg-transparent" />}
            </Link>
          );
        })}
      </div>
      <div className="mt-3 text-xs uppercase tracking-wide text-neutral-400">{role === 'buyer' ? 'Direct with Sellers' : 'Direct with Buyers'}</div>
      <div className="mt-2 space-y-1">
        {(role === 'buyer' ? groups.direct_merchants : groups.direct_buyers).map(c => {
          const avatarSrc = c.other_avatar_path ? `/storage/${c.other_avatar_path}` : null;
          return (
            <Link key={c.id} href={`${base}/chat/${c.id}`} className="flex items-center justify-between gap-3 rounded px-3 py-2 hover:bg-neutral-900">
              <div className="flex items-center gap-3">
                <Avatar src={avatarSrc} name={c.other_name} />
                <div>
                  <div className={c.unread ? 'font-bold' : 'font-medium'}>{c.other_name}</div>
                  <div className="text-xs text-neutral-500">{role === 'buyer' ? 'Seller' : 'Buyer'}</div>
                </div>
              </div>
              {c.unread ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : <span className="h-2 w-2 rounded-full bg-transparent" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
