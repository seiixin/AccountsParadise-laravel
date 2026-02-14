import { useState } from 'react';

export default function ChatBox({ onSend }) {
  const [text, setText] = useState('');
  function send() {
    if (!text.trim()) return;
    onSend?.(text);
    setText('');
  }
  return (
    <div className="ap-card p-3">
      <div className="text-sm text-neutral-400 mb-2">Chat</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        className="ap-input w-full px-3 py-2"
        rows={3}
        placeholder="Type a message…"
      />
      <div className="mt-2 flex justify-end">
        <button onClick={send} className="ap-btn-primary ap-pill px-3 py-2">Send</button>
      </div>
    </div>
  );
}
