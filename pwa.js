"use strict";
// Keep an update available until the learner explicitly accepts it.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    let applying = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (applying) { location.reload(); return; }
      // New worker took over on its own (skipWaiting): refresh once, but never during practice.
      try { if (!sessionStorage.getItem('swAutoReload') && !location.hash.startsWith('#practice')) { sessionStorage.setItem('swAutoReload', '1'); location.reload(); } } catch {}
    });
    function offerUpdate(registration) {
      if (!registration.waiting || !navigator.serviceWorker.controller) return;
      let notice = document.getElementById('pwa-update');
      if (notice) return;
      notice = document.createElement('div');
      notice.id = 'pwa-update'; notice.className = 'pwa-update'; notice.setAttribute('role', 'status');
      notice.innerHTML = `${escapeHtml('Доступна новая версия — ')}<button type="button">${escapeHtml('Обновить')}</button>`;
      notice.querySelector('button').addEventListener('click', () => {
        try {
          // Input events normally save this already; capture focused fields as well.
          const form = document.getElementById('answer-form');
          const session = state.session;
          if (session && form && !session.checked) {
            const submitted=getSubmitted(session.items[session.index], form);
            if(session.remote&&!session.draftConflict)rememberAccountDraft(session,submitted);else session.draft=submitted;
          }
          localStorage.setItem(storageKey('session'), JSON.stringify(session));
        } catch {
          toast('Не удалось сохранить тренировку. Обновите приложение после её завершения.');
          return;
        }
        if (!registration.waiting) return;
        applying = true;
        registration.waiting.postMessage({type:'SKIP_WAITING'});
      });
      document.body.append(notice);
    }
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {updateViaCache:'none'});
      offerUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => { if (worker.state === 'installed') offerUpdate(registration); });
      });
      window.addEventListener('online', () => registration.update().catch(() => {}));
    } catch { /* Reading the site remains available if PWA installation is unavailable. */ }
  });
}
