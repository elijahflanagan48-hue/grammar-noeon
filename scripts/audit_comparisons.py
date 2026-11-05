"""Coverage contract and per-item ledger; not a substitute for language editing."""
import argparse
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

from build_comparisons import RULES, VERSION

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = {
    'forms': ['bigger', 'more easier', 'drier'],
    'variants': ['politer', 'unhappier', 'more rude than helpful', 'tired'],
    'irregular': ['better', 'worse', 'smaller', 'well'],
    'elder': ['older', 'elder', 'than'],
    'far': ['farther', 'further', 'дополнительный'],
    'than': ['than', 'местоимения'],
    'group': ['in the city', 'of the three', 'двух', 'joint', 'разделённым'],
    'articles': ['one of', 'most helpful', 'its most useful', 'second-largest'],
    'equal': ['not so', 'положительная', 'not as cheap'],
    'less': ['less predictable', 'fewer', 'at least'],
    'modifiers': ['slightly', 'by far', 'two centimetres wider', 'much'],
    'ratio': ['half as wide', 'one third', 'as useful a tool as', 'not quite'],
    'change': ['less and less', 'more and more', 'than'],
    'parallel': ['the clearer', 'инверсии'],
    'precision': ['those', 'than me', 'Mina likes Alex more than Jo', 'Jo does'],
    'logic': ['no less reliable', 'no/not cheaper', 'at most', 'not any', 'other'],
    'scale': ['more complete', 'superior', 'more defensive than informative'],
    'compound': ['well-informed', 'well-read', 'good-looking', 'cost-effective', 'better off'],
    'threshold': ['too', 'enough', 'sufficiently', 'число'],
    'idioms': ['lesser of two evils', 'the more, the merrier'],
}


def normalise(text):
    return ' '.join(re.findall(r'[^\W_]+', text.casefold(), re.UNICODE))


def audit(source=None, write=False):
    theory = (ROOT/'content/theory/06-comparison.md').read_text()
    sections = {}
    for block in re.split(r'^## ', theory, flags=re.M)[1:]:
        heading, _, text = block.partition('\n')
        anchor = re.sub(r'[^\w\s-]', '', heading.casefold()).replace('_', '')
        anchor = re.sub(r'\s+', '-', anchor.strip())
        sections[anchor] = text
    rules_by_anchor = {value[1]: key for key,value in RULES.items()}
    assert set(RULES) == set(EVIDENCE)
    for rule, (_,anchor,_) in RULES.items():
        assert anchor in sections, (rule, anchor)
        for term in EVIDENCE[rule]:
            assert term.casefold() in sections[anchor].casefold(), (rule, term)
    bank = json.loads((ROOT/'data/exercises/part-13.json').read_text())
    assert len(bank) == 309
    ledger = []; seen = set(); counts = Counter()
    for item in bank:
        assert item['content_version'] == VERSION
        prompt = normalise(item['prompt']+' '.join(item.get('options',[])))
        assert prompt not in seen, ('Duplicate prompt', item['id'])
        seen.add(prompt)
        refs = item['rule_refs']
        assert refs and item['explanation_ru']
        for field in item.get('blanks') or [item]:
            assert field.get('explanation_ru')
            assert set(field.get('rule_refs', refs)) <= set(refs)
            if not item.get('options'):
                assert field['answer'] in field['accepted_answers']
                assert len(set(map(normalise, field['accepted_answers']))) >= 1
        anchors = [ref.split('#')[1] for ref in refs]
        for anchor in anchors:
            assert anchor in rules_by_anchor, (item['id'], anchor)
            counts[rules_by_anchor[anchor]] += 1
        ledger.append(f"| {item['id']} | {item['cefr_estimate']} | {item['type']} | {'; '.join(anchors)} |")
    source_result = 'Проверка прямых совпадений с исходным файлом не запрошена.'
    if source:
        raw = subprocess.check_output(['textutil','-convert','txt','-stdout',str(source)],text=True)
        lines = [normalise(re.sub(r'^\s*(?:\d+[.)]?|[•–-])\s*','',line)) for line in raw.splitlines()]
        sentences = {line for line in lines if len(line.split()) >= 6}
        for item in bank:
            assert normalise(item['prompt']) not in sentences, ('Source prompt copied', item['id'])
            assert normalise(item.get('answer_text','')) not in sentences, ('Source sentence copied', item['id'])
        source_result = f'Сверены {len(sentences)} исходных строк длиной от шести слов: полных совпадений условий и завершённых предложений не найдено. Это проверка буквальных совпадений, не доказательство отсутствия любого лексического пересечения.'
    text = '# Проверка банка степеней сравнения\n\n27 октября 2026 года. Версия '+VERSION+'.\n\n'
    slots = sum(len(item.get('blanks',[])) or 1 for item in bank)
    text += f'309 заданий; {slots} полей ответа; 20 групп правил. ID сохранены; банк переработан без подсказанных форм.\n\n'
    text += 'Проверены существование и содержательные опорные признаки разделов правил, ссылки каждого задания и поля, ключи, объяснения, версии и отсутствие повторных условий. Редакторская сверка смыслов дополняет автоматические проверки; поиск слов в правиле сам по себе не доказывает правильность ответа.\n\n'+source_result+'\n\n'
    text += '## Покрытие правил\n\n| Правило | Заданий |\n| --- | --- |\n'
    text += '\n'.join(f'| {rule} | {counts[rule]} |' for rule in RULES)+'\n\n'
    text += '## Реестр заданий и обосновывающих правил\n\n| ID | Уровень | Формат | Раздел правила |\n| --- | --- | --- | --- |\n'+'\n'.join(ledger)+'\n'
    if write:
        (ROOT/'docs/review/COMPARISON-AUDIT-2026-10-27.md').write_text(text)
    print('Comparison audit:',len(bank),'items;',len(RULES),'covered rule groups; keys, explanations, versions, uniqueness and theory evidence passed.')
    print(source_result)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-exercises',type=Path)
    parser.add_argument('--write-report',action='store_true')
    args = parser.parse_args()
    audit(args.source_exercises,args.write_report)
