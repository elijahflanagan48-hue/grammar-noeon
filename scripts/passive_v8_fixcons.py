#!/usr/bin/env python3
"""Normalise construction labels of a raw batch to the grammar actually keyed in the answer
(Gemini labels perfect forms with the generic medium label)."""
import json, re, sys
p = sys.argv[1]
MODALS = {'must','might','may','could','can\'t','couldn\'t','should','shouldn\'t','ought','needn\'t','would','wouldn\'t','mustn\'t','cannot'}
MEDIUMISH = {'pv_modal', 'pv_prepositional', 'pv_two_objects', 'pv_present_perfect', 'pv_past_simple', 'pv_present_simple',
             'pv_infinitive', 'pv_state', 'pv_make_allow', 'pv_get', 'pv_reporting_inf', 'pv_gerund', 'pv_agent',
             'pv_negative', 'pv_question', 'pv_question_wh', 'pv_word_order', 'pv_future', 'pv_future_simple'}
def classify(ans):
    w = re.findall(r"[a-z']+", ans.lower())
    if 'been' not in w: return None
    if any(x in w for x in ('will', "won't", 'shall')) and 'have' in w: return 'pv_future_perfect'
    if any(x in MODALS for x in w) and 'have' in w: return 'pv_modal_perfect'
    if 'had' in w or "hadn't" in w: return 'pv_past_perfect'
    if 'to' in w and 'have' in w: return 'pv_perfect_infinitive'
    if 'having' in w: return 'pv_perfect_participle'
    if 'have' in w and ('to' in w) and 'be' in w: return 'pv_modal_perfect'
    return None
def new_label(ans, old):
    if old not in MEDIUMISH: return old
    return classify(ans) or old
out, n = [], 0
for l in open(p):
    if not l.strip(): continue
    d = json.loads(l)
    for b in d.get('blanks', []):
        for key in ('construction', 'tense_or_construction'):
            if key in b:
                lab = new_label(b.get('answer', ''), b[key])
                if lab != b[key]: b[key] = lab; n += 1
    if d['format'] in ('mc', 'fix', 'which') and 'construction' in d:
        ans = d['options'][d['correct_option_index']] if d['format'] in ('mc', 'which') else d.get('answer', '')
        lab = new_label(ans, d['construction'])
        if lab != d['construction']: d['construction'] = lab; n += 1
    out.append(d)
open(p, 'w').write('\n'.join(json.dumps(x, ensure_ascii=False) for x in out) + '\n')
print('relabelled constructions:', n)
