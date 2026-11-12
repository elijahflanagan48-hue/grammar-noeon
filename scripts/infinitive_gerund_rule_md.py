#!/usr/bin/env python3
"""Текстовая версия правила Infinitive · -ing для исполнителей: docs/infinitive-gerund/RULE.md (из того же источника, что и страница)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
import infinitive_gerund_rule_source as S  # noqa: E402

LABEL = {'to': 'to do', 'bare': 'do', 'ing': 'doing', 'both': 'to do / doing'}
MARK = {'y': '✓', 'p': '✓ с условием', 'n': '✗'}


def plain(html):
    t = re.sub(r'</?b>', '**', html)
    t = re.sub(r'</?i>', '_', t)
    t = re.sub(r'<span class="mv-ok">(.*?)</span>', r'✓ \1', t)
    t = re.sub(r'<span class="mv-x">(.*?)</span>', r'✗ \1', t)
    return re.sub(r'<[^>]+>', '', t).replace('****', '')


def rows(items):
    out = []
    for f, title, sample, rid, exs, note in items:
        out.append('### %s — %s (%s)\n' % (title, LABEL[f], rid))
        out.append('Схема: %s\n' % sample)
        out += ['- %s' % (('✗ ' + x[2:]) if x.startswith('✗ ') else x) for x in exs]
        if note:
            out.append('\n%s' % plain(note))
        out.append('')
    return out


def build():
    L = ['# Infinitive · -ing — правило (текстовая версия для исполнителей)', '',
         'Это содержание страницы правила на сайте. Якоря `ig-…` в скобках — значения поля `ref` в заданиях.', '',
         '## Три формы (ig-map)', '']
    for f in S.FORMS:
        icon, word, focus, sub, pats, exs, note = S.LENS[f]
        L += ['**%s** — %s. %s.' % (word, focus, sub), '- Схемы: ' + ' · '.join(plain(p) for p in pats),
              '- Примеры: ' + ' / '.join(plain(x) for x in exs), '- ' + plain(note), '']
    L += ['## Что стоит перед глаголом (ig-after)', '', '| Слово перед глаголом | to do | do | doing | Заметка |', '|---|---|---|---|---|']
    for label, hint, v, note, anchor in S.SLOTS:
        cells = ['%s %s' % (MARK[v[f][0]], v[f][1]) if v[f][1] else MARK[v[f][0]] for f in S.FORMS]
        L.append('| %s (%s) | %s | %s | %s | %s → %s |' % (label, hint, *cells, plain(note), anchor))
    L.append('')
    for title, anchor, items, lead in [
        ('Глагол + to do', 'ig-verb-to', S.VERB_TO, ''), ('Глагол + doing', 'ig-verb-ing', S.VERB_ING, ''),
        ('Предлог + doing', 'ig-prep', S.PREP, 'После любого предлога — только -ing, в том числе после to-предлога.'),
        ('Инфинитив без to', 'ig-bare', S.BARE, '')]:
        L += ['## %s (%s)' % (title, anchor), ''] + ([lead, ''] if lead else []) + rows(items)
    L += ['## Обе формы, но смысл разный (ig-meaning)', '']
    for verb, to, ing, anchor in S.PAIRS:
        L += ['### %s (%s)' % (verb, anchor),
              '- **+ to do** — %s: _%s_ (%s; %s)' % (to[0], to[1], to[2], to[3]),
              '- **+ doing** — %s: _%s_ (%s; %s)' % (ing[0], ing[1], ing[2], ing[3]), '']
    L += rows(S.SAME)
    L += ['## Глагол + sb + … (ig-object)', ''] + rows(S.OBJECT)
    L += ['## Прилагательные, существительные, цель (ig-adj)', ''] + rows(S.ADJ)
    L += ['## Формы: раньше, в процессе, пассив (ig-forms)', '', '| | Актив | Пассив |', '|---|---|---|',
          '| Инфинитив | to do · to be doing · to have done · to have been doing | to be done · to have been done |',
          '| -ing | doing · having done | being done · having been done |', ''] + rows(S.FORM_ROWS)
    L += ['## Список: какой глагол что любит (ig-finder)', '']
    for f in ('to', 'ing', 'bare', 'both'):
        L.append('- **%s**: %s' % (LABEL[f], ', '.join(w for g, w, _ in S.FINDER if g == f)))
    L += ['', '## Ловушки (ig-traps)', '']
    L += ['- ✗ %s → ✓ %s (%s)' % (b, g, n) for b, g, n in S.TRAPS]
    return '\n'.join(L) + '\n'


if __name__ == '__main__':
    out = ROOT / 'docs/infinitive-gerund/RULE.md'
    out.write_text(build(), encoding='utf-8')
    print(out, len(out.read_text()))
