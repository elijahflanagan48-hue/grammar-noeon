"""Review only actually graded keys, preserving the frozen pre-change corpus."""
import csv,json,re,sys
from collections import Counter
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from build_comparisons import RULES
from expand_adjective_constructions import authored_items
R=Path(__file__).resolve().parents[1];D=R/'docs/review/ADJECTIVES-CONSTRUCTIONS-2026-11-01'
read=lambda p:json.loads(p.read_text())
manifest=read(R/'data/exercises/index.json');old_manifest=read(D/'baseline-manifest.json')
bank=[i for p in manifest['parts'] for i in read(R/p['file'])]
old=[i for p in old_manifest['parts'] for i in read(D/'before-part-48.json' if p['file'].endswith('part-48.json') else R/p['file'])]
bank=[i for i in bank if i.get('topic')=='comparison'];old=[i for i in old if i.get('topic')=='comparison']
added,patch,ledger=authored_items()
assert len(bank)==1000 and len(old)==830
with (D/'exercise-review.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['id','level','change','prompt','keys','whole_phrase'])
 for i in added+patch:w.writerow([i['id'],i['level'],'new' if i in added else 'revision',i['prompt'],'; '.join(' / '.join(b['accepted_answers']) for b in i['blanks']),bool(i.get('title'))])
def family_counts(items):
 counts=Counter()
 for i in items:
  # Count exercises linked to the family; these counts do not claim full syntax is elicited.
  for rule,(_,anchor,_)in RULES.items():
   if any(ref.endswith('#'+anchor)for ref in i.get('rule_refs',[])):counts[rule]+=1
 return counts
before=family_counts(old);after=family_counts(bank);fields=Counter(r['rule'] for r in ledger)
lines=['# Проверяемые конструкции: аудит 1 ноября 2026','',
'Сравнивается зафиксированный банк 830 заданий с текущими 1000. Таблица считает ссылки на семейство правил; сама по себе такая ссылка не доказывает, что ученик восстанавливает весь синтаксис. Поэтому отдельно проверены ключи и введены задания на целые обороты. Упоминание модели только в условии не считалось восстановлением конструкции.','',
'В новых и переработанных заданиях: 92 редакционных подтипа (включая варианты рамки и формата ответа), 20 семейств правил, 208 полей. Это не 92 независимые грамматические конструкции.','',
'| Семейство | Заданий до | Заданий после | Новых/переработанных полей |','|---|---:|---:|---:|']
for rule,(_,anchor,_)in RULES.items():lines.append(f'| {anchor} | {before[rule]} | {after[rule]} | {fields[rule]} |')
lines+=['','## Что раньше не требовало ввода полной модели','',
'Следующие значения посчитаны только по ответам на проверяемые поля. Совпадение слов в контексте или объяснении не учитывается. Нулевой счёт не означает, что правило вообще не упоминалось в прежних предложениях.','',
'| Реально вводимый ответ | Полей до | Полей после | Пример нового/изменённого задания |','|---|---:|---:|---|']
patterns=[('twice/half as … as',r'^(twice|half) as .+ as$'),('лексическое adjective + to',r'^(superior|inferior|senior|junior|preferable) to$'),('not so … as',r'^not so (?!much).+ as$'),('not so much … as',r'^not so much .+ as$'),('as + adjective + a/an + noun + as',r'^as \w+ an? \w+ as$'),('so + adjective + a/an + noun',r'^so \w+ an? \w+$'),('more of a … than',r'^more of a .+ than$'),('кратность + the size/length of',r'^(twice|half) the (size|length) of$'),('полная числовая разница',r'^three centimetres \w+ than$')]
def matches(items,pattern):return [(i['id'],b)for i in items for b in i.get('blanks',[])if any(re.search(pattern,a)for a in b.get('accepted_answers',[b.get('answer','')]))]
for label,pat in patterns:
 b=matches(old,pat);a=matches(bank,pat);new=matches(added+patch,pat)
 lines.append(f'| {label} | {len(b)} | {len(a)} | {new[0][0] if new else "—"} |')
lines+=['','## Принципы редакции','',
'- В простых упражнениях сохраняется напечатанная рамка: нужно выбрать форму по смыслу и грамматике. В средних/продвинутых часть рамки тоже восстанавливается, а условие задаёт требуемые служебные слова. Это ограничивает ответ и позволяет честно проверить его автоматически.',
'- Противопоставление качеств одного объекта отделено от обычного ранжирования; формальный регистр указан явно. Comparative для двух не представлен как запрет superlative во всём английском.',
'- Для no + comparative указана включённая граница. Кратность и числовая разница имеют разные данные и разные ключи.',
'- Количественные сравнения, noun ratios и too/enough/sufficiently включены как смежные конструкции степени. Они не названы морфологическими степенями прилагательного.',
'- Устойчивые модели проверяются отдельными полями; нормативные варианты формы и дефиса допускаются явно. Свободные перефразы вне заданной модели не выдаются за автоматически оценённый ответ.',
'- Сложность — редакционное распределение учебного банка, не независимая сертификация CEFR.',
'', 'Полный перечень подтипов: construction-specs.json. Связь каждого нового/переработанного поля с источником: source-ledger.csv и sources.json. Условия и ключи: exercise-review.csv.']
(D/'COVERAGE.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'levels':dict(Counter(i['level']for i in bank)),'formats':dict(Counter(i['type']for i in bank)),'new_fields':sum(len(i['blanks'])for i in added),'revised_fields':sum(len(i['blanks'])for i in patch),'whole_phrase_items':sum(bool(i.get('title'))for i in added+patch),'sources':len(read(D/'sources.json')['sources'])},ensure_ascii=False))
