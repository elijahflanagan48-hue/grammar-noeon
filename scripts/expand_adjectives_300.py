"""Compile 500 individually authored comparison tasks into the shared schema.

Only appends parts 49–53 to the pinned 4709-item input. Never rebuilds prior
exercises, changes attempt snapshots, or touches a database. Private source
and rule evidence live outside the public asset allowlist.
"""
from pathlib import Path
from collections import Counter
import csv
import hashlib
import json
import re
from build_comparisons import RULES

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'docs/review/ADJECTIVES-300-2026-11-01'
VERSION = 'comparison-2026-11-01.2'
FILES = [f'data/exercises/part-{n:02}.json' for n in range(49, 54)]
SLOT = re.compile(r'\(([^)]+)\)')

# Rules were consulted on official publisher/institution sites, 2026-11-01.
SOURCES = {
 'C-COMP': {'publisher':'Cambridge University Press & Assessment', 'title':'English Grammar Today: Comparison — adjectives', 'url':'https://dictionary.cambridge.org/grammar/british-grammar/comparison-adjectives-bigger-biggest-more-i', 'evidence':'Суффиксальные и аналитические степени, исключения, определители, усилители, повтор и связанные сравнения.'},
 'BC-COMP': {'publisher':'British Council', 'title':'Comparative and superlative adjectives', 'url':'https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives', 'evidence':'Образование форм, список распространённых двухсложных прилагательных с обеими моделями, irregular good/bad/far.'},
 'BC-MOD': {'publisher':'British Council', 'title':'Modifying comparatives', 'url':'https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modifying-comparatives', 'evidence':'Большая и малая разница; nowhere near, nearly, just as; усилители comparative.'},
 'C-EQUAL': {'publisher':'Cambridge University Press & Assessment', 'title':'Comparison: comparisons of equality', 'url':'https://dictionary.cambridge.org/grammar/british-grammar/comparisons', 'evidence':'Положительная форма в as … as и not as … as, полные и сокращённые сравнительные части.'},
 'C-FAR': {'publisher':'Cambridge University Press & Assessment', 'title':'Farther, farthest or further, furthest?', 'url':'https://dictionary.cambridge.org/us/grammar/british-grammar/farther-farthest-or-further-furthest', 'evidence':'Обе модели для расстояния; только further в значении дополнительного.'},
 'C-OLD': {'publisher':'Cambridge University Press & Assessment', 'title':'Elder, eldest or older, oldest?', 'url':'https://dictionary.cambridge.org/us/grammar/british-grammar/elder-eldest-or-older-', 'evidence':'Older с than и для предметов; elder не заменяет older в этих позициях.'},
 'C-TOO': {'publisher':'Cambridge University Press & Assessment', 'title':'Too', 'url':'https://dictionary.cambridge.org/grammar/british-grammar/too-enough', 'evidence':'Too перед положительной формой прилагательного, в том числе с to-infinitive.'},
 'BC-ENOUGH': {'publisher':'British Council', 'title':"Using 'enough'", 'url':'https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/using-enough', 'evidence':'Enough после прилагательного; достаточность для результата.'},
 'C-NO': {'publisher':'Cambridge University Press & Assessment', 'title':'No more, not any more', 'url':'https://dictionary.cambridge.org/us/grammar/british-grammar/no-more-not-any-more', 'evidence':'No/not any с сравнительными степенями; контекст каждого нашего задания явно задаёт включённую границу.'},
 'C-ANY': {'publisher':'Cambridge University Press & Assessment', 'title':'Any — Any and comparatives', 'url':'https://dictionary.cambridge.org/grammar/british-grammar/any', 'evidence':'Any с comparative в отрицаниях и вопросах.'},
 'C-PARALLEL': {'publisher':'Cambridge University Press & Assessment', 'title':'The more … the more/less', 'url':'https://dictionary.cambridge.org/dictionary/english/morethe-more-less', 'evidence':'Коррелятивные конструкции с увеличением или уменьшением второго признака.'},
 'P-ADV': {'publisher':'Pearson Education', 'title':'MyGrammarLab Advanced — sample: units 14–15', 'url':'https://www.pearson.com/content/dam/one-dot-com/one-dot-com/english/SampleMaterials/Digital/MyGrammarLab_Advanced.pdf', 'evidence':'Units 14–15, печатные с. 76–83: обычные и вариантные формы, усиление, повтор и связанные сравнения. Более/менее обычные формы различаются по контексту и регистру.'},
 'COL-DRY': {'publisher':'HarperCollins', 'title':'Collins: dry', 'url':'https://www.collinsdictionary.com/us/dictionary/english/dry', 'evidence':'Comparative drier или dryer; в наших ключах каноническая британская форма drier.'},
 'COL-STABLE': {'publisher':'HarperCollins', 'title':'Collins: stable', 'url':'https://www.collinsdictionary.com/us/dictionary/english/stable', 'evidence':'Словарные stabler/stablest и употребление more stable; аналитическая модель по C-COMP.'},
 'COL-SUBTLE': {'publisher':'HarperCollins', 'title':'Collins: subtle', 'url':'https://www.collinsdictionary.com/us/dictionary/english/subtle', 'evidence':'Subtler/subtlest; для двухсложного слова допустима и аналитическая модель.'},
 'COL-LENGTHY': {'publisher':'HarperCollins', 'title':'Collins: lengthy', 'url':'https://www.collinsdictionary.com/us/dictionary/english/lengthy', 'evidence':'Lengthier/lengthiest; каноническая форма lengthier.'},
 'OUP-REMOTE': {'publisher':'Oxford University Press', 'title':'Oxford Advanced Learner’s Dictionary: remote', 'url':'https://www.oxfordlearnersdictionaries.com/definition/english/remote_1', 'evidence':'Remoter/remotest допустимы наряду с аналитической моделью.'},
 'OUP-SEVERE': {'publisher':'Oxford University Press', 'title':'Oxford Advanced Learner’s Dictionary: severe', 'url':'https://www.oxfordlearnersdictionaries.com/us/definition/english/severe', 'evidence':'Severer/severest допустимы, more severe/most severe более употребительны.'},
 'MW-SLIPPERY': {'publisher':'Merriam-Webster', 'title':'Merriam-Webster dictionary: slippery', 'url':'https://scrabble.merriam.com/finder/slippery', 'evidence':'Словарные формы slipperier/slipperiest.'},
}
RULE_SOURCES = {
 'forms':['C-COMP','BC-COMP'], 'variants':['C-COMP','BC-COMP'],
 'irregular':['BC-COMP'], 'articles':['C-COMP'],
 'equal':['C-EQUAL','BC-MOD'], 'less':['C-COMP'],
 'threshold':['C-TOO','BC-ENOUGH'], 'modifiers':['BC-MOD','C-COMP'],
 'change':['C-COMP','P-ADV'], 'parallel':['C-PARALLEL','P-ADV'],
 'precision':['C-COMP','C-EQUAL'], 'logic':['C-NO','C-ANY'],
 'far':['C-FAR'], 'elder':['C-OLD'],
}
EXTRA_SOURCES = {'dry':['COL-DRY'], 'stable':['COL-STABLE'], 'subtle':['COL-SUBTLE'],
                 'lengthy':['COL-LENGTHY'], 'slippery':['MW-SLIPPERY'], 'remote':['OUP-REMOTE'], 'severe':['OUP-SEVERE']}


def read(path):
    return json.loads(path.read_text())


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def field_explanation(rule, base, answers, prefix, suffix):
    answer = answers[0]
    sources = list(RULE_SOURCES[rule])
    if base in EXTRA_SOURCES:
        sources += EXTRA_SOURCES[base]
    if len(answers) > 1:
        sources += ['P-ADV']
    # Identify what is actually supplied outside this particular gap. The item
    # target remains its editorial group, but field explanations name its degree.
    if answer == base:
        if re.search(r'\bas\s*$', prefix, re.I):
            why = 'В as … as нужна положительная форма прилагательного, без -er и more.'
            sources += ['C-EQUAL']
        elif re.search(r'\btoo\s*$', prefix, re.I):
            why = 'После too нужна положительная форма. Too обозначает избыток признака для указанной цели.'
            sources += ['C-TOO']
        elif re.match(r'\s+enough\b', suffix, re.I):
            why = 'Перед enough нужна положительная форма. Enough стоит после прилагательного и обозначает достаточность.'
            sources += ['BC-ENOUGH']
        elif re.search(r'\b(?:more|most|less|least)\s*$', prefix, re.I):
            why = 'Показатель степени уже напечатан перед скобками, поэтому вводится основа прилагательного.'
            sources += ['C-COMP']
        else:
            raise AssertionError(('Unexplained base form', base, prefix, suffix))
    elif base == 'far' and answer == 'further' and not re.match(r'\s+(?:from|away|than)\b', suffix):
        why = 'Здесь far означает «дополнительный»: нужна форма further, не farther.'
        sources += ['C-FAR']
    elif answer.startswith('less '):
        why = 'Контекст задаёт меньшую степень признака: less + положительная форма прилагательного.'
        sources += ['C-COMP']
    elif answer.startswith('least '):
        why = 'Выделяется наименьшая степень признака в названной группе: least + прилагательное.'
        sources += ['C-COMP']
    elif answer.startswith('most ') or answer in {'best','worst','farthest','furthest'} or answer.endswith('est'):
        why = 'Нужна превосходная степень: максимум признака в названной группе или среди состояний одного объекта.'
        sources += ['C-COMP']
        if re.search(r'(?:\bsecond|\bthird|\bfourth|\bfifth)-$', prefix):
            why += ' Порядковое слово уже дано, повторять его в ответе не нужно.'
        if re.search(r"\b(?:its|their|our|his|her|my|your)\s*$|['’]s\s*$", prefix):
            why += ' Притяжательный определитель заменяет the.'
    else:
        why = 'Нужна сравнительная степень прилагательного для сопоставления с указанной точкой отсчёта.'
        sources += ['C-COMP']
        if base in {'good','bad'}:
            why += ' Это неправильная форма.'
        if base == 'old':
            why += ' Older подходит для возраста и для сравнения с than, elder здесь не употребляется.'
            sources += ['C-OLD']
        if base == 'far':
            why += ' Для физического расстояния допустимы farther и further.'
            sources += ['C-FAR']
    if rule == 'logic':
        why += ' No + comparative не требует строгого неравенства: равенство границе допустимо.'
    if rule == 'parallel':
        why += ' Модель the + comparative … the + comparative связывает изменения; направление задано контекстом.'
    if rule == 'change' and (re.match(r'\s+and\s+\(', suffix) or re.search(r'\)\s+and\s*$', prefix) or re.search(r'\b(?:more|less) and (?:more|less)\s*$', prefix)):
        why += ' Повтор comparative с and или more and more передаёт постепенное изменение.'
    if rule == 'precision':
        why += ' Сопоставляются однотипные величины; that/those или притяжательная форма заменяют повтор существительного.'
    why += f' Основной ответ: {answer}.'
    if len(answers) > 1:
        why += f' Также принимается: {answers[1]}.'
    return why, list(dict.fromkeys(sources))


def authored_items():
    items, ledger = [], []
    for level, prefix, total in [('medium','cmp-med-20261101-',260),('advanced','cmp-pro-20261101-',240)]:
        lines = [line.strip() for line in (REVIEW / (level+'.txt')).read_text().splitlines()
                 if line.strip() and not line.lstrip().startswith('#')]
        assert len(lines) == total, (level, len(lines))
        for n, line in enumerate(lines, 1):
            rule, prompt, keys = line.split('|')
            assert rule in RULE_SOURCES, rule
            matches = list(SLOT.finditer(prompt))
            variants = [key.split('~') for key in keys.split(';')]
            assert len(matches) == len(variants), (level,n)
            ident = prefix + f'{n:03d}'
            target, anchor, _ = RULES[rule]
            refs = [f'content/comparison/06-comparison.md#{anchor}']
            blanks = []
            for k, (match, answers) in enumerate(zip(matches, variants), 1):
                assert 1 <= len(answers) <= 2 and len(set(answers)) == len(answers), ident
                base = match[1]
                explanation, sources = field_explanation(rule, base, answers, prompt[:match.start()], prompt[match.end():])
                blanks.append(dict(id=ident+f'-b{k}', base_adjective=base, answer=answers[0],
                    accepted_answers=answers, explanation_ru=explanation, rule_refs=refs))
                ledger.append(dict(item_id=ident, field=k, level=level, target=target,
                    rule=rule, base=base, accepted_answers=' / '.join(answers),
                    sources=';'.join(sources), source_urls=';'.join(SOURCES[s]['url'] for s in sources)))
            values = iter(b['answer'] for b in blanks)
            items.append(dict(id=ident, type='open_brackets', level=level,
                cefr_estimate='B1' if level=='medium' else 'B2', topic='comparison',
                content_version=VERSION, response_contract='bounded-v1', prompt=prompt,
                practice_tenses=[target], tags=[target], rule_refs=refs, blanks=blanks,
                answer_text=SLOT.sub(lambda _: next(values), prompt),
                explanation_ru=' '.join(f'{k}) {b["explanation_ru"]}' for k,b in enumerate(blanks,1))))
        counts=Counter(i['practice_tenses'][0] for i in items if i['level']==level)
        assert len(counts)==5 and set(counts.values())=={total//5}, counts
    assert len(items) == len({i['id'] for i in items}) == 500
    assert all(len(i['blanks']) >= 2 for i in items if i['level']=='advanced')
    return items, ledger


def main():
    baseline = read(REVIEW / 'baseline-manifest.json')
    current = read(ROOT / 'data/exercises/index.json')
    assert baseline['total_items']==4709 and len(baseline['parts'])==48
    assert current['content_versions']['tenses']==baseline['content_versions']['tenses']
    assert current['content_versions']['comparison'] in {baseline['content_versions']['comparison'],VERSION}
    for file, digest in read(REVIEW/'baseline-hashes.json').items():
        assert hashlib.sha256((ROOT/file).read_bytes()).hexdigest()==digest, file+': input changed'
    items, ledger = authored_items()
    previous = [i for p in baseline['parts'] for i in read(ROOT/p['file'])]
    norm=lambda s:' '.join(re.findall(r'[^\W_]+',s.casefold()))
    prompts={norm(i['prompt']) for i in previous}
    completed={norm(i.get('answer_text','')) for i in previous if i.get('answer_text')}
    for i in items:
        assert norm(i['prompt']) not in prompts, i['id']+': duplicate prompt'
        assert norm(i['answer_text']) not in completed, i['id']+': duplicate completed text'
        prompts.add(norm(i['prompt']));completed.add(norm(i['answer_text']))
    assert not {i['id'] for i in previous} & {i['id'] for i in items}
    descriptors=[]
    for n,file in enumerate(FILES):
        chunk=items[n*100:(n+1)*100]
        if (ROOT/file).exists():
            assert read(ROOT/file)==chunk, 'Refusing to replace unrelated '+file
        write(ROOT/file,chunk)
        descriptors.append(dict(file=file,count=len(chunk),
            levels=dict(sorted(Counter(i['cefr_estimate'] for i in chunk).items())),
            types={'open_brackets':len(chunk)},
            levels3=dict(sorted(Counter(i['level'] for i in chunk).items()))))
    bank=previous+items
    manifest=dict(baseline)
    manifest['parts']=[*baseline['parts'],*descriptors]
    manifest['content_versions']=dict(baseline['content_versions'],comparison=VERSION)
    manifest.update(total_items=len(bank),answer_slots=sum(len(i.get('blanks',[])) or 1 for i in bank),
        levels=dict(sorted(Counter(i['cefr_estimate'] for i in bank).items())),
        levels3=dict(sorted(Counter(i['level'] for i in bank).items())),
        types=dict(sorted(Counter(i['type'] for i in bank).items())),
        sections={'comparison':sum(i['id'].startswith('cmp-') for i in bank),'tenses':sum(not i['id'].startswith('cmp-') for i in bank)})
    comparison=[i for i in bank if i['id'].startswith('cmp-')]
    assert Counter(i['level'] for i in comparison)=={'basic':230,'medium':300,'advanced':300}
    write(ROOT/'data/exercises/index.json',manifest)
    write(REVIEW/'sources.json',{'consulted_on':'2026-11-01','sources':SOURCES})
    with (REVIEW/'source-ledger.csv').open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=list(ledger[0]));writer.writeheader();writer.writerows(ledger)
    print(f'{len(items)} additions / {sum(len(i["blanks"]) for i in items)} fields; Adjectives 230 / 300 / 300; bank {len(bank)} / {manifest["answer_slots"]} / {len(manifest["parts"])}.')


if __name__=='__main__':
    main()
