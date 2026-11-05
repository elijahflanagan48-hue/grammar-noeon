(() => {
  const secs = () => [...document.querySelectorAll('details.rsf-sec')];
  const openFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return false;
    const el = document.getElementById(id);
    const sec = el && (el.matches('details.rsf-sec') ? el : el.closest('details.rsf-sec'));
    if (!sec) return false;
    sec.open = true;
    requestAnimationFrame(() => sec.scrollIntoView({ block: 'start' }));
    return true;
  };
  document.addEventListener('click', event => {
    const all = event.target.closest('[data-rs-all]');
    if (all) { const open = all.dataset.rsAll === 'open'; secs().forEach(s => { s.open = open; }); return; }
    const link = event.target.closest('a[href^="#rs"]');
    if (link) {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      const sec = target && (target.matches('details.rsf-sec') ? target : target.closest('details.rsf-sec'));
      if (sec) { sec.open = true; event.preventDefault(); history.replaceState(null, '', link.getAttribute('href')); sec.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    }
  });
  window.addEventListener('hashchange', openFromHash);
  if (!openFromHash()) { const first = secs().find(s => s.id === 'rs01'); if (first) first.open = true; }
})();
