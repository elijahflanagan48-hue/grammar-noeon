/* Нижнее меню на телефоне в духе iOS «Liquid Glass».
   Все движения идут через Web Animations с пружинной кривой linear(): браузер проигрывает их на
   композиторе, поэтому анимация не «заедает», даже когда в этот момент перерисовывается страница.
   Касание поднимает прозрачную линзу и чуть «надувает» панель, отпускание даёт мягкий отскок.
   Капсулу можно тянуть пальцем. */
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav || !window.matchMedia || !Element.prototype.animate) return;
  const mq = matchMedia('(max-width: 999px)'), still = matchMedia('(prefers-reduced-motion: reduce)');
  const pill = document.createElement('span');
  pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true');
  pill.innerHTML = '<span class="nps"><span class="np"><i class="np-rest"></i><i class="np-lens"></i></span></span>';
  nav.prepend(pill);
  const stretchBox = pill.firstChild, wrap = stretchBox.firstChild, rest = wrap.children[0], glass = wrap.children[1];

  const hapticBox = document.createElement('label');
  hapticBox.className = 'nav-haptic'; hapticBox.setAttribute('aria-hidden', 'true');
  hapticBox.innerHTML = '<input type="checkbox" switch tabindex="-1">';
  document.body.appendChild(hapticBox);
  const haptic = () => { try { if (navigator.vibrate) navigator.vibrate(8); else hapticBox.click(); } catch {} };

  // Пружина k/c → кривая linear(...) и длительность, пока движение не затихнет.
  const hasLinear = !!(window.CSS && CSS.supports && CSS.supports('animation-timing-function', 'linear(0, 1)'));
  function spring(k, c) {
    let x = 0, v = 0, t = 0; const points = [0], dt = 1 / 600;
    while (t < 2) {
      for (let i = 0; i < 10; i++) { v += (-k * (x - 1) - c * v) * dt; x += v * dt; t += dt; }
      points.push(+x.toFixed(4));
      if (t > 0.2 && Math.abs(1 - x) < 0.0015 && Math.abs(v) < 0.02) break;
    }
    points[points.length - 1] = 1;
    return { duration: Math.round(t * 1000), easing: hasLinear ? `linear(${points.join(', ')})` : 'cubic-bezier(.3,1.2,.45,1)' };
  }
  const MOVE = spring(440, 36), LENS = spring(560, 38), BAR = spring(420, 28);
  const run = (el, frames, curve, extra) => still.matches ? null : el.animate(frames, { duration: curve.duration, easing: curve.easing, ...extra });
  const matrix = el => { const t = getComputedStyle(el).transform; return !t || t === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(t); };

  let targetX = null, lensOn = false, last = null, drag = null, lensTimer = 0, pressAnim = null, swallow = false;
  const links = () => [...nav.querySelectorAll('a[href]')].filter(a => a.offsetWidth);

  function moveTo(link, animate, fromX) {
    if (!link) return;
    pill.style.width = link.offsetWidth + 'px';
    const x = link.offsetLeft;
    if (targetX !== null && Math.abs(x - targetX) < 0.5 && fromX === undefined) return;
    const from = fromX ?? matrix(pill).m41;
    pill.getAnimations().forEach(a => a.cancel());
    pill.style.transform = `translate3d(${x}px,0,0)`;
    targetX = x;
    if (!animate || Math.abs(from - x) < 0.5) return;
    run(pill, [{ transform: `translate3d(${from}px,0,0)` }, { transform: `translate3d(${x}px,0,0)` }], MOVE);
    const pull = Math.min(0.22, Math.abs(from - x) / 900);
    stretchBox.getAnimations().forEach(a => a.cancel());
    if (pull > 0.02) run(stretchBox, [{ transform: 'scale(1,1)' }, { transform: `scale(${1 + pull},${1 - pull * 0.45})`, offset: 0.28 }, { transform: 'scale(1,1)' }], { duration: Math.round(MOVE.duration * 0.6), easing: 'ease-out' });
  }
  function lens(on) {
    if (on === lensOn) return; lensOn = on;
    const m = matrix(wrap), gFrom = getComputedStyle(glass).opacity, rFrom = getComputedStyle(rest).opacity;
    const to = on ? 'scale(1.16,1.32)' : 'scale(1,1)', gTo = on ? '1' : '0', rTo = on ? '0.15' : '1';
    [wrap, glass, rest].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    wrap.style.transform = to; glass.style.opacity = gTo; rest.style.opacity = rTo;
    run(wrap, [{ transform: `scale(${m.a},${m.d})` }, { transform: to }], LENS);
    run(glass, [{ opacity: gFrom }, { opacity: gTo }], { duration: 130, easing: 'ease-out' });
    run(rest, [{ opacity: rFrom }, { opacity: rTo }], { duration: 130, easing: 'ease-out' });
  }
  function lensPulse(ms) { clearTimeout(lensTimer); lens(true); lensTimer = setTimeout(() => { if (!drag) lens(false); }, ms); }
  function press() { pressAnim?.cancel(); pressAnim = run(nav, [{ transform: 'scale(1)' }, { transform: 'scale(1.012)' }], LENS, { fill: 'forwards' }); }
  function bounce() {
    const from = matrix(nav).a; pressAnim?.cancel(); pressAnim = null;
    run(nav, [{ transform: `scale(${Math.max(from, 1.008)})` }, { transform: 'scale(1)' }], BAR);
  }

  function sync() {
    if (!mq.matches) { pill.style.opacity = '0'; return; }
    const current = nav.querySelector('a.current');
    pill.style.opacity = current ? '1' : '0';
    if (drag || !current) { last = current; return; }
    const changed = last && current !== last;
    moveTo(current, changed);
    if (changed && !lensOn) lensPulse(170);
    last = current;
  }
  new MutationObserver(records => { if (records.some(r => !pill.contains(r.target))) sync(); })
    .observe(nav, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  addEventListener('resize', () => { targetX = null; const c = nav.querySelector('a.current'); if (c && mq.matches) moveTo(c, false); });
  mq.addEventListener?.('change', () => { targetX = null; sync(); });
  sync();

  function nearest(clientX) {
    let best = null, gap = Infinity;
    for (const a of links()) { const r = a.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - clientX); if (d < gap) { gap = d; best = a; } }
    return best;
  }
  const go = href => requestAnimationFrame(() => { location.hash = href; });

  nav.addEventListener('dragstart', event => event.preventDefault());
  nav.addEventListener('pointerdown', event => {
    if (!mq.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag = { x0: event.clientX, id: event.pointerId, moved: false };
    clearTimeout(lensTimer); lens(true); press(); haptic();
  });
  nav.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved) {
      if (Math.abs(event.clientX - drag.x0) < 8) return;
      drag.moved = true;
      try { nav.setPointerCapture(drag.id); } catch {}
      pill.getAnimations().forEach(a => a.cancel());
    }
    const box = nav.getBoundingClientRect(), width = pill.offsetWidth;
    const x = Math.max(4, Math.min(box.width - width - 4, event.clientX - box.left - width / 2));
    pill.style.transform = `translate3d(${x}px,0,0)`; drag.x = x; targetX = null;
    const near = nearest(event.clientX);
    if (near !== drag.near) { if (drag.near) haptic(); drag.near = near; links().forEach(a => a.classList.toggle('nav-under', a === near)); }
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const d = drag; drag = null;
    links().forEach(a => a.classList.remove('nav-under'));
    bounce();
    const current = nav.querySelector('a.current');
    if (d.moved) {
      swallow = true; setTimeout(() => { swallow = false; }, 400);
      const target = (event.type === 'pointercancel' ? current : nearest(event.clientX)) || current;
      moveTo(target, true, d.x);
      if (target && target !== current) { last = target; haptic(); go(target.getAttribute('href')); }
      lensPulse(100);
    } else lensPulse(150);
  }
  nav.addEventListener('pointerup', release);
  nav.addEventListener('pointercancel', release);
  nav.addEventListener('click', event => {
    if (swallow) { event.preventDefault(); event.stopPropagation(); swallow = false; return; }
    const link = event.target.closest('a[href]');
    if (!link || !mq.matches || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    const current = nav.querySelector('a.current');
    if (link !== current) { moveTo(link, true); last = link; }
    go(link.getAttribute('href'));
  }, true);
})();
