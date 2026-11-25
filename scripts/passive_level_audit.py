#!/usr/bin/env python3
"""Strict level audit for the Passive bank (Grammar NOEON).

For every active passive item computes the level it *really* needs:
  required = max(grammar level, vocabulary level, size level)
and compares it with the level written in the bank.

Usage:
  python3 -B scripts/passive_level_audit.py [--json out.json] [--list N]
Needs: pip install wordfreq cefrpy
"""
import argparse, glob, json, re, collections, sys, os

from wordfreq import zipf_frequency
try:
    from cefrpy import CEFRAnalyzer
    _CEFR = CEFRAnalyzer()
except Exception:  # pragma: no cover
    _CEFR = None

LV = {'basic': 0, 'medium': 1, 'advanced': 2, 'beyond': 3}
NAMES = ['basic', 'medium', 'advanced', 'beyond']

# ---------------------------------------------------------------- grammar
G_BASIC = {'pv_present_simple', 'pv_past_simple', 'pv_future_simple', 'pv_going_to',
           'pv_agent', 'pv_negative', 'pv_question',
           'active_present_simple', 'active_past_simple', 'active_future_simple', 'active_other'}
G_MEDIUM = {'pv_present_continuous', 'pv_past_continuous', 'pv_present_perfect',
            'pv_two_objects', 'pv_prepositional', 'pv_get', 'pv_infinitive', 'pv_state',
            'pv_born', 'pv_need_ing', 'pv_modal', 'pv_make_allow',
            'active_present_perfect', 'active_present_continuous', 'active_past_continuous'}
# which cells may appear at which level (cell -> minimal level)
CELL_MIN = {'D1': 0, 'D2': 0, 'D3': 0, 'D10': 0, 'D11': 0,
            'D4': 1, 'D6': 1, 'D7': 1, 'D8': 1, 'D9': 1, 'D5': 2}
G_ADVANCED = {'pv_past_perfect', 'pv_future_perfect', 'pv_modal_perfect', 'pv_perfect_infinitive',
              'pv_perfect_participle', 'pv_gerund', 'pv_reporting_it', 'pv_reporting_subject',
              'pv_causative', 'pv_perception', 'active_past_perfect',
              'active_future_perfect'}
BASIC_MODALS = {'can', 'cannot', "can't", 'must', "mustn't", 'should', "shouldn't", 'will', "won't"}
SKIP_TAG = re.compile(r'^pv_D\d+$')


def grammar_level(item):
    cons = []
    for b in item.get('blanks', []):
        t = b.get('tense_or_construction') or b.get('construction')
        if t:
            cons.append((t, (b.get('answer') or '').lower()))
    if not cons and item.get('construction'):
        cons.append((item['construction'], ''))
    if not cons:
        for t in item.get('tags', []):
            if not SKIP_TAG.match(t) and t not in ('mini_text',):
                cons.append((t, ''))
    lvl, why = 0, []
    for t, ans in cons:
        if t == 'pv_gerund' and item.get('cell') == 'D4' and 'having' not in ans:
            l = 1  # simple being+V3 is a medium D4 target
        elif t in G_ADVANCED:
            l = 2
        elif t in G_MEDIUM:
            l = 1
            if t == 'pv_modal':
                first = ans.split()[0] if ans else ''
                l = 0 if first in BASIC_MODALS or not ans else 1
        elif t in G_BASIC:
            l = 0
        else:
            l = 2  # unknown construction: treat as hard
        if l > lvl:
            lvl = l
        if l >= 1:
            why.append(t)
    return lvl, sorted(set(why))


# ---------------------------------------------------------------- vocabulary
WORD = re.compile(r"[^\W\d_]+(?:['\u2019][^\W\d_]+)?", re.U)
FUNC = set("""a an the and or but if so as of to in on at by for with from into onto over under about after before
during while because since until than then that this these those there here it its i you he she we they me him her us
them my your his our their mine yours ours theirs who whom whose which what when where why how not no yes do does did
done doing is am are was were be been being have has had having will would can could shall should may might must
just very too also again already still yet ever never always often sometimes usually soon now today tonight yesterday
tomorrow one two three four five six seven eight nine ten first second third last next other another each every some
any all both either neither more most much many few little less least such own same only even""".split())


def stems(w):
    w = w.lower().replace("'", '')
    out = {w}
    for suf, rep in (('ies', 'y'), ('ied', 'y'), ('ing', ''), ('ing', 'e'), ('ed', ''), ('ed', 'e'),
                     ('es', ''), ('s', ''), ('ly', ''), ('er', ''), ('est', '')):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            out.add(w[:-len(suf)] + rep)
    # doubled consonant: stopped -> stop
    for s in list(out):
        if len(s) > 3 and s[-1] == s[-2]:
            out.add(s[:-1])
    # British -ise
    if 'is' in w:
        out.add(w.replace('is', 'iz'))
    return out


def zipf(w):
    return max(zipf_frequency(s, 'en') for s in stems(w))


def cefr(w):
    if not _CEFR:
        return None
    best = None
    for s in stems(w):
        try:
            v = _CEFR.get_average_word_level_CEFR(s)
        except Exception:
            v = None
        if v is not None:
            v = str(v)
            if best is None or v < best:
                best = v
    return best


def word_band(w):
    """0 easy (basic ok), 1 = B1-ish (medium ok), 2 = B2-ish (advanced ok), 3 = rare."""
    z = zipf(w)
    c = cefr(w)
    if z >= 4.6 or (z >= 3.9 and c in ('A1', 'A2')):
        return 0
    if z >= 4.0 or (z >= 3.7 and c in ('A1', 'A2', 'B1')):
        return 1
    if z >= 3.5:
        return 2
    return 3


# verbs in brackets: stricter (the learner must instantly understand the verb)
def verb_band(v):
    v = v.lower().replace('to ', '').strip().split()[0] if v else ''
    if not v:
        return 0
    z = zipf(v)
    c = cefr(v)
    if z >= 4.5 or (z >= 4.0 and c in ('A1', 'A2')):
        return 0
    if z >= 4.1 or (z >= 3.8 and c in ('A1', 'A2', 'B1')):
        return 1
    if z >= 3.7:
        return 2
    return 3


GIVEN_NAMES = set("""liv ed jen kim tim rick vera ola pam gil rex ivo una holly molly oscar hank faye gwen roy hope tara sara sarah omar kenji elena zara ivan priya lucas david marta anna tom ben sam alex maria john mary peter paul kate emma lisa nick jack mike james emily daniel sofia ali amir ahmed yuki mei li wei lena olga dima oleg nina maya leo max jan ana carlos juan jose luis pedro hana aya noor fatima hassan ravi raj anil sue amy jane ella ruby lily ivy mia eva ida kim tim bob dan joe ted ron""".split())
CONTRACT_STEMS = set("""is are was were do does did would could should have has had wo can ca isn aren wasn weren don doesn didn won wouldn couldn shouldn haven hasn hadn let it that there he she what who where here we they you i""".split())


def tokens(text):
    out = []
    for m in WORD.finditer(text):
        w = m.group(0)
        start = m.start()
        prev = text[:start].rstrip()
        sentence_start = (not prev) or prev[-1] in '.!?—"“(' or prev.endswith('...')
        if w[0].isupper() and not sentence_start:
            continue  # proper noun
        wl = w.lower()
        if wl in GIVEN_NAMES:
            continue
        m2 = re.search(r"['\u2019](s|t|ll|re|ve|d|m)$", wl)
        if m2:
            stem = wl[:m2.start()]
            if stem in GIVEN_NAMES or stem in CONTRACT_STEMS:
                continue
            w = w[:m2.start()]
        out.append(w)
    return out


def _fill(prompt, answers):
    it = iter(answers)
    return re.sub(r'\([^()]*\)', lambda m: next(it, ''), prompt)


def item_text(item):
    ty = item.get('type') or {'gap': 'open_brackets', 'mini': 'open_brackets', 'mc': 'multiple_choice',
                              'which': 'multiple_choice', 'fix': 'error_fix'}.get(item.get('format'), '')
    t = item.get('answer_text') or ''
    if not t and ty == 'open_brackets':
        t = _fill(item['prompt'], [b.get('answer', '') for b in item.get('blanks', [])])
    if ty == 'multiple_choice':
        if item.get('summary'):
            t = item['summary']
        elif item.get('options') is not None and item.get('correct_option_index') is not None:
            o = item['options'][item['correct_option_index']]
            t = item['prompt'].replace('___', o) if '___' in item['prompt'] else item['prompt'] + ' ' + o
    if ty == 'error_fix':
        t = item.get('answer') or item['prompt']
    if not t:
        t = item['prompt']
    return t


def vocab_level(item):
    text = item_text(item)
    toks = [w for w in tokens(text) if w.lower() not in FUNC and len(w) > 2]
    seen, bands, hard = set(), collections.Counter(), []
    for w in toks:
        k = w.lower()
        if k in seen:
            continue
        seen.add(k)
        b = word_band(w)
        bands[b] += 1
        if b >= 1:
            hard.append((k, b, round(zipf(w), 2)))
    # bracket verbs
    vb = 0
    for b in item.get('blanks', []):
        bv = b.get('base_verb') or b.get('cue') or ''
        parts = [p.strip() for p in bv.split('/') if p.strip()]
        verbs = [p[3:].strip() for p in parts if p.lower().startswith('to ')]
        for v in verbs:
            x = verb_band(v)
            vb = max(vb, x)
            if x >= 1:
                hard.append(('(to ' + v + ')', x, round(zipf(v.split()[0]), 2)))
    # decide level
    # basic:   no band>=2/3 words, at most 1 band-1 word, bracket verb band 0
    # medium:  no band 3, at most 1 band-2 word, bracket verb <=1
    # advanced: at most 2 band-3... we allow 1 band-3 and 3 band-2 words, bracket verb <=2
    b1, b2, b3 = bands[1], bands[2], bands[3]
    if b3 == 0 and b2 == 0 and b1 <= 1 and vb == 0:
        lvl = 0
    elif b3 == 0 and b2 <= 1 and vb <= 1:
        lvl = 1
    elif b3 <= 1 and b2 <= 3 and vb <= 2:
        lvl = 2
    else:
        lvl = 3
    return lvl, hard


# ---------------------------------------------------------------- size
SUBORD = re.compile(r"\b(because|although|though|when|while|if|unless|which|who|whom|whose|that|until|so that)\b", re.I)


def size_level(item):
    text = item_text(item)
    sents = [s for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s]
    words = len(WORD.findall(text))
    longest = max((len(WORD.findall(s)) for s in sents), default=0)
    gaps = len(item.get('blanks', [])) if (item.get('type') == 'open_brackets' or item.get('format') in ('gap', 'mini')) else 1
    sub = len(SUBORD.findall(text))
    reasons = []
    # basic
    if gaps <= 2 and longest <= 13 and words <= 26 and sub <= 1:
        return 0, reasons
    if gaps <= 3 and longest <= 19 and words <= 40 and sub <= 2:
        return 1, reasons
    if gaps <= 4 and longest <= 27 and words <= 60:
        return 2, reasons
    return 3, reasons


def audit(items):
    rows = []
    for it in items:
        g, gwhy = grammar_level(it)
        v, hard = vocab_level(it)
        s, _ = size_level(it)
        cm = CELL_MIN.get(it.get('cell'), 0)
        req = max(g, v, s, cm)
        cm = CELL_MIN.get(it.get('cell'), 0)
        rows.append({'id': it['id'], 'cell': it.get('cell'), 'type': it.get('type') or it.get('format'),
                     'level': it['level'], 'grammar': g, 'vocab': v, 'size': s,
                     'required': NAMES[req], 'hard': hard, 'gwhy': gwhy,
                     'text': item_text(it)[:220]})
    return rows


def load_items(root):
    items = []
    for f in sorted(glob.glob(os.path.join(root, 'data/exercises/part-*.json'))):
        d = json.load(open(f))
        arr = d if isinstance(d, list) else d.get('items') or d.get('exercises') or []
        items += [i for i in arr if i.get('topic') == 'passive' and not i.get('retired')]
    return items


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.')
    ap.add_argument('--json')
    ap.add_argument('--list', type=int, default=0)
    a = ap.parse_args()
    items = load_items(a.root)
    rows = audit(items)
    C = collections.Counter
    print('items', len(rows))
    print('labelled:', dict(C(r['level'] for r in rows)))
    print('required:', dict(C(r['required'] for r in rows)))
    m = C((r['level'], r['required']) for r in rows)
    for lv in NAMES[:3]:
        print(f'  labelled {lv:9}', {k[1]: v for k, v in m.items() if k[0] == lv})
    print('driver of mismatch (basic-labelled):',
          dict(C(('grammar' if r['grammar'] > 0 else '') + ('+vocab' if r['vocab'] > 0 else '') + ('+size' if r['size'] > 0 else '')
                 for r in rows if r['level'] == 'basic' and r['required'] != 'basic')))
    if a.json:
        json.dump(rows, open(a.json, 'w'), ensure_ascii=False, indent=1)
    if a.list:
        bad = [r for r in rows if r['level'] == 'basic' and r['required'] != 'basic'][:a.list]
        for r in bad:
            print(r['id'], r['cell'], 'req=', r['required'], 'g/v/s=', r['grammar'], r['vocab'], r['size'], r['gwhy'], r['hard'][:4])
            print('   ', r['text'])


if __name__ == '__main__':
    main()
