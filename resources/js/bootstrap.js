import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common['Accept'] = 'application/json';
const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrf) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf;
}

// Lightweight SweetAlert-like error modal for session/CSRF issues
window.showErrorAlert = function(title = 'Error', text = 'Something went wrong') {
  const existing = document.getElementById('ap-error-alert');
  if (existing) existing.remove();
  const backdrop = document.createElement('div');
  backdrop.id = 'ap-error-alert';
  backdrop.style.position = 'fixed';
  backdrop.style.top = '0';
  backdrop.style.left = '0';
  backdrop.style.right = '0';
  backdrop.style.bottom = '0';
  backdrop.style.background = 'rgba(0,0,0,0.6)';
  backdrop.style.zIndex = '2147483647';
  backdrop.style.display = 'flex';
  backdrop.style.alignItems = 'center';
  backdrop.style.justifyContent = 'center';
  const box = document.createElement('div');
  box.style.background = '#111827';
  box.style.color = '#fff';
  box.style.border = '1px solid #374151';
  box.style.borderRadius = '12px';
  box.style.padding = '20px';
  box.style.width = 'min(92vw, 420px)';
  box.style.boxShadow = '0 10px 40px rgba(0,0,0,0.4)';
  const h = document.createElement('div');
  h.style.fontSize = '18px';
  h.style.fontWeight = '600';
  h.style.marginBottom = '8px';
  h.innerText = title;
  const p = document.createElement('div');
  p.style.fontSize = '14px';
  p.style.opacity = '0.9';
  p.style.marginBottom = '16px';
  p.innerText = text;
  const btn = document.createElement('button');
  btn.innerText = 'OK';
  btn.style.background = '#22d3ee';
  btn.style.color = '#000';
  btn.style.border = 'none';
  btn.style.padding = '8px 14px';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.onclick = () => backdrop.remove();
  box.appendChild(h);
  box.appendChild(p);
  box.appendChild(btn);
  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
};

// Global interceptor to catch 419 expired (CSRF/session) and show modal
window.axios.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 419) {
      window.showErrorAlert('Session expired', 'Please refresh the page and try again.');
    }
    return Promise.reject(error);
  }
);

// Intercept fetch (used by Inertia) to show alert on 419 as well
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const res = await originalFetch(...args);
    try {
      if (res && res.status === 419) {
        window.showErrorAlert('Session expired', 'Please refresh the page and try again.');
      }
    } catch {}
    return res;
  };
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

const key = import.meta.env.VITE_PUSHER_APP_KEY || 'localkey';
const host = import.meta.env.VITE_PUSHER_HOST || '127.0.0.1';
const port = Number(import.meta.env.VITE_PUSHER_PORT || 8080);
const scheme = import.meta.env.VITE_PUSHER_SCHEME || 'http';
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1';

window.Echo = new Echo({
  broadcaster: 'pusher',
  key,
  cluster,
  wsHost: host,
  wsPort: port,
  wssPort: port,
  forceTLS: scheme === 'https',
  enabledTransports: ['ws', 'wss'],
  withCredentials: true,
  auth: {
    headers: {
      'X-CSRF-TOKEN': csrf || '',
      'X-Requested-With': 'XMLHttpRequest',
    },
  },
});
