#!/usr/bin/env python3
"""Банк Say · Tell · Speak · Talk: проверка авторского JSONL и сборка в формат сайта.

  python3 scripts/speaking_bank.py check  part-A.jsonl [part-B.jsonl ...]   # проверка, отчёт, код 1 при ошибках
  python3 scripts/speaking_bank.py blind  part-A.jsonl > blind-A.jsonl       # задания без ответов для слепого решения
  python3 scripts/speaking_bank.py compare part-A.jsonl solved-A.jsonl       # расхождения ключа и слепого решения
  python3 scripts/speaking_bank.py assemble part-A.jsonl part-B.jsonl --out bank.json

Авторский формат описан в docs/speaking-verbs/TASK.md (в пакете для исполнителей).
"""
import collections
import difflib
import json
import re
import sys
from pathlib import Path

VERSION = 'speaking-2026-11-08.1'
VERBS = ('say', 'tell', 'speak', 'talk')
FORMS = {
    'say': {'say', 'says', 'said', 'saying'},
    'tell': {'tell', 'tells', 'told', 'telling'},
    'speak': {'speak', 'speaks', 'spoke', 'spoken', 'speaking'},
    'talk': {'talk', 'talks', 'talked', 'talking'},
}
LEMMA = {f: v for v, fs in FORMS.items() for f in fs}
TARGETS = {
    # цель: (разрешённые глаголы в скобках, план количества)
    'sv_say_tell': (('say', 'tell'), 90),
    'sv_tell_fixed': (('say', 'tell'), 45),
    'sv_say_fixed': (('say', 'tell'), 45),
    'sv_speak_talk': (('speak', 'talk'), 60),
    'sv_speak_language': (('speak', 'talk'), 35),
    'sv_phrases': (VERBS, 80),
    'sv_mixed': (VERBS, 145),
}
ANCHORS = {
    'sv-map', 'sv-after', 'sv-say-tell', 'sv-say', 'sv-tell', 'sv-reported', 'sv-orders', 'sv-direct',
    'sv-tell-fixed', 'sv-tell-distinguish', 'sv-say-objects', 'sv-things-say', 'sv-hearsay',
    'sv-speak-talk', 'sv-speak', 'sv-talk', 'sv-speak-ability', 'sv-phone', 'sv-speak-public',
    'sv-talk-topic', 'sv-talk-chat', 'sv-talk-sense', 'sv-phrases', 'sv-phrasal', 'sv-traps',
}
LEVELS = ('basic', 'medium', 'advanced')
TYPES = ('open_brackets', 'multiple_choice', 'context_cloze', 'translation_ru_en')
RULE_FILE = 'content/speaking/10-speaking-verbs-rule.html'
CYR = re.compile('[А-Яа-яЁё]')
BRACKET = re.compile(r'\(([a-z]+(?:\s*/\s*[a-z]+)+)\)')


def load(paths):
    items = []
    for p in paths:
        for n, line in enumerate(Path(p).read_text(encoding='utf-8').splitlines(), 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as e:
                items.append({'_bad': '%s:%d: не JSON (%s)' % (p, n, e)})
                continue
            obj['_src'] = '%s:%d' % (Path(p).name, n)
            items.append(obj)
    return items


def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w\s]', ' ', s.lower())).strip()


def check_choice(errs, where, options_text, answer, accept, target, why, ref):
    opts = [o.strip() for o in options_text.split('/')]
    if any(o not in VERBS for o in opts) or len(set(opts)) != len(opts) or len(opts) < 2:
        errs.append('%s: в скобках допустимы только разные say / tell / speak / talk' % where)
        return
    allowed = TARGETS.get(target, (VERBS,))[0]
    if target not in ('sv_phrases', 'sv_mixed') and set(opts) != set(allowed):
        errs.append('%s: для %s в скобках должны быть ровно: %s' % (where, target, ' / '.join(allowed)))
    if not isinstance(answer, str) or answer.lower() not in LEMMA:
        errs.append('%s: answer «%s» — не форма say / tell / speak / talk' % (where, answer))
        return
    if LEMMA[answer.lower()] not in opts:
        errs.append('%s: глагола ответа нет в скобках' % where)
    if not isinstance(accept, list) or answer not in accept:
        errs.append('%s: accept должен содержать answer' % where)
        return
    lemmas = set()
    for a in accept:
        w = a.lower().split()[0] if a.strip() else ''
        if w not in LEMMA and not a.lower().startswith(('was ', 'were ', 'is ', 'are ', 'am ', 'has ', 'have ', 'had ', 'will ', 'be ', 'been ')):
            errs.append('%s: accept «%s» — не форма глагола из скобок' % (where, a))
        if w in LEMMA:
            lemmas.add(LEMMA[w])
    if len(lemmas) > 1:
        return 'WARN %s: принимаются два разных глагола (%s) — проверьте, нельзя ли сделать контекст однозначным' % (where, ', '.join(sorted(lemmas)))
    if not why or not CYR.search(why):
        errs.append('%s: нужен why_ru по-русски' % where)
    if ref not in ANCHORS:
        errs.append('%s: ref «%s» нет в правиле' % (where, ref))


def check(items):
    errs, warns = [], []
    ids = collections.Counter(i.get('id') for i in items)
    seen = []
    for it in items:
        if '_bad' in it:
            errs.append(it['_bad'])
            continue
        w = '%s %s' % (it['_src'], it.get('id'))
        if not re.fullmatch(r'sv-(\d{4}|ex\d\d)', str(it.get('id'))):
            errs.append('%s: id должен быть sv-0001…sv-0500' % w)
        if ids[it.get('id')] > 1:
            errs.append('%s: повтор id' % w)
        t, tp = it.get('target'), it.get('type')
        if t not in TARGETS:
            errs.append('%s: неизвестный target %s' % (w, t))
        if tp not in TYPES:
            errs.append('%s: неизвестный type %s' % (w, tp))
            continue
        if it.get('level') not in LEVELS:
            errs.append('%s: level только basic / medium / advanced' % w)
        p = it.get('prompt', '')
        if not isinstance(p, str) or len(p) < 8:
            errs.append('%s: пустой prompt' % w)
            continue
        if tp != 'translation_ru_en' and CYR.search(p):
            errs.append('%s: кириллица в английском задании (подсказки запрещены)' % w)
        if re.search(r'\b(hint|подсказка|rule|правило)\b', p, re.I):
            errs.append('%s: в задании подсказка' % w)
        if tp == 'open_brackets':
            groups = BRACKET.findall(p)
            if len(groups) != 1 or p.count('(') != 1:
                errs.append('%s: нужна ровно одна скобка вида (say / tell)' % w)
            else:
                r = check_choice(errs, w, groups[0], it.get('answer'), it.get('accept'), t, it.get('why_ru'), it.get('ref'))
                if r:
                    warns.append(r)
        elif tp == 'multiple_choice':
            o = it.get('options')
            if not (isinstance(o, list) and len(o) == 4 and len({norm(x) for x in o}) == 4):
                errs.append('%s: нужно 4 разных варианта' % w)
            if it.get('answer_index') not in (0, 1, 2, 3):
                errs.append('%s: answer_index 0–3' % w)
            if p.count('___') not in (1, 2):
                errs.append('%s: в задании нужен пропуск ___' % w)
            if p.count('___') == 2 and isinstance(o, list) and not all(' … ' in x for x in o):
                errs.append('%s: два пропуска — варианты вида «speak … Speaking»' % w)
            if not CYR.search(it.get('why_ru', '')):
                errs.append('%s: нужен why_ru' % w)
            if it.get('ref') not in ANCHORS:
                errs.append('%s: ref «%s» нет в правиле' % (w, it.get('ref')))
        elif tp == 'context_cloze':
            b = it.get('blanks') or []
            nums = [int(x) for x in re.findall(r'\{\{(\d+)\}\}', p)]
            if nums != list(range(1, len(b) + 1)) or not 3 <= len(b) <= 5:
                errs.append('%s: в тексте {{1}}…{{n}} по порядку, 3–5 пропусков, столько же blanks' % w)
            if len(p.split()) < 35:
                errs.append('%s: текст короче 35 слов' % w)
            lem = collections.Counter()
            for k, bl in enumerate(b, 1):
                r = check_choice(errs, '%s #%d' % (w, k), bl.get('options', ''), bl.get('answer'), bl.get('accept'), 'sv_mixed', bl.get('why_ru'), bl.get('ref'))
                if r:
                    warns.append(r)
                if isinstance(bl.get('answer'), str) and bl['answer'].lower() in LEMMA:
                    lem[LEMMA[bl['answer'].lower()]] += 1
            if len(lem) < 3:
                errs.append('%s: в тексте нужны минимум три разных глагола' % w)
        elif tp == 'translation_ru_en':
            if not CYR.search(p):
                errs.append('%s: prompt перевода — по-русски' % w)
            a, acc = it.get('answer'), it.get('accept') or []
            if not a or CYR.search(a) or a not in acc or len(acc) < 2:
                errs.append('%s: answer английский, accept содержит answer и ещё варианты' % w)
            if not any(v in norm(a or '').split() or any(f in norm(a or '').split() for f in FORMS[v]) for v in VERBS):
                errs.append('%s: в переводе нет say / tell / speak / talk' % w)
            if it.get('ref') not in ANCHORS:
                errs.append('%s: ref «%s» нет в правиле' % (w, it.get('ref')))
        key = norm(re.sub(r'\(.*?\)|\{\{\d+\}\}|___', ' ', p))
        for other_id, other in seen[-400:]:
            if key == other:
                errs.append('%s: дубль %s' % (w, other_id))
                break
            if len(key) > 30 and difflib.SequenceMatcher(None, key, other).quick_ratio() > .92 and difflib.SequenceMatcher(None, key, other).ratio() > .9:
                warns.append('WARN %s: почти повтор %s' % (w, other_id))
                break
        seen.append((it.get('id'), key))
    return errs, warns


def report(items):
    ok = [i for i in items if '_bad' not in i]
    by_t = collections.Counter(i.get('target') for i in ok)
    print('Всего:', len(ok))
    print('По целям:', ', '.join('%s %d/%d' % (t, by_t[t], TARGETS[t][1]) for t in TARGETS))
    print('По типам:', dict(collections.Counter(i.get('type') for i in ok)))
    print('По уровням:', dict(collections.Counter(i.get('level') for i in ok)))
    mc = [i['answer_index'] for i in ok if i.get('type') == 'multiple_choice' and i.get('answer_index') in (0, 1, 2, 3)]
    if mc:
        c = collections.Counter(mc)
        print('Позиции верного ответа в выборе:', [c[k] for k in range(4)])
        if max(c.values()) - min(c[k] for k in range(4)) > max(3, len(mc) * .1):
            print('WARN: позиции верного ответа неравномерны')
    ans = collections.Counter()
    for i in ok:
        for a in ([i.get('answer')] if i.get('type') == 'open_brackets' else [b.get('answer') for b in i.get('blanks', [])]):
            if isinstance(a, str) and a.lower() in LEMMA:
                ans[LEMMA[a.lower()]] += 1
    print('Глагол ответа (скобки и тексты):', dict(ans))


def blind(items):
    for i in items:
        if '_bad' in i or i.get('type') == 'translation_ru_en':
            continue
        o = {k: i[k] for k in ('id', 'type', 'prompt') if k in i}
        if i['type'] == 'multiple_choice':
            o['options'] = i['options']
        if i['type'] == 'context_cloze':
            o['blanks'] = [{'options': b['options']} for b in i['blanks']]
        print(json.dumps(o, ensure_ascii=False))


def compare(key_items, solved_items):
    solved = {s['id']: s for s in solved_items if '_bad' not in s}
    bad = 0
    for i in key_items:
        s = solved.get(i.get('id'))
        if not s:
            continue
        if i['type'] == 'multiple_choice':
            if s.get('answer_index') != i['answer_index']:
                bad += 1
                print('%s: ключ %r, решатель %r — %s' % (i['id'], i['options'][i['answer_index']], (i['options'] + ['?'] * 5)[s.get('answer_index') if isinstance(s.get('answer_index'), int) else 4], s.get('comment', '')))
        elif i['type'] in ('open_brackets', 'context_cloze'):
            keys = [(i['accept'])] if i['type'] == 'open_brackets' else [b['accept'] for b in i['blanks']]
            got = [s.get('answer')] if i['type'] == 'open_brackets' else s.get('answers', [])
            for k, (acc, g) in enumerate(zip(keys, got), 1):
                if (g or '').strip().lower() not in [a.lower() for a in acc]:
                    bad += 1
                    print('%s #%d: ключ %s, решатель %r — %s' % (i['id'], k, acc, g, s.get('comment', '')))
    print('Расхождений:', bad)


def site_item(i):
    base = {'id': i['id'], 'type': i['type'], 'topic': 'speaking', 'level': i['level'], 'content_version': VERSION,
            'response_contract': 'bounded-v1', 'answer_profile': 'english-standard-v2'}
    ref = lambda r: '%s#%s' % (RULE_FILE, r)
    tags = {'practice_tenses': [i['target']], 'tags': [i['target']]}
    if i['type'] == 'open_brackets':
        txt = BRACKET.sub(i['answer'], i['prompt'], count=1)
        return {**base, 'prompt': i['prompt'], 'instruction_ru': 'Раскройте скобки: выберите глагол и поставьте его в нужную форму.',
                'rule_refs': [ref(i['ref'])],
                'blanks': [{'id': i['id'] + '-b1', 'answer': i['answer'], 'accepted_answers': i['accept'], 'rule_refs': [ref(i['ref'])],
                            'explanation_ru': i['why_ru'], 'tense_or_construction': i['target']}],
                'answer_text': txt, 'explanation_ru': i['why_ru'], **tags}
    if i['type'] == 'multiple_choice':
        right = i['options'][i['answer_index']]
        parts = right.split(' … ')
        txt = i['prompt']
        for part in parts:
            txt = txt.replace('___', part, 1)
        return {**base, 'prompt': i['prompt'], 'instruction_ru': 'Выберите правильный вариант.', 'rule_refs': [ref(i['ref'])],
                'options': i['options'], 'correct_option_index': i['answer_index'], 'accepted_option_indices': [i['answer_index']],
                'answer': right, 'summary': txt, 'explanation_ru': i['why_ru'], **tags}
    if i['type'] == 'context_cloze':
        prompt = i['prompt']
        for k, b in enumerate(i['blanks'], 1):
            prompt = prompt.replace('{{%d}}' % k, '{{%d:%s}}' % (k, b['options']), 1)
        txt = i['prompt']
        for k, b in enumerate(i['blanks'], 1):
            txt = txt.replace('{{%d}}' % k, b['answer'], 1)
        refs = list(dict.fromkeys(ref(b['ref']) for b in i['blanks']))
        return {**base, 'prompt': prompt, 'title': 'Заполните пропуски в тексте.', 'instruction_ru': 'Заполните пропуски в тексте.',
                'rule_refs': refs,
                'blanks': [{'id': '%s-b%d' % (i['id'], k), 'answer': b['answer'], 'accepted_answers': b['accept'], 'rule_refs': [ref(b['ref'])],
                            'explanation_ru': b['why_ru'], 'tense_or_construction': i['target']} for k, b in enumerate(i['blanks'], 1)],
                'answer_text': txt, 'explanation_ru': ' '.join(b['why_ru'] for b in i['blanks']), **tags}
    return {**base, 'response_contract': 'manual-review-v1', 'prompt': i['prompt'], 'instruction_ru': 'Переведите на английский язык.',
            'rule_refs': [ref(i['ref'])],
            'blanks': [{'id': i['id'] + '-b1', 'answer': i['answer'], 'accepted_answers': i['accept'],
                        'explanation_ru': i['why_ru'] + ' Один из возможных переводов. Итоговую оценку выставляет преподаватель.',
                        'rule_refs': [ref(i['ref'])], 'tense_or_construction': i['target']}],
            'layout': 'translation', 'grading_mode': 'teacher', 'answer_text': i['answer'],
            'explanation_ru': i['why_ru'] + ' Один из возможных переводов. Итоговую оценку выставляет преподаватель.', **tags}


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return 2
    cmd = argv[1]
    if cmd == 'compare':
        compare(load([argv[2]]), load([argv[3]]))
        return 0
    paths = [a for a in argv[2:] if not a.startswith('--') and (argv[argv.index(a) - 1] != '--out')]
    items = load(paths)
    if cmd == 'blind':
        blind(items)
        return 0
    errs, warns = check(items)
    report(items)
    for w in warns:
        print(w)
    for e in errs:
        print('ERROR', e)
    print('Ошибок: %d, предупреждений: %d' % (len(errs), len(warns)))
    if cmd == 'assemble':
        if errs:
            print('Сборка остановлена: сначала исправьте ошибки.')
            return 1
        out = Path(argv[argv.index('--out') + 1])
        out.write_text(json.dumps([site_item(i) for i in items if '_bad' not in i], ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print('Собрано:', out)
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
