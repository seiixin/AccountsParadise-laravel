import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, useMemo } from 'react';
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
  const subsRef = useRef(new Map());
  const pollRef = useRef(null);

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

  useEffect(() => {
    const handler = () => refresh(1);
    window.addEventListener('ap-inbox-refresh', handler);
    return () => {
      window.removeEventListener('ap-inbox-refresh', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = setInterval(() => {
      refresh(1);
    }, 8000);
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        refresh(1);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isGC = (p) => p.type === 'midman_gc' || p.type === 'admin_gc';
    if (!window.Echo) return;
    const currentIds = new Set(pinned.filter(isGC).map(p => p.id));
    subsRef.current.forEach((entry, id) => {
      if (!currentIds.has(id)) {
        try {
          entry.channel.stopListening('.MessageSent', entry.handler);
        } catch {}
        subsRef.current.delete(id);
      }
    });
    pinned.filter(isGC).forEach(p => {
      if (subsRef.current.has(p.id)) return;
      const channel = window.Echo.channel(`gc.${p.id}`);
      const handler = () => {
        refresh(1);
      };
      channel.listen('.MessageSent', handler);
      subsRef.current.set(p.id, { channel, handler });
    });
    return () => {
      subsRef.current.forEach(({ channel, handler }) => {
        try {
          channel.stopListening('.MessageSent', handler);
        } catch {}
      });
      subsRef.current.clear();
    };
  }, [pinned]);

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

  const unreadCount = useMemo(() => {
    let c = 0;
    try {
      c += pinned.filter(p => !!p.unread).length;
      Object.values(groups || {}).forEach(arr => {
        (arr || []).forEach(x => { if (x.unread) c++; });
      });
    } catch {}
    return c;
  }, [pinned, groups]);

  return (
    <div className="ap-card p-3 max-h-[75vh] overflow-y-auto min-h-0 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none;}`}</style>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-neutral-400">Start Chat</div>
        {unreadCount > 0 && (
          <span className="text-[10px] font-semibold bg-red-600 text-white px-2 py-1 rounded">
            {unreadCount} NEW CHAT
          </span>
        )}
      </div>
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
            <Link key={c.id} href={`${base}/chat/${c.id}`} className="flex items-center justify_between gap-3 rounded px-3 py-2 hover:bg-neutral-900">
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
      {role === 'buyer' && (
        <>
          <div className="mt-3 text-xs uppercase tracking-wide text-neutral-400">Direct with Buyers</div>
          <div className="mt-2 space-y-1">
            {groups.direct_buyers.map(c => {
              const avatarSrc = c.other_avatar_path ? `/storage/${c.other_avatar_path}` : null;
              return (
                <Link key={c.id} href={`${base}/chat/${c.id}`} className="flex items_center justify-between gap-3 rounded px-3 py-2 hover:bg-neutral-900">
                  <div className="flex items-center gap-3">
                    <Avatar src={avatarSrc} name={c.other_name} />
                    <div>
                      <div className={c.unread ? 'font-bold' : 'font-medium'}>{c.other_name}</div>
                      <div className="text-xs text-neutral-500">Buyer</div>
                    </div>
                  </div>
                  {c.unread ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : <span className="h-2 w-2 rounded-full bg-transparent" />}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
