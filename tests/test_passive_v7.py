"""Engine fixtures only: these sentences must never enter the production bank."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from argparse import Namespace

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import build_passive_bank_v7 as builder
from audit_variety import gate
from server.grading import grade

class PassiveV7(unittest.TestCase):
    def setUp(self):
        self.rows,_=builder.pipeline.read_jsonl(ROOT/'tests/fixtures/passive-v7-sample.jsonl')
        self.limits=json.loads((ROOT/'docs/variety/passive-gates.json').read_text())
    def test_all_cells_formats_and_stable_ids(self):
        mapping={}
        items=builder.convert(self.rows,mapping,'passive-2026-11-16.1')
        self.assertEqual({i['cell'] for i in items},{f'D{n}' for n in range(1,12)})
        self.assertEqual({i['practice_group'] for i in items},{'sentence','mini_text','choice','error_fix'})
        reverse=builder.convert(list(reversed(self.rows)),mapping,'passive-2026-11-16.1')
        self.assertEqual({i['seed_id']:i['id'] for i in items},{i['seed_id']:i['id'] for i in reverse})
        mapping['withdrawn-source']='pv7-D1-400'
        extra=copy.deepcopy(self.rows[0]);extra.update(id='B99-99',seed_id='new-seed')
        self.assertEqual(builder.convert([extra],mapping,'passive-2026-11-16.1')[0]['id'],'pv7-D1-401')
        orphan=builder.convert([extra],{},'passive-2026-11-16.1',['pv7-D1-900'])
        self.assertEqual(orphan[0]['id'],'pv7-D1-901')
        for i in items:
            self.assertIn('pv_'+i['cell'],i['practice_tenses'])
            submitted=i['correct_option_index'] if i.get('options') else [b['answer'] for b in i['blanks']] if i.get('blanks') else i['answer']
            self.assertTrue(grade(i,submitted)['correct'],i['id'])
    def test_invalid_sources(self):
        for key,value in [('seed_id',self.rows[0]['seed_id']),('id',self.rows[0]['id'])]:
            rows=copy.deepcopy(self.rows);rows[1][key]=value
            with self.assertRaises(ValueError):builder.convert(rows,{},'passive-2026-11-16.1')
        for mutate in [lambda r:r['blanks'][0].update(accepted_answers=[]),lambda r:r.update(prompt='No brackets.')]:
            row=copy.deepcopy(self.rows[0]);mutate(row)
            with self.assertRaises(ValueError):builder.convert([row],{},'passive-2026-11-16.1')
        row=copy.deepcopy(self.rows[9]);row['options'].pop()
        with self.assertRaises(ValueError):builder.convert([row],{},'passive-2026-11-16.1')
    def test_error_fix_variants_and_retired_snapshot(self):
        item=builder.convert(self.rows,{},'passive-2026-11-16.1')[7]
        item['accepted_answers'].append('The spectators had to leave the stadium.')
        self.assertTrue(grade(item,'  THE  spectators had to leave the stadium  ')['correct'])
        self.assertFalse(grade(item,item['prompt'])['correct'])
        item['retired']='passive-v7'
        self.assertTrue(grade(item,item['answer'])['correct'])
        item=builder.convert(self.rows,{},'passive-2026-11-16.1')[8]
        self.assertTrue(grade(item,item['prompt'])['correct'])
    def test_gate_reports_all_limits_and_excludes_retired(self):
        items=builder.convert(self.rows,{},'passive-2026-11-16.1')
        permissive={**self.limits,'max_opening_share':1,'max_by_the_share':1,'max_time_marker_share':1,'max_verb_uses':100,'min_active_share_in_D2':0,'cell_tolerance':1,'max_near_duplicate_pairs':100}
        self.assertEqual(gate(items,permissive),[])
        self.assertTrue(gate(items,self.limits))
        for key in ['max_opening_share','max_verb_uses','max_time_marker_share','max_near_duplicate_pairs']:
            extra=copy.deepcopy(items[0]);extra['id']='duplicate';extra['prompt']='By the time the archive (to digitise) yesterday.'
            broken=gate(items+[extra,extra],{**permissive,key:0})
            self.assertTrue(broken,key)
            self.assertIn('items:',broken[0])
        archived=[dict(i,retired='passive-v7') for i in items]
        self.assertEqual(gate(items+archived,permissive),[])
    def test_release_rebuild_preserves_other_topics_and_archives(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);bank=root/'content/passive-bank/v7';(bank/'final').mkdir(parents=True)
            (root/'data/exercises').mkdir(parents=True);(root/'docs').mkdir()
            (root/'passive.js').write_bytes((ROOT/'passive.js').read_bytes())
            converted=builder.convert(self.rows,{},'passive-2026-11-16.1')
            old=copy.deepcopy(converted[0]);old['id']='pv5-s001'
            removed=copy.deepcopy(old);removed['id']='pv5-s002'
            withdrawn=copy.deepcopy(converted[0]);withdrawn['id']='pv7-D1-005'
            other={'id':'other-1','topic':'tenses','type':'open_brackets','level':'basic','prompt':'Untouched.'}
            builder.dump(root/'data/exercises/part-01.json',[other])
            other_bytes=(root/'data/exercises/part-01.json').read_bytes()
            builder.dump(root/'data/exercises/part-02.json',[old,removed,withdrawn])
            manifest={'parts':[{'file':'data/exercises/part-01.json','count':1},{'file':'data/exercises/part-02.json','count':3}],
                      'sections':{'tenses':1,'passive':3},'types':{},'levels':{'unrated':4},'levels3':{},'total_items':4,'answer_slots':4,
                      'section_types':{'tenses':{'open_brackets':1},'passive':{'open_brackets':3}},'content_versions':{'passive':'passive-2026-11-16.1'}}
            builder.dump(root/'data/exercises/index.json',manifest)
            builder.dump(root/'docs/current-release.json',{})
            builder.dump(bank/'id-map.json',{'B98-01':'pv7-D1-005'})
            (bank/'keep-v6.txt').write_text('pv5-s001\n')
            (bank/'final/B99.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in self.rows))
            with patch.object(builder,'ROOT',root),patch.object(builder,'BANK',bank),patch.object(builder.pipeline,'BATCHES',{'B99':{}}),patch.object(builder.pipeline,'validate',return_value=0),patch.object(builder.pipeline,'raw_items'),patch.object(builder.pipeline,'old_bank_prompts'):
                args=Namespace(fixture=None,output=None,date='2026-11-16')
                builder.build(args)
                first=json.loads((bank/'id-map.json').read_text())
                builder.build(args)
                self.assertEqual(first,json.loads((bank/'id-map.json').read_text()))
            self.assertEqual(other_bytes,(root/'data/exercises/part-01.json').read_bytes())
            output=json.loads((root/'data/exercises/part-02.json').read_text())
            self.assertEqual(len(output),14)
            by_id={i['id']:i for i in output}
            self.assertNotIn('retired',by_id['pv5-s001'])
            self.assertEqual(by_id['pv5-s002']['retired'],'passive-v7')
            self.assertEqual(by_id['pv7-D1-005']['retired'],'passive-v7')
            self.assertEqual(by_id['pv5-s001']['practice_tenses'][0],'pv_D1')
            for i in output:
                if i.get('retired'):self.assertTrue(grade(i,i['blanks'][0]['answer'])['correct'])
            current=json.loads((root/'data/exercises/index.json').read_text())
            self.assertEqual(current['total_items'],15)
            self.assertEqual(current['sections']['passive'],14)
            self.assertEqual(current['levels']['unrated'],15)

    def test_missing_release_inputs_never_mutates_bank(self):
        manifest=ROOT/'data/exercises/index.json';before=manifest.read_bytes()
        result=subprocess.run([sys.executable,str(ROOT/'scripts/build_passive_bank_v7.py')],capture_output=True,text=True)
        if not (ROOT/'content/passive-bank/v7/final/B01.jsonl').exists():
            self.assertNotEqual(result.returncode,0)
            self.assertIn('Missing approved release inputs',result.stderr)
            self.assertEqual(before,manifest.read_bytes())

if __name__=='__main__':unittest.main()
