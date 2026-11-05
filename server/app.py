"""Independent Grammar NOEON accounts and learning records. SQLite, WSGI, stdlib."""
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import time
import unicodedata
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import unquote
from .grading import grade
from .assignment_keys import assignment_sentence_keys

SESSION_SECONDS=30*86400
ROOT=Path(__file__).resolve().parent.parent
SCHEMA='''
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('teacher','student')),teacher_id TEXT REFERENCES users(id),password TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created REAL NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS one_teacher ON users(role) WHERE role='teacher';
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires REAL NOT NULL);
CREATE TABLE IF NOT EXISTS invites(token TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),email TEXT NOT NULL,name TEXT NOT NULL,expires REAL NOT NULL,used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS practice(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),items TEXT NOT NULL,answers TEXT NOT NULL DEFAULT '[]',draft TEXT,revision INTEGER NOT NULL DEFAULT 0,created REAL NOT NULL,completed REAL);
CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,until_time REAL NOT NULL);
-- Additive migration, dedicated Grammar NOEON database only.
CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),student_id TEXT NOT NULL REFERENCES users(id),practice_id TEXT NOT NULL UNIQUE REFERENCES practice(id),title TEXT NOT NULL,created REAL NOT NULL);
CREATE INDEX IF NOT EXISTS assignments_student ON assignments(student_id,created DESC);
CREATE INDEX IF NOT EXISTS assignments_teacher ON assignments(teacher_id,student_id,created DESC);
-- Per-student reservations; old assignments are registered lazily and atomically.
CREATE TABLE IF NOT EXISTS assignment_sentences(student_id TEXT NOT NULL REFERENCES users(id),sentence_key TEXT NOT NULL,assignment_id TEXT NOT NULL REFERENCES assignments(id),PRIMARY KEY(student_id,sentence_key));
CREATE INDEX IF NOT EXISTS assignment_sentences_owner ON assignment_sentences(student_id,assignment_id);

-- Reversible cancellation and an immutable audit of assignment edits.
CREATE TABLE IF NOT EXISTS assignment_controls(assignment_id TEXT PRIMARY KEY REFERENCES assignments(id),cancelled INTEGER NOT NULL DEFAULT 0 CHECK(cancelled IN (0,1)),version INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS assignment_events(id TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES assignments(id),action TEXT NOT NULL,title TEXT NOT NULL,items TEXT NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));
CREATE INDEX IF NOT EXISTS assignment_events_owner ON assignment_events(assignment_id,created);
CREATE TABLE IF NOT EXISTS notification_reads(user_id TEXT NOT NULL REFERENCES users(id),event_id TEXT NOT NULL,read_at REAL NOT NULL,PRIMARY KEY(user_id,event_id));
CREATE TABLE IF NOT EXISTS practice_format_events(id TEXT PRIMARY KEY,practice_id TEXT NOT NULL REFERENCES practice(id),items TEXT NOT NULL,draft TEXT,revision INTEGER NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));


'''

def learner_item(item):
    visible={key:item[key] for key in ('id','type','prompt','title','options','cefr_estimate','content_version') if key in item}
    if 'blanks' in item:visible['blanks']=[{key:blank[key] for key in ('id','base_verb','base_adjective','supplied_words') if key in blank} for blank in item['blanks']]
    return visible

def digest(s):return hashlib.sha256(s.encode()).hexdigest()
def password_hash(value):
    if not isinstance(value,str) or len(value)<12 or len(value)>256:raise Problem('Пароль должен содержать от 12 до 256 символов.')
    salt=secrets.token_hex(16);iterations=600000
    encoded=hashlib.pbkdf2_hmac('sha256',value.encode(),salt.encode(),iterations).hex()
    return f'pbkdf2_sha256${iterations}${salt}${encoded}'
def password_ok(value,encoded):
    if not isinstance(value,str) or len(value)>256:return False
    try:
        if encoded.startswith('pbkdf2_sha256$'):
            algorithm,count,salt,expected=encoded.split('$');iterations=int(count)
            if not 100000<=iterations<=2000000:return False
        else:
            salt,expected=encoded.split(':');iterations=310000
        actual=hashlib.pbkdf2_hmac('sha256',value.encode(),salt.encode(),iterations).hex()
        return hmac.compare_digest(expected,actual)
    except (ValueError,TypeError):return False
def public(user):return {k:user[k] for k in ('id','name','email','role')}
def clean(value,limit=200):
    if not isinstance(value,str) or not value.strip() or len(value)>limit:raise Problem('Проверьте заполненные поля.')
    return value.strip()
def email(value):
    value=clean(value,254).casefold()
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',value):raise Problem('Введите корректный email.')
    return value
class Problem(Exception):
    def __init__(self,message,status=400):self.message,self.status=message,status

class GrammarApp:
    def __init__(self,folder,origin='http://127.0.0.1:4177',demo=False):
        self.folder=Path(folder).resolve();self.folder.mkdir(parents=True,exist_ok=True,mode=0o700)
        self.path=self.folder/'grammar.sqlite3';self.origin=origin;self.demo=demo
        if self.path.exists():
            with sqlite3.connect(self.path.as_uri()+'?mode=ro',uri=True) as existing:
                if existing.execute('PRAGMA application_id').fetchone()[0] != 1196314437:
                    raise ValueError('This is not a Grammar NOEON database. Choose a new isolated folder.')
        self.setup_token=secrets.token_urlsafe(32)
        with self.connect() as db:
            db.executescript(SCHEMA)
            db.execute('PRAGMA application_id=1196314437')
        self.path.chmod(0o600)
        self.bank={i['id']:i for p in sorted((ROOT/'data/exercises').glob('part-*.json')) for i in json.loads(p.read_text())}
        if demo:self.seed_demo()
        elif not self.teacher_exists():
            secret_file=self.folder/'owner-setup-code.txt'
            secret_file.write_text(self.setup_token);secret_file.chmod(0o600)
    def connect(self):
        db=sqlite3.connect(self.path,timeout=15);db.row_factory=sqlite3.Row
        db.execute('PRAGMA foreign_keys=ON');db.execute('PRAGMA journal_mode=WAL');return db
    def notification_rows(self,db,user):
        teacher=user['role']=='teacher'
        kind='completed' if teacher else 'assigned'
        condition='a.teacher_id=? AND p.completed IS NOT NULL' if teacher else 'a.student_id=? AND COALESCE(c.cancelled,0)=0'
        rows=db.execute(f'''SELECT a.id,a.title,a.student_id,a.practice_id,a.created,p.completed,p.items,p.answers,p.revision,u.name,r.read_at
            FROM assignments a JOIN practice p ON p.id=a.practice_id AND p.user_id=a.student_id
            JOIN users u ON u.id=a.student_id AND u.teacher_id=a.teacher_id AND u.active=1
            LEFT JOIN assignment_controls c ON c.assignment_id=a.id
            LEFT JOIN notification_reads r ON r.user_id=? AND r.event_id=? || ':' || a.id
            WHERE {condition} ORDER BY (r.read_at IS NULL) DESC, {'p.completed' if teacher else 'a.created'} DESC,a.id DESC''',(user['id'],kind,user['id'])).fetchall()
        result=[]
        for row in rows:
            fields=[f for a in json.loads(row['answers']) for f in a['fields']]
            result.append(dict(id=kind+':'+row['id'],kind=kind,title=row['title'],studentId=row['student_id'],studentName=row['name'],practiceId=row['practice_id'],created=row['completed'] if teacher else row['created'],read=row['read_at'] is not None,total=len(json.loads(row['items'])),score=sum(bool(f['correct']) for f in fields),maxScore=sum(bool(f['verified']) for f in fields),pending=sum(not f['verified'] for f in fields)))
        return result
    def teacher_exists(self):
        with self.connect() as db:return bool(db.execute("SELECT id FROM users WHERE role='teacher'").fetchone())
    def seed_demo(self):
        with self.connect() as db:
            if db.execute('SELECT id FROM users LIMIT 1').fetchone():return
            encoded=password_hash('GrammarDemo!2026')
            for ident,mail,name,role,owner in [('teacher-demo','teacher@example.test','Учитель NOEON','teacher',None),('student-demo','anna@example.test','Анна, тестовый ученик','student','teacher-demo'),('other-demo','misha@example.test','Миша, тестовый ученик','student','teacher-demo')]:
                db.execute('INSERT INTO users VALUES(?,?,?,?,?,?,1,?)',(ident,mail,name,role,owner,encoded,time.time()))
    def seed_preview_history(self):
        """Fictional preview examples only; calculate scores through the real grader."""
        if not self.demo:raise ValueError('Preview records require an isolated demo.')
        with self.connect() as db:
            if db.execute('SELECT id FROM practice LIMIT 1').fetchone():return
            for owner,submitted in [('student-demo',['had translated']),('other-demo',['has translate'])]:
                item=self.bank['src-u02-020'];answer=grade(item,submitted)
                db.execute('INSERT INTO practice(id,user_id,items,answers,revision,created,completed) VALUES(?,?,?,?,1,?,?)',(secrets.token_hex(16),owner,json.dumps([item],ensure_ascii=False),json.dumps([answer],ensure_ascii=False),time.time()-86400,time.time()-86300))
    def limit(self,db,key,max_attempts=12):
        row=db.execute('SELECT * FROM limits WHERE key=?',(key,)).fetchone()
        if row and row['until_time']>time.time() and row['attempts']>=max_attempts:raise Problem('Слишком много попыток. Попробуйте через 15 минут.',429)
        db.execute('INSERT INTO limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN until_time<? THEN 1 ELSE attempts+1 END,until_time=CASE WHEN until_time<? THEN excluded.until_time ELSE until_time END',(key,time.time()+900,time.time(),time.time()))
        db.commit();db.execute('BEGIN IMMEDIATE')
    def session(self,db,env):
        cookie=SimpleCookie()
        try:cookie.load(env.get('HTTP_COOKIE',''));token=cookie.get('grammar_session');raw=token.value if token else ''
        except Exception:raw=''
        return db.execute('SELECT u.*,s.csrf,s.expires AS session_expires FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1',(digest(raw),time.time())).fetchone()
    def login(self,db,user):
        raw=secrets.token_urlsafe(40);csrf=secrets.token_urlsafe(32)
        db.execute('INSERT INTO sessions VALUES(?,?,?,?)',(digest(raw),user['id'],csrf,time.time()+SESSION_SECONDS))
        cookie='grammar_session='+raw+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000'
        if self.origin.startswith('https://'):cookie+='; Secure'
        return {'user':public(user),'csrf':csrf},[('Set-Cookie',cookie)]
    def own_student(self,db,user,ident):
        if user['role']!='teacher':raise Problem('Доступ только преподавателю.',403)
        row=db.execute("SELECT * FROM users WHERE id=? AND teacher_id=? AND role='student'",(ident,user['id'])).fetchone()
        if not row:raise Problem('Ученик не найден.',404)
        return row
    def history(self,db,ident):
        return [self.practice_view(r) for r in db.execute('SELECT *,EXISTS(SELECT 1 FROM assignments a JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=practice.id AND c.cancelled=1) AS cancelled FROM practice WHERE user_id=? ORDER BY created DESC',(ident,))]
    def practice_view(self,row):
        items=json.loads(row['items']);answers=json.loads(row['answers']);fields=[f for a in answers for f in a['fields']]
        return {'id':row['id'],'date':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime(row['completed'] or row['created'])),'status':'completed' if row['completed'] else 'cancelled' if 'cancelled' in row.keys() and row['cancelled'] else 'draft','total':len(items),'correct':sum(a['correct'] for a in answers),'score':sum(f['correct'] for f in fields),'maxScore':sum(f['verified'] for f in fields),'pending':sum(not f['verified'] for f in fields),'levels':list(dict.fromkeys(i['cefr_estimate'] for i in items)),'types':list(dict.fromkeys(i['type'] for i in items)),'answers':answers,'index':len(answers),'revision':row['revision'],'draft':json.loads(row['draft']) if row['draft'] else None}
    def assigned_sentences(self,db,student_id):
        used={}
        for row in db.execute('SELECT a.id,p.items FROM assignments a JOIN practice p ON p.id=a.practice_id WHERE a.student_id=? ORDER BY a.created,a.id',(student_id,)):
            for item in json.loads(row['items']):
                for key in assignment_sentence_keys(item):used.setdefault(digest(key),row['id'])
        for row in db.execute('SELECT sentence_key,assignment_id FROM assignment_sentences WHERE student_id=?',(student_id,)):used.setdefault(row['sentence_key'],row['assignment_id'])
        return used
    def assignments(self,db,ident):
        result=[]
        for row in db.execute('SELECT a.title,a.id AS assignment_id,p.*,COALESCE(c.cancelled,0) AS cancelled,COALESCE(c.version,0) AS version FROM assignments a JOIN practice p ON p.id=a.practice_id AND p.user_id=a.student_id LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.student_id=? ORDER BY a.created DESC,a.id DESC',(ident,)):
            view=self.practice_view(row)
            result.append({'id':row['assignment_id'],'title':row['title'],'practiceId':row['id'],'created':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime(row['created'])),'version':row['version'],'editableContent':not row['cancelled'] and not row['completed'] and not view['index'] and row['draft'] is None,'status':'cancelled' if row['cancelled'] else 'completed' if row['completed'] else 'started' if view['index'] or row['draft'] is not None else 'assigned',**{key:view[key] for key in ('total','index','score','maxScore','pending')}})
        return result
    def stats(self,db,ident):
        history=self.history(db,ident);done=[h for h in history if h['status']=='completed']
        return {'sessions':len(done),'drafts':sum(h['status']=='draft' for h in history),'score':sum(h['score'] for h in done),'maxScore':sum(h['maxScore'] for h in done),'pending':sum(h['pending'] for h in done)}
    def route(self,db,path,method,data,user,env):
        if path=='/api/health' and method=='GET':return {'ok':True},[]
        if path=='/api/auth/info' and method=='GET':return {'demo':self.demo,'local':not self.origin.startswith('https://'),'ready':bool(db.execute("SELECT id FROM users WHERE role='teacher'").fetchone())},[]
        if path in ('/api/auth/login','/api/auth/setup','/api/auth/join','/api/auth/demo') and method=='POST':
            address=env.get('REMOTE_ADDR','local')
            self.limit(db,'auth-global:'+address,60)
            subject = data.get('email') if path.endswith('/login') else data.get('token') if path.endswith('/join') else data.get('role') if path.endswith('/demo') else 'owner'
            self.limit(db,'auth-target:'+address+':'+path+':'+digest(str(subject).casefold()))
            if path.endswith('/demo'):
                if not self.demo:raise Problem('Маршрут не найден.',404)
                ident={'teacher':'teacher-demo','student':'student-demo','other':'other-demo'}.get(data.get('role'))
                found=db.execute('SELECT * FROM users WHERE id=? AND active=1',(ident,)).fetchone()
                if not found:raise Problem('Тестовый аккаунт недоступен.',403)
                return self.login(db,found)
            if path.endswith('/login'):
                found=db.execute('SELECT * FROM users WHERE email=? AND active=1',(email(data.get('email')),)).fetchone()
                encoded=found['password'] if found else 'pbkdf2_sha256$600000$dummy$'+('0'*64)
                if not password_ok(data.get('password'),encoded) or not found:raise Problem('Неверная почта или пароль.',401)
                return self.login(db,found)
            if path.endswith('/setup'):
                if not hmac.compare_digest(str(data.get('code','')),self.setup_token):raise Problem('Неверный код создания кабинета.',403)
                if db.execute("SELECT id FROM users WHERE role='teacher'").fetchone():raise Problem('Кабинет учителя уже создан.',409)
                ident=secrets.token_hex(16)
                db.execute('INSERT INTO users VALUES(?,?,?,?,NULL,?,1,?)',(ident,email(data.get('email')),clean(data.get('name')),'teacher',password_hash(data.get('password')),time.time()))
            else:
                invite=db.execute('SELECT * FROM invites WHERE token=? AND used=0 AND expires>?',(digest(clean(data.get('token'))),time.time())).fetchone()
                if not invite:raise Problem('Приглашение недействительно или истекло.',410)
                owner=db.execute('SELECT id FROM users WHERE id=? AND active=1',(invite['teacher_id'],)).fetchone()
                if not owner:raise Problem('Приглашение недоступно.',410)
                address=email(invite['email'] or data.get('email'))
                if invite['email'] and data.get('email') and email(data['email'])!=address:raise Problem('Эта ссылка приглашения выдана для другой почты. Получите новую ссылку у учителя.')
                if db.execute('SELECT id FROM users WHERE email=?',(address,)).fetchone():raise Problem('Эта почта уже зарегистрирована. Войдите в свой кабинет.',409)
                ident=secrets.token_hex(16)
                db.execute('INSERT INTO users VALUES(?,?,?,?,?,?,1,?)',(ident,address,clean(data.get('name') or invite['name']),'student',invite['teacher_id'],password_hash(data.get('password')),time.time()))
                db.execute('UPDATE invites SET used=1 WHERE token=?',(invite['token'],))
            return self.login(db,db.execute('SELECT * FROM users WHERE id=?',(ident,)).fetchone())
        if not user:raise Problem('Войдите в личный кабинет.',401)
        if method=='POST' and not hmac.compare_digest(env.get('HTTP_X_CSRF_TOKEN',''),user['csrf']):raise Problem('Обновите страницу и повторите действие.',403)
        if path=='/api/auth/me' and method=='GET':return {'user':public(user),'csrf':user['csrf']},[]
        if path=='/api/auth/logout' and method=='POST':
            cookie=SimpleCookie(env.get('HTTP_COOKIE',''));token=cookie.get('grammar_session')
            if token:db.execute('DELETE FROM sessions WHERE token=?',(digest(token.value),))
            return {'ok':True},[('Set-Cookie','grammar_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')]
        if path=='/api/notifications' and method=='GET':
            rows=self.notification_rows(db,user)
            return {'items':rows[:50],'unreadCount':sum(not r['read'] for r in rows)},[]
        if path=='/api/notifications/read' and method=='POST':
            rows=self.notification_rows(db,user)
            selected=rows if data.get('all') is True else [r for r in rows if r['id']==data.get('id')]
            if not selected and data.get('all') is not True:raise Problem('Уведомление не найдено.',404)
            db.executemany('INSERT OR IGNORE INTO notification_reads VALUES(?,?,?)',[(user['id'],r['id'],time.time()) for r in selected])
            return {'ok':True},[]
        work=re.fullmatch(r'/api/(?:(?:teacher/students/([\w-]+)/))?attempts/([\w-]+)',path)
        if work and method=='GET':
            student=self.own_student(db,user,work[1]) if work[1] else None
            target=student['id'] if student else user['id']
            row=db.execute('SELECT p.*,a.id AS assignment_id,a.title,a.teacher_id AS assignment_teacher,COALESCE(c.cancelled,0) AS cancelled,COALESCE(c.version,0) AS assignment_version FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE p.id=? AND p.user_id=?',(work[2],target)).fetchone()
            if not row or (student and row['assignment_id'] and row['assignment_teacher']!=user['id']):raise Problem('Задание не найдено.',404)
            can_resume=not student and not row['completed'] and not row['cancelled'] and (user['role']=='teacher' or (row['assignment_id'] and row['assignment_teacher']==user['teacher_id']))
            assignment={'id':row['assignment_id'],'version':row['assignment_version'],'cancelled':bool(row['cancelled'])} if student and row['assignment_id'] else None
            return {'title':row['title'] or 'Тренировка','attempt':self.practice_view(row),'student':public(student) if student else None,'canResume':bool(can_resume),'assignment':assignment},[]
        own_report=re.fullmatch(r'/api/reports/([\w-]+)',path)
        if own_report and method=='GET':
            row=db.execute('SELECT p.*,a.title FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id WHERE p.id=? AND p.user_id=? AND p.completed IS NOT NULL',(own_report[1],user['id'])).fetchone()
            if not row:raise Problem('Отчёт не найден.',404)
            return {'title':row['title'] or 'Итоги тренировки','attempt':self.practice_view(row)},[]
        report=re.fullmatch(r'/api/teacher/students/([\w-]+)/reports/([\w-]+)',path)
        if report and method=='GET':
            student=self.own_student(db,user,report[1])
            row=db.execute('SELECT p.*,a.title FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id WHERE p.id=? AND p.user_id=? AND (a.id IS NULL OR (a.student_id=? AND a.teacher_id=?)) AND p.completed IS NOT NULL',(report[2],student['id'],student['id'],user['id'])).fetchone()
            if not row:raise Problem('Отчёт не найден.',404)
            return {'student':public(student),'title':row['title'] or 'Итоги тренировки','attempt':self.practice_view(row)},[]
        if path=='/api/account' and method=='GET':return {'user':public(user),'stats':self.stats(db,user['id']),'assignments':self.assignments(db,user['id']),'history':self.history(db,user['id'])},[]
        if path=='/api/teacher/students' and method=='GET':
            if user['role']!='teacher':raise Problem('Доступ только преподавателю.',403)
            return {'students':[{**public(r),'active':bool(r['active']),'stats':self.stats(db,r['id'])} for r in db.execute("SELECT * FROM users WHERE teacher_id=? AND role='student' ORDER BY name",(user['id'],))]},[]
        if path=='/api/teacher/invite' and method=='POST':
            if user['role']!='teacher':raise Problem('Доступ только преподавателю.',403)
            address=email(data['email']) if data.get('email') else '';name=clean(data['name']) if data.get('name') else ''
            if address and db.execute('SELECT id FROM users WHERE email=?',(address,)).fetchone():raise Problem('Этот email уже зарегистрирован.',409)
            raw=secrets.token_urlsafe(32)
            db.execute("UPDATE invites SET used=1 WHERE email=? AND teacher_id=? AND email<>''",(address,user['id']))
            db.execute('INSERT INTO invites VALUES(?,?,?,?,?,0)',(digest(raw),user['id'],address,name,time.time()+7*86400))
            return {'token':raw,'name':name,'email':address,'expires_in_days':7},[]
        match=re.fullmatch(r'/api/teacher/students/([\w-]+)',path)
        if match and method=='GET':
            student=self.own_student(db,user,match[1]);return {'user':public(student),'stats':self.stats(db,student['id']),'assignments':self.assignments(db,student['id']),'history':self.history(db,student['id'])},[]
        match=re.fullmatch(r'/api/teacher/students/([\w-]+)/assignment-pool',path)
        if match and method=='GET':
            student=self.own_student(db,user,match[1]);used=self.assigned_sentences(db,student['id'])
            return {'availableIds':[item['id'] for item in self.bank.values() if all(digest(key) not in used for key in assignment_sentence_keys(item))]},[]
        match=re.fullmatch(r'/api/teacher/students/([\w-]+)/assignments/([\w-]+)(?:/(edit|cancel|restore))?',path)
        if match:
            student=self.own_student(db,user,match[1])
            row=db.execute('SELECT a.id AS assignment_id,a.title,p.*,COALESCE(c.cancelled,0) AS cancelled,COALESCE(c.version,0) AS version FROM assignments a JOIN practice p ON p.id=a.practice_id LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.id=? AND a.student_id=? AND a.teacher_id=?',(match[2],student['id'],user['id'])).fetchone()
            if not row:raise Problem('Назначение не найдено.',404)
            items=json.loads(row['items']);current_keys={digest(key) for item in items for key in assignment_sentence_keys(item)}
            editable=not row['cancelled'] and not row['completed'] and not json.loads(row['answers']) and row['draft'] is None
            used=self.assigned_sentences(db,student['id'])
            def allowed(key):return key not in used or (used[key]==row['assignment_id'] and key in current_keys)
            if method=='GET' and not match[3]:return {'id':row['assignment_id'],'title':row['title'],'version':row['version'],'editableContent':editable,'items':items,'availableIds':[item['id'] for item in self.bank.values() if all(allowed(digest(key)) for key in assignment_sentence_keys(item))]},[]
            action=match[3]
            if method!='POST' or not action:raise Problem('Метод не поддерживается.',405)
            if data.get('version')!=row['version']:raise Problem('Назначение уже изменено. Откройте его заново.',409)
            title=row['title'];next_items=items;keys=set()
            if action=='edit':
                title=clean(data.get('title'),160)
                if 'ids' in data:
                    if not editable:raise Problem('Ученик уже начал работу или задание снято. Можно изменить только название.',409)
                    ids=data['ids'];current={item['id']:item for item in items}
                    if not isinstance(ids,list) or not 1<=len(ids)<=50 or any(not isinstance(i,str) or (i not in self.bank and i not in current) for i in ids) or len(set(ids))!=len(ids):raise Problem('Некорректный набор упражнений.')
                    next_items=[current.get(i) or self.bank[i] for i in ids]
                    for item in next_items:
                        for key in map(digest,assignment_sentence_keys(item)):
                            if not allowed(key) or key in keys:raise Problem('Эти предложения уже назначались ученику или повторяются в подборке.',409)
                            keys.add(key)
            db.execute('INSERT INTO assignment_events VALUES(?,?,?,?,?,?,1)',(secrets.token_hex(16),row['assignment_id'],action,row['title'],row['items'],time.time()))
            cancelled=1 if action=='cancel' else 0 if action=='restore' else row['cancelled']
            db.execute('INSERT INTO assignment_controls VALUES(?,?,?) ON CONFLICT(assignment_id) DO UPDATE SET cancelled=excluded.cancelled,version=excluded.version',(row['assignment_id'],cancelled,row['version']+1))
            if action!='edit' or 'ids' in data:db.execute('UPDATE practice SET items=?,revision=revision+1 WHERE id=?',(json.dumps(next_items,ensure_ascii=False),row['id']))
            db.execute('UPDATE assignments SET title=? WHERE id=?',(title,row['assignment_id']))
            for key,ident in used.items():db.execute('INSERT OR IGNORE INTO assignment_sentences VALUES(?,?,?)',(student['id'],key,ident))
            for key in keys-used.keys():db.execute('INSERT INTO assignment_sentences VALUES(?,?,?)',(student['id'],key,row['assignment_id']))
            return {'ok':True,'version':row['version']+1},[]
        match=re.fullmatch(r'/api/teacher/students/([\w-]+)/assignments',path)
        if match and method=='POST':
            student=self.own_student(db,user,match[1])
            if not student['active']:raise Problem('Кабинет ученика отключён.',409)
            title=clean(data.get('title'),160);ids=data.get('ids')
            if not isinstance(ids,list) or not 1<=len(ids)<=50 or any(not isinstance(i,str) or i not in self.bank for i in ids) or len(set(ids))!=len(ids):raise Problem('Некорректный набор упражнений.')
            used=self.assigned_sentences(db,student['id']);keys=set()
            for exercise_id in ids:
                for key in map(digest,assignment_sentence_keys(self.bank[exercise_id])):
                    if key in used or key in keys:raise Problem('Некоторые предложения уже назначены этому ученику или повторяются в подборке. Подберите новые задания.',409)
                    keys.add(key)
            for key,assignment_id in used.items():db.execute('INSERT OR IGNORE INTO assignment_sentences VALUES(?,?,?)',(student['id'],key,assignment_id))
            ident=secrets.token_hex(16);practice_id=secrets.token_hex(16);created=time.time()
            db.execute('INSERT INTO practice(id,user_id,items,created) VALUES(?,?,?,?)',(practice_id,student['id'],json.dumps([self.bank[i] for i in ids],ensure_ascii=False),created))
            db.execute('INSERT INTO assignments VALUES(?,?,?,?,?,?)',(ident,user['id'],student['id'],practice_id,title,created))
            db.executemany('INSERT INTO assignment_sentences VALUES(?,?,?)',[(student['id'],key,ident) for key in keys])
            return {'id':ident,'practiceId':practice_id},[]
        if path=='/api/practice/start' and method=='POST':
            if user['role']!='teacher':raise Problem('Ученикам доступны только задания, назначенные учителем.',403)
            ids=data.get('ids')
            if not isinstance(ids,list) or not 1<=len(ids)<=50 or any(not isinstance(i,str) or i not in self.bank for i in ids) or len(set(ids))!=len(ids):raise Problem('Некорректный набор упражнений.')
            ident=secrets.token_hex(16)
            db.execute('INSERT INTO practice(id,user_id,items,created) VALUES(?,?,?,?)',(ident,user['id'],json.dumps([self.bank[i] for i in ids],ensure_ascii=False),time.time()))
            return {'id':ident,'revision':0},[]
        match=re.fullmatch(r'/api/practice/([\w-]+)(?:/(draft|check|automatic))?',path)
        if match:
            row=db.execute('SELECT * FROM practice WHERE id=? AND user_id=?',(match[1],user['id'])).fetchone()
            if not row:raise Problem('Тренировка не найдена.',404)
            if user['role']=='student' and not db.execute('SELECT a.id FROM assignments a LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=? AND a.student_id=? AND a.teacher_id=? AND COALESCE(c.cancelled,0)=0',(row['id'],user['id'],user['teacher_id'])).fetchone():raise Problem('Задание снято или не назначено учителем.',403)
            if method=='GET' and not match[2]:
                items=json.loads(row['items']);answered=len(json.loads(row['answers']))
                return {**self.practice_view(row),'items':[learner_item(item) if user['role']=='student' and index>=answered else item for index,item in enumerate(items)]},[]
            if method!='POST' or not match[2]:raise Problem('Метод не поддерживается.',405)
            if match[2]=='automatic':
                if row['completed'] or data.get('revision')!=row['revision']:raise Problem('Тренировка изменилась. Откройте её заново.',409)
                items=json.loads(row['items']);answered=len(json.loads(row['answers']));changed=False
                for n,item in enumerate(items):
                    if n<answered or item.get('options') or item.get('blanks'):continue
                    current=self.bank.get(item['id'])
                    if not current or current.get('response_contract')!='bounded-v1':raise Problem('Для этой старой редакции пока нет обновления.',409)
                    items[n]=current;changed=True
                if not changed:return {'revision':row['revision']},[]
                db.execute('INSERT INTO practice_format_events VALUES(?,?,?,?,?,?,1)',(secrets.token_hex(16),row['id'],row['items'],row['draft'],row['revision'],time.time()))
                db.execute('UPDATE practice SET items=?,draft=NULL,revision=revision+1 WHERE id=?',(json.dumps(items,ensure_ascii=False),row['id']))
                return {'revision':row['revision']+1},[]
            answers=json.loads(row['answers']);items=json.loads(row['items']);index=data.get('index')
            if type(index) is not int:raise Problem('Некорректный номер задания.')
            if match[2]=='check' and 0<=index<len(answers):
                if answers[index]['submitted']!=data.get('submitted'):raise Problem('Ответ уже проверен.',409)
                return {'answer':answers[index],'revision':row['revision']},[]
            if row['completed'] or index!=len(answers) or index>=len(items) or data.get('revision')!=row['revision']:raise Problem('Тренировка изменена в другой вкладке. Откройте её заново из кабинета.',409)
            if match[2]=='draft':
                value=data.get('submitted')
                item=items[index]
                if item.get('options'):
                    valid=value is None or (type(value) is int and 0<=value<len(item['options']))
                elif item.get('blanks'):
                    valid=isinstance(value,list) and len(value)==len(item['blanks']) and all(isinstance(v,str) and len(v)<=10000 for v in value)
                else:valid=isinstance(value,str) and len(value)<=10000
                if not valid:raise Problem('Некорректные поля ответа.')
                db.execute('UPDATE practice SET draft=?,revision=revision+1 WHERE id=?',(json.dumps(value,ensure_ascii=False),row['id']))
                return {'revision':row['revision']+1},[]
            if not items[index].get('options') and not items[index].get('blanks'):raise Problem('Обновите формат этой старой подборки перед ответом.',409)
            try:answer=grade(items[index],data.get('submitted'))
            except ValueError as e:raise Problem(str(e))
            answers.append(answer);completed=time.time() if len(answers)==len(items) else None
            db.execute('UPDATE practice SET answers=?,draft=NULL,revision=revision+1,completed=? WHERE id=?',(json.dumps(answers,ensure_ascii=False),completed,row['id']))
            return {'answer':answer,'revision':row['revision']+1},[]
        raise Problem('Маршрут не найден.',404)
    def __call__(self,env,start):
        path=env.get('PATH_INFO','/');method=env.get('REQUEST_METHOD','GET');extra=[]
        headers=[('X-Content-Type-Options','nosniff'),('Cache-Control','no-store'),('Referrer-Policy','no-referrer'),('X-Frame-Options','DENY'),('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'")]
        status=200
        try:
            if path.startswith('/api/'):
                if method not in ('GET','POST'):raise Problem('Метод не поддерживается.',405)
                data={}
                if method=='POST':
                    if env.get('HTTP_ORIGIN') and env['HTTP_ORIGIN']!=self.origin:raise Problem('Недопустимый источник запроса.',403)
                    if env.get('HTTP_SEC_FETCH_SITE')=='cross-site':raise Problem('Недопустимый источник запроса.',403)
                    if not env.get('CONTENT_TYPE','').startswith('application/json'):raise Problem('Требуется JSON.',415)
                    try:length=int(env.get('CONTENT_LENGTH') or 0)
                    except ValueError:raise Problem('Некорректный запрос.')
                    if not 0<=length<=200000:raise Problem('Слишком большой запрос.',413)
                    try:data=json.loads(env['wsgi.input'].read(length))
                    except (ValueError,UnicodeError):raise Problem('Некорректный JSON.')
                    if not isinstance(data,dict):raise Problem('Требуется объект JSON.')
                with self.connect() as db:
                    if method=='POST':db.execute('BEGIN IMMEDIATE')
                    user=self.session(db,env)
                    result,extra=self.route(db,path,method,data,user,env)
                    if user and user['session_expires']-time.time()<SESSION_SECONDS-86400 and (path=='/api/auth/me' or not path.startswith('/api/auth/')):
                        cookie=SimpleCookie(env.get('HTTP_COOKIE',''));raw=cookie['grammar_session'].value
                        changed=db.execute('UPDATE sessions SET expires=MAX(expires,?) WHERE token=? AND expires>?',(time.time()+SESSION_SECONDS,digest(raw),time.time())).rowcount
                        if not changed:raise Problem('Войдите в личный кабинет.',401)
                        value='grammar_session='+raw+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000'
                        if self.origin.startswith('https://'):value+='; Secure'
                        extra.append(('Set-Cookie',value))
                body=json.dumps(result,ensure_ascii=False).encode();mime='application/json; charset=utf-8'
            else:
                if method not in ('GET','HEAD'):raise Problem('Метод не поддерживается.',405)
                name=unquote(path).lstrip('/') or 'index.html'
                allowed=name in {'index.html','app.js','accounts.js','notifications.js','practice-report.js','styles.css','favicon.svg','apple-touch-icon.png','manifest.webmanifest','icons/app-icon.svg','icons/icon-192.png','icons/icon-512.png','icons/favicon-32.png'} or bool(re.fullmatch(r'data/(?:theory\.json|exercises/(?:index|part-\d+)\.json)',name)) or bool(re.fullmatch(r'content/theory/[\w-]+\.md',name))
                if not allowed:raise Problem('Страница не найдена.',404)
                if name.startswith('data/exercises/') and name!='data/exercises/index.json':
                    with self.connect() as db:user=self.session(db,env)
                    if not user:raise Problem('Войдите в личный кабинет.',401)
                    if user['role']!='teacher':raise Problem('Банк упражнений доступен только учителю.',403)
                file=ROOT/name
                if not file.is_file():raise Problem('Страница не найдена.',404)
                body=file.read_bytes();mime='application/manifest+json' if name=='manifest.webmanifest' else mimetypes.guess_type(file.name)[0] or 'text/plain'
                if mime.startswith('text/') or mime=='application/javascript':mime+='; charset=utf-8'
        except Problem as e:status=e.status;body=json.dumps({'error':e.message},ensure_ascii=False).encode();mime='application/json; charset=utf-8'
        except sqlite3.IntegrityError:status=409;body=json.dumps({'error':'Этот аккаунт или запись уже существует.'},ensure_ascii=False).encode();mime='application/json; charset=utf-8'
        except Exception:
            import traceback;traceback.print_exc()
            status=500;body=json.dumps({'error':'Не удалось выполнить действие.'},ensure_ascii=False).encode();mime='application/json; charset=utf-8'
        from http import HTTPStatus
        start(str(status)+' '+HTTPStatus(status).phrase,headers+extra+[('Content-Type',mime),('Content-Length',str(len(body)))])
        return [b'' if method=='HEAD' else body]
