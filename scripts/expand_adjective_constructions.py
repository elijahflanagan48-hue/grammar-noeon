"""Append 70 basic / 100 medium items and diversify 12 advanced snapshots.
All changes are versioned data in the existing bounded open_brackets format.
"""
from pathlib import Path
from collections import Counter
import csv
import json
import re
import hashlib
from build_comparisons import RULES
from expand_adjectives_300 import SOURCES as PREVIOUS_SOURCES, field_explanation

ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/review/ADJECTIVES-CONSTRUCTIONS-2026-11-01'
VERSION='comparison-2026-11-01.3'
SLOT=re.compile(r'\(([^)]+)\)')
read=lambda p:json.loads(p.read_text())
def write(p,value):p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

SOURCES=dict(PREVIOUS_SOURCES)
for key,title,path,note in [
 ('C-POSITION','Adjective phrases: position','grammar/british-grammar/adjective-phrases-position','Порядок as/so + adjective + a/an + noun в письменном английском.'),
 ('C-ANY','Any — comparative use','grammar/british-grammar/any','Any с comparative в вопросах и отрицании.'),
 ('C-AS','As … as','grammar/british-grammar/as-as','Равенство, отрицание, возможность/предел и сравнение количеств.'),
 ('C-SUPERIOR','Superior','dictionary/english/superior','Superior to: сравнение качества/ранга с предлогом to.'),
 ('C-INFERIOR','Inferior','dictionary/english/inferior','Inferior to: качество ниже указанной базы.'),
 ('C-SENIOR','Senior','dictionary/english/senior','Senior to: ранг выше, не senior than.'),
 ('C-JUNIOR','Junior','dictionary/english/junior','Junior to: ранг ниже.'),
 ('C-PREFERABLE','Preferable to something','dictionary/english/preferable-to','Preferable to: более подходящий вариант, без дополнительного more.'),
 ('C-MERRIER','The more the merrier','dictionary/english/more-the-merrier','Чем больше участников, тем веселее: фиксированный сравнительный оборот.'),
 ('C-WISER','None the wiser','us/dictionary/english/none-the-wiser','Устойчивый оборот: не знать/понимать больше, чем до объяснения.'),
 ('C-LESSER','The lesser of two evils','us/dictionary/english/lesser-of-two-evils','Менее нежелательный из двух плохих вариантов.'),
 ('C-ALL','All the better, stronger …','dictionary/english/all-the-better-stronger-more-exciting-etc','All the + comparative усиливает сравнительный признак.'),
 ('C-OFF','Better off','dictionary/english/better-off?q=better-off_1','Better off: более благоприятное, в том числе финансовое, положение.'),
 ('C-MORE-NOUN','More','us/dictionary/english/more','More of a noun than a noun: классифицирующее противопоставление.'),
 ('C-FIDDLE','Be as fit as a fiddle','dictionary/english/be-as-fit-as-a-fiddle','Образное as + положительная форма + as.'),
 ('C-BONE','As dry as a bone','dictionary/english/as-dry-as-a-bone','Фиксированное образное сравнение крайней сухости.'),
 ('C-DOUBLE','Double','dictionary/english/double','Кратность по размеру/количеству.'),
]:SOURCES[key]=dict(publisher='Cambridge University Press & Assessment',title=title,url='https://dictionary.cambridge.org/'+path,evidence=note)
SOURCES['BC-SO']=dict(publisher='British Council',title="Intensifiers: so and such",url='https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/intensifiers-so-such',evidence='So + adjective; such + a/an + adjective + noun; so much + comparative; связь с результатом через that.')
SOURCES['C-ADV-INDEX']=dict(publisher='Cambridge University Press & Assessment',title='Advanced Grammar in Use, Martin Hewings — index of grammatical items',url='https://assets.cambridge.org/97811076/99892/index/9781107699892_index.pdf',evidence='С. 146: as + adjective + a/an + noun; so + adjective + as + to-infinitive; too, enough, sufficiently и количественные сравнения. Индекс подтверждает охват, а порядок as/so в именной группе сверяется также по C-POSITION.')

# code -> local theory family, what is actually graded, authoritative sources.
SPECS={}
def spec(codes,rule,why,sources):
 for code in codes.split():SPECS[code]=(rule,why,sources.split())
spec('regular_er','forms','Обычная сравнительная/превосходная форма короткого прилагательного, с нужным написанием суффикса.','C-COMP BC-COMP')
spec('regular_more','forms','Аналитическая степень длинного прилагательного: more/most, без суффикса -er/-est.','C-COMP')
spec('variant','variants','Нормативная форма прилагательного, включая указанные в ключе равноправные варианты.','C-COMP BC-COMP P-ADV')
spec('irregular','irregular','Неправильная степень good/bad: better/best или worse/worst по контексту.','BC-COMP')
spec('compound','compound','Сравнивается всё составное прилагательное; нельзя соединять more и better в одной форме.','C-COMP P-ADV')
spec('full_than than_pronoun than_clause than_possessive','than','Сравнительная степень + than и подходящая вторая часть: существительное, местоимение или полная часть предложения.','C-COMP')
spec('super_group super_in super_of','group','Превосходная степень внутри названной группы; in/of уже задают группу, их не нужно добавлять повторно.','C-COMP')
spec('super_infinitive','group','Превосходная степень с to-infinitive, который выделяет участника по достижению.','C-COMP')
spec('formal_two','group','В явно заданном традиционном формальном сравнении двух используется comparative: the … of the two.','C-COMP')
spec('possessive_super full_super ordinal one_of super_ever','articles','Определитель/порядковое место/группа и превосходная степень должны согласовываться; my заменяет the, после one of существительное во множественном числе.','C-COMP')
spec('self_super','articles','Сопоставляются состояния одного объекта: at its + superlative.','C-COMP')
spec('zero_the','articles','В сказуемом без следующего существительного возможна превосходная степень без the.','C-COMP')
spec('most_very','articles','Most здесь усилитель «весьма», а не выбор лучшего в группе. После уже напечатанного most нужна основа.','C-COMP')
spec('joint_super','group','Joint + superlative допускает разделённое первое место.','C-COMP')
spec('as_equal just_as full_equal not_as full_not_as not_so full_not_so','equal','Равенство: as + положительная форма + as. Отрицание: not as/not so … as. В полном сочетании нужны оба as и заданное отрицание.','C-EQUAL BC-MOD')
spec('nearly_as not_quite_as','ratio','Nearly/almost/not quite уточняют степень сходства; внутри as … as остаётся положительная форма.','BC-MOD')
spec('formal_as_noun full_formal_noun','ratio','Письменная именная модель: as + adjective + a/an + noun + as; артикль стоит после прилагательного.','C-POSITION C-ADV-INDEX')
spec('full_as_possible','equal','As + положительная форма + as possible задаёт максимально возможную степень признака.','C-AS')
spec('less least no_less','less','Less/least уже задают направление степени; при напечатанном показателе вводится основа, а no less допускает равенство.','C-COMP C-NO')
spec('threshold_too threshold_enough full_enough','threshold','Too + adjective + to/for и adjective + enough + to/for различаются положением показателя и смыслом избытка/достаточности.','C-TOO BC-ENOUGH')
spec('so_such','threshold','So + adjective и such + a/an + adjective + noun усиливают признак; перед comparative нужен so much.','BC-SO')
spec('threshold_sufficiently','threshold','Sufficiently + положительная форма означает достаточную степень признака для указанной цели.','C-ADV-INDEX')
spec('full_formal_degree','threshold','Формальный порядок so + adjective + a/an + noun; as to + infinitive указывает результат или достаточное основание.','C-POSITION C-ADV-INDEX')
spec('ratio_twice ratio_half ratio_times ratio_fraction full_ratio ratio_noun','ratio','Кратность отличается от прибавки: twice/half/three times/one third as … as либо коэффициент + the size/length of.','C-AS C-DOUBLE')
spec('measure_difference full_measure','modifiers','Мера перед comparative задаёт разницу, не коэффициент: three centimetres longer than.','C-COMP')
spec('modifier_big modifier_small modifier_even modifier_super','modifiers','Усилитель/смягчитель должен соответствовать степени: much/slightly/even/still + comparative; by far/easily + superlative.','BC-MOD P-ADV')
spec('repeat_short repeat_more repeat_less full_progressive','change','Постепенное изменение: comparative and comparative либо more and more/less and less + основа. После всей модели не добавляется than.','C-COMP P-ADV')
spec('parallel_up parallel_down full_parallel','parallel','В обеих частях коррелятивной модели нужен the + comparative. Контекст определяет увеличение или уменьшение второго признака.','C-PARALLEL P-ADV')
spec('older elder_family','elder','Older сравнивает возраст с than; elder возможен перед существительным о семье.','C-OLD')
spec('further_distance further_additional','far','Для расстояния допустимы farther/further и farthest/furthest; «дополнительный» — только further.','C-FAR')
spec('ellipsis full_ellipsis full_pronoun that_those full_precise','precision','Сопоставляются одинаковые величины. That/those заменяют существительное, полная часть уточняет участника, а than expected допускает предсказуемое сокращение.','C-COMP C-EQUAL')
spec('boundary full_boundary any_comparative','logic','No/any сочетаются с comparative. Для no + comparative контекст задаёт включённую границу, для отрицания/вопроса any не заменяет comparative.','C-NO C-ANY')
spec('contrast_more full_contrast not_so_much rather_than full_comparative_noun','scale','Сопоставляются описания одного предмета: more + основа + than, not so much … as или rather than. Это не обычное ранжирование двух предметов.','P-ADV C-MORE-NOUN')
spec('full_lexical','scale','Superior/inferior/senior/junior/preferable требуют to в сравнительном значении, без добавления than.','C-SUPERIOR C-INFERIOR C-SENIOR C-JUNIOR C-PREFERABLE')
spec('scale_graded','scale','Complete здесь степень полноты охвата, поэтому more complete допустимо; не утверждается абсолютная завершённость.','C-COMP P-ADV')
spec('full_negative_max','modifiers','Could not have been more + adjective выражает максимально высокую оценку; отрицание не превращает more в less.','C-MORE-NOUN P-ADV')
spec('idiom_merrier','idioms','The more, the merrier — устойчивое приглашение к большему числу участников. Many даёт more, merry — merrier.','C-MERRIER')
spec('idiom_wiser','idioms','В none the wiser нужна фиксированная сравнительная форма wiser: после объяснения понимание не увеличилось.','C-WISER')
spec('idiom_lesser','idioms','В the lesser of two evils употребляется lesser, а не less или smallest.','C-LESSER')
spec('idiom_all','idioms','All the + comparative подчёркивает усиление признака по названной причине.','C-ALL')
spec('idiom_off','compound','Better off/worse off обозначают улучшение/ухудшение положения; off уже дано и не повторяется.','C-OFF')
spec('positive_idiom','idioms','В образном as … as употребляется положительная форма; устойчивый образ не является числовым сравнением.','C-FIDDLE C-BONE')
spec('quant_equality quant_fewer quant_less','less','Смежное количественное сравнение: many/few с исчисляемым множественным, much/little с неисчисляемым; fewer/less — сравнительные формы.','C-EQUAL C-COMP')


def make_item(ident,level,code,prompt,keys,mode='form',prior=None):
 rule,why,sources=SPECS[code]
 refs=[f'content/comparison/06-comparison.md#{RULES[rule][1]}']
 matches=list(SLOT.finditer(prompt));variants=[k.split('~') for k in keys.split(';')]
 assert len(matches)==len(variants),(ident,len(matches),len(variants))
 blanks=[];ledger=[]
 for n,(match,answers) in enumerate(zip(matches,variants),1):
  assert 1<=len(answers)<=2
  # A mixed question may use the special structure in the first gap, with an
  # ordinary comparative in the second. Explain that second gap independently.
  special=(n==1 or code in {'full_parallel','idiom_off'})
  if special:explanation=why;field_sources=sources
  else:
   explanation,field_sources=field_explanation('forms',match[1].lower(),answers,prompt[:match.start()],prompt[match.end():])
  explanation+=' Основной ответ: '+answers[0]+'.'
  if len(answers)>1:explanation+=' Также принимается: '+answers[1]+'.'
  blanks.append(dict(id=ident+f'-b{n}',base_adjective=match[1],answer=answers[0],accepted_answers=answers,rule_refs=refs,explanation_ru=explanation))
  ledger.append(dict(item_id=ident,field=n,level=level,construction=code,rule=rule,mode=mode,
    sources=';'.join(dict.fromkeys(field_sources)),checked_answer=' / '.join(answers)))
 values=iter(b['answer'] for b in blanks)
 item=dict(id=ident,type='open_brackets',level=level,cefr_estimate={'basic':'A2','medium':'B1','advanced':'B2'}[level],
  topic='comparison',content_version=VERSION,response_contract='bounded-v1',prompt=prompt,blanks=blanks,
  practice_tenses=[RULES[rule][0]],tags=[RULES[rule][0]],rule_refs=refs,
  answer_text=SLOT.sub(lambda _:next(values),prompt),explanation_ru=' '.join(f'{n}) '+b['explanation_ru'] for n,b in enumerate(blanks,1)))
 if mode=='chunk':item['title']='Раскройте скобки: впишите сочетание целиком по условию'
 if prior:
  # Preserve the broad precision/meaning topic of these 12 advanced replacements.
  item['practice_tenses']=prior['practice_tenses'];item['tags']=prior['tags']
  item['cefr_estimate']=prior['cefr_estimate']
 return item,ledger


def authored_items():
 additions=[];patch=[];ledger=[]
 for level,total in [('basic',70),('medium',100)]:
  lines=[s.strip() for s in (D/(level+'.txt')).read_text().splitlines() if s.strip() and not s.startswith('#')]
  assert len(lines)==total
  for n,line in enumerate(lines,1):
   code,prompt,keys,*mode=line.split('|')
   item,fields=make_item(f'cmp-construct-20261101-{level[0]}{n:03}',level,code,prompt,keys,mode[0] if mode else 'form')
   additions.append(item);ledger+=fields
 old={i['id']:i for i in read(D/'before-part-48.json')}
 for line in (D/'advanced-revisions.txt').read_text().splitlines():
  ident,code,prompt,keys,*mode=line.split('|')
  item,fields=make_item(ident,'advanced',code,prompt,keys,mode[0] if mode else 'form',old[ident])
  assert len(item['blanks'])==len(old[ident]['blanks'])
  patch.append(item);ledger+=fields
 assert len(patch)==12
 return additions,patch,ledger


def main():
 baseline=read(D/'baseline-manifest.json');current=read(ROOT/'data/exercises/index.json')
 assert baseline['total_items']==5209 and current['content_versions']['comparison'] in {baseline['content_versions']['comparison'],VERSION}
 assert current['content_versions']['tenses']==baseline['content_versions']['tenses']
 for file,digest in read(D/'baseline-hashes.json').items():
  if file=='data/exercises/part-48.json':continue
  assert hashlib.sha256((ROOT/file).read_bytes()).hexdigest()==digest,file
 additions,patch,ledger=authored_items();by={i['id']:i for i in patch}
 original=read(D/'before-part-48.json');updated=[by.get(i['id'],i) for i in original]
 assert read(ROOT/'data/exercises/part-48.json') in [original,updated], 'Unrelated part-48 edits'
 before=[i for i in original if i['id'] in by]
 write(D/'before-records.json',before);write(D/'patch-records.json',patch)
 bank=[];descriptors=[]
 for p in baseline['parts']:
  items=updated if p['file']=='data/exercises/part-48.json' else read(ROOT/p['file'])
  bank+=items;descriptors.append(dict(p))
 assert len(bank)==5209
 norm=lambda s:' '.join(re.findall(r'[^\W_]+',s.casefold()))
 seen={norm(i['prompt']) for i in bank};completed={norm(i.get('answer_text','')) for i in bank if i.get('answer_text')}
 for i in additions:
  assert norm(i['prompt']) not in seen,i['id'];seen.add(norm(i['prompt']))
  assert norm(i['answer_text']) not in completed,i['id'];completed.add(norm(i['answer_text']))
 write(ROOT/'data/exercises/part-48.json',updated)
 for n,chunk in enumerate([additions[:100],additions[100:]],54):
  file=f'data/exercises/part-{n:02}.json'
  if (ROOT/file).exists():assert read(ROOT/file)==chunk,'Unrelated '+file
  write(ROOT/file,chunk);bank+=chunk
  descriptors.append(dict(file=file,count=len(chunk),levels=dict(sorted(Counter(i['cefr_estimate'] for i in chunk).items())),types={'open_brackets':len(chunk)},levels3=dict(sorted(Counter(i['level'] for i in chunk).items()))))
 m=dict(baseline);m['parts']=descriptors;m['content_versions']=dict(baseline['content_versions'],comparison=VERSION)
 m.update(total_items=len(bank),answer_slots=sum(len(i.get('blanks',[])) or 1 for i in bank),
   levels=dict(sorted(Counter(i['cefr_estimate'] for i in bank).items())),levels3=dict(sorted(Counter(i['level'] for i in bank).items())),
   types=dict(sorted(Counter(i['type'] for i in bank).items())),sections={'comparison':1000,'tenses':4379})
 assert Counter(i['level'] for i in bank if i['id'].startswith('cmp-'))=={'basic':300,'medium':400,'advanced':300}
 write(ROOT/'data/exercises/index.json',m)
 write(D/'sources.json',{'consulted_on':'2026-11-01','sources':SOURCES})
 write(D/'construction-specs.json',{c:{'rule':v[0],'checked':v[1],'sources':v[2]} for c,v in SPECS.items()})
 with (D/'source-ledger.csv').open('w',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=ledger[0]);writer.writeheader();writer.writerows(ledger)
 print(f'Added {len(additions)} / {sum(len(i["blanks"]) for i in additions)} fields; revised {len(patch)} / 24 fields; bank {len(bank)} / {m["answer_slots"]} / {len(descriptors)}. Adjectives 300 / 400 / 300.')

if __name__=='__main__':main()
