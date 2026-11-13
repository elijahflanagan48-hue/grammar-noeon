"use strict";
const CACHE = 'grammar-v81';
const FILES = [
  "./",
  "styles.css",
  "practice-report.js",
  "assessments.js",
  "accounts.js",
  "students-roster.js",
  "students-roster.css",
  "teacher-library.js",
  "task-issues.js",
  "theme-boot.js",
  "notifications.js",
  "app.js",
  "passive.js",
  "passive.css",
  "modal-verbs.js",
  "reported-speech.js",
  "nouns-rule.js",
  "nouns-rule.css",
  "speaking-verbs.js",
  "speaking-verbs.css",
  "infinitive-gerund.js",
  "noeon-canvas.js",
  "noeon-canvas.css",
  "infinitive-map.js",
  "infinitive-map.css",
  "infinitive-gerund.css",
  "content/theory/11-infinitive-gerund-rule.html",
  "tense-map.js",
  "tense-canvas.js",
  "theory-ui.js",
  "home-design.js",
  "today-design.js",
  "topic-search.js",
  "nav-glass.js",
  "results-design.js",
  "dash.css",
  "paper.css",
  "home-design.css",
  "tense-map.css",
  "tense-canvas.css",
  "theory-ui.css",
  "modal-verbs.css",
  "content/theory/08-modals.html",
  "content/theory/07-passive.md",
  "content/theory/08-reported.md",
  "content/theory/09-nouns.md",
  "content/theory/reported-full.html",
  "content/theory/reported-full.css",
  "content/theory/reported-full.js",
  "pwa.js",
  "wixt-lat.woff2",
  "wixd-cyr.woff2",
  "wixt-cyr.woff2",
  "wixd-lat.woff2",
  "favicon.svg",
  "apple-touch-icon.png",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/favicon-32.png",
  "icons/app-icon.svg",
  "icons/icon-maskable-512.png",
  "icons/icon-512.png",
  "data/theory.json",
  "data/exercises/index.json",
  "content/theory/03-past.md",
  "content/theory/05-contrasts-and-pitfalls.md",
  "content/theory/06-comparison.md",
  "content/theory/01-foundations.md",
  "content/theory/04-future.md",
  "content/theory/02-present.md"
];
const WAIT_MS = 3000;
const allowed = new Set(FILES.map(file => new URL(file, self.location.href).pathname));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(file => new Request(file, {cache:'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('grammar-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || (url.pathname.startsWith('/data/exercises/') && url.pathname !== '/data/exercises/index.json')) return;
  if (!allowed.has(url.pathname) && request.mode !== 'navigate') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = request.mode === 'navigate' ? '/' : url.pathname;
    const fallback = () => cache.match(key);
    const network = fetch(request, {cache:'no-cache'}).then(async response => {
      if (response.ok && !response.redirected && (allowed.has(url.pathname) || request.mode === 'navigate')) await cache.put(key, response.clone());
      return response;
    });
    event.waitUntil(network.catch(() => {}));
    let timer;
    const timeout = new Promise(resolve => { timer = setTimeout(() => resolve(null), WAIT_MS); });
    try {
      const response = await Promise.race([network, timeout]);
      if (response && response.status < 500) return response;
      const saved = await fallback();
      if (saved) {
        // Stale copy served (slow network): tell open pages when the fresh one has arrived.
        network.then(fresh => { if (fresh && fresh.ok) return self.clients.matchAll?.().then(list => list.forEach(client => client.postMessage({type:'FRESH_AVAILABLE'}))); }).catch(() => {});
        return saved;
      }
      return response || await network;
    } catch { return await fallback() || Response.error(); }
    finally { clearTimeout(timer); }
  })());
});
