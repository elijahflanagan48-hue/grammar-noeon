import copy
import io
import json
from pathlib import Path
import sys
import tempfile
import threading
import time
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from server.app import GrammarApp, password_ok, digest
from server.grading import grade

class Client:
    def __init__(self,app):self.app=app;self.cookie='';self.csrf=''
    def request(self,path,data=None,csrf=True,origin='http://127.0.0.1:4177'):
        raw=json.dumps(data).encode() if data is not None else b''
        env={'PATH_INFO':path,'REQUEST_METHOD':'POST' if data is not None else 'GET','wsgi.input':io.BytesIO(raw),'CONTENT_TYPE':'application/json','CONTENT_LENGTH':str(len(raw)),'HTTP_ORIGIN':origin,'HTTP_COOKIE':self.cookie,'REMOTE_ADDR':'unit-test'}
        if csrf:env['HTTP_X_CSRF_TOKEN']=self.csrf
        result={}
        def start(status,headers):result['status']=int(status.split()[0]);result['headers']=dict(headers)
        body=b''.join(self.app(env,start))
        if result['headers'].get('Set-Cookie'):self.cookie=result['headers']['Set-Cookie'].split(';')[0]
        if 'application/json' in result['headers'].get('Content-Type',''):
            body=json.loads(body)
            if isinstance(body,dict) and body.get('csrf'):self.csrf=body['csrf']
        return result['status'],body,result['headers']
    def get(self,path):return self.request(path)
    def post(self,path,data):return self.request(path,data)

class AccountsTest(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='grammar-accounts-test-')
        self.app=GrammarApp(self.temp.name,demo=True)
        self.teacher,self.student,self.other,self.anon=[Client(self.app) for _ in range(4)]
        for client,role in [(self.teacher,'teacher'),(self.student,'student'),(self.other,'other')]:self.ok(client.post('/api/auth/demo',{'role':role}))
    def tearDown(self):self.temp.cleanup()
    def ok(self,response):self.assertEqual(response[0],200,response[1]);return response[1]
    def start_practice(self,client=None,ids=None):
        client=client or self.student;items=ids or ['src-u02-020']
        if client is self.teacher:return self.ok(client.post('/api/practice/start',{'ids':items}))
        user=self.ok(client.get('/api/auth/me'))['user']
        assigned=self.ok(self.teacher.post('/api/teacher/students/'+user['id']+'/assignments',{'title':'Test practice','ids':items}))
        return {'id':assigned['practiceId'],'revision':0}
    def legacy_item(self,kind='translation_ru_en'):
        # Historical snapshot fixture only: never reintroduce free production into the bank.
        item=copy.deepcopy(self.app.bank['new-translation-001'])
        for key in ('options','correct_option_index','response_contract'):item.pop(key,None)
        item.update(id='legacy-'+kind,type=kind,content_version='historical-fixture',answer='I usually check my inbox after breakfast.',accepted_answers=['I usually check my inbox after breakfast.'])
        self.app.bank[item['id']]=item
        return item
    def stored_legacy_answer(self,practice_id,item,submitted):
        # Fixture from before bounded-v1; current API must not create new pending answers.
        answer=grade(item,submitted)
        with self.app.connect() as db:db.execute('UPDATE practice SET answers=?,completed=?,revision=1 WHERE id=?',(json.dumps([answer]),time.time(),practice_id))
        return answer
    def test_own_completed_report_is_private_and_server_graded(self):
        p=self.start_practice(ids=['cmp-0001']);url='/api/reports/'+p['id']
        self.assertEqual(self.anon.get(url)[0],401)
        self.assertEqual(self.student.get(url)[0],404)
        self.ok(self.student.post('/api/practice/'+p['id']+'/check',{'index':0,'revision':0,'submitted':['taller'],'score':999}))
        self.assertEqual(self.other.get(url)[0],404)
        self.assertEqual(self.teacher.get(url)[0],404)
        report=self.ok(self.student.get(url))
        self.assertEqual((report['attempt']['score'],report['attempt']['maxScore'],report['attempt']['pending']),(1,1,0))
        with self.app.connect() as db:
            db.execute('INSERT INTO practice(id,user_id,items,answers,created,completed) SELECT ?,user_id,items,answers,created,completed FROM practice WHERE id=?',('historical-completed-fixture',p['id']))
        historical='/api/teacher/students/student-demo/reports/historical-completed-fixture'
        self.assertEqual(self.ok(self.teacher.get(historical))['attempt']['score'],1)
        self.assertEqual(self.other.get('/api/reports/historical-completed-fixture')[0],404)
    def test_compact_work_details_hide_unanswered_items_and_enforce_owner(self):
        p=self.start_practice(ids=['src-u02-020','cmp-0001']);url='/api/attempts/'+p['id']
        self.assertEqual(self.anon.get(url)[0],401)
        self.assertEqual(self.other.get(url)[0],404)
        self.assertEqual(self.teacher.get(url)[0],404)
        detail=self.ok(self.student.get(url))
        self.assertTrue(detail['canResume']);self.assertEqual(detail['attempt']['answers'],[])
        self.assertNotIn('accepted_answers',json.dumps(detail));self.assertNotIn('items',detail['attempt'])
        teacherurl='/api/teacher/students/student-demo/attempts/'+p['id']
        self.assertEqual(self.student.get(teacherurl)[0],403)
        teacher=self.ok(self.teacher.get(teacherurl));self.assertFalse(teacher['canResume'])
        self.assertIsNotNone(teacher['assignment'])
        self.ok(self.student.post('/api/practice/'+p['id']+'/check',{'index':0,'revision':0,'submitted':['had already translated']}))
        partial=self.ok(self.student.get(url))
        self.assertEqual(partial['attempt']['index'],1);self.assertEqual(len(partial['attempt']['answers']),1)
        self.assertNotIn('At 180 cm',json.dumps(partial))
        assignment=teacher['assignment']
        self.ok(self.teacher.post('/api/teacher/students/student-demo/assignments/'+assignment['id']+'/cancel',{'version':assignment['version']}))
        cancelled=self.ok(self.student.get(url));self.assertFalse(cancelled['canResume'])
        self.assertEqual(cancelled['attempt']['status'],'cancelled');self.assertEqual(cancelled['attempt']['score'],1)
    def test_explicit_automatic_upgrade_preserves_original_and_checked_answers(self):
        p=self.start_practice(ids=['cmp-0001','new-translation-001'])
        self.ok(self.student.post('/api/practice/'+p['id']+'/check',{'index':0,'revision':0,'submitted':['wrong']}))
        with self.app.connect() as db:
            row=db.execute('SELECT * FROM practice WHERE id=?',(p['id'],)).fetchone()
            items=json.loads(row['items']);old=copy.deepcopy(items[1])
            for k in ('options','correct_option_index','response_contract'):old.pop(k,None)
            old['type']='translation_ru_en';items[1]=old
            original=json.dumps(items,ensure_ascii=False)
            db.execute('UPDATE practice SET items=?,draft=? WHERE id=?',(original,json.dumps('My old draft'),p['id']))
        endpoint='/api/practice/'+p['id']+'/automatic'
        self.assertEqual(self.other.post(endpoint,{'revision':1})[0],404)
        self.assertEqual(self.student.request(endpoint,{'revision':1},csrf=False)[0],403)
        self.assertEqual(self.student.post(endpoint,{'revision':0})[0],409)
        self.assertEqual(self.ok(self.student.post(endpoint,{'revision':1}))['revision'],2)
        view=self.ok(self.student.get('/api/practice/'+p['id']))
        self.assertEqual(view['items'][1]['type'],'multiple_choice')
        self.assertNotIn('answer',view['items'][1]);self.assertIsNone(view['draft'])
        self.assertFalse(view['answers'][0]['correct']);self.assertEqual(view['maxScore'],1)
        with self.app.connect() as db:
            audit=db.execute('SELECT * FROM practice_format_events WHERE practice_id=?',(p['id'],)).fetchone()
            self.assertEqual(audit['items'],original);self.assertEqual(json.loads(audit['draft']),'My old draft')
        current=self.app.bank['new-translation-001']
        self.ok(self.student.post('/api/practice/'+p['id']+'/check',{'index':1,'revision':2,'submitted':current['correct_option_index']}))
        self.assertEqual(self.student.post(endpoint,{'revision':3})[0],409)
        done=self.ok(self.student.get('/api/reports/'+p['id']))['attempt']
        self.assertEqual((done['score'],done['maxScore'],done['pending']),(1,2,0))
        other=self.start_practice(ids=['new-translation-002'])
        assignment=next(a for a in self.ok(self.student.get('/api/account'))['assignments'] if a['practiceId']==other['id'])
        self.ok(self.teacher.post('/api/teacher/students/student-demo/assignments/'+assignment['id']+'/cancel',{'version':0}))
        self.assertEqual(self.student.post('/api/practice/'+other['id']+'/automatic',{'revision':0})[0],403)
    def test_assignment_notifications_and_private_completion_report(self):
        self.assertEqual(self.anon.get('/api/notifications')[0],401)
        self.assertEqual(self.ok(self.teacher.get('/api/notifications'))['unreadCount'],0)
        made=self.ok(self.teacher.post('/api/teacher/students/student-demo/assignments',{'title':'Новая подборка','ids':['cmp-0001']}))
        notice=self.ok(self.student.get('/api/notifications'))
        self.assertEqual(notice['unreadCount'],1)
        event=notice['items'][0]
        self.assertEqual(event['kind'],'assigned')
        self.assertNotIn('answers',event)
        self.assertNotIn('items',event)
        self.assertEqual(self.ok(self.other.get('/api/notifications'))['items'],[])
        self.assertEqual(self.other.post('/api/notifications/read',{'id':event['id']})[0],404)
        self.assertEqual(self.student.request('/api/notifications/read',{'id':event['id']},csrf=False)[0],403)
        self.ok(self.student.post('/api/notifications/read',{'id':event['id']}))
        self.ok(self.student.post('/api/notifications/read',{'id':event['id']}))
        self.assertEqual(self.ok(self.student.get('/api/notifications'))['unreadCount'],0)
        report='/api/teacher/students/student-demo/reports/'+made['practiceId']
        self.assertEqual(self.teacher.get(report)[0],404)
        request={'index':0,'revision':0,'submitted':['taller'],'score':999}
        self.ok(self.student.post('/api/practice/'+made['practiceId']+'/check',request))
        # Network replay cannot create a second completion notice.
        self.ok(self.student.post('/api/practice/'+made['practiceId']+'/check',request))
        result=self.ok(self.teacher.get('/api/notifications'))
        self.assertEqual(result['unreadCount'],1)
        done=result['items'][0]
        self.assertEqual((done['kind'],done['score'],done['maxScore']),('completed',1,1))
        self.assertEqual(len(result['items']),1)
        self.assertEqual(self.student.get(report)[0],403)
        self.assertEqual(self.ok(self.teacher.get(report))['attempt']['score'],1)
        self.ok(self.teacher.post('/api/notifications/read',{'all':True}))
        self.assertEqual(self.ok(self.teacher.get('/api/notifications'))['unreadCount'],0)
        # Reading survives a fresh authenticated client (another device).
        second=Client(self.app);self.ok(second.post('/api/auth/demo',{'role':'teacher'}))
        self.assertTrue(self.ok(second.get('/api/notifications'))['items'][0]['read'])
        self.ok(self.teacher.post('/api/teacher/students/student-demo/assignments/'+made['id']+'/cancel',{'version':0}))
        self.assertEqual(self.ok(self.student.get('/api/notifications'))['items'],[])
        self.assertEqual(self.ok(self.teacher.get('/api/notifications'))['unreadCount'],0)
    def test_comparison_assignment_uses_private_server_grading(self):
        item=self.app.bank['cmp-0001']
        self.assertEqual(item['topic'],'comparison')
        self.assertEqual(self.student.get('/data/exercises/part-13.json')[0],403)
        self.assertEqual(self.anon.get('/data/exercises/part-13.json')[0],401)
        practice=self.start_practice(ids=[item['id']])
        attempt=self.ok(self.student.get('/api/practice/'+practice['id']))
        # Existing attempts are snapshots, including this module's own version.
        self.assertNotIn('answer',json.dumps(attempt.get('items',[])))
        self.assertEqual(attempt['items'][0]['blanks'][0]['base_adjective'],'tall')
        self.assertTrue(grade(item,[item['blanks'][0]['answer']])['correct'])
        self.assertFalse(grade(item,['tallest'])['correct'])
        checked=self.ok(self.student.post('/api/practice/'+practice['id']+'/check',
            {'index':0,'revision':0,'submitted':['taller'],'score':999}))
        self.assertTrue(checked['answer']['correct'])
        self.assertEqual(checked['answer']['item']['rule_refs'],item['rule_refs'])

    def test_completion_notification_preserves_unverified_answers(self):
        item=self.legacy_item();practice=self.start_practice(ids=[item['id']])
        self.stored_legacy_answer(practice['id'],item,'An unrecognised alternative sentence.')
        notice=self.ok(self.teacher.get('/api/notifications'))['items'][0]
        self.assertEqual((notice['kind'],notice['score'],notice['maxScore'],notice['pending']),('completed',0,0,1))
        report=self.ok(self.teacher.get('/api/teacher/students/student-demo/reports/'+practice['id']))
        self.assertFalse(report['attempt']['answers'][0]['fields'][0]['verified'])

    def test_assigned_only_policy_and_hidden_keys(self):
        self.assertEqual(self.student.post('/api/practice/start',{'ids':['src-u02-020']})[0],403)
        self.assertEqual(self.anon.get('/data/exercises/part-01.json')[0],401)
        self.assertEqual(self.student.get('/data/exercises/part-01.json')[0],403)
        self.assertEqual(self.teacher.get('/data/exercises/part-01.json')[0],200)
        ident=self.start_practice()['id'];item=self.ok(self.student.get('/api/practice/'+ident))['items'][0]
        self.assertNotIn('answer_text',item);self.assertNotIn('answer',item['blanks'][0])
        with self.app.connect() as db:
            db.execute('INSERT INTO practice(id,user_id,items,created) VALUES(?,?,?,?)',('legacy-free','student-demo',json.dumps([self.app.bank['src-u02-020']]),time.time()))
        for suffix,data in [('',None),('/draft',{'index':0,'revision':0,'submitted':['had already translated']}),('/check',{'index':0,'revision':0,'submitted':['had already translated']})]:
            self.assertEqual(self.student.request('/api/practice/legacy-free'+suffix,data)[0],403)
        self.assertTrue(any(row['id']=='legacy-free' for row in self.ok(self.student.get('/api/account'))['history']))
        self.start_practice(client=self.teacher)

    def test_manage_assignment_preserves_progress_and_blocks_cancelled_access(self):
        path='/api/teacher/students/student-demo/assignments'
        assigned=self.ok(self.teacher.post(path,{'title':'Original','ids':['src-u02-020','new-choice-003']}))
        endpoint=path+'/'+assigned['id'];practice='/api/practice/'+assigned['practiceId']
        self.assertEqual(self.student.get(endpoint)[0],403)
        self.assertEqual(self.teacher.get(endpoint.replace('student-demo','other-demo'))[0],404)
        self.ok(self.teacher.post(endpoint+'/edit',{'title':'Renamed','version':0}))
        self.assertEqual(self.ok(self.student.get(practice))['revision'],0)
        self.ok(self.teacher.post(endpoint+'/edit',{'title':'Shorter','version':1,'ids':['src-u02-020']}))
        self.assertEqual(self.teacher.post(endpoint+'/edit',{'title':'Stale','version':1})[0],409)
        self.assertNotIn('new-choice-003',self.ok(self.teacher.get('/api/teacher/students/student-demo/assignment-pool'))['availableIds'])
        self.ok(self.student.post(practice+'/draft',{'revision':1,'index':0,'submitted':['had already translated']}))
        self.assertEqual(self.teacher.post(endpoint+'/edit',{'title':'Invalid','version':2,'ids':['new-choice-004']})[0],409)
        before=self.ok(self.student.get(practice))
        self.ok(self.teacher.post(endpoint+'/cancel',{'version':2}))
        self.assertEqual(self.student.get(practice)[0],403)
        self.assertEqual(self.student.post(practice+'/check',{'revision':2,'index':0,'submitted':['had already translated']})[0],403)
        self.assertEqual(self.ok(self.student.get('/api/account'))['assignments'][0]['status'],'cancelled')
        self.assertEqual(self.ok(self.student.get('/api/account'))['stats']['drafts'],0)
        self.ok(self.teacher.post(endpoint+'/restore',{'version':3}))
        restored=self.ok(self.student.get(practice))
        self.assertEqual(restored['draft'],before['draft']);self.assertEqual(restored['answers'],before['answers'])
        self.ok(self.student.post(practice+'/check',{'revision':restored['revision'],'index':0,'submitted':['had already translated']}))
        self.assertEqual(self.teacher.post(endpoint+'/edit',{'title':'Invalid','version':4,'ids':['src-u02-020']})[0],409)
        self.ok(self.teacher.post(endpoint+'/edit',{'title':'Completed title','version':4}))
        self.assertEqual(self.ok(self.student.get(practice))['score'],1)
        with self.app.connect() as db:
            events=db.execute('SELECT * FROM assignment_events ORDER BY created').fetchall()
            self.assertEqual(len(events),5)
            self.assertEqual(len(json.loads(events[1]['items'])),2)

    def test_assignments(self):
        path='/api/teacher/students/student-demo/assignments'
        payload={'title':'Homework','ids':['src-u02-020'],'score':999}
        self.assertEqual(self.other.post(path,payload)[0],403)
        self.assertEqual(self.anon.post(path,payload)[0],401)
        self.assertEqual(self.teacher.post('/api/teacher/students/teacher-demo/assignments',payload)[0],404)
        for invalid in [dict(payload,ids=[]),dict(payload,ids=['unknown']),dict(payload,ids=['src-u02-020']*2),dict(payload,title=' ')]:
            self.assertEqual(self.teacher.post(path,invalid)[0],400)
        assigned=self.ok(self.teacher.post(path,payload));ident=assigned['practiceId']
        own=self.ok(self.student.get('/api/account'))['assignments']
        self.assertEqual(own[0]['status'],'assigned');self.assertNotIn('had already translated',json.dumps(own))
        self.assertEqual(self.ok(self.other.get('/api/account'))['assignments'],[])
        self.assertEqual(self.other.get('/api/practice/'+ident)[0],404)
        self.ok(self.student.post('/api/practice/'+ident+'/draft',{'index':0,'revision':0,'submitted':['had already translated']}))
        self.assertEqual(self.ok(self.teacher.get('/api/teacher/students/student-demo'))['assignments'][0]['status'],'started')
        self.ok(self.student.post('/api/practice/'+ident+'/check',{'index':0,'revision':1,'submitted':['had already translated'],'score':999}))
        done=self.ok(self.teacher.get('/api/teacher/students/student-demo'))['assignments'][0]
        self.assertEqual((done['status'],done['score'],done['maxScore']),('completed',1,1))
        self.assertEqual(self.ok(self.student.get('/api/practice/'+ident))['index'],1)
    def test_unique_assignments_legacy_and_sentence_alias(self):
        path='/api/teacher/students/student-demo/assignments';pool=path.replace('/assignments','/assignment-pool')
        alias=copy.deepcopy(self.app.bank['src-u02-020']);alias['id']='sentence-alias';self.app.bank[alias['id']]=alias
        self.assertEqual(self.student.get(pool)[0],403)
        with self.app.connect() as db:
            db.execute('INSERT INTO practice(id,user_id,items,created) VALUES(?,?,?,?)',('legacy-assigned','student-demo',json.dumps([self.app.bank['src-u02-020']]),time.time()))
            db.execute('INSERT INTO assignments VALUES(?,?,?,?,?,?)',('legacy-assignment','teacher-demo','student-demo','legacy-assigned','Legacy',time.time()))
        available=self.ok(self.teacher.get(pool))['availableIds']
        self.assertNotIn('src-u02-020',available);self.assertNotIn('sentence-alias',available)
        self.assertEqual(self.teacher.post(path,{'title':'Repeat','ids':['sentence-alias']})[0],409)
        self.ok(self.teacher.post('/api/teacher/students/other-demo/assignments',{'title':'Other student','ids':['src-u02-020']}))
        target=available[0];results=[]
        threads=[threading.Thread(target=lambda:results.append(self.teacher.post(path,{'title':'Concurrent','ids':[target]}))) for _ in range(2)]
        for thread in threads:thread.start()
        for thread in threads:thread.join()
        self.assertEqual(sorted(response[0] for response in results),[200,409])
        with self.app.connect() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM practice WHERE user_id='student-demo'").fetchone()[0],2)
            self.assertGreater(db.execute("SELECT COUNT(*) FROM assignment_sentences WHERE assignment_id='legacy-assignment'").fetchone()[0],0)
    def test_persistent_session_renewal_and_expiry(self):
        raw=self.student.cookie.split('=',1)[1];key=digest(raw)
        with self.app.connect() as db:
            expires=db.execute('SELECT expires FROM sessions WHERE token=?',(key,)).fetchone()[0]
            self.assertGreater(expires-time.time(),29.99*86400)
            db.execute('UPDATE sessions SET expires=? WHERE token=?',(time.time()+28*86400,key))
        renewed=self.student.get('/api/auth/me');self.ok(renewed)
        self.assertIn('Max-Age=2592000',renewed[2]['Set-Cookie'])
        self.assertNotIn('Set-Cookie',self.ok_headers(self.student.get('/api/auth/me')))
        with self.app.connect() as db:db.execute('UPDATE sessions SET expires=? WHERE token=?',(time.time()-1,key))
        self.assertEqual(self.student.get('/api/auth/me')[0],401)
        with self.app.connect() as db:
            teacher_key=digest(self.teacher.cookie.split('=',1)[1])
            db.execute('UPDATE sessions SET expires=? WHERE token=?',(time.time()+28*86400,teacher_key))
        self.ok(self.teacher.post('/api/auth/demo',{'role':'student'}))
        self.assertEqual(self.ok(self.teacher.get('/api/auth/me'))['user']['id'],'student-demo','Renewal must not overwrite a fresh sign-in cookie')
    def ok_headers(self,response):
        self.ok(response);return response[2]
    def test_login_logout_cookies_and_passwords(self):
        response=self.anon.post('/api/auth/login',{'email':'anna@example.test','password':'GrammarDemo!2026'})
        self.ok(response);self.assertIn('HttpOnly',response[2]['Set-Cookie']);self.assertIn('SameSite=Lax',response[2]['Set-Cookie'])
        with self.app.connect() as db:
            encoded=db.execute("SELECT password FROM users WHERE id='student-demo'").fetchone()[0]
            self.assertNotIn('GrammarDemo',encoded);self.assertTrue(password_ok('GrammarDemo!2026',encoded))
        self.ok(self.anon.post('/api/auth/logout',{}));self.assertEqual(self.anon.get('/api/account')[0],401)
        self.assertEqual(self.anon.post('/api/auth/login',{'email':'anna@example.test','password':'wrong'})[0],401)
    def test_roles_ownership_and_private_files(self):
        self.assertEqual(self.student.get('/api/teacher/students')[0],403)
        self.assertEqual(self.student.get('/api/teacher/students/other-demo')[0],403)
        self.assertEqual(self.anon.get('/api/account')[0],401)
        a=self.start_practice()
        self.assertEqual(self.other.get('/api/practice/'+a['id'])[0],404)
        self.assertEqual(self.other.post('/api/practice/'+a['id']+'/check',{'index':0,'revision':0,'submitted':['had already translated']})[0],404)
        for path in ['/.git/config','/server/app.py','/private/grammar.sqlite3','/../private/grammar.sqlite3','/%2e%2e/server/app.py']:
            self.assertEqual(self.anon.get(path)[0],404,path)
    def test_teacher_can_read_only_assigned_students(self):
        students=self.ok(self.teacher.get('/api/teacher/students'))['students'];self.assertEqual(len(students),2)
        self.ok(self.teacher.get('/api/teacher/students/student-demo'))
        self.assertEqual(self.teacher.get('/api/teacher/students/teacher-demo')[0],404)
        # Another teacher's identifier cannot be claimed through client input.
        self.assertEqual(self.student.post('/api/teacher/invite',{'name':'X','email':'x@example.test','role':'teacher'})[0],403)
    def test_csrf_and_origin(self):
        self.assertEqual(self.student.request('/api/practice/start',{'ids':['src-u02-020']},csrf=False)[0],403)
        self.assertEqual(self.student.request('/api/practice/start',{'ids':['src-u02-020']},origin='https://evil.example')[0],403)
        self.assertEqual(self.anon.request('/api/auth/demo',{'role':'teacher'},origin='https://evil.example')[0],403)
    def test_invite_is_single_use_and_server_sets_role(self):
        invite=self.ok(self.teacher.post('/api/teacher/invite',{'name':'Новый ученик','email':'new@example.test'}))
        with self.app.connect() as db:
            stored=db.execute('SELECT token FROM invites').fetchone()[0]
            self.assertNotEqual(stored,invite['token'])
            self.assertEqual(len(stored),64)
        new=Client(self.app)
        user=self.ok(new.post('/api/auth/join',{'token':invite['token'],'name':'Новый','password':'Safe-example-password-2026','role':'teacher','teacher_id':'other'}))['user']
        self.assertEqual(user['role'],'student')
        self.assertEqual(Client(self.app).post('/api/auth/join',{'token':invite['token'],'name':'Other','password':'Safe-example-password-2026'})[0],410)
        self.ok(self.teacher.get('/api/teacher/students/'+user['id']))
    def test_open_links_self_entered_email_and_concurrent_join(self):
        first=self.ok(self.teacher.post('/api/teacher/invite',{}))
        second=self.ok(self.teacher.post('/api/teacher/invite',{}))
        payload={'token':first['token'],'name':'New pupil','email':'bad','password':'Safe-example-password-2026','role':'teacher','teacher_id':'forged'}
        self.assertEqual(self.anon.post('/api/auth/join',payload)[0],400)
        payload['email']='anna@example.test'
        self.assertEqual(self.anon.post('/api/auth/join',payload)[0],409)
        payload['email']='  OPEN.PUPIL@example.test  '
        user=self.ok(self.anon.post('/api/auth/join',payload))['user']
        self.assertEqual((user['email'],user['role']),('open.pupil@example.test','student'))
        self.ok(self.teacher.get('/api/teacher/students/'+user['id']))
        self.assertEqual(Client(self.app).post('/api/auth/join',dict(payload,email='other.open@example.test'))[0],410)
        barrier=threading.Barrier(2);responses=[]
        def join(address):
            barrier.wait();responses.append(Client(self.app).post('/api/auth/join',dict(payload,token=second['token'],email=address)))
        threads=[threading.Thread(target=join,args=(address,)) for address in ['race.one@example.test','race.two@example.test']]
        for thread in threads:thread.start()
        for thread in threads:thread.join()
        self.assertEqual(sorted(result[0] for result in responses),[200,410])
        with self.app.connect() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM users WHERE email IN ('race.one@example.test','race.two@example.test')").fetchone()[0],1)
        legacy=self.ok(self.teacher.post('/api/teacher/invite',{'email':'bound@example.test','name':'Bound'}))
        self.assertEqual(Client(self.app).post('/api/auth/join',dict(payload,token=legacy['token'],email='different@example.test'))[0],400)
        self.ok(Client(self.app).post('/api/auth/join',dict(payload,token=legacy['token'],email='bound@example.test')))

    def test_expired_and_replaced_invite(self):
        first=self.ok(self.teacher.post('/api/teacher/invite',{'name':'A','email':'expire@example.test'}))
        second=self.ok(self.teacher.post('/api/teacher/invite',{'name':'A','email':'expire@example.test'}))
        payload={'token':first['token'],'name':'A','password':'Safe-example-password-2026'}
        self.assertEqual(self.anon.post('/api/auth/join',payload)[0],410)
        with self.app.connect() as db:db.execute('UPDATE invites SET expires=?',(time.time()-1,))
        payload['token']=second['token'];self.assertEqual(self.anon.post('/api/auth/join',payload)[0],410)
    def test_draft_revision_and_server_scoring(self):
        a=self.start_practice();path='/api/practice/'+a['id']
        saved=self.ok(self.student.post(path+'/draft',{'index':0,'revision':0,'submitted':['had already translated']}));self.assertEqual(saved['revision'],1)
        self.assertEqual(self.student.post(path+'/draft',{'index':0,'revision':0,'submitted':['wrong']})[0],409)
        self.assertEqual(self.ok(self.student.get(path))['draft'],['had already translated'])
        result=self.ok(self.student.post(path+'/check',{'index':0,'revision':1,'submitted':['wrong'],'correct':True,'score':999}))
        self.assertFalse(result['answer']['correct'])
        account=self.ok(self.student.get('/api/account'));self.assertEqual(account['stats']['score'],0);self.assertEqual(account['stats']['sessions'],1)
        teacher=self.ok(self.teacher.get('/api/teacher/students/student-demo'));self.assertEqual(teacher['stats'],account['stats'])
    def test_idempotent_and_parallel_submission(self):
        a=self.start_practice();path='/api/practice/'+a['id']+'/check';payload={'index':0,'revision':0,'submitted':['had already translated']}
        results=[]
        threads=[threading.Thread(target=lambda:results.append(self.student.post(path,payload))) for _ in range(2)]
        for thread in threads:thread.start()
        for thread in threads:thread.join()
        self.assertEqual([r[0] for r in results],[200,200]);self.assertEqual(results[0][1]['answer'],results[1][1]['answer'])
        account=self.ok(self.student.get('/api/account'));self.assertEqual(account['stats']['sessions'],1);self.assertEqual(account['stats']['score'],1)
        self.assertEqual(self.student.post(path,{**payload,'submitted':['different']})[0],409)
    def test_unknown_translation_not_counted_as_error(self):
        item=self.legacy_item();a=self.start_practice(ids=[item['id']]);self.stored_legacy_answer(a['id'],item,'My usual routine is to check my inbox after I eat breakfast.')
        stats=self.ok(self.student.get('/api/account'))['stats'];self.assertEqual(stats['pending'],1);self.assertEqual(stats['maxScore'],0)
    def test_unknown_sentence_rewrite_is_saved_without_penalty(self):
        item=self.legacy_item('error_correction')
        a=self.start_practice(ids=[item['id']])
        self.assertEqual(self.student.post('/api/practice/'+a['id']+'/check',{'index':0,'revision':0,'submitted':'An unrecognised alternative sentence.','correct':True,'score':999})[0],409)
        answer=self.stored_legacy_answer(a['id'],item,'An unrecognised alternative sentence.')
        self.assertFalse(answer['correct'])
        self.assertFalse(answer['fields'][0]['verified'])
        self.assertEqual(answer['checker'],3)
        own=self.ok(self.student.get('/api/account'))
        self.assertEqual(own['stats']['pending'],1)
        self.assertEqual(own['stats']['maxScore'],0)
        self.assertEqual(own['stats']['score'],0)
    def test_blocked_user_loses_session(self):
        with self.app.connect() as db:db.execute("UPDATE users SET active=0 WHERE id='student-demo'")
        self.assertEqual(self.student.get('/api/account')[0],401)
    def test_order_and_item_versions_are_fixed(self):
        a=self.start_practice(ids=['src-u02-020','src-u02-033']);path='/api/practice/'+a['id']
        self.assertEqual(self.student.post(path+'/check',{'index':1,'revision':0,'submitted':['had']})[0],409)
        original=copy.deepcopy(self.app.bank['src-u02-020'])
        self.app.bank['src-u02-020']['blanks'][0]['answer']='tampered content'
        result=self.ok(self.student.post(path+'/check',{'index':0,'revision':0,'submitted':['had already translated']}))
        self.assertTrue(result['answer']['correct']);self.assertEqual(result['answer']['item'],original)

class OwnerSetupTest(unittest.TestCase):
    def test_owner_setup_is_not_public_teacher_registration(self):
        with tempfile.TemporaryDirectory(prefix='grammar-owner-test-') as folder:
            app=GrammarApp(folder);client=Client(app)
            payload={'email':'owner@example.test','name':'Owner','password':'Safe-owner-password-2026','code':'wrong'}
            self.assertEqual(client.post('/api/auth/setup',payload)[0],403)
            payload['code']=app.setup_token
            self.assertEqual(client.post('/api/auth/setup',payload)[1]['user']['role'],'teacher')
            self.assertEqual(client.post('/api/auth/setup',payload)[0],409)
            self.assertEqual(Client(app).post('/api/auth/demo',{'role':'teacher'})[0],404)


class RateLimitTest(unittest.TestCase):
    def test_repeated_failures_are_limited_without_blocking_other_accounts(self):
        with tempfile.TemporaryDirectory(prefix='grammar-rate-test-') as folder:
            app=GrammarApp(folder,demo=True);client=Client(app)
            for _ in range(12):
                self.assertEqual(client.post('/api/auth/login',{'email':'anna@example.test','password':'wrong'})[0],401)
            self.assertEqual(client.post('/api/auth/login',{'email':'anna@example.test','password':'wrong'})[0],429)
            self.assertEqual(client.post('/api/auth/login',{'email':'misha@example.test','password':'GrammarDemo!2026'})[0],200)


class PersistenceTest(unittest.TestCase):
    def test_owner_can_sign_in_after_server_restart(self):
        with tempfile.TemporaryDirectory(prefix='grammar-persistence-test-') as folder:
            app=GrammarApp(folder);client=Client(app)
            response=client.post('/api/auth/setup',{'email':'owner@example.test','name':'Owner','password':'Safe-owner-password-2026','code':app.setup_token})
            self.assertEqual(response[0],200)
            restarted=GrammarApp(folder)
            self.assertTrue(restarted.teacher_exists())
            response=Client(restarted).post('/api/auth/login',{'email':'owner@example.test','password':'Safe-owner-password-2026'})
            self.assertEqual(response[0],200)
            self.assertEqual(response[1]['user']['role'],'teacher')


class GradingParityTest(unittest.TestCase):
    def test_every_reviewed_variant_is_accepted_on_server(self):
        root=Path(__file__).resolve().parents[1]
        count=0
        for file in (root/'data/exercises').glob('part-*.json'):
            for item in json.loads(file.read_text()):
                if item.get('grading_mode')=='teacher':
                    result=grade(item,[b['answer'] for b in item['blanks']])
                    self.assertFalse(result['correct'])
                    self.assertTrue(all(not f['verified'] for f in result['fields']))
                    continue
                if item.get('options'):
                    for index in item.get('accepted_option_indices',[item['correct_option_index']]):
                        self.assertTrue(grade(item,index)['correct'],item['id'])
                elif item.get('blanks'):
                    canonical=[b['answer'] for b in item['blanks']]
                    for k,blank in enumerate(item['blanks']):
                        for variant in [blank['answer'],*blank['accepted_answers']]:
                            values=canonical.copy();values[k]=variant
                            self.assertTrue(grade(item,values)['correct'],(item['id'],variant));count+=1
                else:
                    for variant in [item['answer'],*item.get('accepted_answers',[])]:
                        self.assertTrue(grade(item,variant)['correct'],(item['id'],variant));count+=1
        self.assertGreater(count,3000)
    def test_grammar_mistakes_are_not_erased(self):
        item={'id':'x','type':'open_brackets','blanks':[{'answer':'had already translated','accepted_answers':['had translated']}]}
        for wrong in ['had not translated','had translate','has translated','translated','had already already translated']:
            self.assertFalse(grade(item,[wrong])['correct'],wrong)
        for good in ['had translated','had already translated']:self.assertTrue(grade(item,[good])['correct'])
        self.assertTrue(grade({'id':'y','type':'translation_ru_en','answer':'He would have left.'},"He'd've left.")['correct'])
    def test_rejects_other_app_database_before_schema_changes(self):
        import sqlite3
        with tempfile.TemporaryDirectory(prefix='other-database-') as folder:
            path=Path(folder)/'grammar.sqlite3'
            with sqlite3.connect(path) as db:db.execute('CREATE TABLE other_app(id INTEGER)')
            before=path.read_bytes()
            with self.assertRaises(ValueError):GrammarApp(folder)
            self.assertEqual(path.read_bytes(),before)

if __name__=='__main__':unittest.main()
