/* Нижнее меню на телефоне: стеклянная «капсула» под текущей вкладкой.
   При переходе она на миг становится линзой и перетекает к новой вкладке; её можно тянуть пальцем. */
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav || !window.matchMedia) return;
  const mq = matchMedia('(max-width: 999px)'), still = matchMedia('(prefers-reduced-motion: reduce)');
  const pill = document.createElement('span');
  pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true'); pill.innerHTML = '<i></i>';
  nav.prepend(pill);
  let last = null, settle = 0, drag = null, swallowClick = false;
  const links = () => [...nav.querySelectorAll('a[href]')].filter(a => a.offsetWidth);
  const lens = on => { clearTimeout(settle); nav.classList.add('nav-moving'); if (!on) settle = setTimeout(() => nav.classList.remove('nav-moving'), still.matches ? 0 : 480); };
  function place(link, animate) {
    if (!mq.matches || !link || !link.offsetWidth) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = link.offsetWidth + 'px';
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    if (animate) lens(false);
  }
  function sync() {
    if (drag?.moved) return;
    const current = nav.querySelector('a.current');
    place(current, nav.classList.contains('nav-ready') && last && current !== last);
    last = current;
  }
  new MutationObserver(records => { if (records.some(r => r.target !== pill && !pill.contains(r.target))) sync(); })
    .observe(nav, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  addEventListener('resize', () => place(nav.querySelector('a.current'), false));
  mq.addEventListener?.('change', () => place(nav.querySelector('a.current'), false));
  sync();
  requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add('nav-ready')));

  nav.addEventListener('dragstart', event => event.preventDefault());
  nav.addEventListener('pointerdown', event => {
    if (!mq.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag = { x0: event.clientX, id: event.pointerId, moved: false };
  });
  nav.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved) {
      if (Math.abs(event.clientX - drag.x0) < 10) return;
      drag.moved = true;
      try { nav.setPointerCapture(drag.id); } catch {}
      nav.classList.add('nav-dragging'); lens(true);
    }
    const box = nav.getBoundingClientRect(), width = pill.offsetWidth;
    const x = Math.max(4, Math.min(box.width - width - 4, event.clientX - box.left - width / 2));
    pill.style.transform = `translateX(${x}px)`;
    const near = nearest(event.clientX);
    links().forEach(a => a.classList.toggle('nav-under', a === near));
  });
  function nearest(clientX) {
    let best = null, gap = Infinity;
    for (const a of links()) { const r = a.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - clientX); if (d < gap) { gap = d; best = a; } }
    return best;
  }
  function finish(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null;
    if (!moved) return;
    nav.classList.remove('nav-dragging');
    links().forEach(a => a.classList.remove('nav-under'));
    swallowClick = true; setTimeout(() => { swallowClick = false; }, 400);
    const target = event.type === 'pointercancel' ? null : nearest(event.clientX);
    const current = nav.querySelector('a.current');
    if (target && target !== current) { place(target, true); last = target; location.hash = target.getAttribute('href'); }
    else place(current, true);
  }
  nav.addEventListener('pointerup', finish);
  nav.addEventListener('pointercancel', finish);
  nav.addEventListener('click', event => { if (swallowClick) { event.preventDefault(); event.stopPropagation(); swallowClick = false; } }, true);
})();
