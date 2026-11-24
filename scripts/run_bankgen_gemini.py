#!/usr/bin/env python3
"""Generate bank-factory drafts with Gemini CLI; never build or publish a bank.

python3 -B scripts/run_bankgen_gemini.py probe --auth api
python3 -B scripts/run_bankgen_gemini.py seeds modals --auth api --only 1,2 --workers 2
python3 -B scripts/run_bankgen_gemini.py batches speaking --auth api --only SP01,SP02

Inputs are passed on stdin, not pasted into a GUI. CLI state and original responses
stay in private/bankgen-topup-20261124. Existing valid drafts are resumed. final/
is deliberately untouched: generated drafts still require editorial review.
"""
from __future__ import annotations
import argparse
import concurrent.futures
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

import bankgen as bg

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / 'private/bankgen-topup-20261124'
TOPICS = tuple(t for t in bg.SPECS if t != 'conditionals')
MODEL = re.compile(r'gemini-(\d+(?:\.\d+)*)-(carbon|neon|argon|pro|hydrogen)(?:-[a-z0-9.-]+)?$')


def atomic_write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    pending = path.with_suffix(path.suffix + '.pending')
    pending.write_text(text, encoding='utf-8')
    pending.replace(path)


def parse_rows(text):
    """Accept JSONL or adjacent JSON objects; reject truncation and stray prose."""
    decoder, rows = json.JSONDecoder(), []
    text = re.sub(r'^\s*```(?:jsonl|json)?\s*$', '', text, flags=re.M)
    text = re.sub(r'^\s*# check:.*$', '', text, flags=re.M).strip()
    while text:
        row, end = decoder.raw_decode(text)
        if not isinstance(row, dict):
            raise ValueError('Expected one object per exercise/seed')
        rows.append(row)
        text = text[end:].lstrip()
    if not rows:
        raise ValueError('Empty Gemini response; no draft was saved')
    return rows


def validate_rows(topic, stage, name, rows):
    if topic not in TOPICS:
        raise ValueError('Topic is outside this task: '+topic)
    key = 'seed_id' if stage == 'seeds' else 'id'
    ids = [r.get(key) for r in rows]
    if None in ids or len(set(ids)) != len(ids):
        raise ValueError('Missing or duplicate response IDs')
    if stage == 'seeds':
        part = int(name.split('-')[1])
        prompt = (bg.base(topic)/'seed-prompts'/f'{name}.md').read_text()
        count = int(re.search(r'Write \*\*(\d+) scenario seeds', prompt)[1])
        expected = {f'{bg.SPECS[topic]["code"]}-{part:02d}{n:02d}' for n in range(1,count+1)}
        if set(ids) != expected:
            raise ValueError(f'{name}: expected {count} exact seed IDs, received {len(rows)}')
        for row in rows:
            if not all(row.get(k) for k in ('domain','place','who','situation','hooks','tone','register')):
                raise ValueError(str(row.get(key))+': incomplete seed')
            if not set(row['hooks']) <= set(bg.SPECS[topic]['hooks']):
                raise ValueError(str(row.get(key))+': unknown hook')
        grams = [bg.toks(r['situation']) for r in rows]
        for n,a in enumerate(grams):
            for m,b in enumerate(grams[n+1:],n+1):
                if a and b and len(a&b)/len(a|b)>.55:
                    raise ValueError(f'Near-duplicate seeds: {ids[n]} / {ids[m]}')
    else:
        plan = next(b for b in bg.load_plan(topic)['batches'] if b['batch']==name)
        expected = {f'{name}-{n:02d}' for n in range(1,plan['size']+1)}
        if set(ids) != expected:
            raise ValueError(f'{name}: incomplete batch or unexpected source IDs')
        spec = bg.SPECS[topic]
        cons = {c for cell in spec['cells'] for c in cell['cons']}
        cells = {c['id'] for c in spec['cells']}
        seeds,_ = bg.load_seeds(topic)
        seen = {}
        for row in rows:
            errors,_ = bg.check_item(row,spec,cons,cells,seeds,seen)
            if row.get('cell') != plan['cell']:
                errors.append('cell does not match plan')
            if errors:
                raise ValueError(str(row.get(key))+': '+'; '.join(errors))
    return rows


def cli_environment(auth, env_file):
    env = os.environ.copy()
    env.update(TERM='xterm-256color',NO_COLOR='1')
    if auth == 'api':
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.strip() and not line.lstrip().startswith('#') and '=' in line:
                    key,value = line.split('=',1)
                    if key.strip() in ('GEMINI_API_KEY','GOOGLE_API_KEY'):
                        env[key.strip()] = value.strip().strip('\"\'')
        key = env.get('GEMINI_API_KEY') or env.get('GOOGLE_API_KEY')
        if not key or key in ('YOUR_GEMINI_API_KEY','PASTE_KEY_HERE'):
            raise ValueError('Set GEMINI_API_KEY in '+str(env_file)+' (do not send the key in chat)')
        env['GEMINI_API_KEY'] = key
        home = PRIVATE/'gemini-api-home'
        atomic_write(home/'.gemini/settings.json',json.dumps({
            'security':{'auth':{'selectedType':'gemini-api-key'}},
            'tools':{'core':[]},'mcp':{'allowed':[]},
            'advanced':{'ignoreLocalEnv':True}},indent=2)+'\n')
        env['GEMINI_CLI_HOME'] = str(home)
    return env


def find_cli(value=None):
    local = PRIVATE/'gemini-cli/node_modules/.bin/gemini'
    executable = value or (str(local) if local.exists() else shutil.which('gemini'))
    if not executable:
        raise ValueError('Install the official @google/gemini-cli or pass --cli')
    return str(Path(executable).resolve())


def run_cli(cli, args, env, cwd, timeout, prefix):
    result = subprocess.run([cli,*args],input=env.pop('_BANKGEN_PROMPT',None),
                            env=env,cwd=cwd,capture_output=True,text=True,timeout=timeout)
    # CLI errors can include request URLs. Redact credentials before persisting logs.
    def redact(text):
        for name in ('GEMINI_API_KEY','GOOGLE_API_KEY'):
            if env.get(name): text=text.replace(env[name],'[REDACTED]')
        return text
    atomic_write(prefix.with_suffix('.response.json'),redact(result.stdout))
    atomic_write(prefix.with_suffix('.stderr.log'),redact(result.stderr))
    if result.returncode:
        raise ValueError('Gemini CLI failed; see '+str(prefix.with_suffix('.stderr.log')))
    return result.stdout


def generate(cli, model, env, prompt, prefix, timeout):
    if not MODEL.fullmatch(model):
        raise ValueError('Select an explicit Gemini reasoning model; Auto/Flash routing is not used')
    work = prefix.parent/'workspace'
    work.mkdir(parents=True,exist_ok=True)
    atomic_write(work/'.gemini/settings.json',json.dumps({
        'tools':{'core':[]},'mcp':{'allowed':[]},
        'advanced':{'ignoreLocalEnv':True}},indent=2)+'\n')
    request = ('Return response text only. Do not use tools, read or write files, run commands, '
               'or spawn agents. All necessary input follows.\n\n'+prompt)
    atomic_write(prefix.with_suffix('.input.md'),request)
    output = run_cli(cli,['--model',model,'--approval-mode','plan','--extensions','',
                         '--output-format','json','--prompt','Follow the supplied input exactly.'],
                     {**env,'_BANKGEN_PROMPT':request},work,timeout,prefix)
    envelope = json.loads(output)
    if envelope.get('error'):
        raise ValueError('Gemini returned an error; see saved response')
    used = envelope.get('stats',{}).get('models',{})
    if model not in used or any('flash' in key.lower() for key in used):
        raise ValueError('CLI did not confirm exclusive use of '+model)
    if envelope.get('stats',{}).get('tools',{}).get('totalCalls',0):
        raise ValueError('Text generation unexpectedly used tools')
    return envelope.get('response','')


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('stage',choices=['probe','seeds','batches'])
    ap.add_argument('topic',nargs='?',choices=TOPICS)
    ap.add_argument('--only',help='Comma-separated seed part numbers or batch IDs')
    ap.add_argument('--cli');ap.add_argument('--model',default='gemini-2.5-pro')
    ap.add_argument('--auth',choices=['inherit','api'],default='inherit')
    ap.add_argument('--env-file',type=Path,default=PRIVATE/'gemini.env')
    ap.add_argument('--workers',type=int,choices=range(1,5),default=1)
    ap.add_argument('--timeout',type=int,default=1800)
    args=ap.parse_args()
    try:
        cli=find_cli(args.cli);env=cli_environment(args.auth,args.env_file)
        if args.stage=='probe':
            text=generate(cli,args.model,env,'Reply with exactly OK.',PRIVATE/'gemini-runner/probe',args.timeout)
            if text.strip()!='OK':raise ValueError('Unexpected probe response')
            print('Gemini CLI ready: '+args.model);return
        if not args.topic:raise ValueError('Topic is required')
        base=bg.base(args.topic)
        folder='seed-prompts' if args.stage=='seeds' else 'prompts'
        selected=set(args.only.split(',')) if args.only else None
        prompts=[p for p in sorted((base/folder).glob('*.md'))
                 if selected is None or p.stem in selected or (args.stage=='seeds' and str(int(p.stem.split('-')[1])) in selected)]
        if not prompts:raise ValueError('No matching prompts')
        master=(base/'master.md').read_text()
        def one(path):
            destination=base/('seeds' if args.stage=='seeds' else 'raw')/(path.stem+'.jsonl')
            if destination.exists():
                validate_rows(args.topic,args.stage,path.stem,parse_rows(destination.read_text()))
                print('skip '+str(destination),flush=True);return
            prefix=PRIVATE/'gemini-runner'/args.topic/args.stage/path.stem
            print('generate '+args.topic+' '+path.stem,flush=True)
            response=generate(cli,args.model,env,master+'\n\n'+path.read_text(),prefix,args.timeout)
            rows=validate_rows(args.topic,args.stage,path.stem,parse_rows(response))
            atomic_write(destination,''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rows))
            print('saved '+str(destination)+' ('+str(len(rows))+')',flush=True)
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
            list(pool.map(one,prompts))
    except (ValueError,KeyError,subprocess.TimeoutExpired,StopIteration) as error:
        ap.exit(1,str(error)+'\n')


if __name__=='__main__':main()
