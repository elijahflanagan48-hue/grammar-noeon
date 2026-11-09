#!/usr/bin/env python3
"""Build the Passive Voice practice bank (open brackets + Active -> Passive) from
hand-written sources in content/passive-bank/.

Source syntax (one task per line, '#' starts a comment):
  LEVEL|text with {cue=answer~alt@CODE#explanation}
LEVEL is B, M or A. A line with one gap becomes a sentence task, a line with
several gaps becomes a mini-text. CODE = tense + optional number (1 singular,
2 plural) + optional flag ('+' lenient alternative, '!' strict).
  ps pc pp pas pac pap fs fp
fs1/fs2 add 'be going to'; fp1/fp2 add 'will be' and 'be going to' unless '!';
pap1+/pap2+ add Past Simple; pp1+/pp2+ add Past Simple (for 'just').
Rewrites (rewrites.txt): LEVEL|CODE|active sentence|passive with ^ before a
final time adverbial|extra accepted answers separated by ~
"""
from __future__ import annotations
import json, re, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'content/passive-bank'
VERSION = 'passive-2026-11-09.1'
NAMES = dict(ps='Present Simple', pc='Present Continuous', pp='Present Perfect', pas='Past Simple',
             pac='Past Continuous', pap='Past Perfect', fs='Future Simple', fp='Future Perfect')
TAGS = dict(ps='pv_present_simple', pc='pv_present_continuous', pp='pv_present_perfect', pas='pv_past_simple',
            pac='pv_past_continuous', pap='pv_past_perfect', fs='pv_future_simple', fp='pv_future_perfect')
REF = 'content/passive/07-passive.md#'
CONTRACT = {'is': "'s", 'are': "'re", 'has': "'s", 'have': "'ve", 'had': "'d", 'will': "'ll"}
SPELL = {'learnt': 'learned', 'burnt': 'burned', 'spelt': 'spelled', 'spoilt': 'spoiled', 'dreamt': 'dreamed',
         'spilt': 'spilled', 'smelt': 'smelled', 'leapt': 'leaped', 'knelt': 'kneeled'}
GAP = re.compile(r'\{([^{}=]+)=([^{}@]+)@([a-z]+)([12]?)([+!]?)#([^{}]+)\}')
errors: list[str] = []


def be(n, past=False):
    if n not in '12':
        raise ValueError('number required')
    return ('was' if n == '1' else 'were') if past else ('is' if n == '1' else 'are')


def derived(code, n, flag, answer):
    """Meaningful grammatical alternatives produced by the flags."""
    out = []
    if code == 'fs':
        m = re.match(r'will ((?:[a-z]+ ){0,2}?)be (.+)$', answer)
        if m and flag != '!':
            out.append(f"{be(n)} {m[1]}going to be {m[2]}")
    if code == 'fp' and flag != '!':
        m = re.match(r'(.*)\bwill (not )?have been (.+)$', answer)
        if m:
            out.append(f"{m[1]}will {m[2] or ''}be {m[3]}")
            if not m[1]:
                out.append(f"{be(n)} {'not ' if m[2] else ''}going to be {m[3]}")
    if code in ('pap', 'pp') and flag == '+':
        m = re.match(r'(?:had|has|have) (not |already |just |never )?been (.+)$', answer)
        if not m:
            return out
        out.append(f"{be(n, True)} {m[1] or ''}{m[2]}")
    return out


def cosmetic(forms):
    out = []
    for form in forms:
        variants = [form]
        words = form.split(' ')
        if words[0] in CONTRACT and not (words[0] == 'will' and len(words) > 1 and words[1] == 'have' and False):
            variants.append(CONTRACT[words[0]] + ' ' + ' '.join(words[1:]))
        more = []
        for v in variants:
            w = v.split(' ')
            sp = [SPELL.get(x, x) for x in w]
            if sp != w: more.append(' '.join(sp))
            iz = [re.sub(r'ised$', 'ized', x) for x in w]
            if iz != w: more.append(' '.join(iz))
        out += variants + more
    return out


def uniq(seq):
    seen, out = set(), []
    for x in seq:
        k = x.lower()
        if k not in seen:
            seen.add(k); out.append(x)
    return out


def parse_gap_line(path, lineno, line):
    level, text = line.split('|', 1)
    assert level in 'BMA' and len(level) == 1, (path, lineno, level)
    blanks = []
    def repl(m):
        cue, answers, code, n, flag, why = (g.strip() for g in m.groups())
        answers = [a.strip() for a in answers.split('~')]
        try:
            if flag == '+' and not re.match(r'(had|has|have) ', answers[0]): raise ValueError('lenient flag without perfect form')
            extra = [x for a in answers for x in derived(code, n, flag, a)]
        except ValueError as e:
            errors.append(f'{path.name}:{lineno}: {e}'); extra = []
        parts = [p.strip() for p in cue.split('/')]
        blanks.append(dict(cue=cue, verb=parts[-1], words=parts[:-1], answer=answers[0], alts=answers[1:] + extra,
                           code=code, why=why))
        return '(' + ' / '.join(parts) + ')'
    prompt = GAP.sub(repl, text.strip())
    if '{' in prompt or '}' in prompt:
        errors.append(f'{path.name}:{lineno}: unparsed gap: {text}')
    if prompt.count('(') != len(blanks):
        errors.append(f'{path.name}:{lineno}: stray brackets')
    for b in blanks:
        if b['code'] not in NAMES: errors.append(f'{path.name}:{lineno}: bad code {b["code"]}')
        if not b['verb'].startswith('to '): errors.append(f'{path.name}:{lineno}: verb cue {b["verb"]}')
    return dict(level={'B': 'basic', 'M': 'medium', 'A': 'advanced'}[level], prompt=prompt, blanks=blanks, src=f'{path.name}:{lineno}')


def answer_text(prompt, answers):
    it = iter(answers)
    return re.sub(r'\(([^)]*)\)', lambda m: next(it), prompt)


def explanation(b):
    alts = [a for a in uniq(b['alts']) if a.lower() != b['answer'].lower()]
    text = f"{NAMES[b['code']]} Passive — {b['why']}: {b['answer']}."
    if alts:
        text += ' Также принимается: ' + ', '.join(alts) + '.'
    return text


def refs_for(prompt, blanks):
    refs = [REF + 'pv-table', REF + 'pv-aspect']
    if any(b['words'] and not set(w.lower() for w in b['words']) <= {'not', 'already', 'just', 'still', 'never', 'yet', 'always', 'often', 'usually', 'no longer', 'ever', 'recently', 'widely', 'rarely', 'sometimes', 'regularly', 'carefully', 'only', 'hardly ever', 'automatically', 'completely', 'properly', 'finally', 'even', 'officially', 'inevitably', 'seldom'} for b in blanks):
        refs.append(REF + 'pv-questions')
    if any(len(b['verb'].split()) > 2 for b in blanks):
        refs.append(REF + 'pv-phrasal')
    return refs


def gap_item(ident, row, layout):
    blanks = []
    for k, b in enumerate(row['blanks'], 1):
        accepted = uniq(cosmetic([b['answer']] + b['alts']))
        if len(accepted) > 64: errors.append(ident + ': too many variants')
        refs = refs_for(row['prompt'], [b])
        blanks.append(dict(id=f'{ident}-b{k}', answer=b['answer'], accepted_answers=accepted, explanation_ru=explanation(b),
                           rule_refs=refs, tense_or_construction=TAGS[b['code']], base_verb=b['verb'], supplied_words=b['words']))
    tenses = list(dict.fromkeys(TAGS[b['code']] for b in row['blanks']))
    return dict(id=ident, type='open_brackets', topic='passive', level=row['level'], content_version=VERSION,
                response_contract='bounded-v1', answer_profile='english-standard-v2', prompt=row['prompt'],
                instruction_ru='Раскройте скобки.', rule_refs=refs_for(row['prompt'], row['blanks']), blanks=blanks,
                layout=layout, practice_group=layout, practice_weight=6 if layout == 'sentence' else 2,
                answer_text=answer_text(row['prompt'], [b['answer'] for b in row['blanks']]),
                explanation_ru=' '.join(b['explanation_ru'] for b in blanks), practice_tenses=tenses, tags=tenses)


def read_lines(name):
    path = SRC / name
    for n, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        line = line.strip()
        if line and not line.startswith('#'):
            yield path, n, line


def rewrite_forms(passive, alts, code):
    if '^' in passive:
        head, tail = passive.split('^')
        head, tail = head.strip(), tail.strip().rstrip('.')
        forms = [f'{head} {tail}.']
        m = re.match(r'(.*?) (by [^,]+)$', head)
        if m and ' by ' not in m[1][-0:] and not tail.startswith('by '):
            forms.append(f'{m[1]} {tail} {m[2]}.')
        body = head[0].lower() + head[1:]
        forms += [f'{tail[0].upper() + tail[1:]}, {body}.', f'{tail[0].upper() + tail[1:]} {body}.']
    else:
        forms = [passive]
    forms += alts
    out = []
    for f in forms:
        out.append(f)
        m = re.match(r"^(.*?[a-z]) (is|are|has|have|had|will) (.*)$", f)
        if m and not re.search(r'\b(is|are|was|were|has|have|had|will)\b', m[1]) and m[1].split()[-1].lower() in {'i', 'you', 'he', 'she', 'we', 'they', 'it'} and len(m[1].split()) <= 4:
            out.append(f"{m[1]}{CONTRACT[m[2]]} {m[3]}")
    return uniq(out)


def main():
    files = ['sentences-ps.txt', 'sentences-pas.txt', 'sentences-fs.txt', 'sentences-pc.txt',
             'sentences-pp.txt', 'sentences-pac.txt', 'sentences-pap.txt', 'sentences-fp.txt']
    groups = [[parse_gap_line(p, n, l) for p, n, l in read_lines(f)] for f in files]
    for f, g in zip(files, groups):
        if len(g) != 75: errors.append(f'{f}: {len(g)} tasks, need 75')
        for r in g:
            if len(r['blanks']) != 1: errors.append(r['src'] + ': sentence needs exactly one gap')
    sentences = [g[k] for k in range(75) for g in groups if k < len(g)]
    minis = []
    for f in sorted(SRC.glob('minitexts-*.txt')):
        for p, n, l in read_lines(f.name):
            r = parse_gap_line(p, n, l)
            if not 2 <= len(r['blanks']) <= 4: errors.append(r['src'] + ': mini-text needs 2-4 gaps')
            minis.append(r)
    if len(minis) != 200: errors.append(f'{len(minis)} mini-texts, need 200')
    rewrites = []
    for p, n, l in read_lines('rewrites.txt'):
        level, code, active, passive, *rest = [x.strip() for x in l.split('|')]
        alts = [a.strip() for a in rest[0].split('~')] if rest and rest[0] else []
        if code not in NAMES: errors.append(f'rewrites.txt:{n}: code')
        rewrites.append((level, code, active, passive, alts))
    if len(rewrites) != 100: errors.append(f'{len(rewrites)} rewrites, need 100')
    # uniqueness: no repeated prompts and no shared 6-word openings/endings
    prompts = [r['prompt'] for r in sentences + minis] + [r[2] for r in rewrites]
    dup = [p for p, c in Counter(prompts).items() if c > 1]
    if dup: errors.append('duplicate prompts: ' + '; '.join(dup[:5]))
    if errors:
        sys.exit('\n'.join(errors))

    items = [gap_item(f'pv5-s{k:03d}', r, 'sentence') for k, r in enumerate(sentences, 1)]
    items += [gap_item(f'pv5-m{k:03d}', r, 'mini_text') for k, r in enumerate(minis, 1)]
    old = {i['id']: i for f in sorted((ROOT / 'data/exercises').glob('part-*.json')) for i in json.loads(f.read_text()) if i.get('topic') == 'passive'}
    translations = [old[f'pv5-tr{k:03d}'] for k in range(1, 101)]
    rw = []
    for k, (level, code, active, passive, alts) in enumerate(rewrites, 1):
        ident = f'pv5-a2p{k:03d}'
        forms = rewrite_forms(passive, alts, code)
        agent = bool(re.search(r' by (?!email|the time|june|friday|monday|tomorrow|noon|next|the end|the morning|winter|20\d\d)', forms[0], re.I)) or 'By whom' in ' '.join(forms) or forms[0].endswith(' by?')
        why = f"Время сохраняется: {NAMES[code]}. " + ('Исполнитель важен, поэтому он сохранён с by.' if agent else 'Неопределённый исполнитель (someone, people, they) в пассиве не называют.')
        refs = [REF + 'pv-table', REF + ('pv-agent' if agent else 'pv-focus')]
        rw.append(dict(id=ident, type='active_to_passive', topic='passive', level={'B': 'basic', 'M': 'medium', 'A': 'advanced'}[level],
                       content_version=VERSION, response_contract='bounded-v1', answer_profile='english-standard-v2', prompt=active,
                       instruction_ru='Перепишите предложение в пассивном залоге, сохранив время и смысл. Неопределённого исполнителя (someone, people, they) не называйте.',
                       rule_refs=refs, blanks=[dict(id=ident + '-b1', answer=forms[0], accepted_answers=forms, explanation_ru=why, rule_refs=refs, tense_or_construction=TAGS[code])],
                       layout='sentence_rewrite', practice_group='transformation', practice_weight=1, answer_text=forms[0], explanation_ru=why,
                       practice_tenses=[TAGS[code]], tags=[TAGS[code]]))
    passive = items + translations + rw
    assert len(passive) == 1000

    manifest_path = ROOT / 'data/exercises/index.json'
    manifest = json.loads(manifest_path.read_text())
    parts = {d['file']: json.loads((ROOT / d['file']).read_text()) for d in manifest['parts']}
    pv_files = [f for f, chunk in parts.items() if any(i.get('topic') == 'passive' for i in chunk)]
    assert all(all(i.get('topic') == 'passive' for i in parts[f]) for f in pv_files) and len(pv_files) == 10
    for n, f in enumerate(pv_files):
        parts[f] = passive[n * 100:(n + 1) * 100]
    bank = [i for d in manifest['parts'] for i in parts[d['file']]]
    for d in manifest['parts']:
        chunk = parts[d['file']]
        if d['file'] in pv_files:
            d['count'] = len(chunk)
            d['types'] = dict(sorted(Counter(i['type'] for i in chunk).items()))
            d['levels3'] = dict(sorted(Counter(i['level'] for i in chunk).items()))
            (ROOT / d['file']).write_text(json.dumps(chunk, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifest['answer_slots'] = sum(len(i.get('blanks', [])) or 1 for i in bank)
    manifest['levels3'] = dict(Counter(i['level'] for i in bank))
    manifest['content_versions']['passive'] = VERSION
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    c = Counter((i['layout'], i['level']) for i in passive)
    print('Passive bank written:', len(passive), 'items;', sum(len(i['blanks']) for i in passive), 'fields;', dict(sorted(c.items())))


if __name__ == '__main__':
    main()
