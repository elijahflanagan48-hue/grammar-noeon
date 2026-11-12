"use strict";
/* NOEON canvas: общий движок карт правил (перемещение, масштаб, щипок, мини-карта, полный экран, перелёт к точке).
   Карта темы отдаёт мир фиксированного размера (W×H) и сама рисует содержимое. */
function noeonCanvasShell(id, label, toolsExtra = '', help = 'Тяните карту · колесо или щипок — масштаб · клик по станции — подробности') {
  return `<div class="nc" id="${id}" tabindex="0" aria-label="${label}">
    <div class="nc-world"></div>
    <div class="nc-ui nc-tools">${toolsExtra}<span class="nc-zoom"><button type="button" data-nc-z="1" aria-label="Приблизить">＋</button><button type="button" data-nc-z="-1" aria-label="Отдалить">−</button><button type="button" data-nc-fit aria-label="Показать всю карту" title="Вся карта">⤢</button><button type="button" data-nc-full aria-label="На весь экран" title="На весь экран">⛶</button></span></div>
    <div class="nc-ui nc-mini" aria-hidden="true"><div class="nc-mini-art"></div><i class="nc-view"></i></div>
    <p class="nc-ui nc-help">${help}</p>
  </div>`;
}
function initialiseNoeonCanvas(box, { W, H, signal, minK = 0.12, maxK = 1.8, onTap, onZoom, start }) {
  const world = box.querySelector('.nc-world'), mini = box.querySelector('.nc-mini'), viewEl = box.querySelector('.nc-view');
  world.style.width = W + 'px'; world.style.height = H + 'px';
  const v = { x: 0, y: 0, k: 1 };
  const clampK = k => Math.min(maxK, Math.max(minK, k));
  const apply = () => {
    world.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`;
    onZoom?.(v.k);
    const m = mini.clientWidth / W, bw = box.clientWidth, bh = box.clientHeight;
    mini.style.height = H * m + 'px';
    viewEl.style.cssText = `left:${(-v.x / v.k) * m}px;top:${(-v.y / v.k) * m}px;width:${(bw / v.k) * m}px;height:${(bh / v.k) * m}px`;
  };
  const smooth = fn => { world.classList.add('nc-anim'); fn(); clearTimeout(smooth.t); smooth.t = setTimeout(() => world.classList.remove('nc-anim'), 480); };
  const zoomAt = (cx, cy, k2) => { k2 = clampK(k2); v.x = cx - (cx - v.x) * (k2 / v.k); v.y = cy - (cy - v.y) * (k2 / v.k); v.k = k2; apply(); };
  const fit = () => { const bw = box.clientWidth, bh = box.clientHeight, k = clampK(Math.min(bw / W, bh / H) * 0.97); v.k = k; v.x = (bw - W * k) / 2; v.y = (bh - H * k) / 2; apply(); };
  // Перелёт к точке мира; panel — сколько пикселей справа (или снизу на телефоне) занято карточкой.
  const flyTo = (x, y, k, panel = {}) => {
    const bw = box.clientWidth - (panel.right || 0), bh = box.clientHeight - (panel.bottom || 0);
    smooth(() => { v.k = clampK(k ?? Math.max(v.k, 0.9)); v.x = bw / 2 - x * v.k; v.y = bh / 2 - y * v.k; apply(); });
  };
  const home = document.createComment('nc-home');
  const setFull = on => {
    if (on === box.classList.contains('is-full')) return;
    if (on) { box.before(home); document.body.append(box); } else if (home.parentNode) home.replaceWith(box);
    box.classList.toggle('is-full', on); document.documentElement.classList.toggle('nc-lock', on);
    box.querySelector('[data-nc-full]').textContent = on ? '✕' : '⛶';
    setTimeout(() => { apply(); box.focus({ preventScroll: true }); }, 30);
  };
  const ptrs = new Map(); let moved = 0, pinch = 0;
  box.addEventListener('pointerdown', e => { moved = 0; if (e.target.closest('.nc-ui,.nc-panel')) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.size === 2) pinch = 0; }, { signal });
  box.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), r = box.getBoundingClientRect(); if (pinch) zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, v.k * d / pinch); pinch = d; moved = 99; return; }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6) { if (!box.classList.contains('is-drag')) { box.classList.add('is-drag'); try { box.setPointerCapture(e.pointerId); } catch {} } v.x += dx; v.y += dy; apply(); }
  }, { signal });
  const end = e => { ptrs.delete(e.pointerId); if (!ptrs.size) setTimeout(() => box.classList.remove('is-drag'), 0); pinch = 0; };
  box.addEventListener('pointerup', end, { signal }); box.addEventListener('pointercancel', end, { signal });
  box.addEventListener('click', e => {
    if (moved > 6 && !e.target.closest('.nc-ui,.nc-panel')) { e.preventDefault(); e.stopPropagation(); return; }
    const z = e.target.closest('[data-nc-z]'); if (z) { const r = box.getBoundingClientRect(); smooth(() => zoomAt(r.width / 2, r.height / 2, v.k * (z.dataset.ncZ > 0 ? 1.35 : 1 / 1.35))); return; }
    if (e.target.closest('[data-nc-fit]')) { smooth(fit); return; }
    if (e.target.closest('[data-nc-full]')) { setFull(!box.classList.contains('is-full')); return; }
    if (e.target.closest('.nc-mini')) { const r = mini.getBoundingClientRect(), m = mini.clientWidth / W; flyTo((e.clientX - r.left) / m, (e.clientY - r.top) / m, v.k); return; }
    if (!e.target.closest('.nc-ui,.nc-panel')) onTap?.(e);
  }, { signal, capture: true });
  box.addEventListener('touchmove', e => { if (!e.target.closest('.nc-ui,.nc-panel')) e.preventDefault(); }, { signal, passive: false });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => box.addEventListener(n, e => e.preventDefault(), { signal }));
  box.addEventListener('wheel', e => {
    if (e.target.closest('.nc-panel,.nc-results')) return;
    e.preventDefault(); const r = box.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 40 && !e.deltaX && e.deltaMode === 0 && !box.classList.contains('nc-trackpad')) zoomAt(e.clientX - r.left, e.clientY - r.top, v.k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0022)));
    else { if (e.deltaX) box.classList.add('nc-trackpad'); v.x -= e.deltaX; v.y -= e.deltaY; apply(); }
  }, { signal, passive: false });
  box.addEventListener('dblclick', e => { if (e.target.closest('.nc-ui,.nc-panel,[data-st]')) return; const r = box.getBoundingClientRect(); smooth(() => zoomAt(e.clientX - r.left, e.clientY - r.top, v.k * 1.6)); }, { signal });
  box.addEventListener('keydown', e => {
    if (e.target.closest('input,textarea')) return;
    const s = 90, K = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
    if (K) { e.preventDefault(); smooth(() => { v.x += K[0]; v.y += K[1]; apply(); }); }
    else if (e.key === '+' || e.key === '=') smooth(() => zoomAt(box.clientWidth / 2, box.clientHeight / 2, v.k * 1.25));
    else if (e.key === '-') smooth(() => zoomAt(box.clientWidth / 2, box.clientHeight / 2, v.k / 1.25));
    else if (e.key === '0') smooth(fit);
    else if (e.key === 'Escape' && box.classList.contains('is-full') && !box.querySelector('.nc-panel:not([hidden])')) setFull(false);
  }, { signal });
  window.addEventListener('resize', () => apply(), { signal });
  signal.addEventListener('abort', () => { document.documentElement.classList.remove('nc-lock'); if (box.classList.contains('is-full')) { box.classList.remove('is-full'); if (home.parentNode) home.replaceWith(box); else box.remove(); } });
  requestAnimationFrame(() => { if (start) start({ v, apply, fit, box }); else fit(); });
  return { v, apply, fit, flyTo, smooth, zoomAt, isFull: () => box.classList.contains('is-full') };
}
