const CACHE = 'expenses-v2';

const CORE_ASSETS = ['./index.html'];

// Version-pinned CDN assets the app depends on. Precached on install so the
// app can render fully offline/from cache without waiting on these each launch.
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.11.0/dist/tabler-icons.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-datalabels/2.2.0/chartjs-plugin-datalabels.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
];

// Trusted CDN origins: any request to these (including sub-resources like the
// icon font file referenced by the CSS above) gets cached the first time it's
// fetched, so we don't have to know every asset URL up front.
const CDN_ORIGINS = [
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
  'https://www.gstatic.com'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...CORE_ASSETS, ...CDN_ASSETS])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (CDN_ORIGINS.some(origin => url.startsWith(origin))) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }))
    );
  }
});
