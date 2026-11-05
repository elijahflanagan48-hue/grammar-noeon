"""Reproduce the additive 2026-10-30 bank expansion from reviewed activity frames.

Only bal-20261030-* records are generated. Historical parts are never rewritten.
Activities are bounded tasks: ongoing readings use a duration/progress context;
perfect-simple readings explicitly refer to a completed result.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'tenses-2026-10-30.1'
# base | past | participle | -ing | task | lexical level | plausible duration
ACTIVITIES = """
read|read|read|reading|the travel guide|A2|an hour
write|wrote|written|writing|the birthday invitation|A2|half an hour
make|made|made|making|a model boat|A2|two hours
draw|drew|drawn|drawing|a picture of the harbour|A2|an hour
paint|painted|painted|painting|the garden gate|A2|two hours
clean|cleaned|cleaned|cleaning|the kitchen|A2|an hour
wash|washed|washed|washing|the muddy football kit|A2|half an hour
repair|repaired|repaired|repairing|the old bicycle|A2|two hours
build|built|built|building|a wooden bird table|A2|three hours
pack|packed|packed|packing|the camping equipment|A2|an hour
prepare|prepared|prepared|preparing|the picnic lunch|A2|half an hour
bake|baked|baked|baking|a loaf of bread|A2|an hour
knit|knitted|knitted|knitting|a woollen scarf|B1|two hours
sew|sewed|sewn|sewing|a cover for the sofa|B1|three hours
copy|copied|copied|copying|the notes from the lesson|A2|half an hour
check|checked|checked|checking|the answers to the quiz|A2|half an hour
sort|sorted|sorted|sorting|the photographs from the trip|A2|an hour
tidy|tidied|tidied|tidying|the shelves in the study|A2|an hour
decorate|decorated|decorated|decorating|the hall for the party|B1|two hours
plant|planted|planted|planting|a row of apple trees|A2|three hours
water|watered|watered|watering|the plants in the greenhouse|A2|half an hour
polish|polished|polished|polishing|the wooden dining table|B1|half an hour
wrap|wrapped|wrapped|wrapping|the presents for the children|A2|an hour
design|designed|designed|designing|a poster for the school fair|B1|two hours
edit|edited|edited|editing|the interview for the local paper|B1|two hours
translate|translated|translated|translating|the article about local wildlife|B1|three hours
record|recorded|recorded|recording|the audio guide for the museum|B1|two hours
film|filmed|filmed|filming|a short documentary about the canal|B1|three hours
rehearse|rehearsed|rehearsed|rehearsing|the final scene of the play|B1|an hour
practise|practised|practised|practising|the piano piece for the concert|A2|an hour
learn|learnt|learnt|learning|the lines for the school play|A2|two hours
test|tested|tested|testing|the new booking system|B1|three hours
update|updated|updated|updating|the visitor information on the website|B1|an hour
organise|organised|organised|organising|the materials for the workshop|B1|two hours
assemble|assembled|assembled|assembling|the flat-pack bookcase|B1|two hours
restore|restored|restored|restoring|the damaged oil painting|B2|three hours
compile|compiled|compiled|compiling|the annual sales report|B2|three hours
analyse|analysed|analysed|analysing|the results of the survey|B2|three hours
compare|compared|compared|comparing|the quotations from the builders|B1|an hour
calculate|calculated|calculated|calculating|the cost of the renovation|B1|two hours
revise|revised|revised|revising|the first draft of the proposal|B2|two hours
proofread|proofread|proofread|proofreading|the manuscript for the publisher|B2|three hours
transcribe|transcribed|transcribed|transcribing|the interview with the witness|B2|two hours
catalogue|catalogued|catalogued|cataloguing|the books donated to the library|B2|three hours
digitise|digitised|digitised|digitising|the letters in the family archive|B2|three hours
map|mapped|mapped|mapping|the footpaths around the village|B1|three hours
survey|surveyed|surveyed|surveying|the site of the new footbridge|B2|three hours
inspect|inspected|inspected|inspecting|the roof of the community centre|B1|an hour
service|serviced|serviced|servicing|the engine of the rescue boat|B2|two hours
install|installed|installed|installing|the lighting for the exhibition|B1|three hours
configure|configured|configured|configuring|the router for the new office|B2|an hour
debug|debugged|debugged|debugging|the code for the payment screen|B2|three hours
evaluate|evaluated|evaluated|evaluating|the applications for the research grant|B2|three hours
assess|assessed|assessed|assessing|the damage to the railway bridge|B2|two hours
draft|drafted|drafted|drafting|the agreement for the new partnership|B2|two hours
rewrite|rewrote|rewritten|rewriting|the introduction to the report|B1|an hour
illustrate|illustrated|illustrated|illustrating|the chapter about garden birds|B2|three hours
embroider|embroidered|embroidered|embroidering|the pattern on the tablecloth|B2|three hours
carve|carved|carved|carving|a wooden sign for the shop|B1|two hours
weave|wove|woven|weaving|a basket for the display|B2|three hours
sand|sanded|sanded|sanding|the surface of the old desk|B2|an hour
tile|tiled|tiled|tiling|the floor of the bathroom|B1|three hours
lay|laid|laid|laying|the carpet in the spare room|B1|two hours
plaster|plastered|plastered|plastering|the wall behind the fireplace|B2|two hours
stitch|stitched|stitched|stitching|the torn lining of the coat|B2|an hour
research|researched|researched|researching|the history of the market square|B1|three hours
investigate|investigated|investigated|investigating|the cause of the power failure|B2|three hours
reconstruct|reconstructed|reconstructed|reconstructing|the sequence of events before the collision|C1|three hours
reconcile|reconciled|reconciled|reconciling|the discrepancies in the quarterly accounts|C1|three hours
calibrate|calibrated|calibrated|calibrating|the sensors on the weather station|C1|two hours
scrutinise|scrutinised|scrutinised|scrutinising|the evidence submitted to the inquiry|C1|three hours
annotate|annotated|annotated|annotating|the manuscript for the critical edition|C1|three hours
decipher|deciphered|deciphered|deciphering|the faded inscription on the stone|C1|two hours
formulate|formulated|formulated|formulating|a response to the objections raised by the panel|C1|two hours
substantiate|substantiated|substantiated|substantiating|the claims made in the funding application|C1|three hours
refine|refined|refined|refining|the methodology for the longitudinal study|C1|three hours
disentangle|disentangled|disentangled|disentangling|the competing accounts of the disputed incident|C2|three hours
contextualise|contextualised|contextualised|contextualising|the allusions in the previously unpublished poem|C2|three hours
collate|collated|collated|collating|the variant readings in the surviving manuscripts|C2|three hours
elucidate|elucidated|elucidated|elucidating|the implications of the proposed constitutional amendment|C2|three hours
summarise|summarised|summarised|summarising|the findings of the independent review|B2|two hours
label|labelled|labelled|labelling|the specimens for the exhibition|B1|an hour
measure|measured|measured|measuring|the windows for the new curtains|A2|half an hour
fold|folded|folded|folding|the leaflets for the charity event|A2|an hour
type|typed|typed|typing|the minutes of the meeting|B1|an hour
scan|scanned|scanned|scanning|the receipts for the accountant|B1|an hour
review|reviewed|reviewed|reviewing|the lesson plan for the new course|B1|two hours
adapt|adapted|adapted|adapting|the story for a radio play|B2|three hours
arrange|arranged|arranged|arranging|the music for the string quartet|B2|three hours
compose|composed|composed|composing|the music for the opening scene|B2|three hours
""".strip()
ROWS = [line.split('|') for line in ACTIVITIES.splitlines()]
SUBJECTS = [('I', 'I'), ('you', 'you'), ('he', 's'), ('she', 's'), ('we', 'p'), ('they', 'p'),
            ('Maya', 's'), ('Daniel', 's'), ('the volunteers', 'p'), ('my cousin', 's'),
            ('the students', 'p'), ('a colleague', 's')]
LEVELS = ['A1', 'A2', 'B1', 'B1+', 'B2', 'C1', 'C2']
SPECS = {
 'present_simple': (141, 0, 'A2', 'present', 'present-simple', 'Регулярное действие.', 'Регулярность выражена обстоятельством частоты. В утвердительной форме у he/she/it к основе добавляется -s/-es; у остальных подлежащих используется основа.'),
 'present_continuous': (160, 28, 'A2', 'present', 'present-continuous', 'Процесс в момент речи.', 'Контекст прямо описывает незавершённое действие сейчас: am/is/are + V-ing. Выбор am/is/are определяется подлежащим.'),
 'present_perfect': (7, 12, 'B1', 'present', 'present-perfect-simple', 'Уже готовый результат к настоящему моменту.', 'Важен готовый результат сейчас, без законченного прошлого времени: have/has + V3. Речь о завершении задачи, а не о длительности процесса.'),
 'present_perfect_continuous': (201, 39, 'B1+', 'present', 'present-perfect-continuous', 'Длительность процесса до настоящего момента.', 'Указана длительность деятельности от её начала до настоящего; работа ещё продолжается: have/has been + V-ing. For вводит длительность.'),
 'past_simple': (46, 0, 'A2', 'past', 'past-simple', 'Завершённое действие в прошлом.', 'Действие целиком относится к законченному прошлому: используется V2. В отрицании после did not нужна основа глагола.'),
 'past_continuous': (211, 50, 'A2', 'past', 'past-continuous', 'Процесс в указанный момент прошлого.', 'Действие находилось в процессе в названный прошлый момент: was/were + V-ing. У I/he/she/it — was, у you/we/they — were.'),
 'past_perfect': (222, 47, 'B1+', 'past', 'past-perfect-simple', 'Уже готовый результат к прошлому моменту.', 'Завершение задачи предшествует указанной точке в прошлом: had + V3. Речь о готовом результате к тому моменту.'),
 'past_perfect_continuous': (239, 74, 'B2', 'past', 'past-perfect-continuous', 'Длительность процесса до момента в прошлом.', 'Процесс начался раньше названного прошлого момента и длился до него; задача тогда ещё не была закончена: had been + V-ing.'),
 'future_simple': (219, 37, 'A2', 'future', 'future-simple-will-v1', 'Спонтанное обещание. Используйте will.', 'Говорящий берёт на себя обязательство в момент речи: will + основа глагола. Это обещание, а не сообщение о заранее устроенной договорённости.'),
 'future_continuous': (233, 84, 'B1+', 'future', 'future-continuous-will-be-v-ing', 'Процесс в указанный момент будущего. Используйте will.', 'В указанный будущий момент действие будет в процессе: will be + V-ing. Здесь не требуется длительность от начала процесса.'),
 'future_perfect': (223, 69, 'B2', 'future', 'future-perfect-simple-will-have-v3', 'Уже готовый результат к будущему сроку. Используйте will.', 'Речь о результате, который уже будет достигнут к будущему сроку: will have + V3. By задаёт срок; инструкция требует взгляда назад из будущего.'),
 'future_perfect_continuous': (242, 84, 'B2', 'future', 'future-perfect-continuous-will-have-been-v-ing', 'Длительность процесса к будущему моменту. Используйте will.', 'Указано, сколько времени будет длиться деятельность к будущей точке; она тогда ещё будет продолжаться: will have been + V-ing.'),
}

def third(base):
    if base.endswith('y') and base[-2] not in 'aeiou':
        return base[:-1] + 'ies'
    return base + ('es' if base.endswith(('s', 'sh', 'ch', 'x', 'z', 'o')) else 's')

def answer(tense, person, row, negative=False):
    base, past, participle, ing = row[:4]
    have = 'has' if person == 's' else 'have'
    be = 'am' if person == 'I' else 'is' if person == 's' else 'are'
    was = 'was' if person in ('I', 's') else 'were'
    if negative:
        return {'present_simple': ('does' if person == 's' else 'do') + ' not ' + base,
                'past_simple': 'did not ' + base, 'future_simple': 'will not ' + base}[tense]
    return {'present_simple': third(base) if person == 's' else base,
            'present_continuous': be + ' ' + ing, 'present_perfect': have + ' ' + participle,
            'present_perfect_continuous': have + ' been ' + ing, 'past_simple': past,
            'past_continuous': was + ' ' + ing, 'past_perfect': 'had ' + participle,
            'past_perfect_continuous': 'had been ' + ing, 'future_simple': 'will ' + base,
            'future_continuous': 'will be ' + ing, 'future_perfect': 'will have ' + participle,
            'future_perfect_continuous': 'will have been ' + ing}[tense]

def sentence(tense, subject, row, variant, negative=False):
    base, _, _, _, task, _, duration = row
    clause = f'{subject} (not to {base}) {task}' if negative else f'{subject} (to {base}) {task}'
    clause = clause[0].upper() + clause[1:]
    # Each frame explicitly supplies the relevant temporal perspective. Imperfective
    # titles distinguish grammatical alternatives that the English alone permits.
    if tense == 'present_simple':
        starts = ['As part of a regular routine', 'As a regular task', 'In a typical week', 'As a matter of routine']
        times = ['every Monday', 'once a week', 'every Friday', 'twice a month', 'every fortnight', 'each weekend']
        return f'{starts[variant % 4]}, {clause[0].lower() + clause[1:] if subject not in ("I", "Maya", "Daniel") else clause} {times[variant % 6]}.'
    if tense == 'present_continuous':
        tails = ['right now; the task is still in progress', 'at this very moment; the task is not finished', 'right now, in the middle of the task', 'at the moment; this is a live description', 'now; this describes an activity in progress', 'right now; this is a snapshot of the activity']
        return f'{clause} {tails[variant % 6]}.'
    if tense == 'present_perfect':
        return f'{clause}; that task is now complete, so there is nothing left to do.'
    if tense == 'present_perfect_continuous':
        tails = ['without a break', 'continuously', 'with no interruption']
        return f'{clause} for {duration} {tails[variant % 3]}, and the task is still in progress now.'
    if tense == 'past_simple':
        times = ['yesterday', 'last Saturday', 'last Tuesday', 'two days ago', 'last weekend', 'on Monday last week']
        return f'{clause} {times[variant % 6]}' + ('; the task was left undone.' if negative else ', completing the whole task that day.')
    if tense == 'past_continuous':
        moments = ['At ten yesterday morning', 'At three yesterday afternoon', 'When the phone rang yesterday', 'When the lights went out last night', 'At the moment the visitors arrived yesterday', 'When the alarm sounded yesterday']
        lower = clause if subject in ('I', 'Maya', 'Daniel') else clause[0].lower() + clause[1:]
        return f'{moments[variant % 6]}, {lower}; this was the activity in progress at that moment.'
    if tense == 'past_perfect':
        moments = ['By the time the visitors arrived yesterday', 'By noon yesterday', 'By the time the inspection began last Friday', 'By the time the photographs were taken yesterday', 'By the time the supervisor returned on Monday', 'By six o’clock yesterday evening']
        lower = clause if subject in ('I', 'Maya', 'Daniel') else clause[0].lower() + clause[1:]
        return f'{moments[variant % 6]}, {lower}; the whole task was already complete at that point.'
    if tense == 'past_perfect_continuous':
        moments = ['When the phone rang yesterday', 'When the visitors arrived yesterday', 'When the supervisor returned on Monday', 'When the alarm sounded yesterday', 'When the lights went out last night', 'When the inspection began last Friday']
        lower = clause if subject in ('I', 'Maya', 'Daniel') else clause[0].lower() + clause[1:]
        return f'{moments[variant % 6]}, {lower} continuously for {duration}; the task was still unfinished then.'
    if tense == 'future_simple':
        # Quoted offers/commitments suit I/we rather than third-person promises.
        starts = ['All right', 'Very well', 'You have my word', 'I promise', 'It’s a deal', 'Agreed']
        lower = clause if subject in ('I', 'Maya', 'Daniel') else clause[0].lower() + clause[1:]
        deadline = ['tomorrow', 'next Tuesday', 'this afternoon'][variant // len(ROWS) % 3]
        return f'“{starts[variant % 6]}: {lower} {deadline},” comes the immediate reply.'
    if tense == 'future_continuous':
        moments = ['At ten tomorrow morning', 'At three tomorrow afternoon', 'At this time tomorrow', 'When you phone tomorrow morning', 'When you arrive tomorrow afternoon', 'At noon next Saturday']
        lower = clause if subject in ('I', 'Maya', 'Daniel') else clause[0].lower() + clause[1:]
        return f'{moments[variant % 6]}, {lower}; that will be the activity in progress at that moment.'
    if tense == 'future_perfect':
        moments = ['By noon tomorrow', 'By the time you arrive tomorrow', 'By six o’clock tomorrow evening', 'By the time the inspection begins next Friday', 'By the time the visitors arrive on Monday', 'By this time next Saturday']
        lower = clause if subject in ('I', 'Maya', 'Daniel') else clause[0].lower() + clause[1:]
        return f'{moments[variant % 6]}, {lower}; the whole task will already be complete at that point.'
    moments = ['By noon tomorrow', 'By three tomorrow afternoon', 'By six o’clock tomorrow evening', 'By the time you arrive tomorrow', 'By the time the visitors arrive on Monday', 'By this time next Saturday']
    lower = clause if subject in ('I', 'Maya', 'Daniel') else clause[0].lower() + clause[1:]
    return f'{moments[variant % 6]}, {lower} continuously for {duration}; the task will still be in progress then.'

def generate():
    output = []
    for tense, (count, extra, minimum, time, anchor, title, explanation) in SPECS.items():
        for n in range(count):
            ident = f'bal-20261030-{tense.replace("_", "-")}-{n + 1:03d}'
            slots = 1 + (n < extra)
            if tense == 'present_perfect':
                slots = 3 if n < 5 else 2
            prompts, blanks, levels = [], [], [minimum]
            for slot in range(slots):
                k = n + slot * 31
                row = ROWS[(k * 17 + list(SPECS).index(tense) * 7) % len(ROWS)]
                subject, person = SUBJECTS[(k // len(ROWS) * 5 + k) % len(SUBJECTS)]
                if tense == 'future_simple':
                    subject, person = ('I', 'I') if k % 2 == 0 else ('we', 'p')
                negative = tense in ('present_simple', 'past_simple') and k % 7 == 0
                prompts.append(sentence(tense, subject, row, k, negative))
                levels.append(row[5])
                key = answer(tense, person, row, negative)
                refs = [f'content/tenses/{dict(present="02-present", past="03-past", future="04-future")[time]}.md#{anchor}']
                variants = [key]
                for regular, alternative in [('learnt', 'learned'), ('knitted', 'knit'), ('sewn', 'sewed')]:
                    if regular in key.split():
                        variants.append(' '.join(alternative if word == regular else word for word in key.split()))
                blanks.append(dict(id=f'{ident}-b{slot + 1}', base_verb=('not ' if negative else '') + row[0],
                                   answer=key, accepted_answers=variants, tense_or_construction=tense,
                                   rule_refs=refs, explanation_ru=explanation))
            prompt = ' '.join(prompts)
            if tense == 'present_perfect' and slots > 1:
                prompt = 'All these tasks are now complete. ' + ' '.join(p.split(';')[0] + '.' for p in prompts)
            keys = iter(b['answer'] for b in blanks)
            completed = re.sub(r'\([^()]+\)', lambda _: next(keys), prompt)
            output.append(dict(id=ident, type='open_brackets', title=title, prompt=prompt,
                               answer_text=completed, blanks=blanks, explanation_ru=explanation,
                               cefr_estimate=max(levels, key=LEVELS.index), tags=[tense], practice_tenses=[tense],
                               rule_refs=refs, content_version=VERSION, response_contract='bounded-v1'))
    assert len({i['prompt'] for i in output}) == len(output), 'Repeated prompt'
    return output

def main():
    manifest_path = ROOT / 'data/exercises/index.json'
    manifest = json.loads(manifest_path.read_text())
    for part in manifest['parts']:
        if int(re.search(r'part-(\d+)', part['file'])[1]) >= 14:
            records = json.loads((ROOT / part['file']).read_text())
            if any(not item['id'].startswith('bal-20261030-') for item in records):
                raise SystemExit('Refusing to replace a later or unrelated bank expansion: ' + part['file'])
    existing = [p for p in manifest['parts'] if int(re.search(r'part-(\d+)', p['file'])[1]) < 14]
    additions = generate()
    def counts(items, key):
        return dict(sorted(Counter(i[key] for i in items).items()))
    parts = existing[:]
    for offset in range(0, len(additions), 100):
        chunk = additions[offset:offset + 100]
        name = f'data/exercises/part-{14 + offset // 100:02d}.json'
        (ROOT / name).write_text(json.dumps(chunk, ensure_ascii=False, indent=2) + '\n')
        parts.append(dict(file=name, count=len(chunk), levels=counts(chunk, 'cefr_estimate'), types=counts(chunk, 'type')))
    bank = [item for part in parts for item in json.loads((ROOT / part['file']).read_text())]
    manifest.update(content_version=VERSION, total_items=len(bank), answer_slots=sum(len(i.get('blanks', [])) or 1 for i in bank),
                    levels=counts(bank, 'cefr_estimate'), types=counts(bank, 'type'), parts=parts,
                    sections=dict(comparison=sum(i['id'].startswith('cmp-') for i in bank), tenses=sum(not i['id'].startswith('cmp-') for i in bank)))
    manifest['content_versions']['tenses'] = VERSION
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Added {len(additions)} exercises; bank {len(bank)} / {manifest["answer_slots"]} fields.')

if __name__ == '__main__':
    main()
