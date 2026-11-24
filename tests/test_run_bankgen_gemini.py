import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import run_bankgen_gemini as runner


class GeminiRunnerTests(unittest.TestCase):
    def test_complete_seed_catalogue_and_adjacent_json(self):
        rows = [json.loads(l) for l in (ROOT/'content/bankgen/modals/seeds/seeds-16.jsonl').read_text().splitlines() if l.startswith('{')]
        text='```jsonl\n'+''.join(json.dumps(r) for r in rows)+'\n# check: seeds=50\n```'
        parsed=runner.parse_rows(text)
        self.assertEqual(runner.validate_rows('modals','seeds','seeds-16',parsed),rows)
        for mutation in ('truncated','wrong-id','unknown-hook','duplicate-plot'):
            with self.subTest(mutation=mutation):
                changed=copy.deepcopy(rows)
                if mutation=='truncated':changed.pop()
                if mutation=='wrong-id':changed[0]['seed_id']='md-9999'
                if mutation=='unknown-hook':changed[0]['hooks']=['unapproved hook']
                if mutation=='duplicate-plot':changed[1]['situation']=changed[0]['situation']
                with self.assertRaises(ValueError):runner.validate_rows('modals','seeds','seeds-16',changed)

    def test_empty_truncated_prose_and_conditionals_are_rejected(self):
        for text in ('','{"id":','Here are the answers: {}'):
            with self.subTest(text=text),self.assertRaises(ValueError):runner.parse_rows(text)
        with self.assertRaises(ValueError):runner.validate_rows('conditionals','batches','CD01',[])

    def test_explicit_model_stdin_and_no_tools(self):
        with tempfile.TemporaryDirectory() as tmp:
            prefix=Path(tmp)/'job'
            envelope=json.dumps({'response':'OK','stats':{'models':{'gemini-2.5-pro':{}},'tools':{'totalCalls':0}}})
            with patch.object(runner,'run_cli',return_value=envelope) as call:
                self.assertEqual(runner.generate('gemini','gemini-2.5-pro',{},'input payload',prefix,30),'OK')
                args=call.call_args.args
                self.assertIn('input payload',args[2]['_BANKGEN_PROMPT'])
                self.assertEqual(json.loads((Path(tmp)/'workspace/.gemini/settings.json').read_text())['tools']['core'],[])
            for bad in ('auto','gemini-3.5-flash'):
                with self.assertRaises(ValueError):runner.generate('gemini',bad,{},'input',prefix,30)
            for stats in ({'models':{'gemini-3.5-flash':{}}},{'models':{'gemini-2.5-pro':{}},'tools':{'totalCalls':1}}):
                with patch.object(runner,'run_cli',return_value=json.dumps({'response':'OK','stats':stats})):
                    with self.assertRaises(ValueError):runner.generate('gemini','gemini-2.5-pro',{},'input',prefix,30)

    def test_credentials_are_redacted_from_failed_cli_logs(self):
        secret='fictional-test-key-never-real'
        with tempfile.TemporaryDirectory() as tmp:
            prefix=Path(tmp)/'job'
            result=subprocess.CompletedProcess([],1,secret,'error '+secret)
            with patch.object(runner.subprocess,'run',return_value=result):
                with self.assertRaises(ValueError):runner.run_cli('gemini',[],{'GEMINI_API_KEY':secret},tmp,30,prefix)
            for file in Path(tmp).glob('*'):
                self.assertNotIn(secret,file.read_text())
                self.assertIn('[REDACTED]',file.read_text())


if __name__=='__main__':unittest.main()
