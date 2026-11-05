"""Editorial repairs applied to derived public data, never to source materials."""
import re
from editorial_review import review_item, finish_item

SLOT = re.compile(r"\((?:to )?[^)]+\)")
ADVERBS = ('already', 'just', 'never', 'always', 'still', 'ever', 'often', 'usually', 'sometimes', 'yet')


def repair_item(item):
    item = review_item(item)
    if item.get('type') != 'open_brackets':
        return finish_item(item)
    if item['id'] == 'src-u07-098':
        item['prompt'] = item['prompt'].replace('(to get) to know about', '(to find out) about')
        item['blanks'][0]['base_verb'] = 'find out'
    parts = SLOT.split(item['prompt'])
    slots = SLOT.findall(item['prompt'])
    changed = False
    for k, blank in enumerate(item['blanks']):
        for word in ADVERBS:
            if not re.search(r'\b' + word + r'\b', blank['answer'], re.I):
                continue
            before = re.compile(r'\b' + word + r'\s*$', re.I)
            after = re.compile(r'^\s*' + word + r'\b', re.I)
            if before.search(parts[k]) or after.search(parts[k+1]):
                parts[k] = before.sub('', parts[k])
                parts[k+1] = after.sub('', parts[k+1])
                slots[k] = '(' + word + ' / ' + slots[k][1:-1] + ')'
                changed = True
    item['prompt'] = ''.join(part + (slots[k] if k < len(slots) else '') for k,part in enumerate(parts))
    if item['id'] == 'src-u09-010':
        item['prompt'] = item['prompt'].replace('twice already.', 'twice.')
    if changed:
        item['review_note_ru'] = 'В ответ включите форму глагола и наречие, указанное в скобках.'
    # Completed text must always come from the visible frame and the exact keys.
    answers = iter(blank['answer'] for blank in item['blanks'])
    item['answer_text'] = SLOT.sub(lambda _: next(answers), item['prompt'])
    # Confirmed tense metadata errors are preserved across future imports.
    if item['id'] in ('src-u07-080', 'src-u10-067'):
        for blank in item['blanks']:
            if blank['answer'] == 'overslept':
                blank.update(tense_or_construction='past_simple', rule_refs=['content/tenses/03-past.md#past-simple'], explanation_ru='Past Simple: overslept — завершённое событие в прошлом.')
        item['tags'] = sorted({b['tense_or_construction'] for b in item['blanks']})
        item['explanation_ru'] = ' '.join(b['explanation_ru'] for b in item['blanks'])
    if item['id'].startswith('src-'):
        item['rule_refs'] = list(dict.fromkeys(ref for blank in item['blanks'] for ref in blank.get('rule_refs',[])))
    return finish_item(item)
