"use strict";
/* NOEON canvas: общий движок карт правил.
   Мышь: тянуть — перемещение, колесо — масштаб (после клика по карте), Ctrl/⌘ + колесо и щипок тачпада — масштаб,
   двумя пальцами по тачпаду — перемещение, двойной клик — приблизить, клавиши ← ↑ → ↓ + − 0, Esc.
   Палец: тянуть — перемещение с инерцией, щипок — масштаб и перемещение, двойной тап — приблизить.
   Карта темы отдаёт мир фиксированного размера (W×H) и сама рисует содержимое; движок сообщает о тапах (onTap). */
function noeonCanvasShell(id, label, toolsExtra = '', help = 'Тяните карту · колесо или щипок — масштаб · клик по станции — подробности') {
  return `<div class="nc" id="${id}" tabindex="0" role="application" aria-roledescription="карта" aria-label="${label}">
    <div class="nc-world"></div>
    <div class="nc-ui nc-tools">${toolsExtra}<span class="nc-zoom"><button type="button" data-nc-z="1" aria-label="Приблизить" title="Приблизить">＋</button><button type="button" data-nc-z="-1" aria-label="Отдалить" title="Отдалить">−</button><button type="button" data-nc-fit aria-label="Показать всю карту" title="Вся карта (0)">⤢</button><button type="button" data-nc-full aria-label="На весь экран" title="На весь экран"><span class="nc-full-i">⛶</span><span class="nc-full-t">На весь экран</span></button></span></div>
    <div class="nc-ui nc-mini" aria-hidden="true"><div class="nc-mini-art"></div><i class="nc-view"></i></div>
    <p class="nc-ui nc-help">${help}</p>
    <p class="nc-ui nc-toast" aria-live="polite" hidden></p>
  </div>`;
}
function initialiseNoeonCanvas(box, { W, H, signal, minK = 0.12, maxK = 1.8, margin = 160, onTap, onZoom, start }) {
  const world = box.querySelector('.nc-world'), mini = box.querySelector('.nc-mini'), viewEl = box.querySelector('.nc-view'), toast = box.querySelector('.nc-toast');
  world.style.width = W + 'px'; world.style.height = H + 'px';
  const v = { x: 0, y: 0, k: 1 };
  const isFull = () => box.classList.contains('is-full');
  const touchUI = matchMedia('(hover: none)').matches;
  let active = false, anim = 0, inertia = 0;
  const clampK = k => Math.min(maxK, Math.max(minK, k));
  // Не даём карте уехать за экран: всегда видна полоса не меньше margin.
  const clamp = () => {
    const bw = box.clientWidth, bh = box.clientHeight, mw = Math.min(margin, bw / 3), mh = Math.min(margin, bh / 3);
    v.x = Math.min(bw - mw, Math.max(mw - W * v.k, v.x)); v.y = Math.min(bh - mh, Math.max(mh - H * v.k, v.y));
  };
  const apply = () => {
    clamp();
    world.style.transform = `translate3d(${v.x}px,${v.y}px,0) scale(${v.k})`;
    onZoom?.(v.k);
    const m = mini.clientWidth / W, bw = box.clientWidth, bh = box.clientHeight;
    mini.style.height = H * m + 'px';
    viewEl.style.cssText = `left:${(-v.x / v.k) * m}px;top:${(-v.y / v.k) * m}px;width:${(bw / v.k) * m}px;height:${(bh / v.k) * m}px`;
  };
  const stop = () => { cancelAnimationFrame(anim); cancelAnimationFrame(inertia); anim = inertia = 0; };
  // Плавный переход к виду (x, y, k) по кривой ease-out; миникарта и границы обновляются на каждом кадре.
  const animateTo = (tx, ty, tk, ms = 420) => {
    stop(); const s = { ...v }, t0 = performance.now();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = now => {
      const p = reduce ? 1 : Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      v.k = s.k + (tk - s.k) * e; v.x = s.x + (tx - s.x) * e; v.y = s.y + (ty - s.y) * e; apply();
      if (p < 1) anim = requestAnimationFrame(step); else anim = 0;
    };
    anim = requestAnimationFrame(step);
  };
  const zoomAt = (cx, cy, k2, smooth = false) => {
    k2 = clampK(k2); const x = cx - (cx - v.x) * (k2 / v.k), y = cy - (cy - v.y) * (k2 / v.k);
    if (smooth) animateTo(x, y, k2, 260); else { v.x = x; v.y = y; v.k = k2; apply(); }
  };
  const fitView = () => { const bw = box.clientWidth, bh = box.clientHeight, k = clampK(Math.min(bw / W, bh / H) * 0.97); return [(bw - W * k) / 2, (bh - H * k) / 2, k]; };
  const fit = (smooth = true) => { const [x, y, k] = fitView(); if (smooth) animateTo(x, y, k); else { v.x = x; v.y = y; v.k = k; apply(); } };
  // Перелёт к точке мира; panel — сколько места справа (компьютер) или снизу (телефон) занимает карточка.
  const flyTo = (x, y, k, panel = {}) => {
    const bw = box.clientWidth - (panel.right || 0), bh = box.clientHeight - (panel.bottom || 0), k2 = clampK(k ?? Math.max(v.k, 0.9));
    animateTo(bw / 2 - x * k2, bh / 2 - y * k2, k2);
  };
  const say = (text, ms = 1600) => { toast.textContent = text; toast.hidden = false; clearTimeout(say.t); say.t = setTimeout(() => { toast.hidden = true; }, ms); };
  const setActive = on => { active = on; box.classList.toggle('is-active', on); };
  // Полный экран: карта переносится в <body>, иначе position:fixed ловят родители-контейнеры.
  const home = document.createComment('nc-home');
  const setFull = on => {
    if (on === isFull()) return;
    const cx = (box.clientWidth / 2 - v.x) / v.k, cy = (box.clientHeight / 2 - v.y) / v.k;
    if (on) { box.before(home); document.body.append(box); } else if (home.parentNode) home.replaceWith(box);
    box.classList.toggle('is-full', on); document.documentElement.classList.toggle('nc-lock', on);
    const b = box.querySelector('[data-nc-full]'); b.querySelector('.nc-full-i').textContent = on ? '✕' : '⛶'; b.querySelector('.nc-full-t').textContent = on ? 'Закрыть' : 'На весь экран';
    b.setAttribute('aria-label', on ? 'Выйти из полноэкранного режима' : 'На весь экран');
    requestAnimationFrame(() => { v.x = box.clientWidth / 2 - cx * v.k; v.y = box.clientHeight / 2 - cy * v.k; apply(); box.focus({ preventScroll: true }); setActive(true); });
    if (!on) box.scrollIntoView({ block: 'nearest' });
  };
  // Указатели: перемещение (с инерцией), щипок, тапы.
  const ptrs = new Map(); let moved = 0, downAt = 0, pinch = null, samples = [], lastTap = { t: 0, x: 0, y: 0 }, downTarget = null;
  const local = e => { const r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const pair = () => { const [a, b] = [...ptrs.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };
  box.addEventListener('pointerdown', e => {
    if (e.target.closest('.nc-ui,.nc-panel')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stop(); setActive(true);
    const p = local(e); ptrs.set(e.pointerId, p);
    if (ptrs.size === 1) { moved = 0; downAt = performance.now(); downTarget = e.target; samples = [{ ...p, t: downAt }]; }
    if (ptrs.size === 2) { pinch = pair(); moved = 99; }
  }, { signal });
  box.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    const prev = ptrs.get(e.pointerId), p = local(e); ptrs.set(e.pointerId, p);
    if (ptrs.size >= 2) {
      const q = pair();
      if (pinch) { v.x += q.mx - pinch.mx; v.y += q.my - pinch.my; zoomAt(q.mx, q.my, v.k * q.d / pinch.d); }
      pinch = q; return;
    }
    moved += Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y);
    if (moved > 6) {
      if (!box.classList.contains('is-drag')) { box.classList.add('is-drag'); try { box.setPointerCapture(e.pointerId); } catch {} }
      v.x += p.x - prev.x; v.y += p.y - prev.y; apply();
      const now = performance.now(); samples.push({ ...p, t: now }); samples = samples.filter(s => now - s.t < 90);
    }
  }, { signal });
  const end = e => {
    if (!ptrs.has(e.pointerId)) return;
    const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
    if (ptrs.size === 1) { pinch = null; const [q] = ptrs.values(); samples = [{ ...q, t: performance.now() }]; return; }
    if (ptrs.size) return;
    pinch = null; box.classList.remove('is-drag');
    if (e.type === 'pointercancel') return;
    const now = performance.now();
    if (moved <= 6 && now - downAt < 600) {
      // Тап: по объекту — сразу onTap; по пустому месту — двойной тап приближает.
      const quick = now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30;
      const onObject = downTarget?.closest?.('[data-st],a,button');
      if (!onObject && quick && e.pointerType !== 'mouse') { zoomAt(p.x, p.y, v.k * 1.8, true); lastTap.t = 0; return; }
      lastTap = { t: now, x: p.x, y: p.y };
      onTap?.({ target: downTarget, x: p.x, y: p.y, pointerType: e.pointerType });
      return;
    }
    // Инерция после броска.
    const first = samples[0], last = samples.at(-1);
    if (first && last && last.t - first.t > 10) {
      let vx = (last.x - first.x) / (last.t - first.t), vy = (last.y - first.y) / (last.t - first.t);
      if (Math.hypot(vx, vy) > 0.25 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let t = performance.now();
        const step = n => { const dt = Math.min(32, n - t); t = n; v.x += vx * dt; v.y += vy * dt; vx *= Math.pow(0.94, dt / 16); vy *= Math.pow(0.94, dt / 16); apply();
          if (Math.hypot(vx, vy) > 0.02) inertia = requestAnimationFrame(step); else inertia = 0; };
        inertia = requestAnimationFrame(step);
      }
    }
  };
  box.addEventListener('pointerup', end, { signal }); box.addEventListener('pointercancel', end, { signal });
  box.addEventListener('lostpointercapture', e => { if (ptrs.has(e.pointerId) && e.pointerType !== 'mouse') end(e); }, { signal });
  // Кнопки панели инструментов и миникарта.
  box.addEventListener('click', e => {
    const z = e.target.closest('[data-nc-z]'); if (z) { zoomAt(box.clientWidth / 2, box.clientHeight / 2, v.k * (z.dataset.ncZ > 0 ? 1.4 : 1 / 1.4), true); return; }
    if (e.target.closest('[data-nc-fit]')) { fit(); return; }
    if (e.target.closest('[data-nc-full]')) { setFull(!isFull()); return; }
    if (e.target.closest('.nc-mini')) { const r = mini.getBoundingClientRect(), m = mini.clientWidth / W; flyTo((e.clientX - r.left) / m, (e.clientY - r.top) / m, v.k); }
  }, { signal });
  box.addEventListener('dblclick', e => { if (e.target.closest('.nc-ui,.nc-panel,[data-st]')) return; const p = local(e); zoomAt(p.x, p.y, v.k * 1.8, true); }, { signal });
  // Колесо: Ctrl/⌘ или щипок тачпада — масштаб всегда; иначе только когда карта активна (клик по ней или полный экран).
  let trackpad = false;
  box.addEventListener('wheel', e => {
    if (e.target.closest('.nc-panel,.nc-results')) return;
    const pinchGesture = e.ctrlKey || e.metaKey;
    if (!pinchGesture && !active && !isFull()) { say(touchUI ? 'Коснитесь карты, чтобы управлять ею' : 'Щёлкните по карте, чтобы управлять колёсиком'); return; }
    e.preventDefault(); stop();
    if (e.deltaX) trackpad = true;
    const p = local(e), dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
    if (pinchGesture) zoomAt(p.x, p.y, v.k * Math.exp(-dy * 0.01));
    else if (!trackpad || e.deltaMode === 1) zoomAt(p.x, p.y, v.k * Math.exp(-Math.max(-120, Math.min(120, dy)) * 0.0022));
    else { v.x -= e.deltaX; v.y -= dy; apply(); }
  }, { signal, passive: false });
  // Касания: страница не должна прокручиваться и масштабироваться под пальцами.
  box.addEventListener('touchmove', e => { if (!e.target.closest('.nc-ui,.nc-panel')) e.preventDefault(); }, { signal, passive: false });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => box.addEventListener(n, e => e.preventDefault(), { signal }));
  // Активность: клик вне карты возвращает колесо странице.
  document.addEventListener('pointerdown', e => { if (!box.contains(e.target)) setActive(false); }, { signal, capture: true });
  box.addEventListener('keydown', e => {
    if (e.target.closest('input,textarea,select')) return;
    const s = 100, K = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
    if (K) { e.preventDefault(); animateTo(v.x + K[0], v.y + K[1], v.k, 200); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(box.clientWidth / 2, box.clientHeight / 2, v.k * 1.3, true); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomAt(box.clientWidth / 2, box.clientHeight / 2, v.k / 1.3, true); }
    else if (e.key === '0') { e.preventDefault(); fit(); }
    else if (e.key === 'Escape' && isFull() && !box.querySelector('.nc-panel:not([hidden])')) setFull(false);
  }, { signal });
  // Изменение размера (поворот телефона, окно, полный экран): центр остаётся на месте.
  let size = [0, 0];
  const ro = new ResizeObserver(() => {
    const bw = box.clientWidth, bh = box.clientHeight; if (!bw || !bh) return;
    if (size[0]) { v.x += (bw - size[0]) / 2; v.y += (bh - size[1]) / 2; }
    size = [bw, bh]; apply();
  });
  ro.observe(box);
  signal.addEventListener('abort', () => { stop(); ro.disconnect(); document.documentElement.classList.remove('nc-lock'); if (isFull()) { box.classList.remove('is-full'); if (home.parentNode) home.replaceWith(box); else box.remove(); } });
  const api = { v, apply, fit, flyTo, animateTo, zoomAt, say, isFull, setFull, isActive: () => active };
  box.__nc = api;
  requestAnimationFrame(() => { size = [box.clientWidth, box.clientHeight]; if (start) start({ v, apply, fit: () => fit(false), box }); else fit(false); });
  return api;
}
