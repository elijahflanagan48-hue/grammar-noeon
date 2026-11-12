#!/usr/bin/env python3
"""Банк Infinitive · -ing: проверка авторского JSONL и сборка в формат сайта.

  python3 ig_bank.py check  part-A-01.jsonl [part-A-02.jsonl ...]   # проверка, отчёт, код 1 при ошибках
  python3 ig_bank.py blind  part-A-*.jsonl > blind-A.jsonl          # задания без ответов для слепого решения
  python3 ig_bank.py compare part-A.jsonl solved-A.jsonl            # расхождения ключа и слепого решения
  python3 ig_bank.py assemble part-*.jsonl --out bank.json          # сборка в формат сайта

Авторский формат описан в docs/infinitive-gerund/TASK.md.
"""
import collections
import difflib
import json
import re
import sys
from pathlib import Path

VERSION = 'infinitive-2026-11-12.1'
TARGETS = {
    # цель: (план, разрешённые якоря правила)
    'ig_verb_to': (90, {'ig-verb-to', 'ig-want', 'ig-decide', 'ig-manage', 'ig-seem', 'ig-wh'}),
    'ig_verb_ing': (100, {'ig-verb-ing', 'ig-enjoy', 'ig-avoid', 'ig-finish', 'ig-admit', 'ig-go', 'ig-worth'}),
    'ig_prep': (90, {'ig-prep', 'ig-prep-verb', 'ig-prep-adj', 'ig-prep-obj', 'ig-prep-free', 'ig-to-prep'}),
    'ig_bare': (70, {'ig-bare', 'ig-modal', 'ig-make-let', 'ig-help', 'ig-senses', 'ig-rather'}),
    'ig_object': (70, {'ig-object', 'ig-obj-to', 'ig-obj-ing', 'ig-suggest', 'ig-forbid', 'ig-poss', 'ig-believe'}),
    'ig_adj': (60, {'ig-adj', 'ig-adj-to', 'ig-too', 'ig-first', 'ig-noun-to', 'ig-purpose', 'ig-subject'}),
    'ig_meaning': (130, {'ig-meaning', 'ig-remember', 'ig-forget', 'ig-stop', 'ig-try', 'ig-regret', 'ig-go-on', 'ig-mean',
                         'ig-need', 'ig-afraid', 'ig-sorry', 'ig-interested', 'ig-like', 'ig-same', 'ig-love', 'ig-used'}),
    'ig_forms': (80, {'ig-forms', 'ig-perf-inf', 'ig-cont-inf', 'ig-pass', 'ig-perf-ger', 'ig-needs', 'ig-unreal', 'ig-neg'}),
    'ig_mixed': (110, None),
}
ANCHORS = set().union(*(a for _, a in TARGETS.values() if a)) | {'ig-map', 'ig-after', 'ig-finder', 'ig-traps'}
LEVELS = ('basic', 'medium', 'advanced')
TYPES = ('open_brackets', 'multiple_choice', 'context_cloze', 'translation_ru_en')
SENTENCE_MC = 'Which sentence is correct?'
RULE_FILE = 'content/infinitive/11-infinitive-gerund-rule.html'
CYR = re.compile('[А-Яа-яЁё]')
BRACKET = re.compile(r'\(([a-z]+)\)')
IRREGULAR = {
    'be': 'been', 'bear': 'born', 'beat': 'beaten', 'become': 'become', 'begin': 'begun', 'bend': 'bent', 'bite': 'bitten', 'blow': 'blown',
    'break': 'broken', 'bring': 'brought', 'build': 'built', 'burn': 'burnt', 'buy': 'bought', 'catch': 'caught', 'choose': 'chosen',
    'come': 'come', 'cost': 'cost', 'cut': 'cut', 'deal': 'dealt', 'dig': 'dug', 'do': 'done', 'draw': 'drawn', 'dream': 'dreamt',
    'drink': 'drunk', 'drive': 'driven', 'eat': 'eaten', 'fall': 'fallen', 'feed': 'fed', 'feel': 'felt', 'fight': 'fought', 'find': 'found',
    'fly': 'flown', 'forbid': 'forbidden', 'forget': 'forgotten', 'forgive': 'forgiven', 'freeze': 'frozen', 'get': 'got', 'give': 'given',
    'go': 'gone', 'grow': 'grown', 'hang': 'hung', 'have': 'had', 'hear': 'heard', 'hide': 'hidden', 'hit': 'hit', 'hold': 'held', 'hurt': 'hurt',
    'keep': 'kept', 'know': 'known', 'lay': 'laid', 'lead': 'led', 'learn': 'learnt', 'leave': 'left', 'lend': 'lent', 'let': 'let', 'lie': 'lain',
    'light': 'lit', 'lose': 'lost', 'make': 'made', 'mean': 'meant', 'meet': 'met', 'mislead': 'misled', 'overhear': 'overheard', 'pay': 'paid',
    'put': 'put', 'quit': 'quit', 'read': 'read', 'ride': 'ridden', 'ring': 'rung', 'rise': 'risen', 'run': 'run', 'say': 'said', 'see': 'seen',
    'seek': 'sought', 'sell': 'sold', 'send': 'sent', 'set': 'set', 'shake': 'shaken', 'shoot': 'shot', 'show': 'shown', 'shut': 'shut',
    'sing': 'sung', 'sink': 'sunk', 'sit': 'sat', 'sleep': 'slept', 'speak': 'spoken', 'spend': 'spent', 'spill': 'spilt', 'split': 'split',
    'spread': 'spread', 'stand': 'stood', 'steal': 'stolen', 'stick': 'stuck', 'sting': 'stung', 'strike': 'struck', 'swear': 'sworn',
    'sweep': 'swept', 'swim': 'swum', 'take': 'taken', 'teach': 'taught', 'tear': 'torn', 'tell': 'told', 'think': 'thought', 'throw': 'thrown',
    'understand': 'understood', 'upset': 'upset', 'wake': 'woken', 'wear': 'worn', 'win': 'won', 'write': 'written', 'withdraw': 'withdrawn',
    'overtake': 'overtaken', 'undertake': 'undertaken', 'mistake': 'mistaken', 'rebuild': 'rebuilt', 'rewrite': 'rewritten', 'retake': 'retaken',
}
ALT_V3 = {'burn': {'burned'}, 'dream': {'dreamed'}, 'learn': {'learned'}, 'spill': {'spilled'}, 'get': {'gotten'}, 'prove': {'proven'}, 'show': {'showed'}}
DOUBLE_EXCEPT = {'open', 'visit', 'happen', 'offer', 'listen', 'enter', 'answer', 'remember', 'consider', 'order', 'suffer', 'wonder',
                 'gather', 'deliver', 'discover', 'cover', 'bother', 'travel', 'cancel', 'label', 'model', 'signal', 'fix', 'mix', 'relax',
                 'snow', 'show', 'follow', 'allow', 'borrow', 'swallow', 'stay', 'pay', 'play', 'enjoy', 'employ', 'destroy', 'develop',
                 'limit', 'edit', 'benefit', 'profit', 'credit', 'target', 'budget', 'market', 'focus', 'organise', 'organize', 'prefer'}
VOWELS = 'aeiou'


def ing_forms(v):
    out = {v + 'ing'}
    if v.endswith('ie'):
        out.add(v[:-2] + 'ying')
    if v.endswith('e') and not v.endswith(('ee', 'ye', 'oe')):
        out.add(v[:-1] + 'ing')
    if len(v) >= 3 and v[-1] not in VOWELS + 'wxy' and v[-2] in VOWELS and v[-3] not in VOWELS:
        out.add(v + v[-1] + 'ing')
    if v.endswith('c'):
        out.add(v + 'king')
    if v in ('travel', 'cancel', 'label', 'model', 'signal'):
        out.add(v + 'ling')
    return out


def v3_forms(v):
    if v in IRREGULAR:
        return {IRREGULAR[v]} | ALT_V3.get(v, set())
    out = {v + 'ed'} | ALT_V3.get(v, set())
    if v.endswith('e'):
        out.add(v + 'd')
    if v.endswith('y') and len(v) > 2 and v[-2] not in VOWELS:
        out.add(v[:-1] + 'ied')
    if len(v) >= 3 and v[-1] not in VOWELS + 'wxy' and v[-2] in VOWELS and v[-3] not in VOWELS:
        out.add(v + v[-1] + 'ed')
    if v.endswith('c'):
        out.add(v + 'ked')
    return out


def classify(form, verb):
    """Вернуть название формы или None. Проверяет и строй формы, и то, что глагол — тот, что в скобках."""
    w = form.strip().lower().replace('’', "'").split()
    if not w or not verb:
        return None
    ing, v3 = ing_forms(verb), v3_forms(verb)
    pats = [
        (['V'], 'bare'), (['to', 'V'], 'to'), (['ING'], 'ing'),
        (['to', 'be', 'ING'], 'to-cont'), (['to', 'be', 'V3'], 'to-pass'), (['being', 'V3'], 'ing-pass'),
        (['to', 'have', 'V3'], 'to-perf'), (['having', 'V3'], 'ing-perf'), (['to', 'have', 'been', 'ING'], 'to-perf-cont'),
        (['to', 'have', 'been', 'V3'], 'to-perf-pass'), (['having', 'been', 'V3'], 'ing-perf-pass'),
        (['be', 'V3'], 'bare-pass'), (['have', 'V3'], 'bare-perf'),
    ]
    for p, name in pats:
        if len(p) != len(w):
            continue
        ok = True
        for a, b in zip(p, w):
            if a == 'V':
                ok = b == verb
            elif a == 'ING':
                ok = b in ing
            elif a == 'V3':
                ok = b in v3
            else:
                ok = a == b
            if not ok:
                break
        if ok:
            return name
    return None


def load(paths):
    items = []
    for p in paths:
        for n, line in enumerate(Path(p).read_text(encoding='utf-8').splitlines(), 1):
            line = line.strip()
            if not line or line.startswith('```'):
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


def check_ref(errs, where, target, ref):
    allowed = TARGETS.get(target, (0, None))[1]
    if ref not in ANCHORS:
        errs.append('%s: ref «%s» нет в правиле' % (where, ref))
    elif allowed and ref not in allowed:
        errs.append('%s: ref «%s» не относится к %s' % (where, ref, target))


def check_form(errs, warns, where, verb, answer, accept, why, ref, target):
    if not isinstance(answer, str) or not answer.strip():
        errs.append('%s: пустой answer' % where)
        return
    if classify(answer, verb) is None:
        errs.append('%s: answer «%s» не похож на форму глагола «%s» (to do / do / doing / to be done / having done …). Если глагол неправильный и форма верна, напишите об этом в сдаче — Claude проверит' % (where, answer, verb))
    if not isinstance(accept, list) or answer not in accept:
        errs.append('%s: accept должен содержать answer' % where)
        return
    for a in accept:
        if classify(a, verb) is None:
            warns.append('WARN %s: accept «%s» не похож на форму глагола «%s»' % (where, a, verb))
    kinds = {classify(a, verb) for a in accept} - {None}
    if {'to', 'ing'} <= kinds and ref not in ('ig-same', 'ig-love', 'ig-like', 'ig-help', 'ig-needs', 'ig-need', 'ig-afraid', 'ig-forbid', 'ig-poss'):
        warns.append('WARN %s: принимаются и to do, и -ing — проверьте, что задание не на различение' % where)
    if not why or not CYR.search(why) or len(why) > 160:
        errs.append('%s: нужен why_ru по-русски, до 160 знаков' % where)
    check_ref(errs, where, target, ref)


def check(items):
    errs, warns = [], []
    ids = collections.Counter(i.get('id') for i in items)
    seen = []
    for it in items:
        if '_bad' in it:
            errs.append(it['_bad'])
            continue
        w = '%s %s' % (it['_src'], it.get('id'))
        if not re.fullmatch(r'ig-(\d{4}|ex\d\d)', str(it.get('id'))):
            errs.append('%s: id должен быть ig-0001…ig-1000' % w)
        if ids[it.get('id')] > 1:
            errs.append('%s: повтор id' % w)
        t, tp = it.get('target'), it.get('type')
        if t not in TARGETS:
            errs.append('%s: неизвестный target %s' % (w, t))
        if tp not in TYPES:
            errs.append('%s: неизвестный type %s' % (w, tp))
            continue
        if tp in ('context_cloze', 'translation_ru_en') and t != 'ig_mixed':
            errs.append('%s: тексты и переводы — только в ig_mixed' % w)
        if it.get('level') not in LEVELS:
            errs.append('%s: level только basic / medium / advanced' % w)
        p = it.get('prompt', '')
        if not isinstance(p, str) or len(p) < 8:
            errs.append('%s: пустой prompt' % w)
            continue
        if tp != 'translation_ru_en' and CYR.search(p):
            errs.append('%s: кириллица в английском задании (подсказки запрещены)' % w)
        if re.search(r'\b(hint|gerund|infinitive|подсказка|rule|правило)\b', p, re.I):
            errs.append('%s: в задании подсказка или название формы' % w)
        if tp == 'open_brackets':
            groups = BRACKET.findall(p)
            if len(groups) != 1 or p.count('(') != 1:
                errs.append('%s: нужна ровно одна скобка с глаголом в начальной форме: (visit)' % w)
            else:
                check_form(errs, warns, w, groups[0], it.get('answer'), it.get('accept'), it.get('why_ru'), it.get('ref'), t)
        elif tp == 'multiple_choice':
            o = it.get('options')
            if not (isinstance(o, list) and len(o) == 4 and len({norm(x) for x in o}) == 4):
                errs.append('%s: нужно 4 разных варианта' % w)
            if it.get('answer_index') not in (0, 1, 2, 3):
                errs.append('%s: answer_index 0–3' % w)
            if p != SENTENCE_MC and p.count('___') != 1:
                errs.append('%s: нужен один пропуск ___ (или prompt «%s» с четырьмя предложениями)' % (w, SENTENCE_MC))
            if p == SENTENCE_MC and isinstance(o, list) and any(len(x.split()) < 4 for x in o):
                errs.append('%s: в выборе предложения варианты — целые предложения' % w)
            if not CYR.search(it.get('why_ru', '')):
                errs.append('%s: нужен why_ru' % w)
            check_ref(errs, w, t, it.get('ref'))
        elif tp == 'context_cloze':
            b = it.get('blanks') or []
            nums = [int(x) for x in re.findall(r'\{\{(\d+)\}\}', p)]
            if nums != list(range(1, len(b) + 1)) or not 3 <= len(b) <= 5:
                errs.append('%s: в тексте {{1}}…{{n}} по порядку, 3–5 пропусков, столько же blanks' % w)
            if not 40 <= len(p.split()) <= 110:
                errs.append('%s: текст 40–110 слов' % w)
            kinds = set()
            for k, bl in enumerate(b, 1):
                v = bl.get('verb', '')
                if not re.fullmatch(r'[a-z]+', v or ''):
                    errs.append('%s #%d: verb — один глагол в начальной форме' % (w, k))
                    continue
                check_form(errs, warns, '%s #%d' % (w, k), v, bl.get('answer'), bl.get('accept'), bl.get('why_ru'), bl.get('ref'), 'ig_mixed')
                kinds.add((classify(bl.get('answer', ''), v) or '?').split('-')[0])
            if len(kinds - {'?'}) < 2:
                errs.append('%s: в тексте нужны минимум две разные формы (to do / doing / do)' % w)
        elif tp == 'translation_ru_en':
            if not CYR.search(p):
                errs.append('%s: prompt перевода — по-русски' % w)
            a, acc = it.get('answer'), it.get('accept') or []
            if not a or CYR.search(a) or a not in acc or len(acc) < 2:
                errs.append('%s: answer английский, accept содержит answer и ещё варианты' % w)
            check_ref(errs, w, 'ig_mixed', it.get('ref'))
        key = norm(re.sub(r'\(.*?\)|\{\{\d+\}\}|___', ' ', p))
        if p != SENTENCE_MC:
            for other_id, other in seen:
                if key == other:
                    errs.append('%s: дубль %s' % (w, other_id))
                    break
                if len(key) > 30 and difflib.SequenceMatcher(None, key, other).quick_ratio() > .9 and difflib.SequenceMatcher(None, key, other).ratio() > .88:
                    warns.append('WARN %s: почти повтор %s' % (w, other_id))
                    break
            seen.append((it.get('id'), key))
    return errs, warns


def report(items):
    ok = [i for i in items if '_bad' not in i]
    by_t = collections.Counter(i.get('target') for i in ok)
    print('Всего:', len(ok))
    print('По целям:', ', '.join('%s %d/%d' % (t, by_t[t], TARGETS[t][0]) for t in TARGETS if by_t[t]))
    print('По типам:', dict(collections.Counter(i.get('type') for i in ok)))
    print('По уровням:', dict(collections.Counter(i.get('level') for i in ok)))
    mc = [i['answer_index'] for i in ok if i.get('type') == 'multiple_choice' and i.get('answer_index') in (0, 1, 2, 3)]
    if mc:
        c = collections.Counter(mc)
        print('Позиции верного ответа в выборе:', [c[k] for k in range(4)])
        if max(c.values()) - min(c[k] for k in range(4)) > max(3, len(mc) * .1):
            print('WARN: позиции верного ответа неравномерны')
    forms = collections.Counter()
    for i in ok:
        if i.get('type') == 'open_brackets':
            g = BRACKET.findall(i.get('prompt', ''))
            if g:
                forms[(classify(i.get('answer', ''), g[0]) or '?')] += 1
        for b in i.get('blanks', []) if i.get('type') == 'context_cloze' else []:
            forms[(classify(b.get('answer', ''), b.get('verb', '')) or '?')] += 1
    print('Формы ответов (скобки и тексты):', dict(forms.most_common()))
    refs = collections.Counter(i.get('ref') for i in ok if i.get('ref'))
    print('Пункты правила:', dict(refs.most_common()))


def blind(items):
    for i in items:
        if '_bad' in i or i.get('type') == 'translation_ru_en':
            continue
        o = {k: i[k] for k in ('id', 'type', 'prompt') if k in i}
        if i['type'] == 'multiple_choice':
            o['options'] = i['options']
        if i['type'] == 'context_cloze':
            o['blanks'] = [{'verb': b['verb']} for b in i['blanks']]
        print(json.dumps(o, ensure_ascii=False))


def compare(key_items, solved_items):
    solved = {s['id']: s for s in solved_items if '_bad' not in s}
    bad = 0
    low = lambda s: re.sub(r'\s+', ' ', (s or '').strip().lower().replace('’', "'"))
    for i in key_items:
        s = solved.get(i.get('id'))
        if not s or '_bad' in i:
            continue
        if i['type'] == 'multiple_choice':
            if s.get('answer_index') != i['answer_index'] or s.get('comment'):
                bad += 1
                got = s.get('answer_index')
                print('%s: ключ %r, решатель %r — %s' % (i['id'], i['options'][i['answer_index']], i['options'][got] if got in (0, 1, 2, 3) else got, s.get('comment', '')))
        elif i['type'] in ('open_brackets', 'context_cloze'):
            keys = [i['accept']] if i['type'] == 'open_brackets' else [b['accept'] for b in i['blanks']]
            got = [s.get('answer')] if i['type'] == 'open_brackets' else s.get('answers', [])
            for k, (acc, g) in enumerate(zip(keys, got), 1):
                if low(g) not in [low(a) for a in acc] or s.get('comment'):
                    bad += 1
                    print('%s #%d: ключ %s, решатель %r — %s' % (i['id'], k, acc, g, s.get('comment', '')))
    print('Расхождений и замечаний:', bad)


def site_item(i):
    base = {'id': i['id'], 'type': i['type'], 'topic': 'infinitive', 'level': i['level'], 'content_version': VERSION,
            'response_contract': 'bounded-v1', 'answer_profile': 'english-standard-v2'}
    ref = lambda r: '%s#%s' % (RULE_FILE, r)
    tags = {'practice_tenses': [i['target']], 'tags': [i['target']]}
    if i['type'] == 'open_brackets':
        verb = BRACKET.findall(i['prompt'])[0]
        txt = BRACKET.sub(i['answer'], i['prompt'], count=1)
        return {**base, 'prompt': i['prompt'], 'instruction_ru': 'Раскройте скобки: поставьте глагол в нужную форму (to do, do или doing).',
                'rule_refs': [ref(i['ref'])],
                'blanks': [{'id': i['id'] + '-b1', 'base_verb': verb, 'answer': i['answer'], 'accepted_answers': i['accept'], 'rule_refs': [ref(i['ref'])],
                            'explanation_ru': i['why_ru'], 'tense_or_construction': i['target']}],
                'answer_text': txt, 'explanation_ru': i['why_ru'], **tags}
    if i['type'] == 'multiple_choice':
        right = i['options'][i['answer_index']]
        txt = right if i['prompt'] == SENTENCE_MC else i['prompt'].replace('___', right, 1)
        return {**base, 'prompt': i['prompt'], 'instruction_ru': 'Выберите правильное предложение.' if i['prompt'] == SENTENCE_MC else 'Выберите правильный вариант.',
                'rule_refs': [ref(i['ref'])], 'options': i['options'], 'correct_option_index': i['answer_index'],
                'accepted_option_indices': [i['answer_index']], 'answer': right, 'summary': txt, 'explanation_ru': i['why_ru'], **tags}
    if i['type'] == 'context_cloze':
        prompt = i['prompt']
        for k, b in enumerate(i['blanks'], 1):
            prompt = prompt.replace('{{%d}}' % k, '{{%d:%s}}' % (k, b['verb']), 1)
        txt = i['prompt']
        for k, b in enumerate(i['blanks'], 1):
            txt = txt.replace('{{%d}}' % k, b['answer'], 1)
        return {**base, 'prompt': prompt, 'instruction_ru': 'Заполните пропуски: поставьте глаголы в нужную форму.',
                'rule_refs': list(dict.fromkeys(ref(b['ref']) for b in i['blanks'])),
                'blanks': [{'id': '%s-b%d' % (i['id'], k), 'base_verb': b['verb'], 'answer': b['answer'], 'accepted_answers': b['accept'],
                            'rule_refs': [ref(b['ref'])], 'explanation_ru': b['why_ru'], 'tense_or_construction': i['target']} for k, b in enumerate(i['blanks'], 1)],
                'answer_text': txt, 'explanation_ru': ' '.join(b['why_ru'] for b in i['blanks']), **tags}
    note = ' Один из возможных переводов. Итоговую оценку выставляет преподаватель.'
    return {**base, 'response_contract': 'manual-review-v1', 'prompt': i['prompt'], 'instruction_ru': 'Переведите на английский язык.',
            'rule_refs': [ref(i['ref'])],
            'blanks': [{'id': i['id'] + '-b1', 'answer': i['answer'], 'accepted_answers': i['accept'], 'explanation_ru': i['why_ru'] + note,
                        'rule_refs': [ref(i['ref'])], 'tense_or_construction': i['target']}],
            'layout': 'translation', 'grading_mode': 'teacher', 'answer_text': i['answer'], 'explanation_ru': i['why_ru'] + note, **tags}


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return 2
    cmd = argv[1]
    if cmd == 'compare':
        compare(load([argv[2]]), load([argv[3]]))
        return 0
    paths = [a for k, a in enumerate(argv[2:], 2) if not a.startswith('--') and argv[k - 1] != '--out']
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
