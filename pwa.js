"use strict";
// Apply updates automatically; defer the reload while a practice session is open.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Updates apply automatically (the worker calls skipWaiting). Reload once the new worker takes over,
    // but never in the middle of practice: wait until the learner leaves it.
    let pending = false;
    const reload = () => {
      try { const t = Number(sessionStorage.getItem('swReloadAt') || 0); if (Date.now() - t < 15000) return; sessionStorage.setItem('swReloadAt', String(Date.now())); } catch {}
      location.reload();
    };
    document.getElementById('pwa-update')?.remove();
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      document.getElementById('pwa-update')?.remove();
      if (!navigator.serviceWorker.controller) return;
      if (location.hash.startsWith('#practice')) pending = true; else reload();
    });
    window.addEventListener('hashchange', () => { if (pending && !location.hash.startsWith('#practice')) { pending = false; reload(); } });
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {updateViaCache:'none'});
      window.addEventListener('online', () => registration.update().catch(() => {}));
      document.addEventListener('visibilitychange', () => { if (!document.hidden) registration.update().catch(() => {}); });
    } catch { /* Reading the site remains available if PWA installation is unavailable. */ }
  });
}
