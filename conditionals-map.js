"use strict";
/* Карта правила Conditionals: «Зазеркалье» на движке noeon-canvas.js. Данные — conditionals-map-data.js.
   Сверху — мир «если бы», снизу — реальный мир, слева направо — время. Между мирами зеркало с лифтами
   «шаг назад»: так глагол меняет форму, когда условие становится нереальным. */
const CDM_COL_W = 1260, CDM_GAP = 120, CDM_X0 = 1060, CDM_CHIP_H = 100, CDM_ROW = 116, CDM_HEAD = 176, CDM_ZGAP = 64;
const cdmColX = c => CDM_X0 + c * (CDM_COL_W + CDM_GAP);
const CDM_WORLD = { u: 'Изнанка', r: 'Реальность' };
const CDM_GAMECAT = { zero: 'Всегда так', first: 'Реальное будущее', second: 'Если бы: сейчас / будущее', third: 'Если бы: прошлое', mixed: 'Смешанное' };

// Ссылка «Подробно в правиле»: конструкции wish, would rather и т. п. живут в своих разделах, даже если на карте стоят в районе по времени.
function cdmRefFor(name) {
  if (/^(wish|if only)/i.test(name)) return 'cd-wish';
  if (/rather|it’s time|it’s high|as if|prefer/i.test(name)) return 'cd-unreal';
  if (/imagine|suppose|What if/i.test(name)) return 'cd-conj';
  if (/weren’t for|without|but for|^I would have…|^I wouldn’t|^It would be/i.test(name)) return 'cd-implied';
  if (/were to/i.test(name)) return 'cd-second';
  return '';
}
function cdmLayout() {
  const items = [], zones = [], W = cdmColX(4);
  const chipW = (CDM_COL_W - 60 - 24) / 2;
  const place = (world, top) => {
    const bottoms = [];
    for (let c = 0; c < 4; c++) {
      let y = top + 44;
      CDM_DISTRICTS.filter(d => d.world === world && d.col === c).forEach(d => {
        const x = cdmColX(c), rows = Math.ceil(d.chips.length / 2), h = CDM_HEAD + rows * CDM_ROW + 30;
        const z = { ...d, x, y, w: CDM_COL_W, h }; zones.push(z);
        d.chips.forEach((r, i) => {
          const [name, pat, mean, e1, t1, e2, t2, check, note = '', game = ''] = r;
          items.push({ id: 'c' + items.length, kind: 'chip', zone: d.key, zoneTitle: d.title, world, col: c, ref: d.key === 'traps' ? d.ref : cdmRefFor(name) || d.ref,
            game: game === '-' || d.game === '-' ? '' : game || d.game,
            x: x + 30 + (i % 2) * (chipW + 24), y: y + CDM_HEAD + Math.floor(i / 2) * CDM_ROW, w: chipW, h: CDM_CHIP_H,
            name, pat, mean, ex: [[e1, t1], [e2, t2]].filter(e => e[0]), check, note, trap: d.key === 'traps' });
        });
        y += h + CDM_ZGAP;
      });
      bottoms.push(y);
    }
    return bottoms;
  };
  const UY = 430, ub = place('u', UY), UB = Math.max(...ub) - CDM_ZGAP + 44;
  const MY = UB + 40, MH = 330, RY = MY + MH + 40, rb = place('r', RY), RB = Math.max(...rb) - CDM_ZGAP + 44;
  // свободные места в верхнем мире: легенда и компас
  const extras = [{ kind: 'legend', col: 2, y: ub[2], x: cdmColX(2) }, { kind: 'compass', col: 3, y: ub[3], x: cdmColX(3) }]
    .map(e => ({ ...e, w: CDM_COL_W, h: UB - 44 - e.y })).filter(e => e.h > 420);
  const lifts = CDM_LIFTS.map((l, i) => ({ ...l, id: 'l' + i, kind: 'lift', x: cdmColX(l.col) + CDM_COL_W / 2 - 300, y: MY + 46, w: 600, h: MH - 92 }));
  return { items, zones, lifts, extras, W, H: RB + 120, UY, UB, MY, MH, RY, RB };
}
const CDM = cdmLayout();

/* ---------- отрисовка ---------- */
function cdmEsc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function cdmSolved(t) { return cdmEsc(t).replace(/\[([^|\]]+)(?:\|[^\]]*)?\]/g, '<b>$1</b>'); }
function cdmMarked(t) { return cdmEsc(t).replace(/\[\[([^\]]+)\]\]/g, '<mark>$1</mark>'); }
const cdmPlain = t => t.replace(/\[\[|\]\]/g, '');
function cdmFit(text, max, big) { return text.length > max * 1.25 ? Math.round(big * 0.72) : text.length > max ? Math.round(big * 0.85) : big; }
function cdmClip(text, max) { return text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, '') + ' …' : text; }
function cdmChip(it) {
  const fsN = cdmFit(it.name, 26, 32), pat = cdmClip(it.pat, 44);
  return `<g class="cdm-st cdm-chip cdm-z-${it.zone}${it.trap ? ' cdm-trap' : ''}" data-st="${it.id}" tabindex="-1"><rect class="cdm-tag" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="20"/><rect class="cdm-stripe" x="${it.x}" y="${it.y}" width="12" height="${it.h}" rx="6"/>
    <text class="cdm-tn" x="${it.x + 34}" y="${it.y + 44}" font-size="${fsN}">${cdmEsc(it.name)}</text><text class="cdm-tp" x="${it.x + 34}" y="${it.y + 80}">${cdmEsc(pat)}</text></g>`;
}
function cdmZone(z) {
  return `<g class="cdm-zone cdm-z-${z.key}"><rect class="cdm-zr" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="40"/>
    <text class="cdm-zi" x="${z.x + 36}" y="${z.y + 106}">${z.icon}</text><text class="cdm-zt" x="${z.x + 134}" y="${z.y + 98}">${cdmEsc(z.title)}</text>
    <text class="cdm-zs" x="${z.x + 136}" y="${z.y + 144}">${cdmEsc(z.sub)}</text></g>`;
}
function cdmLift(l) {
  const cx = l.x + l.w / 2;
  return `<g class="cdm-st cdm-lift" data-st="${l.id}" tabindex="-1"><rect class="cdm-cab" x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="30"/>
    <path class="cdm-door" d="M${cx} ${l.y + 18}V${l.y + l.h - 18}"/>
    <text class="cdm-lh" x="${cx}" y="${l.y + 58}" text-anchor="middle">⇧ лифт · ${cdmEsc(l.title.toLowerCase())}</text>
    <text class="cdm-ls" x="${cx}" y="${l.y + 128}" text-anchor="middle">${cdmEsc(l.shift)}</text>
    <text class="cdm-lsub" x="${cx}" y="${l.y + 180}" text-anchor="middle">${cdmEsc(l.sub)}</text></g>`;
}
function cdmMirror() {
  const { W, MY, MH, UB, RY } = CDM;
  const glare = Array.from({ length: 26 }, (_, i) => `<path d="M${i * 240 - 60} ${MY + MH}L${i * 240 + 120} ${MY}"/>`).join('');
  const rails = CDM.lifts.map(l => { const cx = l.x + l.w / 2; return `<path d="M${cx - 220} ${UB - 40}V${RY + 40}M${cx + 220} ${UB - 40}V${RY + 40}"/>`; }).join('');
  const tx = cdmColX(3) + 40;
  return `<g class="cdm-mirror"><rect class="cdm-glass" x="40" y="${MY}" width="${W - 80}" height="${MH}" rx="56"/><g class="cdm-glare">${glare}</g>
    <g class="cdm-rails">${rails}</g>
    <text class="cdm-mt" x="${tx}" y="${MY + 120}">Зеркало</text>
    <text class="cdm-ms" x="${tx}" y="${MY + 178}">Наверх — шаг назад во времени:</text>
    <text class="cdm-ms" x="${tx}" y="${MY + 222}">is → were · will → would · did → had done.</text>
    <text class="cdm-ms2" x="${tx}" y="${MY + 268}">Нажмите на лифт.</text></g>`;
}
function cdmBridges() {
  // Пиктограмма моста в шапке района «Мосты»: две арки — «тогда → сейчас» и «всегда → тогда».
  const m = CDM.zones.find(z => z.key === 'mixed'); if (!m) return '';
  const x0 = m.x + m.w - 470, x1 = m.x + m.w - 50, y = m.y + 140, mid = (x0 + x1) / 2;
  return `<g class="cdm-bridges"><path class="cdm-br" d="M${x0} ${y}Q${mid} ${y - 150} ${x1} ${y}"/><path class="cdm-br cdm-br2" d="M${x0 + 40} ${y}Q${mid} ${y - 90} ${x1 - 40} ${y}"/>
    <path class="cdm-pier" d="M${x0 + 90} ${y - 52}V${y}M${mid} ${y - 75}V${y}M${x1 - 90} ${y - 52}V${y}"/><path class="cdm-deck" d="M${x0 - 10} ${y}H${x1 + 10}"/></g>`;
}
function cdmExtra(e) {
  const x = e.x, y = e.y, w = e.w;
  if (e.kind === 'legend') {
    const rows = [['u', 'Изнанка — мир «если бы»: этого нет, не было или вряд ли будет'], ['r', 'Реальность: правда или может случиться'], ['mixed', 'Мосты: условие и результат в разное время'], ['gates', 'Шлагбаумы и тропы: условие без if'], ['traps', 'Трещины: частые ошибки']];
    return `<g class="cdm-legend"><rect x="${x}" y="${y}" width="${w}" height="${e.h}" rx="40"/><text class="cdm-lgh" x="${x + 44}" y="${y + 92}">Как читать карту</text>
      ${rows.map(([k, t], i) => `<rect class="cdm-lgk cdm-k-${k}" x="${x + 44}" y="${y + 136 + i * 66}" width="40" height="40" rx="12"/><text class="cdm-lgt" x="${x + 104}" y="${y + 166 + i * 66}">${cdmEsc(t)}</text>`).join('')}
      <text class="cdm-lgt cdm-lgm" x="${x + 44}" y="${y + 136 + rows.length * 66 + 50}">Слева направо — время: прошлое, сейчас, будущее, всегда.</text></g>`;
  }
  const steps = [['Это правда или может случиться?', 'да → реальный мир · нет → мир «если бы»'], ['Когда?', 'всегда · сейчас · будущее · прошлое'], ['Условие и результат в одно время?', 'нет → мост (смешанное)'], ['Официальный текст?', 'да → парадный подъезд']];
  return `<g class="cdm-legend cdm-compass"><rect x="${x}" y="${y}" width="${w}" height="${e.h}" rx="40"/><text class="cdm-lgh" x="${x + 44}" y="${y + 92}">🧭 Компас</text>
    ${steps.map(([q, a], i) => `<circle class="cdm-cn" cx="${x + 72}" cy="${y + 168 + i * 112}" r="28"/><text class="cdm-cnt" x="${x + 72}" y="${y + 180 + i * 112}" text-anchor="middle">${i + 1}</text><text class="cdm-cq" x="${x + 124}" y="${y + 166 + i * 112}">${cdmEsc(q)}</text><text class="cdm-lgt" x="${x + 124}" y="${y + 206 + i * 112}">${cdmEsc(a)}</text>`).join('')}</g>`;
}
// Крупные названия миров на левом поле карты.
const CDM_SIDE = {
  u: { icon: '🪞', name: 'Изнанка', lines: ['мир «если бы»:', 'этого нет, не было', 'или вряд ли будет'] },
  r: { icon: '🌍', name: 'Реальность', lines: ['это правда', 'или может случиться'] },
};
function cdmSide(w, top, bottom) {
  const d = CDM_SIDE[w], x = 120, cy = (top + bottom) / 2, y0 = cy - 150;
  return `<g class="cdm-side cdm-side-${w}"><text class="cdm-side-ic" x="${x}" y="${y0}">${d.icon}</text>
    <text class="cdm-side-h" x="${x}" y="${y0 + 170}">${cdmEsc(d.name)}</text>
    ${d.lines.map((l, i) => `<text class="cdm-side-t" x="${x + 4}" y="${y0 + 250 + i * 58}">${cdmEsc(l)}</text>`).join('')}
    <path class="cdm-side-ar" d="M${x + 4} ${w === 'u' ? y0 + 250 + d.lines.length * 58 + 30 : y0 - 160}v90" /></g>`;
}
function conditionalsMapSvg() {
  const { W, H, UY, UB, RY, RB } = CDM;
  const fascia = `<g class="cdm-fascia"><rect x="${CDM_X0}" y="60" width="${W - CDM_X0 - 120}" height="200" rx="44"/>
    <text class="cdm-fa-ic" x="${CDM_X0 + 52}" y="196">🪞</text><text class="cdm-fa-h" x="${CDM_X0 + 196}" y="190">Зазеркалье условий</text>
    <text class="cdm-fa-t" x="${W - 180}" y="146" text-anchor="end">Внизу — реальный мир, вверху — мир «если бы».</text>
    <text class="cdm-fa-t" x="${W - 180}" y="192" text-anchor="end">Подняться через зеркало = сделать шаг назад во времени.</text></g>`;
  const times = CDM_TIMES.map((t, c) => `<g class="cdm-time"><rect x="${cdmColX(c)}" y="296" width="${CDM_COL_W}" height="96" rx="48"/><text x="${cdmColX(c) + CDM_COL_W / 2}" y="362" text-anchor="middle">${c === 0 ? '← ' : ''}${t}${c === 2 ? ' →' : c === 3 ? ' ∞' : ''}</text></g>`).join('');
  const bands = `<rect class="cdm-sky" x="40" y="${UY}" width="${W - 80}" height="${UB - UY}" rx="56"/><rect class="cdm-ground" x="40" y="${RY}" width="${W - 80}" height="${RB - RY}" rx="56"/>
    <g class="cdm-stars">${Array.from({ length: 70 }, (_, i) => `<circle cx="${(i * 733) % (W - 200) + 100}" cy="${UY + 30 + (i * 397) % (UB - UY - 60)}" r="${3 + (i % 3) * 2}"/>`).join('')}</g>
    <g class="cdm-cols">${[1, 2, 3].map(c => `<path d="M${cdmColX(c) - CDM_GAP / 2} ${UY + 30}V${UB - 30}M${cdmColX(c) - CDM_GAP / 2} ${RY + 30}V${RB - 30}"/>`).join('')}</g>
    ${cdmSide('u', UY, UB)}${cdmSide('r', RY, RB)}`;
  const body = CDM.items.map(cdmChip).join('');
  return `<svg class="cdm-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Карта правила: Conditionals, Зазеркалье условий">${fascia}${times}${bands}${cdmMirror()}${CDM.zones.map(cdmZone).join('')}${cdmBridges()}${CDM.extras.map(cdmExtra).join('')}${CDM.lifts.map(cdmLift).join('')}${body}</svg>`;
}
function conditionalsMapHtml() {
  const modes = `<span class="cdm-modes" role="group" aria-label="Режим карты">${[['all', '👁', 'Всё'], ['lift', '⇅', 'Шаг назад'], ['game', '🎮', 'Игры']].map(([m, i, t], n) => `<button type="button" data-cdm-mode="${m}" aria-pressed="${!n}" title="${t}"><i aria-hidden="true">${i}</i><span>${t}</span></button>`).join('')}</span>`;
  const search = `<label class="cdm-search"><span class="sr-only">Найти конструкцию на карте</span><i class="cdm-s-ic" aria-hidden="true">🔍</i><input type="search" placeholder="Найти: wish, unless, если бы…" autocomplete="off" spellcheck="false"><span class="nc-results cdm-results" hidden></span></label>`;
  return `<section class="cdm-wrap" id="cd-mirror" aria-labelledby="cdm-title">
    <div class="cdm-head"><div><p class="eyebrow">Карта правила</p><h2 id="cdm-title">Зазеркалье условий</h2><p>Внизу реальность, вверху её изнанка — мир «если бы». Слева направо идёт время. Нажмите на конструкцию, чтобы увидеть схему, примеры и проверить себя, или на лифт в зеркале — как глагол меняет форму.</p></div>
      <ul class="cdm-key"><li class="cdm-k-r">реально</li><li class="cdm-k-u">если бы</li><li class="cdm-k-mixed">смешанное</li><li class="cdm-k-gates">без if</li><li class="cdm-k-traps">ловушки</li></ul></div>
    ${noeonCanvasShell('cdm-canvas', 'Карта правила «Зазеркалье условий». Перетаскивайте, масштабируйте колесом или щипком', search + modes, 'Тяните карту · колесо или щипок — масштаб · нажмите на конструкцию или лифт')}
  </section>`;
}

/* ---------- карточки ---------- */
function cdmShuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function cdmCheck(text) {
  const m = text && text.match(/\[([^\]]+)\]/); if (!m) return '';
  const opts = m[1].split('|');
  return `<div class="cdm-check"><p class="cdm-ch-h">Проверьте себя</p><p class="cdm-ch-q">${cdmEsc(text.replace(m[0], '___')).replace('___', '<span class="cdm-gap">___</span>')}</p><div class="cdm-ch-o">${cdmShuffle(opts).map(o => `<button type="button"${o === opts[0] ? ' data-ok' : ''}>${cdmEsc(o)}</button>`).join('')}</div></div>`;
}
function cdmWhere(it) { return `${CDM_WORLD[it.world]} · ${CDM_TIMES[it.col].toLowerCase()}`; }
// Exercise filters are independent of rule text and the map's examples.
function cdmPracticeTarget(it) {
  const tags = {
    'would have done':'cd_third_form','could have done':'cd_third_could_might','might have done':'cd_third_could_might',
    '’d = had / would':'cd_third_contracted','wish + had done':'cd_wish_past_perfect','if only + had done':'cd_if_only',
    'wish + could have done':'cd_wish_could','would rather sb had done':'cd_would_rather','would rather have done':'cd_would_rather',
    'as if + had done':'cd_as_if','What if … had done?':'cd_what_if',
    'had done → would do':'cd_mixed_past_present','had done → would be doing':'cd_mixed_past_present',
    'did → would have done':'cd_mixed_present_past','were → would have done':'cd_mixed_present_past','could → would have done':'cd_mixed_present_past',
    'would do':'cd_second_would','If I were you':'cd_second_if_i_were_you','were / was':'cd_second_were',
    'could do':'cd_second_could_might','might do':'cd_second_could_might','if + could':'cd_second_could_might',
    'wish + Past':'cd_wish_past','wish + were':'cd_wish_past','wish + could':'cd_wish_could',
    'if only + Past':'cd_if_only','would rather sb did':'cd_would_rather','it’s time sb did':'cd_its_time','it’s high time':'cd_its_time',
    'as if + Past':'cd_as_if','imagine / suppose + Past':'cd_conj_suppose','if it weren’t for':'cd_implied_if_it_werent',
    'without / with + noun':'cd_implied_without','were to do':'cd_second_were_to','were to: мягко':'cd_second_were_to',
    'wish + would':'cd_wish_would','if only + would':'cd_if_only','would prefer it if':'cd_id_prefer',
    'Would it be OK if…?':'cd_second_question','I wouldn’t…':'cd_second_would','It would be…':'cd_second_would',
    'Should you…':'cd_inversion_should','Should you not…':'cd_inversion_negative','Were I…':'cd_inversion_were',
    'Were sb to do…':'cd_inversion_were','Had I known…':'cd_inversion_had','Had I not…':'cd_inversion_negative',
    'Were it not for':'cd_inversion_negative','Had it not been for':'cd_inversion_negative',
    'otherwise':'cd_implied_otherwise','or (else)':'cd_implied_otherwise','повелит. + and':'cd_implied_imperative','повелит. + or':'cd_implied_imperative',
    'with + noun':'cd_implied_without','without + noun':'cd_implied_without','but for':'cd_implied_but_for',
    'if it hadn’t been for':'cd_implied_if_it_werent','if not for':'cd_implied_but_for','in that case':'cd_implied_in_that_case',
    'if so / if not':'cd_implied_if_so','unless':'cd_conj_unless','unless ≠ if … not':'cd_conj_unless',
    'as long as':'cd_conj_as_long_as','provided / providing':'cd_conj_provided','on condition that':'cd_conj_on_condition',
    'only if':'cd_conj_only_if','even if':'cd_conj_even_if','in case':'cd_conj_in_case','in case (прошлое)':'cd_conj_in_case',
    'in case of':'cd_conj_in_case','whether … or not':'cd_conj_whether','suppose / what if':'cd_conj_suppose','assuming (that)':'cd_conj_suppose',
    'will do':'cd_first_will','can / may / might':'cd_first_modal','повелительное':'cd_first_imperative',
    'when ≠ if':'cd_first_when_if','if you will…':'cd_second_polite_would','if you would…':'cd_second_polite_would',
    'if + Present → Present':'cd_zero_fact','when = if':'cd_zero_if_when','инструкции':'cd_zero_imperative',
    'привычки':'cd_zero_habit','unless (правила)':'cd_conj_unless','whenever':'cd_zero_habit',
    '✗ If it will rain':'cd_trap_will_after_if','✗ If I would have':'cd_trap_would_after_if','✗ If I’d have known':'cd_trap_would_after_if',
    '✗ I wish I can':'cd_wish_could','✗ I wish I would':'cd_wish_would','✗ unless … don’t':'cd_conj_unless',
    '✗ if (заранее)':'cd_conj_in_case','✗ It’s time we go':'cd_its_time','✗ I’d rather you don’t':'cd_would_rather','✗ even if (факт)':'cd_conj_even_if'
  };
  return tags[it.name] || ({third:'cd_third',mixed:'cd_mixed',second:'cd_second',unlikely:'cd_second',formal:'cd_inversion',implied:'cd_implied',rnow:'cd_zero',rpast:'cd_all',gates:'cd_conj',first:'cd_first',zero:'cd_zero',traps:'cd_all'}[it.zone] || 'cd_all');
}
function cdmPanelHtml(id) {
  if (id[0] === 'l') {
    const l = CDM.lifts[+id.slice(1)];
    return `<header><span class="cdm-badge cdm-b-lift">⇅ лифт · ${cdmEsc(l.title.toLowerCase())}</span><h3>${cdmEsc(l.shift)}</h3><p class="cdm-pat">${cdmEsc(l.sub)}</p></header>
      <p class="cdm-how">Внизу — как есть на самом деле. Нажмите «Отразить»: условие поднимается в мир «если бы», и каждый глагол делает шаг назад во времени.</p>
      <ol class="cdm-pairs">${l.pairs.map(p => `<li><p class="cdm-real">${cdmMarked(p[0])}</p><p class="cdm-unreal">${cdmMarked(p[1])}</p></li>`).join('')}</ol>
      <button type="button" class="cdm-flip" aria-pressed="false">⇅ Отразить</button>
      <a class="cdm-rule" href="#theory/conditionals/cd-core" data-cdm-rule="cd-core">Подробно в правиле →</a>`;
  }
  const it = CDM.items[+id.slice(1)];
  const note = it.note ? `<p class="${it.trap ? 'cdm-trapnote' : 'cdm-note'}">${it.trap ? '<b>Ловушка.</b> ' : ''}${cdmEsc(it.note)}</p>` : '';
  return `<header><span class="cdm-badge cdm-z-${it.zone}">${cdmEsc(it.zoneTitle)}</span><span class="cdm-where">${cdmEsc(cdmWhere(it))}</span><h3>${cdmEsc(it.name)}</h3><p class="cdm-pat">${cdmEsc(it.pat)}</p><p class="cdm-mean">${cdmEsc(it.mean)}</p></header>
    <ul class="cdm-exs">${it.ex.map(([e, r]) => `<li><span class="cdm-ex">${cdmEsc(e)}</span><span class="cdm-ru">${cdmEsc(r)}</span></li>`).join('')}</ul>
    ${note}${cdmCheck(it.check)}<a class="button primary cdm-practice" href="#practice/conditionals/${cdmPracticeTarget(it)}">Практика →</a><a class="cdm-rule" href="#theory/conditionals/${it.ref}" data-cdm-rule="${it.ref}">Подробно в правиле →</a>`;
}
/* ---------- запуск ---------- */
let conditionalsMapAbort = null;
function initialiseConditionalsMap(root) {
  const box = root.querySelector('#cdm-canvas'); if (!box) return;
  conditionalsMapAbort?.abort(); conditionalsMapAbort = new AbortController(); const signal = conditionalsMapAbort.signal;
  window.addEventListener('hashchange', () => { if (!box.isConnected) conditionalsMapAbort?.abort(); }, { signal });
  const world = box.querySelector('.nc-world'); world.innerHTML = conditionalsMapSvg();
  box.querySelector('.nc-mini-art').innerHTML = `<svg viewBox="0 0 ${CDM.W} ${CDM.H}"><rect class="cdm-mini cdm-mini-u" x="40" y="${CDM.UY}" width="${CDM.W - 80}" height="${CDM.UB - CDM.UY}" rx="60"/><rect class="cdm-mini cdm-mini-m" x="40" y="${CDM.MY}" width="${CDM.W - 80}" height="${CDM.MH}" rx="60"/><rect class="cdm-mini cdm-mini-r" x="40" y="${CDM.RY}" width="${CDM.W - 80}" height="${CDM.RB - CDM.RY}" rx="60"/>${CDM.zones.map(z => `<rect class="cdm-mini cdm-z-${z.key}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="50"/>`).join('')}</svg>`;
  const panel = document.createElement('aside'); panel.className = 'nc-panel cdm-panel'; panel.hidden = true; panel.setAttribute('aria-live', 'polite'); box.append(panel);
  const game = document.createElement('div'); game.className = 'nc-ui cdm-game'; game.hidden = true; box.append(game);
  const svg = world.querySelector('svg');
  const mobile = () => box.clientWidth < 700;
  const panelSpace = () => panel.hidden ? {} : mobile() ? { bottom: panel.offsetHeight } : { right: panel.offsetWidth + 16 };
  const obj = id => id[0] === 'l' ? CDM.lifts[+id.slice(1)] : CDM.items[+id.slice(1)];
  const bump = el => { if (!el) return; el.classList.remove('cdm-jump'); void el.getBBox(); el.classList.add('cdm-jump'); };
  const open = (id, fly = true) => {
    svg.querySelectorAll('.cdm-st.is-on').forEach(n => n.classList.remove('is-on'));
    const el = svg.querySelector(`[data-st="${id}"]`); el?.classList.add('is-on'); bump(el);
    panel.innerHTML = `<button type="button" class="cdm-close" aria-label="Закрыть">✕</button>${cdmPanelHtml(id)}`; panel.hidden = false; panel.scrollTop = 0;
    if (fly) { const it = obj(id); api.flyTo(it.x + it.w / 2, it.y + it.h / 2, Math.min(Math.max(api.v.k, mobile() ? 0.5 : 0.6), (box.clientWidth - 16) / (it.w + 60)), panelSpace()); }
  };
  const close = () => { panel.hidden = true; svg.querySelectorAll('.cdm-st.is-on').forEach(n => n.classList.remove('is-on')); };
  const game$ = { on: false, kind: null, answered: false };
  let lodT = 0, lodT0 = 0;
  const api = initialiseNoeonCanvas(box, {
    W: CDM.W, H: CDM.H, signal, minK: 0.05, maxK: 1.6,
    onZoom: k => { clearTimeout(lodT); lodT = setTimeout(() => { const lo = k < 0.26, ti = k < 0.13; if (box.classList.contains('lod-low') !== lo) box.classList.toggle('lod-low', lo); if (box.classList.contains('lod-tiny') !== ti) box.classList.toggle('lod-tiny', ti); }, lodT0 ? 220 : 0); lodT0 = 1; },
    onTap: e => { const st = e.target?.closest?.('[data-st]'); if (st) { if (game$.on && game$.kind && !game$.answered) return; open(st.dataset.st); } else if (!panel.hidden) close(); },
    start: ({ v, apply, fit, box: b }) => { if (b.clientWidth < 700) { v.k = 0.12; v.x = 8 - 40 * 0.12; v.y = 40 - 280 * 0.12; apply(); } else fit(); },
  });
  panel.addEventListener('click', e => {
    if (e.target.closest('.cdm-close')) { close(); return; }
    const flip = e.target.closest('.cdm-flip');
    if (flip) { const on = flip.getAttribute('aria-pressed') !== 'true'; flip.setAttribute('aria-pressed', String(on)); panel.classList.toggle('cdm-flipped', on); flip.textContent = on ? '⇅ Вернуть в реальность' : '⇅ Отразить'; return; }
    const opt = e.target.closest('.cdm-ch-o button');
    if (opt) { const c = opt.closest('.cdm-check'); if (c.classList.contains('done')) return; const ok = opt.hasAttribute('data-ok'); c.classList.add('done', ok ? 'ok' : 'bad');
      c.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.hasAttribute('data-ok')) b.classList.add('right'); }); if (!ok) opt.classList.add('wrong');
      c.querySelector('.cdm-gap').textContent = c.querySelector('[data-ok]').textContent; return; }
    const rule = e.target.closest('[data-cdm-rule]');
    if (rule && typeof revealConditionalsAnchor === 'function') { e.preventDefault(); if (api.isFull()) box.querySelector('[data-nc-full]').click(); revealConditionalsAnchor(document.querySelector('.theory-content'), rule.dataset.cdmRule); }
  }, { signal });
  // поиск
  const input = box.querySelector('.cdm-search input'), results = box.querySelector('.cdm-results');
  const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[’']/g, '\'').replace(/…/g, ' ').replace(/\s+/g, ' ').trim();
  const words = it => [it.name, it.pat, it.mean, it.zoneTitle, ...it.ex.flat()];
  input.addEventListener('input', () => {
    const q = norm(input.value); if (!q) { results.hidden = true; return; }
    const score = it => norm(it.name).startsWith(q) ? 0 : norm(it.name).includes(q) ? 1 : norm(it.pat + ' ' + it.mean).includes(q) ? 2 : 3;
    const hits = CDM.items.filter(it => words(it).some(w => norm(w).includes(q))).sort((a, b) => score(a) - score(b)).slice(0, 9);
    results.innerHTML = hits.length ? hits.map(h => `<button type="button" data-go="${h.id}"><b>${cdmEsc(h.name)}</b><small>${cdmEsc(h.zoneTitle + ' · ' + h.mean)}</small></button>`).join('') : '<span class="cdm-none">Нет на карте</span>';
    results.hidden = false;
  }, { signal });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') results.querySelector('[data-go]')?.click(); if (e.key === 'Escape') { input.value = ''; results.hidden = true; } }, { signal });
  results.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (!b) return; results.hidden = true; input.blur(); open(b.dataset.go); }, { signal });

  /* ---------- игры ---------- */
  const typed = CDM.items.filter(it => it.game);
  const checks = CDM.items.filter(it => it.check);
  const pairs = CDM.lifts.flatMap(l => l.pairs.map(p => ({ l, p })));
  const GAMES = {
    world: { title: 'Какой мир?', icon: '🪞', about: 'узнайте тип по предложению', pool: () => typed,
      ask: it => ({ q: `<span class="cdm-g-s">${cdmEsc(it.ex[0][0])}</span><small>Где это на карте?</small>`, opts: Object.keys(CDM_GAMECAT).map(k => CDM_GAMECAT[k]), right: CDM_GAMECAT[it.game], why: `${it.name}: ${it.pat}`, open: it.id, wide: true }) },
    flip: { title: 'Отражение', icon: '⇅', about: 'поднимите фразу в «если бы»', pool: () => pairs,
      ask: ({ l, p }) => ({ q: `<span class="cdm-g-s cdm-g-real">${cdmEsc(cdmPlain(p[0]))}</span><small>Как это звучит в мире «если бы»?</small>`, opts: cdmShuffle([cdmPlain(p[1]), p[2], p[3]]), right: cdmPlain(p[1]), why: `${l.title.toLowerCase()}: ${l.shift}`, open: l.id, wide: true }) },
    quiz: { title: 'Викторина', icon: '❓', about: 'вставьте пропущенное', pool: () => checks,
      ask: it => { const m = it.check.match(/\[([^\]]+)\]/), o = m[1].split('|'); return { q: cdmEsc(it.check.replace(m[0], '___')).replace('___', '<span class="cdm-gap">___</span>'), opts: cdmShuffle(o), right: o[0], why: `${it.name} — ${it.mean}`, open: it.id }; } },
  };
  const best = { get: k => { try { return +localStorage.getItem('cdm-best-' + k) || 0; } catch { return 0; } }, set: (k, v) => { try { localStorage.setItem('cdm-best-' + k, v); } catch {} } };
  const menu = () => { game$.kind = null; close();
    game.innerHTML = `<p class="cdm-g-h">Игры в Зазеркалье</p><div class="cdm-g-menu">${Object.entries(GAMES).map(([k, g]) => `<button type="button" data-game="${k}"><span class="cdm-g-ic" aria-hidden="true">${g.icon}</span><span><b>${g.title}</b><small>${g.about}${best.get(k) ? ` · рекорд ${best.get(k)}/10` : ''}</small></span></button>`).join('')}</div><button type="button" class="cdm-g-end">Выйти из игр</button>`; };
  const ask = () => { const G = GAMES[game$.kind], q = G.ask(game$.list[game$.i]); game$.q = q; game$.answered = false;
    game.innerHTML = `<div class="cdm-g-top"><p class="cdm-g-h">${G.icon} ${G.title}</p><p class="cdm-g-n">${game$.i + 1} / ${game$.list.length}</p></div><div class="cdm-g-bar"><i style="width:${game$.i * 10}%"></i></div><p class="cdm-g-q">${q.q}</p><div class="cdm-g-o${q.wide ? ' cdm-g-wide' : ''}">${q.opts.map(o => `<button type="button" data-g="${cdmEsc(o)}">${cdmEsc(o)}</button>`).join('')}</div>`;
    game.classList.remove('cdm-shake', 'cdm-pop'); };
  const finish = () => { const ok = game$.log.filter(r => r.ok).length, rec = ok > best.get(game$.kind); if (rec) best.set(game$.kind, ok);
    const verdict = ok >= 9 ? 'Вы свободно ходите сквозь зеркало!' : ok >= 7 ? 'Почти без ошибок.' : ok >= 5 ? 'Хорошо, но есть трещины.' : 'Загляните в правило и попробуйте ещё.';
    game.innerHTML = `<div class="cdm-podium"><p class="cdm-medal">${ok >= 9 ? '🏆' : ok >= 7 ? '🥈' : ok >= 5 ? '🥉' : '🪞'}</p><p class="cdm-score"><b>${ok}</b> из 10</p><p>${rec ? 'Новый рекорд! ' : ''}${verdict}</p>${game$.log.filter(r => !r.ok).map(r => `<p class="cdm-miss">✗ ${cdmEsc(r.why)}</p>`).join('')}</div><div class="cdm-g-o"><button type="button" class="cdm-g-again">Ещё раз</button><button type="button" class="cdm-g-menu-b">Другая игра</button></div>`; };
  const startGame = k => { game$.kind = k; game$.list = cdmShuffle(GAMES[k].pool()).slice(0, 10); game$.i = 0; game$.log = []; close(); ask(); };
  game.addEventListener('click', e => {
    if (e.target.closest('.cdm-g-end')) { setMode('all'); return; }
    const pick = e.target.closest('[data-game]'); if (pick) { startGame(pick.dataset.game); return; }
    if (e.target.closest('.cdm-g-again')) { startGame(game$.kind); return; }
    if (e.target.closest('.cdm-g-menu-b')) { menu(); return; }
    if (e.target.closest('.cdm-g-next')) { game$.i++; close(); if (game$.i >= game$.list.length) finish(); else ask(); return; }
    const b = e.target.closest('[data-g]'); if (!b || game$.answered) return;
    const q = game$.q, ok = b.dataset.g === q.right; game$.answered = true; game$.log.push({ ok, why: q.why });
    game.querySelectorAll('[data-g]').forEach(x => { x.disabled = true; if (x.dataset.g === q.right) x.classList.add('right'); });
    if (ok) { b.classList.add('right'); game.classList.add('cdm-pop'); } else { b.classList.add('wrong'); game.classList.add('cdm-shake'); try { navigator.vibrate?.(30); } catch {} }
    game.insertAdjacentHTML('beforeend', `<p class="cdm-g-r ${ok ? 'ok' : 'bad'}">${ok ? '✓ Верно' : '✗ Нет'}: ${cdmEsc(q.why)}</p><button type="button" class="cdm-g-next">${game$.i + 1 < game$.list.length ? 'Дальше →' : 'Итог'}</button>`);
    open(q.open);
  }, { signal });
  /* ---------- режим «Шаг назад» ---------- */
  const explain = document.createElement('div'); explain.className = 'nc-ui cdm-explain'; explain.hidden = true;
  explain.innerHTML = `<button type="button" class="cdm-ex-x" aria-label="Свернуть пояснение">–</button><p class="cdm-ex-h">⇅ Шаг назад во времени</p>
    <p class="cdm-ex-t">Чтобы сделать условие нереальным, каждый глагол отступает на шаг в прошлое:</p>
    <table class="cdm-ex-tb"><tr><th>реально</th><th>если бы</th></tr><tr><td>is · am · are</td><td>were</td></tr><tr><td>have · do</td><td>had · did</td></tr><tr><td>can · will</td><td>could · would</td></tr><tr><td>did · was</td><td>had done · had been</td></tr><tr><td>would do</td><td>would have done</td></tr></table>
    <p class="cdm-ex-t">Нажмите на лифт в зеркале, чтобы увидеть, как меняются целые фразы.</p>`;
  box.append(explain);
  explain.addEventListener('click', e => { if (e.target.closest('.cdm-ex-x')) explain.classList.toggle('is-min'); }, { signal });
  const setMode = m => {
    box.querySelectorAll('[data-cdm-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cdmMode === m)));
    box.classList.toggle('cdm-mode-lift', m === 'lift'); explain.hidden = m !== 'lift';
    if (m === 'lift') { close(); const l = CDM.lifts[mobile() ? 1 : 0]; if (mobile()) api.flyTo(l.x + l.w / 2, CDM.MY + CDM.MH / 2 + 260, 0.42); else api.flyTo(CDM.W / 2, CDM.MY + CDM.MH / 2, Math.min(0.32, (box.clientWidth - 16) / (CDM.W - 1200))); }
    game$.on = m === 'game'; game.hidden = !game$.on; box.classList.toggle('cdm-mode-game', game$.on);
    if (game$.on) menu(); else game$.answered = false;
  };
  box.addEventListener('click', e => { const m = e.target.closest('[data-cdm-mode]'); if (m) setMode(m.dataset.cdmMode); }, { signal });
  box.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } }, { signal, capture: true });
  return api;
}
