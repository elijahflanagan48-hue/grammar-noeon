/* Big pan/zoom canvas map of the 12 tenses */
const TC_LINKS_H = ['+ процесс', '+ результат', '+ длительность'];
function tenseCanvasCard(row, item, i, idx) {
  const x = TENSE_EXTRA[item.name] || {}, asp = TENSE_ASPECTS[i], tip = TENSE_TIP[item.name] || '';
  const forms = [['＋', x.aff], ['−', x.neg], ['?', x.q]].filter(f => f[1]);
  return `<div class="tc-card tc-${row.time.toLowerCase()}" data-tc="${idx}" tabindex="0" aria-label="${escapeHtml(item.name)}">
    <header><span class="tc-asp">${asp.label}</span><code>${escapeHtml(item.formula)}</code></header>
    <h3>${escapeHtml(item.name)}</h3>
    <p class="tc-focus">${escapeHtml(item.focus)}</p>
    <div class="tc-body">
      <div class="tc-left"><div class="tc-tl">${tenseTimelineSvg(row.time, asp.key, true)}</div>
        <div class="tc-x"><h4>Формы</h4><div class="tc-forms" lang="en">${forms.map(f => `<div><b>${f[0]}</b><span>${escapeHtml(f[1])}</span></div>`).join('')}</div>
        <h4>Слова-маркеры</h4><p class="tc-markers">${item.markers.map(m => `<span>${escapeHtml(m)}</span>`).join('')}</p></div></div>
      <div class="tc-right">
        <h4>Когда используем</h4>
        <ul class="tc-uses">${item.uses.map((u, n) => `<li><strong>${escapeHtml(u)}</strong>${x.ru && x.ru[n] ? `<small>${escapeHtml(x.ru[n])}</small>` : ''}${(x.ex || item.examples)[n] ? `<em lang="en">${escapeHtml((x.ex || item.examples)[n])}</em>` : ''}</li>`).join('')}</ul>
        <p class="tc-trap"><b>Обратите внимание.</b> ${escapeHtml(item.trap)}</p>
        ${tip ? `<p class="tc-tip">💡 ${escapeHtml(tip)}</p>` : ''}
        ${x.vs ? `<p class="tc-vs"><b>${escapeHtml(item.name)} или ${escapeHtml(x.vs[0])}?</b> ${escapeHtml(x.vs[1])}</p>` : ''}
        <a class="tc-link" href="#theory/${row.route}/${item.anchor}">Полное правило →</a>
      </div>
    </div>
  </div>`;
}
function tenseCanvasHtml() {
  const head = TENSE_ASPECTS.map(a => `<div class="tc-colhead"><b>${a.label}</b><span>${escapeHtml(a.look)}</span></div>`).join('');
  const rows = TENSE_MAP.map((r, ri) => `<div class="tc-rowhead tc-${r.time.toLowerCase()}"><b>${r.time}</b><span>${TENSE_TIME_LABEL[r.time]}</span></div>` + r.items.map((it, i) => tenseCanvasCard(r, it, i, ri * 4 + i)).join('')).join('');
  return `<div class="tc" tabindex="0" aria-label="Большая карта времён. Перетаскивайте, масштабируйте колесом с Ctrl или щипком">
    <div class="tc-world"><svg class="tc-links" aria-hidden="true"></svg><div class="tc-grid"><span></span>${head}${rows}</div></div>
    <div class="tc-ui tc-tools"><button type="button" data-tc-z="1" aria-label="Приблизить">＋</button><button type="button" data-tc-z="-1" aria-label="Отдалить">−</button><output class="tc-pct">100%</output><button type="button" data-tc-fit aria-label="Показать всю карту" title="Вся карта">⤢</button><button type="button" data-tc-full aria-label="На весь экран" title="На весь экран">⛶</button></div>
    <div class="tc-ui tc-mini" aria-hidden="true"><i class="tc-view"></i></div>
    <p class="tc-ui tc-help">Тяните карту · Ctrl + колесо или щипок — масштаб · клик по карточке — приблизить · стрелки, + / −, 0</p>
  </div>`;
}
function initialiseTenseCanvas(root, signal) {
  const box = root.querySelector('.tc'), world = box.querySelector('.tc-world'), svg = box.querySelector('.tc-links'), mini = box.querySelector('.tc-mini'), viewEl = box.querySelector('.tc-view'), pct = box.querySelector('.tc-pct');
  const cards = [...box.querySelectorAll('.tc-card')];
  const v = { x: 0, y: 0, k: 1 }, MIN = 0.2, MAX = 1.6;
  let W = 0, H = 0, built = false, anim = false;
  const apply = () => {
    world.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`;
    box.classList.toggle('lod-low', v.k < 0.6); pct.textContent = Math.round(v.k * 100) + '%';
    if (W) { const m = mini.clientWidth / W, bw = box.clientWidth, bh = box.clientHeight;
      viewEl.style.cssText = `left:${(-v.x / v.k) * m}px;top:${(-v.y / v.k) * m}px;width:${(bw / v.k) * m}px;height:${(bh / v.k) * m}px`; }
  };
  const smooth = fn => { world.classList.add('tc-anim'); anim = true; fn(); clearTimeout(smooth.t); smooth.t = setTimeout(() => { world.classList.remove('tc-anim'); anim = false; }, 420); };
  const clampK = k => Math.min(MAX, Math.max(MIN, k));
  const zoomAt = (cx, cy, k2) => { k2 = clampK(k2); v.x = cx - (cx - v.x) * (k2 / v.k); v.y = cy - (cy - v.y) * (k2 / v.k); v.k = k2; apply(); };
  const fit = () => { const bw = box.clientWidth, bh = box.clientHeight, k = clampK(Math.min(bw / W, bh / H) * 0.96); v.k = k; v.x = (bw - W * k) / 2; v.y = (bh - H * k) / 2; apply(); };
  const fitWidth = () => { const bw = box.clientWidth, k = clampK(bw / W * 1.02); v.k = k; v.x = (bw - W * k) / 2; v.y = 8; apply(); };
  const focusCard = c => { const bw = box.clientWidth, bh = box.clientHeight, w = c.offsetWidth, h = c.offsetHeight, k = clampK(Math.min(bw / (w + 80), bh / (h + 80), 1)); v.k = k; v.x = bw / 2 - (c.offsetLeft + w / 2) * k; v.y = bh / 2 - (c.offsetTop + h / 2) * k; apply(); cards.forEach(x => x.classList.toggle('is-on', x === c)); };
  const build = () => {
    const grid = box.querySelector('.tc-grid'); W = grid.offsetWidth + 80; H = grid.offsetHeight + 80;
    world.style.width = W + 'px'; world.style.height = H + 'px'; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    const pos = c => { let x = 0, y = 0, e = c; while (e && e !== world) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: c.offsetWidth, h: c.offsetHeight }; };
    cards.forEach(c => { const p = pos(c); c.style.setProperty('--x', p.x); });
    const P = cards.map(pos); let out = '<defs><marker id="tcarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>';
    const label = (x, y, t) => `<g transform="translate(${x},${y})"><rect x="${-t.length * 3.6 - 8}" y="-11" width="${t.length * 7.2 + 16}" height="22" rx="11" class="tc-lbl"/><text text-anchor="middle" y="4">${t}</text></g>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const a = P[r * 4 + c];
      if (c < 3) { const b = P[r * 4 + c + 1], y = a.y + 70; out += `<path class="tc-arrow" d="M${a.x + a.w} ${y} H${b.x}" marker-end="url(#tcarr)"/>` + label((a.x + a.w + b.x) / 2, y - 22, TC_LINKS_H[c]); }
      if (r < 2) { const b = P[(r + 1) * 4 + c], x = a.x + a.w / 2; out += `<path class="tc-arrow" d="M${x} ${a.y + a.h} V${b.y}" marker-end="url(#tcarr)"/>` + (c === 0 ? label(x + 70, (a.y + a.h + b.y) / 2, r ? 'дальше по времени' : 'в прошлое') : ''); } }
    svg.innerHTML = out;
    const m = mini.clientWidth / W; mini.style.height = H * m + 'px';
    mini.querySelectorAll('.tc-mb').forEach(n => n.remove());
    P.forEach((p, i) => { const d = document.createElement('b'); d.className = 'tc-mb'; d.style.cssText = `left:${p.x * m}px;top:${p.y * m}px;width:${p.w * m}px;height:${p.h * m}px`; d.dataset.i = i; mini.insertBefore(d, viewEl); });
    built = true;
  };
  // Fullscreen: the map section is a CSS container (it traps position:fixed), so move the canvas to <body>.
  const home = document.createComment('tc-home');
  const setFull = on => {
    if (on === box.classList.contains('is-full')) return;
    if (on) { box.before(home); document.body.append(box); } else if (home.parentNode) { home.replaceWith(box); }
    box.classList.toggle('is-full', on); document.documentElement.classList.toggle('tc-lock', on);
    box.querySelector('[data-tc-full]').textContent = on ? '✕' : '⛶';
    setTimeout(() => { build(); smooth(fit); box.focus({ preventScroll: true }); }, 30);
  };
  // pointers: pan + pinch
  const ptrs = new Map(); let moved = 0, last = null, pinch = 0;
  box.addEventListener('pointerdown', e => { moved = 0; if (e.target.closest('.tc-ui,a,button')) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; last = { x: e.clientX, y: e.clientY }; if (ptrs.size === 2) pinch = 0; }, { signal });
  box.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), r = box.getBoundingClientRect(); if (pinch) zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, v.k * d / pinch); pinch = d; moved = 99; return; }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6) { if (!box.classList.contains('is-drag')) { box.classList.add('is-drag'); try { box.setPointerCapture(e.pointerId); } catch {} } v.x += dx; v.y += dy; apply(); }
  }, { signal });
  const end = e => { ptrs.delete(e.pointerId); if (!ptrs.size) setTimeout(() => box.classList.remove('is-drag'), 0); pinch = 0; };
  box.addEventListener('pointerup', end, { signal }); box.addEventListener('pointercancel', end, { signal });
  box.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); return; }
    const z = e.target.closest('[data-tc-z]'); if (z) { const r = box.getBoundingClientRect(); smooth(() => zoomAt(r.width / 2, r.height / 2, v.k * (z.dataset.tcZ > 0 ? 1.3 : 1 / 1.3))); return; }
    if (e.target.closest('[data-tc-fit]')) { smooth(fit); return; }
    if (e.target.closest('[data-tc-full]')) { setFull(!box.classList.contains('is-full')); return; }
    const mb = e.target.closest('.tc-mb'); if (mb) { smooth(() => focusCard(cards[+mb.dataset.i])); return; }
    if (e.target.closest('.tc-mini')) { const r = mini.getBoundingClientRect(), m = mini.clientWidth / W; v.x = box.clientWidth / 2 - ((e.clientX - r.left) / m) * v.k; v.y = box.clientHeight / 2 - ((e.clientY - r.top) / m) * v.k; smooth(apply); return; }
    const c = e.target.closest('.tc-card'); if (c && !e.target.closest('a')) { if (v.k < 0.85 || !c.classList.contains('is-on')) smooth(() => focusCard(c)); else cards.forEach(x => x.classList.toggle('is-on', x === c)); }
  }, { signal, capture: true });
  box.addEventListener('wheel', e => { e.preventDefault(); const r = box.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(e.clientX - r.left, e.clientY - r.top, v.k * Math.exp(-e.deltaY * 0.01)); else { v.x -= e.deltaX; v.y -= e.deltaY; apply(); } }, { signal, passive: false });
  box.addEventListener('dblclick', e => { if (e.target.closest('.tc-card,.tc-ui')) return; const r = box.getBoundingClientRect(); smooth(() => zoomAt(e.clientX - r.left, e.clientY - r.top, v.k * 1.5)); }, { signal });
  box.addEventListener('keydown', e => { if (e.target !== box) return; const s = 80, K = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
    if (K) { e.preventDefault(); e.stopPropagation(); smooth(() => { v.x += K[0]; v.y += K[1]; apply(); }); }
    else if (e.key === '+' || e.key === '=') smooth(() => zoomAt(box.clientWidth / 2, box.clientHeight / 2, v.k * 1.25));
    else if (e.key === '-') smooth(() => zoomAt(box.clientWidth / 2, box.clientHeight / 2, v.k / 1.25));
    else if (e.key === '0') smooth(fit); else if (e.key === 'Escape' && box.classList.contains('is-full')) { setFull(false); } }, { signal, capture: true });
  window.addEventListener('resize', () => { if (!box.closest('[hidden]')) { build(); apply(); } }, { signal });
  signal.addEventListener('abort', () => { document.documentElement.classList.remove('tc-lock'); if (box.classList.contains('is-full')) { box.classList.remove('is-full'); if (home.parentNode) home.replaceWith(box); box.remove(); } });
  return { show() { requestAnimationFrame(() => { build(); fitWidth(); box.focus({ preventScroll: true }); }); } };
}
