"""Sentence identity shared with the generated browser/Worker implementation."""
import re
import unicodedata


def assignment_sentence_keys(item):
    prompt=item.get('prompt') or '';options=item.get('options') or []
    gaps=re.findall(r'_{2,}',prompt)
    texts=['\n'.join([prompt,*options]) if options and not gaps and item['type']!='meaning_choice' else prompt]
    completed=[]
    if item.get('answer_text'):completed.append(item['answer_text'])
    if options and item['type']!='meaning_choice':
        indices=item['accepted_option_indices'] if 'accepted_option_indices' in item else [item.get('correct_option_index')]
        for index in indices:
            answer=options[index] if isinstance(index,int) and 0<=index<len(options) else None
            if not isinstance(answer,str):continue
            if gaps:
                pieces=re.split(r'\s*/\s*',answer);iterator=iter(pieces)
                completed.append(re.sub(r'_{2,}',lambda _:next(iterator) if len(pieces)==len(gaps) else answer,prompt))
            elif len(answer.strip().split())>=4:completed.append(answer)
    elif not item.get('blanks') and not options:
        completed.extend([item.get('answer'),*item.get('accepted_answers',[])])
    texts.extend(completed)
    for text in completed:
        if isinstance(text,str):texts.extend(part for part in re.split(r'[.!?]+\s+',text) if len(part.strip().split())>=4)
    def normalise(text):
        text=re.sub(r'^\s*\d+\s*[.)]\s*','',unicodedata.normalize('NFKC',text).lower())
        return ' '.join(''.join(char if char.isalnum() else ' ' for char in text).split())
    return list(dict.fromkeys(['id:'+item['id'],*['sentence:'+normalise(text) for text in texts if isinstance(text,str) and text.strip()]]))
