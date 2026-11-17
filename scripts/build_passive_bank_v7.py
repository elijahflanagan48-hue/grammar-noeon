#!/usr/bin/env python3
"""Compile reviewed v7 batches. --fixture writes only to --output, never the bank."""
from __future__ import annotations
import argparse
import collections
import datetime
import json
import re
from pathlib import Path
import passive_v7 as pipeline
from audit_variety import skeleton
from build_passive_bank_v6 import cosmetic, uniq, answer_text, rewrite_forms

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / 'content/passive-bank/v7'
REFS = dict(D1=['pv-table','pv-aspect'], D2=['pv-focus','pv-boundaries'], D3=['pv-modals'],
 D4=['pv-nonfinite'], D5=['pv-reporting'], D6=['pv-objects','pv-phrasal'],
 D7=['pv-get','pv-causative'], D8=['pv-patterns'], D9=['pv-boundaries'], D10=['pv-agent'], D11=['pv-questions'])
WEIGHTS = dict(sentence=40, mini_text=25, choice=20, error_fix=7, translation=4, transformation=4)
INSTRUCTIONS = dict(gap='Раскройте скобки.', mini='Раскройте скобки в тексте.', mc='Выберите правильный вариант.',
 which='Выберите предложение, которое подходит к ситуации.', fix='Если в предложении есть ошибка, перепишите его правильно. Если ошибки нет, перепишите без изменений.')

def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

def convert(rows, mapping, version, reserved_ids=()):
    if len(set(mapping.values())) != len(mapping):
        raise ValueError('Duplicate output ID in id-map')
    used = set(mapping.values()) | set(reserved_ids)
    seeds, sources, result = set(), set(), []
    for row in rows:
        source, cell = row['id'], row['cell']
        if source in sources: raise ValueError('Duplicate source ID: '+source)
        sources.add(source)
        if row['seed_id'] in seeds: raise ValueError('Repeated seed: '+row['seed_id'])
        seeds.add(row['seed_id'])
        errors, _ = pipeline.check_item(row, {}, {})
        if errors: raise ValueError(source+': '+'; '.join(errors))
        if source not in mapping:
            n = max([int(x.rsplit('-',1)[1]) for x in used if x.startswith('pv7-'+cell+'-')], default=0)+1
            mapping[source] = f'pv7-{cell}-{n:03d}'
            used.add(mapping[source])
        ident = mapping[source]
        if not re.fullmatch(r'pv7-'+cell+r'-\d{3,}', ident): raise ValueError('Cell changed for '+source)
        refs = ['content/passive/07-passive.md#'+a for a in REFS[cell]]
        for anchor in REFS[cell]:
            if not re.search(r'id=[\'\"]'+anchor+r'[\'\"]', json.loads(re.search(r'const PASSIVE_RULE_CONTENT=(.*);', (ROOT/'passive.js').read_text())[1])):
                raise ValueError('Missing theory anchor: '+anchor)
        fmt = row['format']
        group = dict(gap='sentence',mini='mini_text',mc='choice',which='choice',fix='error_fix')[fmt]
        tags = list(dict.fromkeys(['pv_'+cell]+[b['construction'] for b in row.get('blanks',[])]+([row['construction']] if row.get('construction') else [])))
        item = dict(id=ident, topic='passive', level=row['level'], content_version=version,
            response_contract='bounded-v1', answer_profile='english-standard-v2', prompt=row['prompt'],
            instruction_ru=INSTRUCTIONS[fmt], explanation_ru=row['explanation_ru'], rule_refs=refs,
            cell=cell, genre=row['genre'], seed_id=row['seed_id'], skeleton=skeleton(row['prompt']),
            practice_tenses=tags, tags=tags, practice_group=group, practice_weight=WEIGHTS[group])
        if fmt in ('gap','mini'):
            item.update(type='open_brackets', layout=group, blanks=[])
            for k, b in enumerate(row['blanks'],1):
                item['blanks'].append(dict(id=f'{ident}-b{k}',answer=b['answer'],accepted_answers=uniq(cosmetic(b['accepted_answers'])),
                    base_verb=b['cue'],supplied_words=[p.strip() for p in b['cue'].split('/') if not p.strip().startswith('to ')],
                    tense_or_construction=b['construction'],voice=b['voice'],explanation_ru=row['explanation_ru'],rule_refs=refs))
            item['answer_text'] = answer_text(row['prompt'],[b['answer'] for b in row['blanks']])
        elif fmt in ('mc','which'):
            options, ix = row['options'], row['correct_option_index']
            summary = row['prompt'].replace('___', options[ix]) if fmt=='mc' else options[ix]
            item.update(type='multiple_choice',options=options,correct_option_index=ix,accepted_option_indices=[ix],answer=options[ix],summary=summary,answer_text=summary)
        else:
            item.update(type='error_fix',answer=row['answer'],accepted_answers=uniq([v for a in row['accepted_answers'] for v in rewrite_forms(a,[],None)]),answer_text=row['answer'],has_error=row['has_error'])
        result.append(item)
    return result

def build(args):
    version = 'passive-'+args.date+'.1'
    if args.fixture:
        if not args.output: raise ValueError('--fixture requires --output')
        output=Path(args.output).resolve()
        if any(output.is_relative_to(p) for p in [ROOT/'data', BANK, ROOT/'cloudflare']):
            raise ValueError('Fixture output must stay outside production bank directories')
        rows, bad = pipeline.read_jsonl(Path(args.fixture))
        if bad: raise ValueError('\n'.join(bad))
        dump(Path(args.output), convert(rows, {}, version))
        return
    paths = [BANK/'final'/f'{b}.jsonl' for b in pipeline.BATCHES]
    missing = [str(p.relative_to(ROOT)) for p in paths+[BANK/'keep-v6.txt'] if not p.exists()]
    if missing: raise ValueError('Missing approved release inputs:\n'+'\n'.join(missing))
    def final_items(only=None):
        data=[]
        for p in paths:
            if only and p.stem not in only: continue
            rows, bad = pipeline.read_jsonl(p)
            for row in rows:
                if not re.fullmatch(p.stem+r'-\d{2,}',row.get('id','')): raise ValueError('Invalid source ID in '+p.name)
                row['_batch']=p.stem
            data.append((p.stem,rows,bad))
        return data
    # Run the existing full validator against final/, keeping every check intact.
    pipeline.raw_items = final_items
    original_old = pipeline.old_bank_prompts
    pipeline.old_bank_prompts = lambda: [i['prompt'] for p in (ROOT/'data/exercises').glob('part-*.json') for i in json.loads(p.read_text()) if i.get('topic')=='passive' and not i['id'].startswith('pv7-')]
    if pipeline.validate(): raise ValueError('Approved batches failed passive_v7 validation; see reports/')
    pipeline.old_bank_prompts = original_old
    mapping_path = BANK/'id-map.json'
    mapping = json.loads(mapping_path.read_text()) if mapping_path.exists() else {}
    rows=[r for _, batch, _ in final_items() for r in batch]
    manifest_path=ROOT/'data/exercises/index.json'
    manifest=json.loads(manifest_path.read_text())
    parts={d['file']:json.loads((ROOT/d['file']).read_text()) for d in manifest['parts']}
    new = convert(rows,mapping,version,[i['id'] for chunk in parts.values() for i in chunk if i['id'].startswith('pv7-')])
    old=[i for chunk in parts.values() for i in chunk if i.get('topic')=='passive' and not i['id'].startswith('pv7-')]
    keep={l.strip() for l in (BANK/'keep-v6.txt').read_text().splitlines() if l.strip() and not l.startswith('#')}
    unknown=keep-{i['id'] for i in old}
    if unknown: raise ValueError('Unknown retained IDs: '+', '.join(sorted(unknown)))
    for item in old:
        if item['id'] not in keep: item['retired']='passive-v7'
        else:
            item.pop('retired',None)
            item['cell']='D1'
            for field in ('practice_tenses','tags'): item[field]=list(dict.fromkeys(['pv_D1']+item.get(field,[])))
            group=item.get('practice_group','sentence')
            item['practice_weight']=WEIGHTS.get(group,4)
    # Preserve withdrawn v7 IDs too, so an issued task never disappears.
    new_ids={i['id'] for i in new}
    archive=[dict(i,retired='passive-v7') for chunk in parts.values() for i in chunk if i.get('topic')=='passive' and i['id'].startswith('pv7-') and i['id'] not in new_ids]
    passive=old+archive+new
    pv_files=[f for f,chunk in parts.items() if any(i.get('topic')=='passive' for i in chunk)]
    if any(any(i.get('topic')!='passive' for i in parts[f]) for f in pv_files): raise ValueError('Mixed topic part')
    chunks=[passive[n:n+100] for n in range(0,len(passive),100)]
    # Reuse old part paths, allocate new paths after the global maximum.
    next_part=max(int(Path(f).stem.split('-')[1]) for f in parts)+1
    while len(pv_files)<len(chunks):
        f=f'data/exercises/part-{next_part:02d}.json';next_part+=1
        pv_files.append(f);manifest['parts'].append({'file':f})
    for n,f in enumerate(pv_files): parts[f]=chunks[n] if n<len(chunks) else []
    all_items=[i for d in manifest['parts'] for i in parts[d['file']]]
    if len({i['id'] for i in all_items})!=len(all_items): raise ValueError('Duplicate bank ID')
    for d in manifest['parts']:
        if d['file'] in pv_files:
            d['section']='passive'
            chunk=parts[d['file']]; d['count']=len(chunk)
            for key,field in [('types','type'),('levels3','level')]: d[key]=dict(collections.Counter(i[field] for i in chunk))
            d['levels']=dict(collections.Counter(i.get('cefr_level','unrated') for i in chunk))
    manifest.update(total_items=len(all_items), answer_slots=sum(len(i.get('blanks',[])) or 1 for i in all_items))
    for key,field in [('types','type'),('levels3','level')]:manifest[key]=dict(collections.Counter(i[field] for i in all_items))
    manifest['levels']['unrated']=manifest['levels'].get('unrated',0)+len(passive)-json.loads(manifest_path.read_text())['sections']['passive']
    manifest['sections']['passive']=len(passive)
    manifest['section_types']['passive']=dict(collections.Counter(i['type'] for i in passive if not i.get('retired')))
    manifest['content_versions']['passive']=version
    for f in pv_files: dump(ROOT/f,parts[f])
    dump(mapping_path,mapping);dump(manifest_path,manifest)
    release_path=ROOT/'docs/current-release.json'; release=json.loads(release_path.read_text())
    release.update(content_versions=manifest['content_versions'],total_items=manifest['total_items'],answer_slots=manifest['answer_slots'],parts=len(manifest['parts']),sections=manifest['sections'])
    release['passive_v7_status']='built; deployment and verification pending'
    dump(release_path,release)
    print('Passive v7:',len(new),'new,',len(keep),'retained,',sum(bool(i.get('retired')) for i in passive),'archived')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fixture');parser.add_argument('--output');parser.add_argument('--date',default=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=3))).date().isoformat())
    try: build(parser.parse_args())
    except (ValueError,KeyError,AssertionError) as error: parser.exit(1,str(error)+'\n')
