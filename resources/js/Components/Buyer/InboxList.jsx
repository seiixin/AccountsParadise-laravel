export default function InboxList({ conversations = [] }) {
  return (
    <div className="ap-card p-3">
      <div className="text-sm text-neutral-400 mb-2">Messages</div>
      <ul className="space-y-2">
        {conversations.map((c) => (
          <li key={c.id} className="rounded border border-neutral-800 bg-neutral-900 p-2">
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="text-xs text-neutral-400">{c.last_message ?? '—'}</div>
          </li>
        ))}
        {!conversations.length && <li className="text-neutral-400 text-center py-6">No messages</li>}
      </ul>
    </div>
  );
}
