/* Нижнее меню на телефоне в духе iOS «Liquid Glass».
   Капсула и сама панель двигаются на пружинах (своя физика на requestAnimationFrame, не CSS-переходы):
   касание поднимает линзу и чуть «надувает» панель, при отпускании панель мягко подпрыгивает.
   Капсулу можно тянуть пальцем; в движении линза вытягивается по скорости. */
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav || !window.matchMedia) return;
  const mq = matchMedia('(max-width: 999px)'), still = matchMedia('(prefers-reduced-motion: reduce)');
  const pill = document.createElement('span');
  pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true');
  pill.innerHTML = '<span class="np"><i class="np-rest"></i><i class="np-lens"></i></span>';
  nav.prepend(pill);
  const wrap = pill.firstChild, rest = wrap.children[0], glass = wrap.children[1];

  // Лёгкий тактильный отклик: vibrate на Android, скрытый переключатель-switch на iOS 18+.
  const hapticBox = document.createElement('label');
  hapticBox.className = 'nav-haptic'; hapticBox.setAttribute('aria-hidden', 'true');
  hapticBox.innerHTML = '<input type="checkbox" switch tabindex="-1">';
  document.body.appendChild(hapticBox);
  const haptic = () => { try { if (navigator.vibrate) navigator.vibrate(8); else hapticBox.click(); } catch {} };

  const S = { x: 0, v: 0, tx: 0, w: 64, wv: 0, tw: 64, l: 0, lv: 0, tl: 0, s: 1, sv: 0, ts: 1 };
  let running = false, prev = 0, ready = false, last = null, drag = null, lensTimer = 0;
  const links = () => [...nav.querySelectorAll('a[href]')].filter(a => a.offsetWidth);
  const step = (p, v, t, k, c, dt) => { const a = -k * (p - t) - c * v; v += a * dt; return [p + v * dt, v]; };

  function render() {
    const stretch = Math.min(Math.abs(S.v) / 2200, 0.28);
    pill.style.transform = `translate3d(${S.x.toFixed(2)}px,0,0)`;
    pill.style.width = S.w.toFixed(2) + 'px';
    wrap.style.transform = `scale(${(1 + 0.16 * S.l + stretch).toFixed(4)},${(1 + 0.32 * S.l - stretch * 0.35).toFixed(4)})`;
    glass.style.opacity = Math.max(0, Math.min(1, S.l)).toFixed(3);
    rest.style.opacity = (1 - Math.max(0, Math.min(1, S.l)) * 0.85).toFixed(3);
    nav.style.transform = Math.abs(S.s - 1) < 0.0005 ? '' : `scale(${S.s.toFixed(4)})`;
  }
  function frame(now) {
    const dt = Math.min(0.034, (now - prev) / 1000 || 0.016); prev = now;
    for (let i = 0; i < 2; i++) {
      const h = dt / 2;
      [S.x, S.v] = step(S.x, S.v, S.tx, drag?.moved ? 900 : 330, drag?.moved ? 55 : 27, h);
      [S.w, S.wv] = step(S.w, S.wv, S.tw, 420, 40, h);
      [S.l, S.lv] = step(S.l, S.lv, S.tl, 300, 24, h);
      [S.s, S.sv] = step(S.s, S.sv, S.ts, 380, 26, h);
    }
    render();
    const calm = Math.abs(S.x - S.tx) < 0.2 && Math.abs(S.v) < 2 && Math.abs(S.w - S.tw) < 0.2 && Math.abs(S.l - S.tl) < 0.003 && Math.abs(S.lv) < 0.01 && Math.abs(S.s - S.ts) < 0.0004 && Math.abs(S.sv) < 0.003;
    if (calm) { Object.assign(S, { x: S.tx, v: 0, w: S.tw, wv: 0, l: S.tl, lv: 0, s: S.ts, sv: 0 }); render(); running = false; return; }
    requestAnimationFrame(frame);
  }
  function kick() { if (still.matches) { Object.assign(S, { x: S.tx, w: S.tw, l: S.tl, s: S.ts, v: 0, sv: 0 }); render(); return; } if (!running) { running = true; prev = performance.now(); requestAnimationFrame(frame); } }

  function aim(link, jump) {
    if (!link) return;
    S.tx = link.offsetLeft; S.tw = link.offsetWidth;
    if (jump) { S.x = S.tx; S.w = S.tw; S.v = 0; }
  }
  function pulse() { clearTimeout(lensTimer); S.tl = 1; lensTimer = setTimeout(() => { if (!drag) { S.tl = 0; kick(); } }, 230); }
  function sync() {
    if (!mq.matches) { pill.style.opacity = '0'; nav.style.transform = ''; return; }
    const current = nav.querySelector('a.current');
    pill.style.opacity = current ? '1' : '0';
    if (drag) return;
    if (!ready || !last) { aim(current, true); render(); }
    else if (current !== last) { aim(current, false); pulse(); S.sv -= 0.12; kick(); }
    else { aim(current, false); kick(); }
    last = current;
  }
  new MutationObserver(records => { if (records.some(r => !pill.contains(r.target) && r.target !== hapticBox)) sync(); })
    .observe(nav, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  addEventListener('resize', () => { if (!drag) { aim(nav.querySelector('a.current'), true); render(); } });
  mq.addEventListener?.('change', sync);
  sync(); requestAnimationFrame(() => { ready = true; });

  function nearest(clientX) {
    let best = null, gap = Infinity;
    for (const a of links()) { const r = a.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - clientX); if (d < gap) { gap = d; best = a; } }
    return best;
  }
  nav.addEventListener('dragstart', event => event.preventDefault());
  nav.addEventListener('pointerdown', event => {
    if (!mq.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const link = event.target.closest('a[href]');
    drag = { x0: event.clientX, id: event.pointerId, moved: false, link };
    clearTimeout(lensTimer);
    S.tl = 1; S.ts = 1.015;
    if (link) aim(link, false);
    haptic(); kick();
  });
  nav.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved) {
      if (Math.abs(event.clientX - drag.x0) < 8) return;
      drag.moved = true;
      try { nav.setPointerCapture(drag.id); } catch {}
    }
    const box = nav.getBoundingClientRect(), width = S.tw;
    S.tx = Math.max(4, Math.min(box.width - width - 4, event.clientX - box.left - width / 2));
    const near = nearest(event.clientX);
    if (near !== drag.near) { if (drag.near) haptic(); drag.near = near; }
    links().forEach(a => a.classList.toggle('nav-under', a === near));
    kick();
  });
  let swallow = false;
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null;
    links().forEach(a => a.classList.remove('nav-under'));
    S.ts = 1; S.sv -= 0.2;
    const current = nav.querySelector('a.current');
    if (moved) {
      swallow = true; setTimeout(() => { swallow = false; }, 400);
      const target = event.type === 'pointercancel' ? current : nearest(event.clientX);
      aim(target || current, false);
      if (target && target !== current) { last = target; location.hash = target.getAttribute('href'); haptic(); }
    } else if (event.type === 'pointercancel' || !event.target.closest('a[href]')) aim(current, false);
    clearTimeout(lensTimer); lensTimer = setTimeout(() => { S.tl = 0; kick(); }, moved ? 120 : 200);
    kick();
  }
  nav.addEventListener('pointerup', release);
  nav.addEventListener('pointercancel', release);
  nav.addEventListener('click', event => { if (swallow) { event.preventDefault(); event.stopPropagation(); swallow = false; } }, true);
})();
