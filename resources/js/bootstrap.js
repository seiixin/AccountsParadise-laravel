import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrf) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf;
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

const key = import.meta.env.VITE_PUSHER_APP_KEY || 'localkey';
const host = import.meta.env.VITE_PUSHER_HOST || window.location.hostname;
const port = Number(import.meta.env.VITE_PUSHER_PORT || 6001);
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
