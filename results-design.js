/* "Результаты": the picture first (tiles, tense heatmap, trend), then the full history. */
function rdTone(percent) { return percent >= 85 ? 'ok' : percent >= 65 ? 'warn' : 'bad'; }
function rdStats(map) {
  let correct = 0, checked = 0;
  map.forEach(value => { correct += value.correct; checked += value.checked; });
  return { correct, checked, percent: checked ? Math.round(correct / checked * 100) : null };
}
function rdHeatmap(map) {
  const columns = ['Simple', 'Continuous', 'Perfect', 'Perfect Continuous'];
  const head = columns.map(name => `<span class="rd-col">${escapeHtml(name.replace('Perfect Continuous', 'Perf. Cont.'))}</span>`).join('');
  const rows = TENSE_MAP.map(row => {
    const cells = row.items.map(item => {
      const id = item.name.toLowerCase().replaceAll(' ', '_'), value = map.get(id);
      if (!value || value.checked < 5) return `<a class="rd-cell none" href="#practice/tenses/${id}" title="${escapeHtml(item.name)}: мало данных"><b>—</b><small>мало данных</small></a>`;
      const percent = Math.round(value.correct / value.checked * 100);
      return `<a class="rd-cell ${rdTone(percent)}" href="#practice/tenses/${id}" title="${escapeHtml(item.name)}: ${percent}%"><b>${percent}%</b><small>${value.checked} полей</small></a>`;
    }).join('');
    return `<span class="rd-row">${escapeHtml(row.time)}</span>${cells}`;
  }).join('');
  return `<div class="rd-heat" role="group" aria-label="Точность по временам"><span></span>${head}${rows}</div><p class="rd-legend"><i class="ok"></i>от 85% <i class="warn"></i>65–84% <i class="bad"></i>ниже 65% <i class="none"></i>меньше 5 полей</p>`;
}
function rdTrend(weeks) {
  const points = weeks.filter(week => week.maxScore > 0);
  if (points.length < 2) return '<p class="subtle">График появится после тренировок хотя бы за две разные недели.</p>';
  const width = 320, height = 120, pad = 18, step = (width - pad * 2) / (points.length - 1);
  const coords = points.map((week, index) => [pad + index * step, pad + (1 - week.score / week.maxScore) * (height - pad * 2), Math.round(week.score / week.maxScore * 100)]);
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const dots = coords.map(([x, y, value]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"><title>${value}%</title></circle><text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle">${value}</text>`).join('');
  return `<svg class="rd-trend" viewBox="0 0 ${width} ${height}" role="img" aria-label="Точность по неделям"><polyline points="${line}"/>${dots}</svg><p class="subtle">Точность по неделям за последние 8 недель, %.</p>`;
}
function rdSections(map) {
  const names = { speaking: 'Speaking verbs', nouns: 'Существительные', reported: 'Косвенная речь', modals: 'Модальные глаголы', passive: 'Страдательный залог', comparison: 'Сравнения' };
  const groups = {};
  map.forEach((value, id) => { const section = targetSection(id); if (section === 'tenses' || !names[section]) return; (groups[section] ||= { correct: 0, checked: 0 }); groups[section].correct += value.correct; groups[section].checked += value.checked; });
  const html = Object.entries(groups).map(([section, value]) => { const percent = Math.round(value.correct / value.checked * 100); return `<div class="td-topic-head"><h3>${escapeHtml(names[section])}</h3><b>${percent}%</b></div><div class="td-bar"><i class="${rdTone(percent)}" style="width:${percent}%"></i></div>`; }).join('');
  return html ? `<section class="today-section"><h2>Другие разделы</h2>${html}</section>` : '';
}
function resultsDashboard(data, canPractice) {
  const map = new Map(data.topics.map(topic => [topic.topicId, { correct: Number(topic.correct), checked: Number(topic.checked) }]));
  const total = rdStats(map), tenseOnly = rdStats(new Map([...map].filter(([id]) => targetSection(id) === 'tenses')));
  const weeks = data.weeks, sessions = weeks.reduce((sum, week) => sum + Number(week.sessions), 0);
  const streak = tdStreak(data.days);
  const weak = [...map].filter(([, value]) => value.checked >= 5 && value.correct / value.checked < .7).sort((a, b) => a[1].correct / a[1].checked - b[1].correct / b[1].checked).slice(0, 4);
  const weakHtml = weak.map(([id, value]) => { const label = PRACTICE_TENSES.find(t => t.id === id)?.label || id, percent = Math.round(value.correct / value.checked * 100); return `<div class="rd-weak"><div><strong>${escapeHtml(label)}</strong><small>${percent}% · ${value.checked} полей</small></div><a class="button" href="${escapeHtml(todayRuleLink(id))}">Правило</a>${canPractice ? `<a class="button" href="#practice/${targetSection(id)}/${encodeURIComponent(id)}">Тренировать</a>` : ''}</div>`; }).join('');
  const tile = (value, label, attr) => `<div class="rd-tile"><strong data-results-stat="${attr}">${value}</strong><span>${label}</span></div>`;
  return `<section class="rd-tiles">${tile(total.percent === null ? '—' : total.percent + '%', 'точность за всё время', 'accuracy')}${tile(total.checked, 'проверено полей', 'checked')}${tile(sessions, 'тренировок за 8 недель', 'sessions')}${tile(streak, 'дней подряд', 'streak')}</section>
  <section class="today-section"><h2>Карта времён</h2>${rdHeatmap(map)}${tenseOnly.checked ? '' : '<p class="subtle">Нажмите на клетку, чтобы потренировать время. Цвет появится после 5 проверенных полей.</p>'}</section>
  <section class="today-section"><h2>Динамика</h2>${rdTrend(weeks)}</section>
  <section class="today-section"><h2>Над чем поработать</h2>${weakHtml || '<p class="subtle">Слабых тем пока нет: либо данных мало, либо всё выше 70%.</p>'}</section>${rdSections(map)}`;
}
