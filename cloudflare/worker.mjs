import { statistics } from './statistics.mjs';
import { handleTeacherLibrary } from './teacher-library.mjs';
import { handleTaskIssues } from './task-issues.mjs';
import { assessmentTitle } from './generated/assessment-config.mjs';
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import exercises from './generated/bank.json';
import assessments from './generated/assessments.json' with {type:'json'};
import { balancedPractice, exerciseTenses, PRACTICE_TENSES, exerciseSection, targetSection, supportedResponseContract } from './generated/selection.mjs';
import { grade } from './generated/checker.mjs';
import { reportFieldTopics, storedTopicSummary, reviewableTranslationField } from './generated/topics.mjs';
import { assignmentSentenceKeys } from './generated/assignment-keys.mjs';

const bank = new Map(exercises.map(item => [item.id, item]));
const now = () => Date.now() / 1000;
const token = () => randomBytes(32).toString('hex');
const digest = value => createHash('sha256').update(value).digest('hex');
const bankSentenceKeys = new Map(exercises.map(item => [item.id, assignmentSentenceKeys(item).map(digest)]));
const SESSION_SECONDS = 30 * 86400;
const SESSION_RENEW_WINDOW = SESSION_SECONDS - 86400;
const sessionCookie = raw => `grammar_session=${raw}; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=${SESSION_SECONDS}`;
const teacherUser = user => ({...publicUser(user),name:user.teacher_name||user.name,active:!!user.active});
const publicUser = user => Object.fromEntries(['id', 'name', 'email', 'role'].map(key => [key, user[key]]));
class Problem extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
function clean(value, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Problem('Проверьте заполненные поля.');
  return value.trim();
}
function email(value) {
  value = clean(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Problem('Введите корректный email.');
  return value;
}
function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const first = Buffer.from(a), second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}
function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 256) throw new Problem('Пароль должен содержать от 12 до 256 символов.');
}
class FirebaseProblem extends Problem {
  constructor(code, status) {
    const limited = /TOO_MANY|QUOTA_EXCEEDED/.test(code);
    const unavailable = /OPERATION_NOT_ALLOWED|CONFIGURATION_NOT_FOUND|API_KEY_INVALID/.test(code) || status >= 500;
    super(limited ? 'Слишком много запросов. Попробуйте позже.' : unavailable ? 'Сервис входа пока недоступен.' : 'Проверьте почту и пароль.', limited ? 429 : unavailable ? 503 : 401);
    this.code = code;
  }
}
async function firebase(env, action, payload) {
  if (!env.FIREBASE_API_KEY) throw new Problem('Сервис входа ещё не настроен.', 503);
  let response, result;
  try {
    response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Firebase-Locale': 'ru' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(15000)
    });
    result = await response.json();
  } catch { throw new Problem('Сервис входа временно недоступен. Попробуйте позже.', 503); }
  if (!response.ok) throw new FirebaseProblem(String(result.error?.message || 'AUTH_ERROR').split(' : ')[0], response.status);
  return result;
}
async function authenticate(env, address, password, signup = false) {
  validatePassword(password);
  const payload = { email: address, password, returnSecureToken: true };
  let signed;
  if (signup) {
    try { signed = await firebase(env, 'signUp', payload); }
    catch (error) {
      // A verified identity may already exist after a retry or email confirmation.
      if (error.code !== 'EMAIL_EXISTS') throw error;
      signed = await firebase(env, 'signInWithPassword', payload);
    }
  } else signed = await firebase(env, 'signInWithPassword', payload);
  const lookup = await firebase(env, 'lookup', { idToken: signed.idToken });
  const identity = lookup.users?.[0];
  if (!identity || identity.localId !== signed.localId || identity.email?.toLowerCase() !== address || identity.disabled) throw new Problem('Вход недоступен.', 403);
  if (!identity.emailVerified) {
    await firebase(env, 'sendOobCode', { requestType: 'VERIFY_EMAIL', idToken: signed.idToken });
    const pending = new Problem('Письмо подтверждения отправлено на вашу почту. Подтвердите адрес, вернитесь в это окно и повторите отправку формы.', 403);
    pending.code = 'VERIFY_EMAIL';
    throw pending;
  }
  return { id: identity.localId, email: identity.email.toLowerCase() };
}
const prepare = (db, sql, values = []) => db.prepare(sql).bind(...values);
const one = (db, sql, values) => prepare(db, sql, values).first();
const all = async (db, sql, values) => (await prepare(db, sql, values).all()).results;
const run = (db, sql, values) => prepare(db, sql, values).run();
function cookieToken(request) {
  return request.headers.get('Cookie')?.match(/(?:^|;\s*)grammar_session=([a-f0-9]{64})(?:;|$)/)?.[1] || '';
}
async function currentUser(db, request) {
  return one(db, 'SELECT u.*,s.csrf,s.expires AS session_expires FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1', [digest(cookieToken(request)), now()]);
}
async function login(db, user) {
  const raw = token(), csrf = token();
  const result=await run(db, 'INSERT INTO sessions SELECT ?,id,?,? FROM users WHERE id=? AND active=1', [digest(raw), csrf, now() + SESSION_SECONDS,user.id]);
  if(!result.meta.changes)throw new Problem('Кабинет отключён.',403);
  await run(db,'UPDATE users SET last_active=? WHERE id=? AND active=1',[now(),user.id]);
  return [{ user: publicUser(user), csrf }, { 'Set-Cookie': sessionCookie(raw) }];
}
async function rateLimit(db, key, max) {
  const time = now();
  const row = await one(db, `INSERT INTO limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET
    attempts=CASE WHEN until_time<? THEN 1 ELSE attempts+1 END,
    until_time=CASE WHEN until_time<? THEN excluded.until_time ELSE until_time END RETURNING attempts`, [key, time + 900, time, time]);
  if (row.attempts > max) throw new Problem('Слишком много попыток. Попробуйте через 15 минут.', 429);
}

function learnerAnswer(answer){
  const copy={...answer};delete copy.manual_review_history;
  return answer.item?.type==='translation_ru_en'&&answer.fields.some(f=>f.verified===false)?{...copy,item:{...learnerItem(answer.item),practice_tenses:answer.item.practice_tenses}}:copy;
}
function practiceView(row,hideManual=false) {
  const items = JSON.parse(row.items), rawAnswers = JSON.parse(row.answers), answers=hideManual?rawAnswers.map(learnerAnswer):rawAnswers, fields = answers.flatMap(answer => answer.fields);
  return { ...(items[0]?.assessment_id?{assessmentId:items[0].assessment_id}:{}), id: row.id, source: row.source || 'teacher', date: new Date((row.completed || row.created) * 1000).toISOString(), status: row.completed ? 'completed' : row.cancelled ? 'cancelled' : 'draft', total: items.length,
    correct: answers.filter(answer => answer.correct).length, score: fields.filter(field => field.correct).length,
    maxScore: fields.filter(field => field.verified).length, pending: fields.filter(field => !field.verified).length,
    levels: [...new Set(items.map(item => item.level || "archive"))], types: [...new Set(items.map(item => item.type))],
    answers, index: answers.length, revision: row.revision, draft: row.draft === null ? null : JSON.parse(row.draft) };
}

// Materialized lists never select or parse items/answers once a row has a summary.
const summarySelect='id,user_id,source,created,completed,revision,score,max_score,pending_count,total_items,answered_count,topic_summary,levels_json,types_json';
function metadata(items,answers) {
  return [items.length,answers.length,JSON.stringify(storedTopicSummary(answers)),JSON.stringify([...new Set(items.map(i=>i.level || "archive"))]),JSON.stringify([...new Set(items.map(i=>i.type))])];
}
async function materialize(db,ids) {
  if(!ids.length)return;
  const rows=await all(db,`SELECT id,items,answers,revision FROM practice WHERE id IN (SELECT value FROM json_each(?)) AND topic_summary IS NULL`,[JSON.stringify(ids)]);
  if(rows.length)await db.batch(rows.map(row=>prepare(db,`UPDATE practice SET total_items=?,answered_count=?,topic_summary=?,levels_json=?,types_json=? WHERE id=? AND revision=? AND topic_summary IS NULL`,[...metadata(JSON.parse(row.items),JSON.parse(row.answers)),row.id,row.revision])));
}
function summaryView(row) {
  return {...(row.assessmentId?{assessmentId:row.assessmentId,title:assessmentTitle(row.assessmentId)}:{}),id:row.id,source:row.source||'teacher',date:new Date((row.completed||row.created)*1000).toISOString(),status:row.completed?'completed':row.cancelled?'cancelled':'draft',
    total:row.total_items,index:row.answered_count,score:row.score,maxScore:row.max_score,pending:row.pending_count,
    levels:JSON.parse(row.levels_json||'[]'),types:JSON.parse(row.types_json||'[]'),topic_summary:JSON.parse(row.topic_summary||'{}')};
}

async function freePracticeAllowed(db, id) {
  return !!(await one(db,'SELECT allowed FROM student_practice_settings WHERE student_id=?',[id]))?.allowed;
}
function practiceFilters(data) {
  if (!data || Object.keys(data).some(key=>!['topic','tenses','levels','type','types','count'].includes(key))) throw new Problem('Некорректные фильтры практики.');
  if (!['tenses','comparison','passive','modals','reported','nouns','speaking'].includes(data.topic) || !Number.isInteger(data.count) || data.count<1 || data.count>50) throw new Problem('Выберите раздел и размер от 1 до 50.');
  const targets=PRACTICE_TENSES.filter(t=>targetSection(t.id)===data.topic).map(t=>t.id);
  const levels=[...new Set(exercises.map(item=>item.level))], types=[...new Set(exercises.filter(item=>exerciseSection(item)===data.topic&&supportedResponseContract(item)).map(item=>item.type))];
  for(const [key,allowed] of [['tenses',targets],['levels',levels]]) if(!Array.isArray(data[key])||!data[key].length||data[key].length>allowed.length||new Set(data[key]).size!==data[key].length||data[key].some(value=>!allowed.includes(value))) throw new Problem('Выберите доступные темы и уровни.');
  if(data.types!==undefined&&data.type!==undefined)throw new Problem('Передайте один набор форматов.');
  const formats=data.types!==undefined?data.types:data.type==='all'?types:[data.type];
  if(!Array.isArray(formats)||!formats.length||formats.length>types.length||new Set(formats).size!==formats.length||formats.some(type=>!types.includes(type)))throw new Problem('Выберите доступные форматы.');
  const pool=exercises.filter(item=>exerciseSection(item)===data.topic&&supportedResponseContract(item)&&data.levels.includes(item.level)&&formats.includes(item.type)&&exerciseTenses(item).length&&exerciseTenses(item).every(target=>data.tenses.includes(target)));
  const covered=new Set(pool.flatMap(exerciseTenses)),missing=data.tenses.filter(target=>!covered.has(target));
  const size=Math.min(pool.length,data.topic==='tenses'?Math.max(data.count,covered.size):data.count);
  return {pool,available:pool.length,size,missing,coverage:covered.size};
}

async function notificationRows(db,user) {
  const teacher=user.role==='teacher',kind=teacher?'completed':'assigned';
  const condition=teacher?'a.teacher_id=? AND p.completed IS NOT NULL':'a.student_id=? AND COALESCE(c.cancelled,0)=0';
  const rows=await all(db,`SELECT a.id,a.title,a.student_id,a.practice_id,a.created,p.completed,json_array_length(p.items) AS total,p.score,p.max_score,p.pending_count,${teacher?'COALESCE(u.teacher_name,u.name)':'u.name'} AS name,r.read_at
    FROM assignments a JOIN practice p ON p.id=a.practice_id AND p.user_id=a.student_id
    JOIN users u ON u.id=a.student_id AND u.teacher_id=a.teacher_id AND u.active=1
    LEFT JOIN assignment_controls c ON c.assignment_id=a.id
    LEFT JOIN notification_reads r ON r.user_id=? AND r.event_id=? || ':' || a.id
    WHERE ${condition} ORDER BY (r.read_at IS NULL) DESC,${teacher?'p.completed':'a.created'} DESC,a.id DESC`,[user.id,kind,user.id]);
  const items=rows.map(row=>({id:kind+':'+row.id,kind,title:row.title,studentId:row.student_id,studentName:row.name,practiceId:row.practice_id,created:teacher?row.completed:row.created,read:row.read_at!==null,total:row.total,score:row.score,maxScore:row.max_score,pending:row.pending_count}));
  if(teacher)return items;
  // Notices are derived from the saved decision itself. A failed/replayed review
  // cannot create a separate or duplicate delivery; a revised decision is new.
  const eventId="'reviewed:'||p.id||':'||answer.key||':'||field.key||':'||COALESCE(json_extract(field.value,'$.manual_review.revision'),json_extract(field.value,'$.manual_review.at'))";
  const reviewed=await all(db,`SELECT ${eventId} AS event_id,p.id AS practice_id,COALESCE(a.title,'Самостоятельная тренировка') AS title,
    answer.key AS answer_index,field.key AS field_index,json_extract(field.value,'$.correct') AS correct,
    json_extract(field.value,'$.manual_review.at') AS reviewed_at,json_extract(field.value,'$.manual_review.note') AS note,
    json_extract(field.value,'$.manual_review.updated') AS updated,r.read_at
    FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id
    JOIN json_each(p.answers) answer JOIN json_each(answer.value,'$.fields') field
    LEFT JOIN notification_reads r ON r.user_id=p.user_id AND r.event_id=${eventId}
    WHERE p.user_id=? AND p.completed IS NOT NULL AND instr(p.answers,'"manual_review"')>0 AND json_extract(answer.value,'$.item.type')='translation_ru_en'
    AND json_type(field.value,'$.manual_review.at') IN ('integer','real')`,[user.id]);
  items.push(...reviewed.map(row=>({id:row.event_id,kind:'reviewed',title:row.title,practiceId:row.practice_id,
    answerIndex:Number(row.answer_index),fieldIndex:Number(row.field_index),correct:!!row.correct,note:row.note||'',updated:!!row.updated,created:row.reviewed_at,read:row.read_at!==null})));
  return items.sort((a,b)=>Number(a.read)-Number(b.read)||b.created-a.created||b.id.localeCompare(a.id));
}

async function reviewQueue(db,user,cursor=null,limit=20) {
  if(user.role!=='teacher')throw new Problem('Доступ только преподавателю.',403);
  let after='',values=[user.id];
  if(cursor){
    let parsed;try{parsed=JSON.parse(atob(cursor));}catch{throw new Problem('Некорректная страница очереди.');}
    if(!Array.isArray(parsed)||parsed.length!==2||typeof parsed[0]!=='number'||!Number.isFinite(parsed[0])||typeof parsed[1]!=='string'||parsed[1].length>100)throw new Problem('Некорректная страница очереди.');
    after='WHERE completed>? OR (completed=? AND practiceId>?)';values.push(parsed[0],parsed[0],parsed[1]);
  }
  const queue=`WITH queue AS (SELECT p.id AS practiceId,u.id AS studentId,COALESCE(u.teacher_name,u.name) AS studentName,
    COALESCE(a.title,'Самостоятельная тренировка') AS title,p.completed,p.source,COUNT(*) AS pending
    FROM practice p JOIN users u ON u.id=p.user_id LEFT JOIN assignments a ON a.practice_id=p.id
    JOIN json_each(p.answers) answer JOIN json_each(answer.value,'$.fields') field
    WHERE u.teacher_id=? AND u.role='student' AND u.active=1 AND (a.id IS NULL OR a.teacher_id=u.teacher_id)
    AND p.completed IS NOT NULL AND p.pending_count>0 AND json_extract(answer.value,'$.item.type')='translation_ru_en'
    AND json_extract(field.value,'$.verified')=0 AND COALESCE(json_extract(field.value,'$.skipped'),0)=0 GROUP BY p.id),
    counted AS (SELECT *,COUNT(*) OVER() AS matching_count,SUM(pending) OVER() AS total_pending FROM queue)`;
  const rows=await all(db,`${queue} SELECT * FROM counted ${after} ORDER BY completed,practiceId LIMIT ?`,[...values,limit+1]);
  const totals=rows[0]||await one(db,`${queue} SELECT COUNT(*) AS matching_count,COALESCE(SUM(pending),0) AS total_pending FROM queue`,[user.id]);
  const page=rows.slice(0,limit),last=page.at(-1);
  return {items:page.map(({matching_count,total_pending,...row})=>row),total:totals.matching_count,totalFields:totals.total_pending,
    nextCursor:rows.length>limit?btoa(JSON.stringify([last.completed,last.practiceId])):null};
}
function learnerItem(item) {
  const visible = Object.fromEntries(['id','type','prompt','title','options','level','content_version','topic','instruction_ru','context_ru','prefix','blocks','error_fragment','grading_mode'].filter(key => key in item).map(key => [key,item[key]]));
  if (item.blanks) visible.blanks = item.blanks.map(blank => Object.fromEntries(['id','base_verb','base_adjective','supplied_words','modal_options'].filter(key => key in blank).map(key => [key,blank[key]])));
  return visible;
}
async function history(db, id, cursor) {
  // Stable pagination, including attempts created within the same millisecond.
  let condition = '', values = [id];
  if (cursor) {
    let parsed;
    try { parsed = JSON.parse(atob(cursor)); } catch { throw new Problem('Некорректная страница истории.'); }
    if (!Array.isArray(parsed) || typeof parsed[0] !== 'number' || typeof parsed[1] !== 'string') throw new Problem('Некорректная страница истории.');
    condition = ' AND (created<? OR (created=? AND id<?))'; values.push(parsed[0], parsed[0], parsed[1]);
  }
  const rows = await all(db, `SELECT ${summarySelect},EXISTS(SELECT 1 FROM assignments a JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=practice.id AND c.cancelled=1) AS cancelled FROM practice WHERE user_id=?${condition} ORDER BY created DESC,id DESC LIMIT 26`, values);
  const page = rows.slice(0, 25), last = page.at(-1);
  const legacy=page.filter(row=>row.topic_summary===null);
  if(legacy.length){await materialize(db,legacy.map(row=>row.id));const refreshed=await all(db,`SELECT ${summarySelect} FROM practice WHERE id IN (SELECT value FROM json_each(?))`,[JSON.stringify(legacy.map(row=>row.id))]);const byId=new Map(refreshed.map(row=>[row.id,row]));for(const row of page)if(byId.has(row.id))Object.assign(row,byId.get(row.id));}
  const candidates=page.filter(row=>row.total_items===25);
  if(candidates.length){const labels=await all(db,"SELECT id,json_extract(items,'$[0].assessment_id') AS assessmentId FROM practice WHERE id IN (SELECT value FROM json_each(?))",[JSON.stringify(candidates.map(r=>r.id))]);const names=new Map(labels.map(r=>[r.id,r.assessmentId]));for(const r of page)if(names.get(r.id))r.assessmentId=names.get(r.id);}
  return { history: page.map(summaryView), nextCursor: rows.length > 25 ? btoa(JSON.stringify([last.created, last.id])) : null };
}
async function stats(db, id) {
  return one(db, `SELECT COALESCE(SUM(completed IS NOT NULL),0) AS sessions,COALESCE(SUM(completed IS NULL),0) AS drafts,
    COALESCE(SUM(CASE WHEN completed IS NOT NULL THEN score ELSE 0 END),0) AS score,
    COALESCE(SUM(CASE WHEN completed IS NOT NULL THEN max_score ELSE 0 END),0) AS maxScore,
    COALESCE(SUM(CASE WHEN completed IS NOT NULL THEN pending_count ELSE 0 END),0) AS pending FROM practice WHERE user_id=? AND (completed IS NOT NULL OR NOT EXISTS(SELECT 1 FROM assignments a JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=practice.id AND c.cancelled=1))`, [id]);
}
async function today(db,user) {
  const time=now(),weekStart=time-7*86400;
  // A legacy snapshot is materialized once. Warm requests read short stored columns only.
  const legacy=await all(db,`SELECT p.id FROM practice p WHERE p.topic_summary IS NULL AND (p.user_id=? OR (?='teacher' AND EXISTS(SELECT 1 FROM assignments a JOIN users u ON u.id=a.student_id WHERE a.practice_id=p.id AND a.teacher_id=? AND u.teacher_id=?)))`,[user.id,user.role,user.id,user.id]);
  await materialize(db,legacy.map(row=>row.id));
  const resumeSql=`SELECT p.id,COALESCE(a.title,'Тренировка') AS title,p.total_items AS total,p.answered_count AS current_index FROM practice p
    LEFT JOIN assignments a ON a.practice_id=p.id LEFT JOIN assignment_controls c ON c.assignment_id=a.id
    WHERE p.user_id=? AND p.completed IS NULL AND COALESCE(c.cancelled,0)=0 AND
    (?='teacher' OR (p.source='self' OR a.teacher_id=?) AND (p.answered_count>0 OR p.draft IS NOT NULL OR p.source='self'))
    ORDER BY p.created DESC,p.id DESC LIMIT 1`;
  const queries=[[resumeSql,[user.id,user.role,user.teacher_id||'']]];
  if(user.role==='student') {
    queries.push([
      `SELECT a.id,a.practice_id AS practiceId,a.title,a.created,p.total_items AS total,COUNT(*) OVER() AS matching_count
       FROM assignments a JOIN practice p ON p.id=a.practice_id AND p.user_id=a.student_id LEFT JOIN assignment_controls c ON c.assignment_id=a.id
       WHERE a.student_id=? AND a.teacher_id=? AND COALESCE(c.cancelled,0)=0 AND p.completed IS NULL AND p.answered_count=0 AND p.draft IS NULL ORDER BY a.created DESC,a.id DESC LIMIT 5`,[user.id,user.teacher_id]],
      [`SELECT t.key AS topicId,SUM(json_extract(t.value,'$[0]')) AS correct,SUM(json_extract(t.value,'$[1]')) AS checked FROM practice p,json_each(p.topic_summary) t WHERE p.user_id=? GROUP BY t.key HAVING checked>=5 AND correct*1.0/checked<0.7 ORDER BY correct*1.0/checked,checked DESC,t.key LIMIT 3`,[user.id]],
      [`SELECT COUNT(*) AS sessions,COALESCE(SUM(score),0) AS score,COALESCE(SUM(max_score),0) AS maxScore,COALESCE(SUM(pending_count),0) AS pending FROM practice WHERE user_id=? AND completed>=?`,[user.id,weekStart]],
      [`SELECT COALESCE(SUM(completed IS NOT NULL),0) AS sessions,COALESCE(SUM(CASE WHEN completed IS NOT NULL THEN score ELSE 0 END),0) AS score,COALESCE(SUM(CASE WHEN completed IS NOT NULL THEN max_score ELSE 0 END),0) AS maxScore FROM practice WHERE user_id=?`,[user.id]],
      ['SELECT allowed FROM student_practice_settings WHERE student_id=?',[user.id]]);
  } else {
    queries.push([
      `SELECT a.id,a.title,a.student_id AS studentId,COALESCE(u.teacher_name,u.name) AS studentName,p.id AS practiceId,p.completed AS completed,p.score,p.max_score AS maxScore,p.pending_count AS pending,COUNT(*) OVER() AS matching_count
       FROM assignments a JOIN practice p ON p.id=a.practice_id AND p.user_id=a.student_id JOIN users u ON u.id=a.student_id AND u.teacher_id=a.teacher_id
       LEFT JOIN notification_reads r ON r.user_id=a.teacher_id AND r.event_id='completed:'||a.id
       WHERE a.teacher_id=? AND u.active=1 AND p.completed IS NOT NULL AND r.read_at IS NULL ORDER BY p.completed DESC,a.id DESC LIMIT 5`,[user.id]],
      [`SELECT id,COALESCE(teacher_name,name) AS name,last_active AS lastActive,COUNT(*) OVER() AS matching_count FROM users WHERE teacher_id=? AND role='student' AND active=1 AND COALESCE(last_active,created)<? ORDER BY COALESCE(last_active,created),id LIMIT 5`,[user.id,weekStart]],
      [`SELECT a.id,a.title,a.student_id AS studentId,COALESCE(u.teacher_name,u.name) AS studentName,p.id AS practiceId,a.created,p.total_items AS total,COUNT(*) OVER() AS matching_count FROM assignments a JOIN practice p ON p.id=a.practice_id AND p.user_id=a.student_id
       JOIN users u ON u.id=a.student_id AND u.teacher_id=a.teacher_id LEFT JOIN assignment_controls c ON c.assignment_id=a.id
       WHERE a.teacher_id=? AND u.active=1 AND p.completed IS NULL AND p.answered_count=0 AND p.draft IS NULL AND COALESCE(c.cancelled,0)=0 AND a.created<? ORDER BY a.created,a.id LIMIT 5`,[user.id,time-3*86400]]);
  }
  const rows=(await db.batch(queries.map(([sql,values])=>prepare(db,sql,values)))).map(result=>result.results);
  const resume=rows[0][0]?{id:rows[0][0].id,title:rows[0][0].title,total:rows[0][0].total,index:rows[0][0].current_index}:null;
  const page=items=>({items:items.map(({matching_count,...row})=>row),total:items[0]?.matching_count||0});
  if(user.role==='student')return {role:user.role,resume,newAssignments:page(rows[1]),weakTopics:rows[2],week:{...rows[3][0],since:new Date(weekStart*1000).toISOString()},stats:rows[4][0],freePracticeAllowed:!!rows[5][0]?.allowed};
  return {role:user.role,resume,completed:page(rows[1]),inactiveStudents:page(rows[2]),staleAssignments:page(rows[3]),reviews:await reviewQueue(db,user,null,5)};
}

async function ownStudent(db, user, id) {
  if (user.role !== 'teacher') throw new Problem('Доступ только преподавателю.', 403);
  const row = await one(db, "SELECT * FROM users WHERE id=? AND teacher_id=? AND role='student'", [id, user.id]);
  if (!row) throw new Problem('Ученик не найден.', 404);
  return row;
}
async function assignments(db, id) {
  const legacy=await all(db,'SELECT p.id FROM practice p JOIN assignments a ON a.practice_id=p.id WHERE a.student_id=? AND p.topic_summary IS NULL',[id]);
  await materialize(db,legacy.map(row=>row.id));
  const rows=await all(db,`SELECT a.id,a.title,a.created,a.practice_id,p.total_items,p.answered_count,p.draft IS NOT NULL AS has_draft,p.completed,p.score,p.max_score,p.pending_count,COALESCE(c.cancelled,0) AS cancelled,COALESCE(c.version,0) AS version
    FROM assignments a JOIN practice p ON p.id=a.practice_id AND p.user_id=a.student_id LEFT JOIN assignment_controls c ON c.assignment_id=a.id
    WHERE a.student_id=? ORDER BY a.created DESC,a.id DESC`,[id]);
  return rows.map(row=>({id:row.id,title:row.title,practiceId:row.practice_id,created:new Date(row.created*1000).toISOString(),total:row.total_items,index:row.answered_count,
    version:row.version,editableContent:!row.cancelled&&!row.completed&&!row.answered_count&&!row.has_draft,
    status:row.cancelled?'cancelled':row.completed?'completed':row.answered_count||row.has_draft?'started':'assigned',score:row.score,maxScore:row.max_score,pending:row.pending_count}));
}
async function assignedSentences(db, studentId) {
  const used = new Map(); used.legacy = [];
  for (const row of await all(db,'SELECT sentence_key,assignment_id FROM assignment_sentences WHERE student_id=?',[studentId])) used.set(row.sentence_key,row.assignment_id);
  const rows = await all(db, `SELECT a.id,p.items FROM assignments a JOIN practice p ON p.id=a.practice_id
    WHERE a.student_id=? AND NOT EXISTS(SELECT 1 FROM assignment_sentences s WHERE s.student_id=a.student_id AND s.assignment_id=a.id)
    ORDER BY a.created,a.id`, [studentId]);
  for (const row of rows) for (const item of JSON.parse(row.items)) {
    for (const key of assignmentSentenceKeys(item).map(digest)) if (!used.has(key)) {
      used.set(key,row.id); used.legacy.push({key,assignment:row.id});
    }
  }
  return used;
}

async function remediationPool(db,row,owner,mode) {
  const answers=JSON.parse(row.answers),wrong=answers.filter(a=>(a.fields||[]).some(f=>!f.correct&&f.verified===true&&!f.skipped));
  if(mode==='repeat')return wrong.filter(a=>a.item.options?.length||a.item.blanks?.length).map(a=>{const item=structuredClone(a.item);delete item.assessment_id;return item;});
  const targets=new Set(),levels=new Set(),types=new Set(),sections=new Set();
  for(const a of wrong){sections.add(exerciseSection(a.item));levels.add(a.item.level);types.add(a.item.type);
    (a.fields||[]).forEach((f,n)=>{if(!f.correct&&f.verified===true&&!f.skipped)reportFieldTopics(a.item,n).forEach(t=>targets.add(t));});}
  const used=new Set();
  for(const attempt of await all(db,'SELECT items FROM practice WHERE user_id=?',[owner]))for(const item of JSON.parse(attempt.items))assignmentSentenceKeys(item).forEach(key=>used.add(key));
  const eligible=exercises.filter(i=>supportedResponseContract(i)&&i.grading_mode!=='teacher'&&sections.has(exerciseSection(i))&&exerciseTenses(i).length&&exerciseTenses(i).every(t=>targets.has(t))&&assignmentSentenceKeys(i).every(k=>!used.has(k)));
  return eligible.sort((a,b)=>Number(levels.has(b.level))-Number(levels.has(a.level))||Number(types.has(b.type))-Number(types.has(a.type))||a.id.localeCompare(b.id));
}

const changedElsewhere = () => new Problem('Тренировка изменена в другой вкладке. Откройте её заново из кабинета.', 409);

async function route(db, env, request, url, data, responseHeaders) {
  const path = url.pathname, method = request.method;
  if (path === '/api/health' && method === 'GET') {
    const meta = await one(db, "SELECT value FROM app_meta WHERE name='application'");
    if (meta?.value !== 'grammar-noeon') throw new Problem('База приложения не готова.', 503);
    return [{ ok: true }, {}];
  }
  if (path === '/api/auth/info' && method === 'GET') return [{ demo: false, local: false,
    ready: !!(await one(db, "SELECT id FROM users WHERE role='teacher'")), authProvider: 'firebase', setupAvailable: !!env.OWNER_SETUP_CODE && !!env.FIREBASE_API_KEY }, {}];
  if (['/api/auth/login', '/api/auth/setup', '/api/auth/join', '/api/auth/reset'].includes(path) && method === 'POST') {
    const address = request.headers.get('CF-Connecting-IP') || 'local';
    await rateLimit(db, 'auth-global:' + digest(address), 60);
    const subject = path.endsWith('/login') || path.endsWith('/reset') ? data.email : path.endsWith('/join') ? data.token : 'owner';
    await rateLimit(db, 'auth-target:' + digest(address + ':' + path + ':' + String(subject).toLowerCase()), 12);
    if (path.endsWith('/reset')) {
      const target = email(data.email);
      try { await firebase(env, 'sendOobCode', { requestType: 'PASSWORD_RESET', email: target }); }
      catch (error) { if (error.code !== 'EMAIL_NOT_FOUND') throw error; }
      return [{ ok: true, message: 'Если аккаунт с этой почтой существует, письмо для восстановления пароля отправлено.' }, {}];
    }
    if (path.endsWith('/login')) {
      const user = await one(db, 'SELECT * FROM users WHERE email=? AND active=1', [email(data.email)]);
      if (!user) throw new Problem('Неверная почта или пароль.', 401);
      const identity = await authenticate(env, user.email, data.password);
      if (identity.id !== user.id) throw new Problem('Неверная почта или пароль.', 401);
      return login(db, user);
    }
    if (path.endsWith('/setup')) {
      if (!env.OWNER_SETUP_CODE || !equal(data.code, env.OWNER_SETUP_CODE)) throw new Problem('Неверный код создания кабинета.', 403);
      if (await one(db, "SELECT id FROM users WHERE role='teacher'")) throw new Problem('Кабинет учителя уже создан.', 409);
      const address = email(data.email), name = clean(data.name);
      const identity = await authenticate(env, address, data.password, true);
      const user = { id: identity.id, email: address, name, role: 'teacher' };
      await run(db, 'INSERT INTO users(id,email,name,role,teacher_id,active,created) VALUES(?,?,?,?,NULL,1,?)', [user.id, user.email, user.name, user.role, now()]);
      return login(db, user);
    }
    const inviteHash = digest(clean(data.token)), time = now();
    const invite = await one(db, 'SELECT i.* FROM invites i JOIN users u ON u.id=i.teacher_id WHERE i.token=? AND i.used=0 AND i.revoked=0 AND i.expires>? AND u.active=1', [inviteHash, time]);
    if (!invite) throw new Problem('Приглашение недействительно или истекло.', 410);
    const name = clean(data.name || invite.name);
    const studentEmail = email(invite.email || data.email);
    if (invite.email && data.email && email(data.email)!==studentEmail) throw new Problem('Эта ссылка приглашения выдана для другой почты. Получите новую ссылку у учителя.');
    if (await one(db,'SELECT id FROM users WHERE email=?',[studentEmail])) throw new Problem('Эта почта уже зарегистрирована. Войдите в свой кабинет.',409);
    const { id } = await authenticate(env, studentEmail, data.password, true);
    // Batch is one transaction. The conditional insert prevents two uses of one invite.
    const result = await db.batch([
      prepare(db, `INSERT INTO users(id,email,name,role,teacher_id,active,created)
        SELECT ?,?,?,'student',i.teacher_id,1,? FROM invites i
        WHERE i.token=? AND i.used=0 AND i.revoked=0 AND i.expires>? AND EXISTS(SELECT 1 FROM users u WHERE u.id=i.teacher_id AND u.active=1)`, [id, studentEmail, name, time, inviteHash, now()]),
      prepare(db, 'UPDATE invites SET used=1 WHERE token=? AND EXISTS(SELECT 1 FROM users WHERE id=?)', [inviteHash, id])
    ]);
    if (!result[0].meta.changes) throw new Problem('Приглашение недействительно или истекло.', 410);
    return login(db, await one(db, 'SELECT * FROM users WHERE id=?', [id]));
  }
  if (path === '/api/auth/demo') throw new Problem('Маршрут не найден.', 404);
  const user = await currentUser(db, request);
  if (!user && path === '/api/auth/me' && method === 'GET') return [{ user: null }, {}];
  if (!user) throw new Problem('Войдите в личный кабинет.', 401);
  if(!user.last_active||user.last_active<now()-300)await run(db,'UPDATE users SET last_active=? WHERE id=? AND active=1',[now(),user.id]);
  if (method === 'POST' && !equal(request.headers.get('X-CSRF-Token'), user.csrf)) throw new Problem('Обновите страницу и повторите действие.', 403);
  // Renew at most daily; an expired or deleted session can never be revived.
  if (user.session_expires - now() < SESSION_RENEW_WINDOW && path !== '/api/auth/logout') {
    const renewed = await run(db, 'UPDATE sessions SET expires=MAX(expires,?) WHERE token=? AND expires>?', [now() + SESSION_SECONDS, digest(cookieToken(request)), now()]);
    if (!renewed.meta.changes) throw new Problem('Войдите в личный кабинет.', 401);
    responseHeaders['Set-Cookie'] = sessionCookie(cookieToken(request));
  }
  if (path === '/api/auth/me' && method === 'GET') return [{ user: publicUser(user), csrf: user.csrf }, {}];
  if (path === '/api/auth/logout' && method === 'POST') {
    await run(db, 'DELETE FROM sessions WHERE token=?', [digest(cookieToken(request))]);
    return [{ ok: true }, { 'Set-Cookie': 'grammar_session=; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=0' }];
  }
  // Fixed assessment forms remain outside the practice bank and its filters.
  if(path==='/api/tests'&&method==='GET') {
    if(user.role!=='teacher')throw new Problem('Тесты назначает учитель.',403);
    return [{tests:assessments.map(({id,number,title,version,items})=>({id,number,title,version,count:items.length}))},{}];
  }
  const testMatch=path.match(/^\/api\/tests\/((?:comparison|tenses|passive)-[1-5])(?:\/(start|assign))?$/);
  if(testMatch) {
    if(user.role!=='teacher')throw new Problem('Тесты назначает учитель.',403);
    const test=assessments.find(t=>t.id===testMatch[1]);
    if(method==='GET'&&!testMatch[2])return [test,{}];
    if(method!=='POST'||!testMatch[2])throw new Problem('Метод не поддерживается.',405);
    const recipient=testMatch[2]==='assign'?await ownStudent(db,user,clean(data.studentId)):user;
    if(recipient.active===0)throw new Problem('Кабинет ученика отключён.',409);
    const id=token(),created=now(),commands=[];
    if(testMatch[2]==='assign') {
      commands.push(prepare(db,'INSERT INTO practice(id,user_id,items,created,total_items,answered_count,topic_summary,levels_json,types_json) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM users WHERE id=? AND teacher_id=? AND active=1)',[id,recipient.id,JSON.stringify(test.items),created,...metadata(test.items,[]),recipient.id,user.id]));
      commands.push(prepare(db,'INSERT INTO assignments VALUES(?,?,?,?,?,?)',[token(),user.id,recipient.id,id,assessmentTitle(test.id),created]));
    } else commands.push(prepare(db,'INSERT INTO practice(id,user_id,items,created,total_items,answered_count,topic_summary,levels_json,types_json) VALUES(?,?,?,?,?,?,?,?,?)',[id,recipient.id,JSON.stringify(test.items),created,...metadata(test.items,[])]));
    await db.batch(commands);return [{id},{}];
  }
  const testAttempt=path.match(/^\/api\/test-attempts\/([\w-]+)(?:\/(draft|submit))?$/);
  if(testAttempt) {
    const row=await one(db,'SELECT * FROM practice WHERE id=?',[testAttempt[1]]);
    if(!row)throw new Problem('Тест не найден.',404);
    const items=JSON.parse(row.items);
    if(!items[0]?.assessment_id)throw new Problem('Тест не найден.',404);
    if(row.user_id!==user.id) {
      if(user.role!=='teacher'||!await one(db,'SELECT a.id FROM assignments a JOIN users u ON u.id=a.student_id WHERE a.practice_id=? AND a.teacher_id=? AND u.teacher_id=?',[row.id,user.id,user.id]))throw new Problem('Тест не найден.',404);
      if(method!=='GET')throw new Problem('Ответы сохраняет только ученик.',403);
    }
    if(user.role==='student'&&!await one(db,'SELECT a.id FROM assignments a LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=? AND a.student_id=? AND a.teacher_id=? AND COALESCE(c.cancelled,0)=0',[row.id,user.id,user.teacher_id]))throw new Problem('Тест снят или не назначен.',403);
    const view=r=>({id:r.id,title:assessmentTitle(items[0].assessment_id),assessmentId:items[0].assessment_id,revision:r.revision,completed:!!r.completed,items:r.completed?items:items.map(learnerItem),draft:r.draft?JSON.parse(r.draft):null,...(r.completed?{attempt:practiceView(r)}:{})});
    if(method==='GET'&&!testAttempt[2])return [view(row),{}];
    if(method!=='POST'||!testAttempt[2])throw new Problem('Метод не поддерживается.',405);
    if(row.completed) {
      if(testAttempt[2]==='submit'&&JSON.stringify(JSON.parse(row.answers).map(a=>a.submitted))===JSON.stringify(data.responses))return [view(row),{}];
      throw new Problem('Тест уже сдан.',409);
    }
    if(data.revision!==row.revision)throw changedElsewhere();
    const responses=data.responses;
    if(!Array.isArray(responses)||responses.length!==items.length)throw new Problem('Проверьте ответы на все вопросы.');
    for(const [n,i]of items.entries()) {
      const value=responses[n];
      if(i.options?!(value===null||Number.isInteger(value)&&value>=0&&value<4):!(Array.isArray(value)&&value.length===1&&typeof value[0]==='string'&&value[0].length<=500))throw new Problem('Некорректный ответ.');
    }
    const guard=' AND NOT EXISTS(SELECT 1 FROM assignments a JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=practice.id AND c.cancelled=1)';
    if(testAttempt[2]==='draft') {
      const r=await run(db,'UPDATE practice SET draft=?,revision=revision+1 WHERE id=? AND revision=? AND completed IS NULL'+guard,[JSON.stringify(responses),row.id,row.revision]);
      if(!r.meta.changes)throw changedElsewhere();return [{revision:row.revision+1},{}];
    }
    const isSkipped=(i,n)=>i.options?responses[n]===null:!responses[n][0].trim();
    const unanswered=items.filter(isSkipped).length;
    if(unanswered&&data.allowIncomplete!==true)throw new Problem(`Не отвечено: ${unanswered} из 25. Подтвердите сдачу с пропусками.`,409);
    const answers=items.map((i,n)=>isSkipped(i,n)?{id:i.id,submitted:responses[n],correct:false,skipped:true,fields:[{submitted:i.options?null:responses[n][0],correct:false,verified:true,skipped:true}],item:i,checker:3}:grade(i,responses[n]));
    const score=answers.filter(a=>a.correct).length;
    const r=await run(db,'UPDATE practice SET answers=?,draft=NULL,revision=revision+1,completed=?,score=?,max_score=25,pending_count=0,total_items=?,answered_count=?,topic_summary=?,levels_json=?,types_json=? WHERE id=? AND revision=? AND completed IS NULL'+guard,[JSON.stringify(answers),now(),score,...metadata(items,answers),row.id,row.revision]);
    if(!r.meta.changes)throw changedElsewhere();return [view(await one(db,'SELECT * FROM practice WHERE id=?',[row.id])),{}];
  }

  const statsMatch=path.match(/^\/api\/(?:(?:teacher\/students\/([\w-]+)\/))?statistics$/);
  if(statsMatch&&method==='GET') {
    const owner=statsMatch[1]?(await ownStudent(db,user,statsMatch[1])).id:user.id;
    return [await statistics(db,owner,{all,materialize}),{}];
  }
  const libraryResult=await handleTeacherLibrary({db,user,path,method,data,helpers:{Problem,all,one,prepare,metadata,now,token,digest,bank,bankSentenceKeys,assignedSentences,ownStudent}});
  if(libraryResult)return libraryResult;
  const issueResult=await handleTaskIssues({db,user,path,method,data,one,all,run,now,token,Problem,rateLimit});
  if(issueResult)return issueResult;

  if(path==='/api/today'&&method==='GET')return [await today(db,user),{}];
  if(path==='/api/teacher/reviews'&&method==='GET')return [await reviewQueue(db,user,url.searchParams.get('cursor')),{}];
  if(path==='/api/notifications'&&method==='GET') {
    const rows=await notificationRows(db,user);
    return [{items:rows.slice(0,50),unreadCount:rows.filter(r=>!r.read).length},{}];
  }
  if(path==='/api/notifications/read'&&method==='POST') {
    const rows=await notificationRows(db,user),selected=data.all===true?rows:rows.filter(r=>r.id===data.id);
    if(!selected.length&&data.all!==true)throw new Problem('Уведомление не найдено.',404);
    if(selected.length)await db.batch(selected.map(r=>prepare(db,'INSERT OR IGNORE INTO notification_reads VALUES(?,?,?)',[user.id,r.id,now()])));
    return [{ok:true},{}];
  }
  const mistakes=path.match(/^\/api\/(?:(?:teacher\/students\/([\w-]+)\/))?mistakes$/);
  if(mistakes&&method==='GET') {
    const student=mistakes[1]?await ownStudent(db,user,mistakes[1]):null,target=student?.id||user.id;
    const topic=url.searchParams.get('topic');
    if(!PRACTICE_TENSES.some(t=>t.id===topic))throw new Problem('Неизвестная тема.');
    // Page IDs/summaries first. Read large answers only for relevant attempts.
    const page=await history(db,target,url.searchParams.get('cursor'));
    const kind=url.searchParams.get('kind');
    if(kind&&!['practice','assessment'].includes(kind))throw new Problem('Неизвестный вид работы.');
    const ids=page.history.filter(a=>(!kind||(a.status==='completed'&&(kind==='assessment'?!!a.assessmentId:!a.assessmentId)))&&(a.topic_summary[topic]?.[1]||0)>(a.topic_summary[topic]?.[0]||0)).map(a=>a.id);
    const rows=ids.length?await all(db,'SELECT id,answers FROM practice WHERE user_id=? AND id IN (SELECT value FROM json_each(?))',[target,JSON.stringify(ids)]):[];
    const errors=[];
    for(const row of rows)for(const answer of JSON.parse(row.answers)) (answer.fields||[]).forEach((field,index)=>{
      if(!field.correct&&field.verified!==false&&reportFieldTopics(answer.item,index).includes(topic))errors.push({attemptId:row.id,item:answer.item,field,index});
    });
    return [{errors,nextCursor:page.nextCursor},{}];
  }
  const work=path.match(/^\/api\/(?:(?:teacher\/students\/([\w-]+)\/))?attempts\/([\w-]+)$/);
  if(work&&method==='GET') {
    const student=work[1]?await ownStudent(db,user,work[1]):null,target=student?.id||user.id;
    const row=await one(db,'SELECT p.*,a.id AS assignment_id,a.title,a.teacher_id AS assignment_teacher,COALESCE(c.cancelled,0) AS cancelled,COALESCE(c.version,0) AS assignment_version FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE p.id=? AND p.user_id=?',[work[2],target]);
    if(!row||(student&&row.assignment_id&&row.assignment_teacher!==user.id))throw new Problem('Задание не найдено.',404);
    const canResume=!student&&!row.completed&&!row.cancelled&&(user.role==='teacher'||row.source==='self'||(row.assignment_id&&row.assignment_teacher===user.teacher_id));
    return [{title:row.title||'Тренировка',attempt:practiceView(row,user.role==='student'),student:student?teacherUser(student):null,canResume:!!canResume,assignment:student&&row.assignment_id?{id:row.assignment_id,version:row.assignment_version,cancelled:!!row.cancelled}:null},{}];
  }
  const ownReport=path.match(/^\/api\/reports\/([\w-]+)$/);
  if(ownReport&&method==='GET') {
    const row=await one(db,'SELECT p.*,a.title FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id WHERE p.id=? AND p.user_id=? AND p.completed IS NOT NULL',[ownReport[1],user.id]);
    if(!row)throw new Problem('Отчёт не найден.',404);
    return [{title:row.title||'Итоги тренировки',attempt:practiceView(row,user.role==='student')},{}];
  }

  const remediation=path.match(/^\/api\/(?:(?:teacher\/students\/([\w-]+)\/))?reports\/([\w-]+)\/remediation$/);
  if(remediation){
    const student=remediation[1]?await ownStudent(db,user,remediation[1]):null,owner=student?.id||user.id;
    if(student&&!student.active)throw new Problem('Кабинет ученика отключён.',409);
    const row=await one(db,'SELECT p.*,a.teacher_id AS assignment_teacher FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id WHERE p.id=? AND p.user_id=? AND p.completed IS NOT NULL',[remediation[2],owner]);
    if(!row||(student&&row.assignment_teacher&&row.assignment_teacher!==user.id))throw new Problem('Работа не найдена.',404);
    const mode=method==='GET'?url.searchParams.get('mode')||'new':data.mode;
    if(!['new','repeat'].includes(mode))throw new Problem('Выберите новые задания или повтор.');
    const canStart=user.role==='teacher'||await freePracticeAllowed(db,user.id);
    if(!canStart){if(method==='GET')return [{canStart:false,needsTeacher:true,items:[]},{}];throw new Problem('Такую подборку может назначить преподаватель.',403);}
    if(method==='POST'&&data.revision!==row.revision)throw new Problem('Оценка работы изменилась. Подберите упражнения заново.',409);
    if(!['GET','POST'].includes(method))throw new Problem('Метод не поддерживается.',405);
    if(method==='POST'&&!/^[a-f0-9]{64}$/.test(data.requestId||''))throw new Problem('Откройте подборку заново.');
    const id=method==='POST'?digest('remediation:'+user.id+':'+row.id+':'+mode+':'+data.requestId):null;
    const existing=id?await one(db,'SELECT items FROM practice WHERE id=? AND user_id=?',[id,owner]):null;
    if(existing){if(JSON.stringify(JSON.parse(existing.items).map(i=>i.id))!==JSON.stringify(data.ids))throw new Problem('Этот запрос уже использован для другой подборки.',409);return [{id,practiceId:id,revision:0,assigned:!!student},{}];}
    const pool=await remediationPool(db,row,owner,mode);
    if(method==='GET'){
      const keys=new Set(),selected=[],covered=new Set(),remaining=[...pool];
      while(remaining.length){
        remaining.sort((a,b)=>exerciseTenses(b).filter(t=>!covered.has(t)).length-exerciseTenses(a).filter(t=>!covered.has(t)).length);
        const item=remaining.shift();const sentenceKeys=assignmentSentenceKeys(item);if(mode==='new'&&sentenceKeys.some(k=>keys.has(k)))continue;selected.push(item);exerciseTenses(item).forEach(t=>covered.add(t));sentenceKeys.forEach(k=>keys.add(k));if(selected.length===(mode==='repeat'?50:5))break;}
      return [{canStart:true,mode,revision:row.revision,requestId:token(),available:pool.length,wrongCount:JSON.parse(row.answers).filter(a=>(a.fields||[]).some(f=>!f.correct&&f.verified===true&&!f.skipped)).length,omitted:mode==='repeat'?JSON.parse(row.answers).filter(a=>(a.fields||[]).some(f=>!f.correct&&f.verified===true&&!f.skipped)&&!a.item.options?.length&&!a.item.blanks?.length).length:0,items:user.role==='student'?selected.map(learnerItem):selected},{}];
    }
    const ids=data.ids;
    if(!Array.isArray(ids)||!ids.length||ids.length>(mode==='repeat'?50:10)||new Set(ids).size!==ids.length)throw new Problem('Выберите задания из предложенной подборки.');
    const byId=new Map(pool.map(i=>[i.id,i]));
    if(ids.some(id=>!byId.has(id)))throw new Problem('Подборка устарела или задания не соответствуют ошибкам. Подберите заново.',409);
    const selected=ids.map(id=>byId.get(id)),keys=new Set();
    if(!Array.isArray(data.itemVersions)||data.itemVersions.length!==selected.length||selected.some((item,n)=>(item.content_version??null)!==data.itemVersions[n]))throw new Problem('Редакция упражнений изменилась. Подберите задания заново.',409);
    for(const item of selected)for(const key of assignmentSentenceKeys(item)){
      if(mode==='new'&&keys.has(key))throw new Problem('В подборке повторяются предложения.');keys.add(key);
    }
    const created=now(),title=mode==='repeat'?'Повтор заданий с ошибками':'Тренировка по ошибкам';
    const snapshots=selected.map(i=>({...i,remediation:{sourceId:row.id,sourceRevision:row.revision,mode}}));
    await rateLimit(db,'remediation:'+owner,30);
    const guard=student?"EXISTS(SELECT 1 FROM users WHERE id=? AND teacher_id=? AND active=1)":"(?='teacher' OR EXISTS(SELECT 1 FROM student_practice_settings s JOIN users u ON u.id=s.student_id WHERE s.student_id=? AND s.allowed=1 AND u.active=1))";
    const params=student?[owner,user.id]:[user.role,owner];
    const novelGuard=mode==='new'?" AND NOT EXISTS(SELECT 1 FROM practice old,json_each(old.items) issued WHERE old.user_id=? AND (json_extract(issued.value,'$.id') IN (SELECT value FROM json_each(?)) OR json_extract(issued.value,'$.prompt') IN (SELECT value FROM json_each(?))))":'';
    const novelParams=mode==='new'?[owner,JSON.stringify(ids),JSON.stringify(selected.map(i=>i.prompt))]:[];
    const statement=prepare(db,`INSERT INTO practice(id,user_id,items,created,total_items,answered_count,topic_summary,levels_json,types_json,source) SELECT ?,?,?,?,?,?,?,?,?,? WHERE ${guard} AND EXISTS(SELECT 1 FROM practice WHERE id=? AND revision=?)${novelGuard}`,[id,owner,JSON.stringify(snapshots),created,...metadata(snapshots,[]),student?'teacher':'self',...params,row.id,row.revision,...novelParams]);
    if(student){
      try{const commands=[statement,prepare(db,'INSERT INTO assignments VALUES(?,?,?,?,?,?)',[digest('assignment:'+id),user.id,owner,id,title,created])];if(mode==='new')commands.push(prepare(db,'INSERT INTO assignment_sentences(student_id,sentence_key,assignment_id) SELECT ?,value,? FROM json_each(?)',[owner,digest('assignment:'+id),JSON.stringify([...keys].map(digest))]));await db.batch(commands);}
      catch(error){if(/FOREIGN KEY|UNIQUE/.test(error.message))throw new Problem('Подборка или доступ изменились. Откройте её заново.',409);throw error;}
    }else{const result=await statement.run();if(!result.meta.changes)throw new Problem('Доступ или оценка работы изменились. Откройте её заново.',409);}
    return [{id,practiceId:id,revision:0,assigned:!!student},{}];
  }
  const manualReview=path.match(/^\/api\/teacher\/students\/([\w-]+)\/reports\/([\w-]+)\/review$/);
  if(manualReview&&method==='POST'){
    const student=await ownStudent(db,user,manualReview[1]);
    const fieldIndex=data.fieldIndex===undefined?0:data.fieldIndex;
    if(!Number.isInteger(data.revision)||!Number.isInteger(data.answerIndex)||!Number.isInteger(fieldIndex)||typeof data.correct!=='boolean'||(data.note!==undefined&&(typeof data.note!=='string'||data.note.length>2000)))throw new Problem('Укажите результат проверки и короткий комментарий.');
    const row=await one(db,'SELECT p.* FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id WHERE p.id=? AND p.user_id=? AND (a.id IS NULL OR (a.student_id=? AND a.teacher_id=?)) AND p.completed IS NOT NULL',[manualReview[2],student.id,student.id,user.id]);
    if(!row)throw new Problem('Отчёт не найден.',404);
    if(row.revision!==data.revision)throw new Problem('Работа уже изменилась. Обновите отчёт.',409);
    const answers=JSON.parse(row.answers),answer=answers[data.answerIndex];
    if(!answer||!reviewableTranslationField(answer,fieldIndex))throw new Problem('Это поле не требует ручной проверки.');
    const note=(data.note||'').trim(),at=now(),field=answer.fields[fieldIndex];
    if(field.verified===true&&field.manual_review&&field.correct===data.correct&&(field.manual_review.note||'')===note)
      return [{ok:true,revision:row.revision,unchanged:true},{}];
    answer.manual_review_history=[...(answer.manual_review_history||[]),{teacherId:user.id,at,fieldIndex,revision:row.revision+1,correct:data.correct,note,previousCorrect:field.correct,previousVerified:field.verified}];
    answer.fields[fieldIndex]={...field,correct:data.correct,verified:true,manual_review:{at,note,revision:row.revision+1,updated:!!field.manual_review}};
    delete answer.fields[fieldIndex].diagnostic;
    answer.correct=answer.fields.every(f=>f.correct);
    const items=JSON.parse(row.items),fields=answers.flatMap(a=>a.fields);
    const changed=await run(db,'UPDATE practice SET answers=?,revision=revision+1,score=?,max_score=?,pending_count=?,total_items=?,answered_count=?,topic_summary=?,levels_json=?,types_json=? WHERE id=? AND user_id=? AND revision=? AND completed IS NOT NULL',[JSON.stringify(answers),fields.filter(f=>f.correct).length,fields.filter(f=>f.verified).length,fields.filter(f=>!f.verified).length,...metadata(items,answers),row.id,student.id,row.revision]);
    if(!changed.meta.changes)throw new Problem('Работа уже изменилась. Обновите отчёт.',409);
    return [{ok:true,revision:row.revision+1},{}];
  }
  const reportMatch=path.match(/^\/api\/teacher\/students\/([\w-]+)\/reports\/([\w-]+)$/);
  if(reportMatch&&method==='GET') {
    const student=await ownStudent(db,user,reportMatch[1]);
    const row=await one(db,'SELECT p.*,a.title FROM practice p LEFT JOIN assignments a ON a.practice_id=p.id WHERE p.id=? AND p.user_id=? AND (a.id IS NULL OR (a.student_id=? AND a.teacher_id=?)) AND p.completed IS NOT NULL',[reportMatch[2],student.id,student.id,user.id]);
    if(!row)throw new Problem('Отчёт не найден.',404);
    return [{student:teacherUser(student),title:row.title||'Итоги тренировки',attempt:practiceView(row,user.role==='student')},{}];
  }
  if (path === '/api/account' && method === 'GET') return [{ user: publicUser(user), freePracticeAllowed: user.role==='student'&&await freePracticeAllowed(db,user.id), stats: await stats(db, user.id), assignments: await assignments(db, user.id), ...await history(db, user.id, url.searchParams.get('cursor')) }, {}];
  if (path === '/api/teacher/students' && method === 'GET') {
    if (user.role !== 'teacher') throw new Problem('Доступ только преподавателю.', 403);
    // Independent aggregates prevent assignment joins from multiplying practice scores.
    const rows=await all(db,`SELECT u.id,u.email,u.name,u.teacher_name,u.role,u.active,u.last_active,
      COALESCE(p.sessions,0) AS sessions,COALESCE(p.drafts,0) AS drafts,COALESCE(p.score,0) AS score,COALESCE(p.maxScore,0) AS maxScore,COALESCE(p.pending,0) AS pending,COALESCE(a.unfinished,0) AS unfinished
      FROM users u LEFT JOIN (SELECT user_id,SUM(completed IS NOT NULL) AS sessions,SUM(completed IS NULL) AS drafts,
      SUM(CASE WHEN completed IS NOT NULL THEN score ELSE 0 END) AS score,SUM(CASE WHEN completed IS NOT NULL THEN max_score ELSE 0 END) AS maxScore,SUM(CASE WHEN completed IS NOT NULL THEN pending_count ELSE 0 END) AS pending FROM practice GROUP BY user_id) p ON p.user_id=u.id
      LEFT JOIN (SELECT a.student_id,COUNT(*) AS unfinished FROM assignments a JOIN practice p ON p.id=a.practice_id LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE p.completed IS NULL AND COALESCE(c.cancelled,0)=0 GROUP BY a.student_id) a ON a.student_id=u.id
      WHERE u.teacher_id=? AND u.role='student' ORDER BY COALESCE(u.teacher_name,u.name),u.id`,[user.id]);
    return [{students:rows.map(row=>({...teacherUser(row),lastActive:row.last_active?new Date(row.last_active*1000).toISOString():null,unfinished:row.unfinished,stats:Object.fromEntries(['sessions','drafts','score','maxScore','pending'].map(key=>[key,row[key]]))}))},{}];
  }
  if(path==='/api/teacher/invites'&&method==='GET') {
    if(user.role!=='teacher')throw new Problem('Доступ только преподавателю.',403);
    return [{invites:await all(db,'SELECT token AS id,created,expires FROM invites WHERE teacher_id=? AND used=0 AND revoked=0 AND expires>? ORDER BY created DESC,token',[user.id,now()])},{}];
  }
  const revoke=path.match(/^\/api\/teacher\/invites\/([a-f0-9]{64})\/revoke$/);
  if(revoke&&method==='POST') {
    if(user.role!=='teacher')throw new Problem('Доступ только преподавателю.',403);
    const result=await run(db,'UPDATE invites SET revoked=1 WHERE token=? AND teacher_id=? AND used=0 AND revoked=0',[revoke[1],user.id]);
    if(!result.meta.changes)throw new Problem('Приглашение не найдено.',404);
    return [{ok:true},{}];
  }
  const manageStudent=path.match(/^\/api\/teacher\/students\/([\w-]+)\/(rename|active)$/);
  if(manageStudent&&method==='POST') {
    const student=await ownStudent(db,user,manageStudent[1]);
    if(manageStudent[2]==='rename')await run(db,'UPDATE users SET teacher_name=? WHERE id=? AND teacher_id=?',[clean(data.name),student.id,user.id]);
    else {
      if(typeof data.active!=='boolean')throw new Problem('Укажите состояние кабинета.');
      const commands=[prepare(db,'UPDATE users SET active=? WHERE id=? AND teacher_id=?',[Number(data.active),student.id,user.id])];
      if(!data.active)commands.push(prepare(db,'DELETE FROM sessions WHERE user_id=?',[student.id]));
      await db.batch(commands);
    }
    return [{ok:true},{}];
  }
  if (path === '/api/teacher/invite' && method === 'POST') {
    if (user.role !== 'teacher') throw new Problem('Доступ только преподавателю.', 403);
    // Older clients may still create email-bound invitations; new links need no pupil data.
    const address = data.email ? email(data.email) : '', name = data.name ? clean(data.name) : '', raw = token();
    if (address && await one(db, 'SELECT id FROM users WHERE email=?', [address])) throw new Problem('Этот email уже зарегистрирован.', 409);
    await db.batch([
      prepare(db, "UPDATE invites SET used=1 WHERE email=? AND teacher_id=? AND email<>''", [address, user.id]),
      prepare(db, 'INSERT INTO invites(token,teacher_id,email,name,expires,used,created) VALUES(?,?,?,?,?,0,?)', [digest(raw), user.id, address, name, now() + 7 * 86400,now()])
    ]);
    return [{ token: raw, id:digest(raw), name, email: address, expires_in_days: 7 }, {}];
  }
  const studentMatch = path.match(/^\/api\/teacher\/students\/([\w-]+)$/);
  if (studentMatch && method === 'GET') {
    const student = await ownStudent(db, user, studentMatch[1]);
    return [{ user: teacherUser(student), freePracticeAllowed: await freePracticeAllowed(db,student.id), stats: await stats(db, student.id), assignments: await assignments(db, student.id), ...await history(db, student.id, url.searchParams.get('cursor')) }, {}];
  }
  const permissionMatch=path.match(/^\/api\/teacher\/students\/([\w-]+)\/free-practice$/);
  if(permissionMatch&&method==='POST') {
    const student=await ownStudent(db,user,permissionMatch[1]);
    if(typeof data.allowed!=='boolean'||Object.keys(data).some(key=>key!=='allowed'))throw new Problem('Укажите разрешение на свободную тренировку.');
    await run(db,'INSERT INTO student_practice_settings(student_id,allowed) VALUES(?,?) ON CONFLICT(student_id) DO UPDATE SET allowed=excluded.allowed',[student.id,Number(data.allowed)]);
    return [{allowed:data.allowed},{}];
  }
  if(path==='/api/practice/preview'&&method==='POST') {
    if(user.role!=='student'||!await freePracticeAllowed(db,user.id))throw new Problem('Учитель пока не разрешил свободную тренировку.',403);
    const {available,size,missing,coverage}=practiceFilters(data);
    return [{canStart:available>0,size,missing,coverage},{}];
  }
  const poolMatch = path.match(/^\/api\/teacher\/students\/([\w-]+)\/assignment-pool$/);
  if (poolMatch && method === 'GET') {
    const student = await ownStudent(db,user,poolMatch[1]);
    const used = await assignedSentences(db,student.id);
    return [{ availableIds: exercises.filter(item => bankSentenceKeys.get(item.id).every(key => !used.has(key))).map(item => item.id) }, {}];
  }
  const manageMatch = path.match(/^\/api\/teacher\/students\/([\w-]+)\/assignments\/([\w-]+)(?:\/(edit|cancel|restore))?$/);
  if (manageMatch) {
    const student = await ownStudent(db,user,manageMatch[1]);
    const row = await one(db, `SELECT a.id AS assignment_id,a.title,p.*,COALESCE(c.cancelled,0) AS cancelled,COALESCE(c.version,0) AS version
      FROM assignments a JOIN practice p ON p.id=a.practice_id LEFT JOIN assignment_controls c ON c.assignment_id=a.id
      WHERE a.id=? AND a.student_id=? AND a.teacher_id=?`,[manageMatch[2],student.id,user.id]);
    if (!row) throw new Problem('Назначение не найдено.',404);
    const items = JSON.parse(row.items), currentKeys = new Set(items.flatMap(item=>assignmentSentenceKeys(item).map(digest)));
    if(items[0]?.assessment_id&&manageMatch[3]==='edit')throw new Problem('Состав проверочного теста не изменяется. Назначьте другой тест.',409);
    const editableContent = !items[0]?.assessment_id && !row.cancelled && !row.completed && !JSON.parse(row.answers).length && row.draft === null;
    const used = await assignedSentences(db,student.id);
    const allowed = key => !used.has(key) || (used.get(key)===row.assignment_id && currentKeys.has(key));
    if (method==='GET' && !manageMatch[3]) return [{id:row.assignment_id,title:row.title,version:row.version,assessmentId:items[0]?.assessment_id,editableContent,items,
      availableIds:exercises.filter(item=>bankSentenceKeys.get(item.id).every(allowed)).map(item=>item.id)},{}];
    const action=manageMatch[3];
    if(action==='restore'&&!student.active)throw new Problem('Кабинет ученика отключён.',409);
    if (method!=='POST' || !action) throw new Problem('Метод не поддерживается.',405);
    if (data.version!==row.version) throw new Problem('Назначение уже изменено. Откройте его заново.',409);
    let title=row.title, nextItems=items;
    const keys=new Set();
    if (action==='edit') {
      title=clean(data.title,160);
      if (data.ids!==undefined) {
        if (!editableContent) throw new Problem('Ученик уже начал работу или задание снято. Можно изменить только название.',409);
        const ids=data.ids,current=new Map(items.map(item=>[item.id,item]));
        if (!Array.isArray(ids)||!ids.length||ids.length>50||new Set(ids).size!==ids.length||ids.some(id=>!bank.has(id)&&!current.has(id))) throw new Problem('Некорректный набор упражнений.');
        nextItems=ids.map(id=>current.get(id)||bank.get(id));
        if(data.itemVersions!==undefined&&(!Array.isArray(data.itemVersions)||data.itemVersions.length!==ids.length||nextItems.some((item,n)=>(item.content_version??null)!==data.itemVersions[n])))throw new Problem('Редакция заданий изменилась. Обновите страницу и проверьте набор заново.',409);
        for (const item of nextItems) for (const key of assignmentSentenceKeys(item).map(digest)) {
          if (!allowed(key)||keys.has(key)) throw new Problem('Эти предложения уже назначались ученику или повторяются в подборке.',409);
          keys.add(key);
        }
      }
    }
    const eventId=token();
    const commands=[
      prepare(db,'INSERT OR IGNORE INTO assignment_controls(assignment_id) VALUES(?)',[row.assignment_id]),
      prepare(db,'UPDATE assignment_controls SET version=version+1,cancelled=? WHERE assignment_id=? AND version=?',
        [action==='cancel'?1:action==='restore'?0:row.cancelled,row.assignment_id,row.version]),
      // changes() + CHECK make failed optimistic updates roll the entire batch back.
      prepare(db,'INSERT INTO assignment_events VALUES(?,?,?,?,?,?,changes())',[eventId,row.assignment_id,action,row.title,row.items,now()])
    ];
    if (action!=='edit'||data.ids!==undefined) commands.push(
      prepare(db,`UPDATE practice SET items=?,total_items=?,answered_count=?,topic_summary=?,levels_json=?,types_json=?,revision=revision+1 WHERE id=? AND revision=?${data.ids!==undefined?" AND answers='[]' AND draft IS NULL AND completed IS NULL":""}`,[JSON.stringify(nextItems),...metadata(nextItems,JSON.parse(row.answers)),row.id,row.revision]),
      prepare(db,'UPDATE assignment_events SET guard=changes() WHERE id=?',[eventId])
    );
    commands.push(
      prepare(db,'UPDATE assignments SET title=? WHERE id=?',[title,row.assignment_id]),
      prepare(db,`INSERT OR IGNORE INTO assignment_sentences(student_id,sentence_key,assignment_id)
        SELECT ?,json_extract(value,'$.key'),json_extract(value,'$.assignment') FROM json_each(?)`,[student.id,JSON.stringify(used.legacy)]),
      prepare(db,'INSERT INTO assignment_sentences(student_id,sentence_key,assignment_id) SELECT ?,value,? FROM json_each(?)',
        [student.id,row.assignment_id,JSON.stringify([...keys].filter(key=>!used.has(key)))])
    );
    try { await db.batch(commands); } catch(error) {
      if (/CHECK constraint failed|UNIQUE constraint failed.*assignment_(sentences|controls)/.test(error.message)) throw new Problem('Назначение изменено в другой вкладке или ученик уже начал работу. Откройте его заново.',409);
      throw error;
    }
    return [{ok:true,version:row.version+1},{}];
  }
  const assignMatch = path.match(/^\/api\/teacher\/students\/([\w-]+)\/assignments$/);
  if (assignMatch && method === 'POST') {
    const student = await ownStudent(db, user, assignMatch[1]);
    if (!student.active) throw new Problem('Кабинет ученика отключён.', 409);
    const title = clean(data.title, 160), ids = data.ids;
    if (!Array.isArray(ids) || !ids.length || ids.length > 50 || ids.some(id => !bank.has(id)) || new Set(ids).size !== ids.length) throw new Problem('Некорректный набор упражнений.');
    if(data.itemVersions!==undefined&&(!Array.isArray(data.itemVersions)||data.itemVersions.length!==ids.length||ids.some((id,n)=>(bank.get(id).content_version??null)!==data.itemVersions[n])))throw new Problem('Редакция заданий изменилась. Обновите страницу и проверьте набор заново.',409);
    const used = await assignedSentences(db,student.id), keys = new Set();
    for (const exerciseId of ids) for (const key of bankSentenceKeys.get(exerciseId)) {
      if (used.has(key) || keys.has(key)) throw new Problem('Некоторые предложения уже назначены этому ученику или повторяются в подборке. Подберите новые задания.',409);
      keys.add(key);
    }
    const id = token(), practiceId = token(), created = now();
    try { await db.batch([
      prepare(db, `INSERT OR IGNORE INTO assignment_sentences(student_id,sentence_key,assignment_id)
        SELECT ?,json_extract(value,'$.key'),json_extract(value,'$.assignment') FROM json_each(?)`, [student.id,JSON.stringify(used.legacy)]),
      prepare(db, 'INSERT INTO practice(id,user_id,items,created,total_items,answered_count,topic_summary,levels_json,types_json) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM users WHERE id=? AND teacher_id=? AND active=1)', [practiceId,student.id,JSON.stringify(ids.map(id=>bank.get(id))),created,...metadata(ids.map(id=>bank.get(id)),[]),student.id,user.id]),
      prepare(db, 'INSERT INTO assignments VALUES(?,?,?,?,?,?)', [id, user.id, student.id, practiceId, title, created]),
      prepare(db, 'INSERT INTO assignment_sentences(student_id,sentence_key,assignment_id) SELECT ?,value,? FROM json_each(?)', [student.id,id,JSON.stringify([...keys])])
    ]); } catch(error) {
      if (/FOREIGN KEY constraint failed/.test(error.message))throw new Problem('Кабинет ученика отключён или изменён.',409);
      if (/UNIQUE constraint failed.*assignment_sentences/.test(error.message)) throw new Problem('Эти предложения уже назначены в другой вкладке. Подборка обновлена; отправьте новый набор.',409);
      throw error;
    }
    return [{ id, practiceId }, {}];
  }
  if (path === '/api/practice/start' && method === 'POST') {
    if(user.role==='student') {
      if(!await freePracticeAllowed(db,user.id))throw new Problem('Учитель пока не разрешил свободную тренировку.',403);
      const {pool,size,missing}=practiceFilters(data);
      if(!pool.length||(data.topic==='tenses'&&missing.length))throw new Problem('Нет заданий для выбранных тем. Измените фильтры.');
      await rateLimit(db,'self-practice:'+user.id,30);
      const selected=balancedPractice(pool,size), id=token();
      const result=await run(db,"INSERT INTO practice(id,user_id,items,created,total_items,answered_count,topic_summary,levels_json,types_json,source) SELECT ?,?,?,?,?,?,?,?,?,'self' WHERE EXISTS(SELECT 1 FROM student_practice_settings WHERE student_id=? AND allowed=1)",[id,user.id,JSON.stringify(selected),now(),...metadata(selected,[]),user.id]);
      if(!result.meta.changes)throw new Problem('Учитель пока не разрешил свободную тренировку.',403);
      return [{id,revision:0},{}];
    }
    const ids = data.ids;
    if (!Array.isArray(ids) || !ids.length || ids.length > 50 || ids.some(id => !bank.has(id)) || new Set(ids).size !== ids.length) throw new Problem('Некорректный набор упражнений.');
    const id = token();
    await run(db, 'INSERT INTO practice(id,user_id,items,created,total_items,answered_count,topic_summary,levels_json,types_json) VALUES(?,?,?,?,?,?,?,?,?)', [id,user.id,JSON.stringify(ids.map(id=>bank.get(id))),now(),...metadata(ids.map(id=>bank.get(id)),[])]);
    return [{ id, revision: 0 }, {}];
  }
  const match = path.match(/^\/api\/practice\/([\w-]+)(?:\/(draft|check|automatic))?$/);
  if (match) {
    const load = () => one(db, 'SELECT * FROM practice WHERE id=? AND user_id=?', [match[1], user.id]);
    const row = await load();
    if (!row) throw new Problem('Тренировка не найдена.', 404);
    if (user.role === 'student' && row.source !== 'self' && !await one(db, 'SELECT a.id FROM assignments a LEFT JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=? AND a.student_id=? AND a.teacher_id=? AND COALESCE(c.cancelled,0)=0', [row.id, user.id, user.teacher_id])) throw new Problem('Задание снято или не назначено учителем.', 403);
    const items = JSON.parse(row.items), answers = JSON.parse(row.answers);
    if(items[0]?.assessment_id && match[2])throw new Problem('Проверочный тест сдаётся целиком.',409);
    if (method === 'GET' && !match[2]) return [{ ...practiceView(row,user.role==='student'), contentOutdated: items.some(item => bank.get(item.id)?.content_version !== item.content_version), items: user.role === 'student' ? items.map((item,index) => index < answers.length && !(item.grading_mode==='teacher'&&answers[index].fields.some(f=>!f.verified)) ? item : learnerItem(item)) : items }, {}];
    if (method !== 'POST' || !match[2]) throw new Problem('Метод не поддерживается.', 405);
    if(match[2]==='automatic') {
      if(row.completed||data.revision!==row.revision)throw changedElsewhere();
      let changed=false;
      for(let n=answers.length;n<items.length;n++) {
        if(items[n].options||items[n].blanks?.length)continue;
        const current=bank.get(items[n].id);
        if(!current||current.response_contract!=='bounded-v1')throw new Problem('Для этой старой редакции пока нет обновления.',409);
        items[n]=current;changed=true;
      }
      if(!changed)return [{revision:row.revision},{}];
      try {
        await db.batch([
          prepare(db,'UPDATE practice SET items=?,total_items=?,answered_count=?,topic_summary=?,levels_json=?,types_json=?,draft=NULL,revision=revision+1 WHERE id=? AND user_id=? AND revision=? AND completed IS NULL AND NOT EXISTS(SELECT 1 FROM assignments a JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=practice.id AND c.cancelled=1)',[JSON.stringify(items),...metadata(items,answers),row.id,user.id,row.revision]),
          prepare(db,'INSERT INTO practice_format_events VALUES(?,?,?,?,?,?,changes())',[token(),row.id,row.items,row.draft,row.revision,now()])
        ]);
      } catch(error) {if(String(error.message).includes('CHECK constraint'))throw changedElsewhere();throw error;}
      return [{revision:row.revision+1},{}];
    }
    const index = data.index;
    if (!Number.isInteger(index)) throw new Problem('Некорректный номер задания.');
    const replay = saved => {
      const answer = JSON.parse(saved.answers)[index];
      if (!answer) throw changedElsewhere();
      if (JSON.stringify(answer.submitted) !== JSON.stringify(data.submitted)) throw new Problem('Ответ уже проверен.', 409);
      return [{ answer:user.role==='student'?learnerAnswer(answer):answer, revision: saved.revision }, {}];
    };
    if (match[2] === 'check' && index >= 0 && index < answers.length) return replay(row);
    if (row.completed || index !== answers.length || index >= items.length || data.revision !== row.revision) throw changedElsewhere();
    if (match[2] === 'draft') {
      const value = data.submitted, item = items[index];
      const valid = item.options ? value === null || (Number.isInteger(value) && value >= 0 && value < item.options.length)
        : item.blanks?.length ? Array.isArray(value) && value.length === item.blanks.length && value.every(v => typeof v === 'string' && v.length <= 10000)
        : typeof value === 'string' && value.length <= 10000;
      if (!valid) throw new Problem('Некорректные поля ответа.');
      const result = await run(db, 'UPDATE practice SET draft=?,revision=revision+1 WHERE id=? AND user_id=? AND revision=? AND completed IS NULL AND NOT EXISTS(SELECT 1 FROM assignments a JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=practice.id AND c.cancelled=1)', [JSON.stringify(value), row.id, user.id, row.revision]);
      if (!result.meta.changes) throw changedElsewhere();
      return [{ revision: row.revision + 1 }, {}];
    }
    let answer;
    if(!items[index].options&&!items[index].blanks?.length)throw new Problem('Обновите формат этой старой подборки перед ответом.',409);
    try { answer = grade(items[index], data.submitted); } catch (error) { throw new Problem(error.message); }
    answers.push(answer);
    const fields = answers.flatMap(answer => answer.fields);
    const result = await run(db, `UPDATE practice SET answers=?,total_items=?,answered_count=?,topic_summary=?,levels_json=?,types_json=?,draft=NULL,revision=revision+1,completed=?,score=?,max_score=?,pending_count=?
      WHERE id=? AND user_id=? AND revision=? AND completed IS NULL AND NOT EXISTS(SELECT 1 FROM assignments a JOIN assignment_controls c ON c.assignment_id=a.id WHERE a.practice_id=practice.id AND c.cancelled=1)`,
    [JSON.stringify(answers),...metadata(items,answers), answers.length === items.length ? now() : null, fields.filter(f => f.correct).length, fields.filter(f => f.verified).length,
      fields.filter(f => !f.verified).length, row.id, user.id, row.revision]);
    if (!result.meta.changes) return replay(await load());
    return [{ answer:user.role==='student'?learnerAnswer(answer):answer, revision: row.revision + 1 }, {}];
  }
  throw new Problem('Маршрут не найден.', 404);
}

export async function cleanup(db,time=now()) {
  await db.batch([prepare(db,'DELETE FROM sessions WHERE expires<?',[time]),prepare(db,'DELETE FROM limits WHERE until_time<?',[time]),prepare(db,'DELETE FROM invites WHERE expires<?',[time-30*86400])]);
}
export default {
  async scheduled(event,env,ctx) {ctx.waitUntil(cleanup(env.DB.withSession('first-primary')));},
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      let path;
      try { path = decodeURIComponent(url.pathname).replace(/\/{2,}/g, '/'); } catch { return new Response('Not found', {status:404}); }
      if (path !== url.pathname) return new Response('Not found', {status:404,headers:{'Cache-Control':'no-store'}});
      if (path.startsWith('/data/exercises/') && path !== '/data/exercises/index.json') {
        const user = await currentUser(env.DB.withSession('first-primary'), request);
        if (user?.role !== 'teacher') return Response.json({error:'Банк упражнений доступен только учителю.'}, {status:user?403:401,headers:{'Cache-Control':'no-store'}});
        const asset = await env.ASSETS.fetch(request);
        const response = new Response(asset.body, asset);
        response.headers.set('Cache-Control','private, no-store');
        response.headers.set('Vary','Cookie');
        return response;
      }
      const asset = await env.ASSETS.fetch(request);
      if (path === '/sw.js' || path === '/' || path === '/index.html') {
        const response = new Response(asset.body, asset);
        response.headers.set('Cache-Control', 'no-cache');
        return response;
      }
      if((asset.ok||asset.status===304)&&(/\.(?:woff2|png|svg)$/i.test(path)||url.searchParams.has('v'))) {
        const response=new Response(asset.body,asset);
        response.headers.set('Cache-Control','public, max-age=31536000, immutable');
        return response;
      }
      return asset;
    }
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'" };
    try {
      const allowedOrigins = [env.PUBLIC_ORIGIN, ...String(env.ADDITIONAL_ORIGINS || '').split(',').map(origin => origin.trim())];
      if (url.protocol !== 'https:' || !allowedOrigins.includes(url.origin)) throw new Problem('Адрес приложения не настроен.', 503);
      if (!['GET', 'POST'].includes(request.method)) throw new Problem('Метод не поддерживается.', 405);
      let data = {};
      if (request.method === 'POST') {
        if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new Problem('Недопустимый источник запроса.', 403);
        if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new Problem('Требуется JSON.', 415);
        if (Number(request.headers.get('Content-Length')) > 200000) throw new Problem('Слишком большой запрос.', 413);
        // Bound streamed bodies too; Content-Length is not trusted.
        const reader = request.body?.getReader(), chunks = []; let length = 0;
        if (reader) while (true) {
          const { value, done } = await reader.read(); if (done) break;
          length += value.byteLength;
          if (length > 200000) { await reader.cancel(); throw new Problem('Слишком большой запрос.', 413); }
          chunks.push(value);
        }
        const body = new Uint8Array(length); let offset = 0;
        for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
        try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body)); } catch { throw new Problem('Некорректный JSON.'); }
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Problem('Требуется объект JSON.');
      }
      const db = env.DB.withSession('first-primary');
      const marker = await one(db, "SELECT value FROM app_meta WHERE name='application'");
      if (marker?.value !== 'grammar-noeon') throw new Problem('База приложения не готова.', 503);
      const [result, extra] = await route(db, env, request, url, data, headers);
      return new Response(JSON.stringify(result), { headers: { ...headers, ...extra } });
    } catch (error) {
      let status = error instanceof Problem ? error.status : 500;
      let message = error instanceof Problem ? error.message : 'Не удалось выполнить действие.';
      if (!(error instanceof Problem) && /UNIQUE constraint failed/.test(error.message)) { status = 409; message = 'Этот аккаунт или запись уже существует.'; }
      if (status === 500) console.error('Grammar API error', error.name); // No submitted data, secrets or query values.
      return new Response(JSON.stringify({ error: message, ...(error.code === 'VERIFY_EMAIL' ? { code: 'VERIFY_EMAIL' } : {}) }), { status, headers });
    }
  }
};
