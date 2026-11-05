"""Trusted server-side grammar checking; no scores are accepted from a browser."""
import re
import unicodedata

NEGATIVES={"won't":"will not","can't":"cannot","shan't":"shall not","isn't":"is not","aren't":"are not","wasn't":"was not","weren't":"were not","haven't":"have not","hasn't":"has not","hadn't":"had not","don't":"do not","doesn't":"does not","didn't":"did not","wouldn't":"would not","couldn't":"could not","shouldn't":"should not","mustn't":"must not","needn't":"need not"}
CONTRACTION=re.compile(r"\b(i|you|he|she|it|we|they|that|there|what|who|here)'(m|re|ve|ll|s|d)\b")
EXPANSIONS={'m':['am'],'re':['are'],'ve':['have'],'ll':['will'],'s':['is','has'],'d':['had','would']}

def forms(value, commas=False):
    text=unicodedata.normalize('NFKC',str(value or '')).strip().lower()
    text=text.replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"')
    text=re.sub(r'\s+[–—-]\s+',' — ',text)
    text=re.sub(r'\s+',' ',text)
    text=re.sub(r'[.!?]+$','',text)
    text=re.sub(r'\bcan not\b','cannot',text)
    text=text.replace('‐','-').replace('‑','-')
    text=re.sub(r'[\s.!?;]+$','',text).strip()
    if commas and len(text)>=2 and text[0]==text[-1] and text[0] in ('"',"'"):
        text=re.sub(r'[\s.!?;]+$','',text[1:-1].strip()).strip()
    if commas:text=re.sub(r'\s+',' ',re.sub(r',(?!\d)',' ',text)).strip()
    spellings={'cozy':'cosy','cozier':'cosier','coziest':'cosiest','color':'colour','colors':'colours','colored':'coloured','colorful':'colourful','neighborhood':'neighbourhood','neighborhoods':'neighbourhoods'}
    text=re.sub(r'\b(?:cozy|cozier|coziest|color|colors|colored|colorful|neighborhood|neighborhoods)\b',lambda m:spellings[m[0]],text)
    text=re.sub(r'\b(well|better|best|good)-(informed|educated|designed|read|looking|off|known|lit)\b',r'\1 \2',text)
    text=re.sub(r'\b(time-consuming|cost-effective|second-largest)\b',lambda m:m[0].replace('-',' '),text)
    text=re.sub(r"\b[a-z]+n't\b",lambda m:NEGATIVES.get(m[0],m[0]),text)
    values=[text]
    for _ in range(16):
        if not any(CONTRACTION.search(v) for v in values):break
        updated=[]
        for v in values:
            m=CONTRACTION.search(v)
            if not m:updated.append(v);continue
            for aux in EXPANSIONS[m[2]]:updated.append(v[:m.start()]+m[1]+' '+aux+v[m.end():])
        values=updated
        if len(values)>256:return set()
    return {re.sub(r"\b(would|could|should|must|might|may|will)'ve\b",r'\1 have',v) for v in values}

STANDARD_V2_NEGATIVES={"isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "hasn't": 'has not', "haven't": 'have not', "hadn't": 'had not', "won't": 'will not', "can't": 'cannot', "couldn't": 'could not', "mustn't": 'must not', "shouldn't": 'should not', "wouldn't": 'would not', "mightn't": 'might not', "needn't": 'need not', "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "shan't": 'shall not'}
STANDARD_V2_SPELLING={'organizer': 'organiser', 'organizers': 'organisers', 'organized': 'organised', 'organizing': 'organising', 'labeler': 'labeller', 'labelers': 'labellers', 'labeled': 'labelled', 'labeling': 'labelling', 'cataloged': 'catalogued', 'cataloging': 'cataloguing', 'cataloger': 'cataloguer', 'recognized': 'recognised', 'digitized': 'digitised', 'color': 'colour', 'colored': 'coloured', 'colors': 'colours', 'center': 'centre', 'centerpiece': 'centrepiece', 'theater': 'theatre', 'neighbor': 'neighbour', 'neighbors': 'neighbours', 'neighborhood': 'neighbourhood', 'fiber': 'fibre', 'fibers': 'fibres', 'tire': 'tyre', 'tires': 'tyres', 'woolen': 'woollen', 'molded': 'moulded', 'artifact': 'artefact', 'artifacts': 'artefacts'}

def standard_form(value):
    text=unicodedata.normalize('NFKC',value).replace('’',"'").replace('‘',"'").replace('ʼ',"'").lower().strip()
    text=re.sub(r"\b(could|should|would|might|must|may)'ve\b",r'\1 have',text)
    text=re.sub(r"\b[a-z]+n't\b",lambda m:STANDARD_V2_NEGATIVES.get(m[0],m[0]),text)
    text=re.sub(r'\bcan not\b','cannot',text)
    text=re.sub(r'\b(dr|mr|mrs|ms|prof)\.(?=\s)',r'\1',text)
    text=re.sub(r'\b[a-z]+\b',lambda m:STANDARD_V2_SPELLING.get(m[0],m[0]),text)
    text=re.sub(r'[.!?\s]+$','',text)
    return re.sub(r'\s+',' ',text).strip()

def modal_form(value):
    text=re.sub('[\u2019\u2018\u02bc]', "'", str(value)).strip().lower()
    text=re.sub(r'\s+', ' ', text)
    return re.sub(r'[.!?]+$', '', text).strip()

def grade(item, submitted):
    if item.get('options'):
        if type(submitted) is not int or submitted<0 or submitted>=len(item['options']):raise ValueError('Выберите ответ.')
        correct=submitted in item.get('accepted_option_indices',[item['correct_option_index']])
        fields=[{'submitted':submitted,'correct':correct,'verified':True}]
    else:
        targets=item.get('blanks') or [item]
        values=submitted if isinstance(submitted,list) else [submitted]
        if len(values)!=len(targets) or any(not isinstance(v,str) or not v.strip() or len(v)>10000 for v in values):raise ValueError('Заполните все поля.')
        fields=[]
        if item.get('grading_mode')=='teacher':
            return {'id':item['id'],'submitted':submitted,'correct':False,'fields':[{'submitted':v,'correct':False,'verified':False} for v in values],'item':item,'checker':3}
        for field,value in zip(targets,values):
            sentence=item['type'] in ('translation_ru_en','transformation','error_correction')
            if item.get('answer_profile')=='modal-exact-v1':
                actual=modal_form(value)
                correct=any(actual==modal_form(answer) for answer in [field['answer'],*field.get('accepted_answers',[])])
            elif item.get('answer_profile')=='english-standard-v2':
                actual=standard_form(value)
                correct=any(actual==standard_form(answer) for answer in [field['answer'],*field.get('accepted_answers',[])])
            else:
                actual=forms(value,sentence)
                correct=any(actual & forms(answer,sentence) for answer in [field['answer'],*field.get('accepted_answers',[])])
            review=item['type']=='translation_ru_en' or (not item.get('blanks') and item['type'] in ('transformation','error_correction'))
            fields.append({'submitted':value,'correct':correct,'verified':correct or not review})
    return {'id':item['id'],'submitted':submitted,'correct':all(f['correct'] for f in fields),'fields':fields,'item':item,'checker':3}
