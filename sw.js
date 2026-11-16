"use strict";
const CACHE = 'grammar-v93';
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
  "nouns-map.js",
  "nouns-map.css",
  "comparison-map.js",
  "comparison-map.css",
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
  "content/theory/02-present.md",
  "content/theory/10-speaking-verbs-rule.html"
];
const WAIT_MS = 2000;
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
    // Файлы с ?v=<хеш> никогда не меняются: отдаём из кэша сразу, без похода в сеть.
    if (request.mode !== 'navigate' && url.searchParams.has('v')) {
      const hit = await cache.match(request.url);
      if (hit) return hit;
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request.url, response.clone());
        return response;
      } catch { return await cache.match(url.pathname) || Response.error(); }
    }
    // Шрифты и картинки: мгновенно из кэша, свежая копия подтягивается в фоне.
    if (request.mode !== 'navigate' && /\.(?:woff2|png|svg|webmanifest)$/i.test(url.pathname)) {
      const hit = await cache.match(url.pathname);
      const network = fetch(request, {cache:'no-cache'}).then(async response => {
        if (response.ok && !response.redirected) await cache.put(url.pathname, response.clone());
        return response;
      });
      event.waitUntil(network.catch(() => {}));
      if (hit) return hit;
      try { return await network; } catch { return Response.error(); }
    }
    // Страница и данные (правила, оглавление банка): мгновенно из кэша этого релиза, без похода в сеть.
    // Свежая копия подтягивается в фоне; если она отличается, страница один раз перезагрузится (FRESH_AVAILABLE).
    const key = request.mode === 'navigate' ? '/' : url.pathname;
    const fallback = () => cache.match(key);
    // Мгновенно только страница и JSON-данные; остальное (стили без хеша, md) — сначала сеть, как раньше.
    const instant = request.mode === 'navigate' || url.pathname.endsWith('.json');
    const saved = instant ? await fallback() : null;
    const before = saved ? saved.clone() : null;
    const network = fetch(request, {cache:'no-cache'}).then(async response => {
      if (response.ok && !response.redirected && (allowed.has(url.pathname) || request.mode === 'navigate')) {
        let changed = false;
        if (before) { try { changed = (await before.text()) !== (await response.clone().text()); } catch { changed = true; } }
        await cache.put(key, response.clone());
        if (changed) await self.clients.matchAll?.().then(list => list.forEach(client => client.postMessage({type:'FRESH_AVAILABLE'})));
      }
      return response;
    });
    event.waitUntil(network.catch(() => {}));
    if (saved) return saved;
    // Кэша ещё нет (самый первый запуск): ждём сеть не дольше WAIT_MS.
    let timer;
    const timeout = new Promise(resolve => { timer = setTimeout(() => resolve(null), WAIT_MS); });
    try {
      const response = await Promise.race([network, timeout]);
      if (response && response.status < 500) return response;
      const old = await fallback();
      if (old) {
        network.then(fresh => { if (fresh && fresh.ok) return self.clients.matchAll?.().then(list => list.forEach(client => client.postMessage({type:'FRESH_AVAILABLE'}))); }).catch(() => {});
        return old;
      }
      return response || await network;
    } catch { return await fallback() || Response.error(); }
    finally { clearTimeout(timer); }
  })());
});
