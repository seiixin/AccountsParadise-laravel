import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import ChatSidebar from '@/Components/Guest/ChatSidebar';
import BackButton from '@/Components/Guest/BackButton'; // Import the BackButton component

function roleBase(role) {
  if (role === 'buyer') return '/buyer';
  if (role === 'merchant') return '/merchant';
  if (role === 'admin') return '/admin';
  if (role === 'midman') return '/midman';
  return '';
}

function csrf() {
  const m = document.querySelector('meta[name="csrf-token"]');
  if (m) return m.getAttribute('content') || '';
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isWsConnected() {
  try {
    const c = window?.Echo?.connector?.pusher?.connection;
    return !!c && c.state === 'connected';
  } catch {
    return false;
  }
}

export default function Conversation({ conversationId }) {
  const { auth } = usePage().props;
  const role = auth?.user?.role;
  const meId = auth?.user?.id;
  const meName = auth?.user?.name;
  const base = roleBase(role);
  const [conv, setConv] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [content, setContent] = useState('');
  const [showInbox, setShowInbox] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attPreview, setAttPreview] = useState(null);
  const [attError, setAttError] = useState('');
  const fileInputRef = useRef(null);
  const listRef = useRef(null);
  const idsRef = useRef(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  async function load(page = 1) {
    const res = await axios.get(`${base}/chat/${conversationId}`, { params: { page, per_page: 100 }, headers: { Accept: 'application/json' } });
    setConv(res.data.conversation);
    setParticipants(res.data.participants ?? []);
    const list = res.data.messages ?? res.data;
    const data = list.data ?? [];
    setMessages(data);
    idsRef.current = new Set(data.map(m => m.id));
    setMeta(list.meta ?? { current_page: list.current_page ?? 1, last_page: list.last_page ?? 1 });
    try { window.dispatchEvent(new CustomEvent('ap-inbox-refresh')); } catch {}
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!conv) return;
      const connected = isWsConnected();
      if (!connected) load(meta.last_page ?? 1);
    }, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv?.id, meta.last_page]);

  useEffect(() => {
    if (!conv || !window.Echo) return;
    const id = conversationId;
    const channel = conv.type === 'direct'
      ? window.Echo.private(`conversation.${id}`)
      : window.Echo.channel(`gc.${id}`);
    const publicFallback = conv.type === 'direct'
      ? window.Echo.channel(`conversation.${id}`)
      : null;
    const handler = (e) => {
      const msg = e.message;
      if (msg?.id && idsRef.current.has(msg.id)) return;
      if (msg?.id) idsRef.current.add(msg.id);
      setMessages((prev) => [...prev, msg]);
    };
    channel.listen('.MessageSent', handler);
    if (publicFallback) publicFallback.listen('.MessageSent', handler);
    return () => {
      try {
        channel.stopListening('.MessageSent', handler);
        if (publicFallback) publicFallback.stopListening('.MessageSent', handler);
      } catch {}
    };
  }, [conv, conversationId]);

  const isGroup = useMemo(() => conv?.type && conv?.type !== 'direct', [conv?.type]);
  const other = useMemo(() => participants.find(p => p.user_id !== meId), [participants, meId]);
  const pMap = useMemo(() => {
    const m = new Map();
    participants.forEach(p => m.set(p.user_id, p));
    return m;
  }, [participants]);

  async function refreshUnread() {
    const res = await axios.get(`${base}/inbox`, { params: { page: 1, per_page: 20 }, headers: { Accept: 'application/json' } });
    let c = 0;
    const pinned = res.data?.pinned ?? [];
    c += pinned.filter(p => !!p.unread).length;
    const groups = res.data?.groups ?? {};
    Object.values(groups).forEach(arr => {
      (arr ?? []).forEach(x => { if (x.unread) c++; });
    });
    setUnreadCount(c);
  }

  useEffect(() => {
    refreshUnread();
    const handler = () => refreshUnread();
    window.addEventListener('ap-inbox-refresh', handler);
    const t = setInterval(() => refreshUnread(), 10000);
    const onVis = () => { if (document.visibilityState === 'visible') refreshUnread(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('ap-inbox-refresh', handler);
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  async function send() {
    if (!content.trim() && !attachment) return;
    const token = csrf();
    const hasFile = !!attachment;
    if (hasFile && attError) return;
    const currentContent = content;
    const currentPreview = attPreview;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      sender_id: meId,
      sender_name: meName || 'Me',
      content: currentContent,
      attachment_path: null,
      attachment_url: currentPreview || null,
      address_to_ids: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setContent('');
    setAttachment(null);
    setAttPreview(null);
    setAttError('');
    let res;
    if (hasFile) {
      const fd = new FormData();
      fd.append('content', currentContent);
      fd.append('attachment', attachment);
      res = await axios.post(`${base}/chat/${conversationId}/messages`, fd, {
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
    } else {
      res = await axios.post(`${base}/chat/${conversationId}/messages`, { content: currentContent }, {
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
        withCredentials: true,
      });
    }
    const msg = res?.data?.message;
    if (msg) {
      if (msg?.id) idsRef.current.add(msg.id);
      setMessages((prev) => {
        const hasBroadcast = prev.some(m => m.id === msg.id);
        if (hasBroadcast) {
          return prev.filter(m => m.id !== tempId);
        }
        return prev.map(m => (m.id === tempId ? msg : m));
      });
    } else {
      load(meta.last_page ?? 1);
    }
  }

  function onPickAttachment(e) {
    const f = e.target.files?.[0] || null;
    setAttError('');
    setAttachment(null);
    setAttPreview(null);
    if (!f) return;
    const isVideo = /^video\//.test(f.type);
    const url = URL.createObjectURL(f);
    setAttPreview(url);
    if (isVideo) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        if (v.duration > 60) {
          setAttError('Video must be 60s or less');
          setAttachment(null);
          setAttPreview(null);
          URL.revokeObjectURL(url);
        } else {
          setAttachment(f);
        }
      };
      v.onerror = () => {
        setAttachment(null);
        setAttPreview(null);
        setAttError('Invalid video');
        URL.revokeObjectURL(url);
      };
      v.src = url;
    } else {
      setAttachment(f);
    }
  }

  return (
    <AuthenticatedLayout fullWidth hideGlobalInboxButton>
      <header className="flex items-center gap-4 py-4 hidden lg:flex">
        <BackButton role={role} /> {/* Use the BackButton component */}
      </header>

      <Head title="Conversation" />
      <div className="grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-3 h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-hidden">
        <div className="hidden md:block md:col-span-3 md:h-full md:overflow-y-auto no-scrollbar"><ChatSidebar /></div>
        <div className="md:col-span-6 md:ap-card md:p-3 p-0 h-full overflow-y-auto no-scrollbar flex flex-col">
          <div className="md:hidden px-2 py-2 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between sticky top-0 z-10">
{unreadCount > 0 ? (
  <button
    onClick={() => setShowInbox(true)}
    className="ml-2 inline-flex items-center gap-2 text-[10px] font-semibold bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
    aria-label="Back to Inbox"
    title="Back to Inbox"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <span className="leading-none">
      {unreadCount} NEW CHAT
    </span>
  </button>
) : (
  <button
    onClick={() => setShowInbox(true)}
    className="rounded p-2 hover:bg-gray-100 transition"
    aria-label="Back to Inbox"
    title="Inbox"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
)}

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                {isGroup ? (
                  <img src="/AccountsParadiseLogo.png" alt={conv?.title ?? 'Group'} className="h-full w-full object-cover" />
                ) : (
                  other?.avatar_path ? <img src={`/storage/${other.avatar_path}`} alt={other?.name} className="h-full w-full object-cover" /> : <span className="text-xs text-neutral-300">{(other?.name ?? '?')[0]}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{conv?.title ?? (other?.name ?? 'Conversation')}</div>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(true)}
              className="rounded px-2 py-1"
              aria-label="More"
              title="More"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="18" cy="12" r="2" fill="currentColor" />
              </svg>
            </button>
          </div>
          <div className="hidden md:flex items-center justify-between sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950 px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                {isGroup ? (
                  <img src="/AccountsParadiseLogo.png" alt={conv?.title ?? 'Group'} className="h-full w-full object-cover" />
                ) : (
                  other?.avatar_path ? <img src={`/storage/${other.avatar_path}`} alt={other?.name} className="h-full w-full object-cover" /> : <span className="text-xs text-neutral-300">{(other?.name ?? '?')[0]}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{isGroup ? (conv?.title ?? 'Group Chat') : (other?.name ?? 'Conversation')}</div>
              </div>
            </div>
          </div>
          <div ref={listRef} className="flex-1 md:rounded md:border md:border-neutral-800 md:p-2 p-0 bg-neutral-950 overflow-y-auto no-scrollbar">
            {messages.map(m => {
              const isMe = m.sender_id === meId;
              const sender = pMap.get(m.sender_id);
              const avatarSrc = sender?.avatar_path ? `/storage/${sender.avatar_path}` : null;
              if (!isGroup) {
                return (
                  <div key={m.id} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!isMe && (
                      <div className="h-7 w-7 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                        {avatarSrc ? <img src={avatarSrc} alt={m.sender_name} className="h-full w-full object-cover" /> : <span className="text-[10px] text-neutral-300">{(m.sender_name ?? '?')[0]}</span>}
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${isMe ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-100'}`}>
                  <div className="text-[11px] opacity-75">{new Date(m.created_at).toLocaleString()}</div>
                  <div className="mt-1">{m.content}</div>
                  {m.attachment_path && (
                    /\.mp4|\.webm|\.mov$/i.test(m.attachment_path) ? (
                      <video src={`/storage/${m.attachment_path}`} controls className="mt-2 w-64 max-w-full rounded" />
                    ) : (
                      <img src={`/storage/${m.attachment_path}`} alt="attachment" className="mt-2 w-64 max-w-full rounded object-contain" />
                    )
                  )}
                  {m.attachment_url && !m.attachment_path && (
                    /\.mp4|\.webm|\.mov$/i.test(m.attachment_url) ? (
                      <video src={m.attachment_url} controls className="mt-2 w-64 max-w-full rounded" />
                    ) : (
                      <img src={m.attachment_url} alt="attachment" className="mt-2 w-64 max-w-full rounded object-contain" />
                    )
                  )}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!isMe && (
                    <div className="h-7 w-7 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                      {avatarSrc ? <img src={avatarSrc} alt={m.sender_name} className="h-full w-full object-cover" /> : <span className="text-[10px] text-neutral-300">{(m.sender_name ?? '?')[0]}</span>}
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMe ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-100'}`}>
                    <div className="text-[11px] opacity-75">
                      {isMe ? new Date(m.created_at).toLocaleString() : `${m.sender_name} · ${new Date(m.created_at).toLocaleString()}`}
                    </div>
                    <div className="mt-1">{m.content}</div>
                    {m.attachment_path && (
                      /\.mp4|\.webm|\.mov$/i.test(m.attachment_path) ? (
                        <video src={`/storage/${m.attachment_path}`} controls className="mt-2 w-64 max-w-full rounded" />
                      ) : (
                        <img src={`/storage/${m.attachment_path}`} alt="attachment" className="mt-2 w-64 max-w-full rounded object-contain" />
                      )
                    )}
                    {m.attachment_url && !m.attachment_path && (
                      /\.mp4|\.webm|\.mov$/i.test(m.attachment_url) ? (
                        <video src={m.attachment_url} controls className="mt-2 w-64 max-w-full rounded" />
                      ) : (
                        <img src={m.attachment_url} alt="attachment" className="mt-2 w-64 max-w-full rounded object-contain" />
                      )
                    )}
                  </div>
                </div>
              );
            })}
            {!messages.length && <div className="text-sm text-neutral-400">No messages yet</div>}
          </div>
          <div className="sticky bottom-0 z-10 bg-neutral-950 border-t border-neutral-800">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={onPickAttachment}
            />
            <div className="lg:hidden p-2 pb-[calc(env(safe-area-inset-bottom,0)+0.5rem)]">
              <div className="relative flex items-center rounded-full border border-blue-400 bg-black text-black px-3 py-2 shadow-sm">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent border-none ring-0 outline-none focus:ring-0 focus:outline-none appearance-none pr-16 text-sm text-white placeholder-white/50"
                />
                <button
                  type="button"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach"
                  title="Attach"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12L10 23a6 6 0 01-8.49-8.49L12 4a4 4 0 116 6L8 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                  onClick={send}
                  aria-label="Send"
                  title="Send"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="hidden lg:block p-2">
              <div className="relative flex items-center rounded-full border border-blue-400 bg-black text-neutral-100 px-3 py-2 shadow-sm">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent border-none ring-0 outline-none focus:ring-0 focus:outline-none appearance-none pr-16 text-sm text-white placeholder-white/50"
                />
                <button
                  type="button"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach"
                  title="Attach"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12L10 23a6 6 0 01-8.49-8.49L12 4a4 4 0 116 6L8 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400"
                  onClick={send}
                  aria-label="Send"
                  title="Send"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {attPreview && (
            <div className="px-2 pb-2 bg-neutral-950">
              {/^video\//.test(attachment?.type || '') ? (
                <video src={attPreview} controls className="mt-2 w-64 max-w-full rounded" />
              ) : (
                <img src={attPreview} alt="preview" className="mt-2 w-64 max-w-full rounded object-contain" />
              )}
              {attError && <div className="mt-1 text-xs text-red-400">{attError}</div>}
            </div>
          )}
        </div>
        <div className="hidden md:block md:col-span-3 ap-card p-3 md:h-full md:overflow-y-auto no-scrollbar">
          {isGroup ? (
            <>
              <div className="flex flex-col items-center gap-2 pb-3 border-b border-neutral-800">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                  <img src="/AccountsParadiseLogo.png" alt={conv?.title ?? 'Group'} className="h-full w-full object-cover" />
                </div>
                <div className="text-lg font-semibold">{conv?.title ?? 'Group Chat'}</div>
              </div>
              <div className="text-xs uppercase tracking-wide text-neutral-400">Members</div>
              <div className="mt-2 space-y-1">
                {participants.map(p => (
                  <MemberRow key={p.user_id} member={p} base={base} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs uppercase tracking-wide text-neutral-400">Chat Partner</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                  {other?.avatar_path ? <img src={`/storage/${other.avatar_path}`} alt={other?.name} className="h-full w-full object-cover" /> : <span className="text-sm text-neutral-300">{(other?.name ?? '?')[0]}</span>}
                </div>
                <div>
                  <div className="text-lg font-semibold">{other?.name}</div>
                  <div className="text-xs text-neutral-400">{other?.role}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {createPortal(
        <div className="md:hidden">
          {showInbox && (
            <div className="fixed inset-x-0 bottom-0 top-16 z-40 bg-neutral-950 text-neutral-100">
              <div className="p-0">
                <div className="flex items-center justify-between mb-3 px-2 pt-2">
                  <div className="text-sm text-neutral-400">Inbox</div>
                  <button onClick={() => setShowInbox(false)} className="rounded px-3 py-2 bg-white text-black">Back</button>
                </div>
                <ChatSidebar />
              </div>
            </div>
          )}
          {showDetails && (
            <div className="fixed inset-x-0 bottom-0 top-16 z-40 bg-neutral-950 text-neutral-100">
              <div className="p-0">
                <div className="flex items-center justify-between mb-3 px-2 pt-2">
                  <button onClick={() => setShowDetails(false)} className="rounded px-3 py-2 bg-white text-white">Back</button>
                  <div className="text-sm text-neutral-400">Details</div>
                </div>
                <div className="ap-card p-3">
                  {isGroup ? (
                    <>
                      <div className="flex flex-col items-center gap-2 pb-3 border-b border-neutral-800">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                          <img src="/AccountsParadiseLogo.png" alt={conv?.title ?? 'Group'} className="h-full w-full object-cover" />
                        </div>
                        <div className="text-lg font-semibold">{conv?.title ?? 'Group Chat'}</div>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Members</div>
                      <div className="mt-2 space-y-1">
                        {participants.map(p => (
                          <MemberRow key={p.user_id} member={p} base={base} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Chat Partner</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                          {other?.avatar_path ? <img src={`/storage/${other.avatar_path}`} alt={other?.name} className="h-full w-full object-cover" /> : <span className="text-sm text-neutral-300">{(other?.name ?? '?')[0]}</span>}
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{other?.name}</div>
                          <div className="text-xs text-neutral-400">{other?.role}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </AuthenticatedLayout>
  );
}

function MemberRow({ member, base }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarSrc = member.avatar_path ? `/storage/${member.avatar_path}` : null;
  async function message() {
    const token = csrf();
    const res = await axios.post(`${base}/chat/start-with`, { target_user_id: member.user_id }, {
      headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
      withCredentials: true,
    });
    window.location.href = `${base}/chat/${res.data.conversation_id}`;
  }
  return (
    <div className="relative flex items-center justify-between rounded px-2 py-2 hover:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
          {avatarSrc ? <img src={avatarSrc} alt={member.name} className="h-full w-full object-cover" /> : <span className="text-xs">{member.name.substring(0,1).toUpperCase()}</span>}
        </div>
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-xs text-neutral-400">{member.role}</div>
        </div>
      </div>
      <button onClick={() => setMenuOpen(v => !v)} className="rounded px-2 py-1 hover:bg-neutral-800">⋯</button>
      {menuOpen && (
        <div className="absolute right-2 top-10 z-10 rounded border border-neutral-800 bg-neutral-950 p-2 shadow-lg">
          <button onClick={message} className="block w-full rounded px-3 py-2 text-left hover:bg-neutral-900">Message</button>
        </div>
      )}
    </div>
  );
}
