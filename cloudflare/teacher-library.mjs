import {assignmentSentenceKeys} from './generated/assignment-keys.mjs';
// Trusted, immutable teacher snapshots. Called only after the shared auth/CSRF guard.
export async function handleTeacherLibrary(context) {
  const {db,user,path,method,data,helpers:h}=context;
  if(!/^\/api\/teacher\/library(?:-drafts)?(?:\/|$)/.test(path))return null;
  const {Problem,all,one,prepare,metadata,now,token,digest,bank,bankSentenceKeys,assignedSentences,ownStudent}=h;
  if(user.role!=='teacher')throw new Problem('Библиотека доступна только преподавателю.',403);
  const cleanTitle=value=>{if(typeof value!=='string'||!value.trim()||value.trim().length>160)throw new Problem('Введите название набора до 160 символов.');return value.trim();};
  const view=row=>({id:row.id,title:row.title,created:new Date(row.created*1000).toISOString(),count:JSON.parse(row.items).length,filters:JSON.parse(row.filters),items:JSON.parse(row.items)});
  const draftMatch=path.match(/^\/api\/teacher\/library-drafts\/([\w-]+)$/);
  if(draftMatch){
    const pupil=await ownStudent(db,user,draftMatch[1]);
    const saved=await one(db,'SELECT * FROM teacher_set_drafts WHERE teacher_id=? AND student_id=?',[user.id,pupil.id]);
    const draftView=row=>row?{studentId:row.student_id,title:row.title,items:JSON.parse(row.items),filters:JSON.parse(row.filters),revision:row.revision,updated:new Date(row.updated*1000).toISOString()}:null;
    if(method==='GET')return [{draft:draftView(saved)},{}];
    if(method!=='POST')throw new Problem('Действие недоступно.',405);
    if(!Number.isInteger(data.revision)||data.revision<0)throw new Problem('Некорректная версия черновика.');
    if((saved?.revision||0)!==data.revision)throw new Problem('Черновик изменён в другой вкладке. Перезагрузите страницу, чтобы восстановить последнюю версию.',409);
    if(data.discard===true){
      if(saved){const changed=await prepare(db,'DELETE FROM teacher_set_drafts WHERE teacher_id=? AND student_id=? AND revision=?',[user.id,pupil.id,saved.revision]).run();if(!changed.meta.changes)throw new Problem('Черновик уже изменён в другой вкладке.',409);}
      return [{ok:true},{}];
    }
    const title=cleanTitle(data.title),ids=data.ids,versions=data.itemVersions;
    if(!Array.isArray(ids)||ids.length>50||new Set(ids).size!==ids.length||!Array.isArray(versions)||versions.length!==ids.length)throw new Problem('Некорректный набор черновика.');
    const stored=new Map((saved?JSON.parse(saved.items):[]).map(item=>[item.id,item]));
    const items=ids.map((id,n)=>{const previous=stored.get(id);const item=previous&&(previous.content_version??null)===versions[n]?previous:bank.get(id);if(!item||(item.content_version??null)!==versions[n])throw new Problem('Редакция задания изменилась. Не удалось сохранить черновик.',409);return item;});
    const filters=data.filters&&typeof data.filters==='object'&&!Array.isArray(data.filters)?data.filters:{};
    if(JSON.stringify(filters).length>4000)throw new Problem('Слишком длинные настройки.');
    const updated=now();
    if(saved){const changed=await prepare(db,'UPDATE teacher_set_drafts SET title=?,items=?,filters=?,revision=revision+1,updated=? WHERE teacher_id=? AND student_id=? AND revision=?',[title,JSON.stringify(items),JSON.stringify(filters),updated,user.id,pupil.id,saved.revision]).run();if(!changed.meta.changes)throw new Problem('Черновик уже изменён в другой вкладке.',409);}
    else try{await prepare(db,'INSERT INTO teacher_set_drafts(teacher_id,student_id,title,items,filters,updated) VALUES(?,?,?,?,?,?)',[user.id,pupil.id,title,JSON.stringify(items),JSON.stringify(filters),updated]).run();}catch(error){if(/UNIQUE constraint/i.test(error.message))throw new Problem('Черновик уже сохранён в другой вкладке.',409);throw error;}
    return [{ok:true,revision:data.revision+1,updated:new Date(updated*1000).toISOString()},{}];
  }
  if(path==='/api/teacher/library'&&method==='GET'){
    const rows=await all(db,'SELECT id,title,created,json_array_length(items) AS count FROM teacher_sets WHERE teacher_id=? ORDER BY created DESC,id DESC',[user.id]);
    return [{sets:rows.map(row=>({...row,created:new Date(row.created*1000).toISOString()}))},{}];
  }
  if(path==='/api/teacher/library'&&method==='POST'){
    const title=cleanTitle(data.title),ids=data.ids;
    if(!Array.isArray(ids)||!ids.length||ids.length>50||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'))throw new Problem('Выберите от 1 до 50 разных упражнений.');
    let draftItems=[];
    if(data.draftStudentId){await ownStudent(db,user,data.draftStudentId);const draft=await one(db,'SELECT items FROM teacher_set_drafts WHERE teacher_id=? AND student_id=?',[user.id,data.draftStudentId]);if(draft)draftItems=JSON.parse(draft.items);}
    const trusted=new Map(draftItems.map(item=>[item.id,item]));
    if(!Array.isArray(data.itemVersions)||data.itemVersions.length!==ids.length)throw new Problem('Проверьте версии упражнений.',409);
    const snapshots=ids.map((id,n)=>{const old=trusted.get(id),item=old&&(old.content_version??null)===data.itemVersions[n]?old:bank.get(id);if(!item||(item.content_version??null)!==data.itemVersions[n])throw new Problem('Редакция упражнений изменилась. Обновите набор перед сохранением.',409);return item;});
    const keys=new Set();
    for(const item of snapshots)for(const key of assignmentSentenceKeys(item)){if(keys.has(key))throw new Problem('В наборе повторяются предложения.');keys.add(key);}
    const filters=data.filters&&typeof data.filters==='object'&&!Array.isArray(data.filters)?data.filters:{};
    if(JSON.stringify(filters).length>4000)throw new Problem('Слишком длинные настройки.');
    const id=token(),created=now(),items=JSON.stringify(snapshots);
    await prepare(db,'INSERT INTO teacher_sets(id,teacher_id,title,items,filters,created) VALUES(?,?,?,?,?,?)',[id,user.id,title,items,JSON.stringify(filters),created]).run();
    return [{id,title,count:ids.length},{}];
  }
  const match=path.match(/^\/api\/teacher\/library\/([\w-]+)(\/assign)?$/);
  if(!match)throw new Problem('Раздел библиотеки не найден.',404);
  const row=await one(db,'SELECT * FROM teacher_sets WHERE id=? AND teacher_id=?',[match[1],user.id]);
  if(!row)throw new Problem('Набор не найден.',404);
  if(!match[2]&&method==='GET')return [view(row),{}];
  if(!match[2]||method!=='POST')throw new Problem('Действие недоступно.',405);
  const recipients=data.studentIds;
  if(!Array.isArray(recipients)||!recipients.length||recipients.length>50||new Set(recipients).size!==recipients.length||recipients.some(id=>typeof id!=='string'||!/^[\w-]+$/.test(id)))throw new Problem('Выберите от 1 до 50 учеников.');
  if(typeof data.requestId!=='string'||!/^[\w-]{12,100}$/.test(data.requestId))throw new Problem('Некорректный запрос назначения.');
  if(data.allowRepeat!==true&&data.allowRepeat!==false)throw new Problem('Укажите, разрешено ли повторное назначение предложений.');
  const title=cleanTitle(data.title??row.title),items=JSON.parse(row.items),created=now();
  const fingerprint=digest(JSON.stringify({set:row.id,students:[...recipients].sort(),title,allowRepeat:data.allowRepeat}));
  const deliveryId=digest('teacher-set-delivery:'+user.id+':'+data.requestId);
  const previous=await one(db,'SELECT fingerprint,result FROM teacher_set_deliveries WHERE id=? AND teacher_id=?',[deliveryId,user.id]);
  if(previous){if(previous.fingerprint!==fingerprint)throw new Problem('Этот запрос уже использован для другого назначения.',409);return [{...JSON.parse(previous.result),replayed:true},{}];}
  const students=[];
  for(const id of recipients){const pupil=await ownStudent(db,user,id);if(!pupil.active)throw new Problem('Один из кабинетов отключён. Снимите его выбор.',409);students.push(pupil);}
  const keys=[...new Set(items.flatMap(assignmentSentenceKeys).map(digest))];
  const reservations=[];
  for(const pupil of students){const used=await assignedSentences(db,pupil.id);if(!data.allowRepeat&&keys.some(key=>used.has(key)))throw new Problem('Некоторым ученикам эти предложения уже назначены или пройдены в свободной тренировке. Разрешите повтор явно или измените выбор учеников.',409);reservations.push(used);}
  const deliveries=students.map(pupil=>({studentId:pupil.id,practiceId:digest(deliveryId+':practice:'+pupil.id),assignmentId:digest(deliveryId+':assignment:'+pupil.id)}));
  const result={setId:row.id,deliveries};
  const guardSql="(SELECT CASE WHEN COUNT(*)=? THEN 1 ELSE 0 END FROM users WHERE teacher_id=? AND role='student' AND active=1 AND id IN (SELECT value FROM json_each(?)))";
  const commands=[prepare(db,`INSERT INTO teacher_set_deliveries(id,teacher_id,set_id,fingerprint,result,created,guard) VALUES(?,?,?,?,?,?,${guardSql})`,[deliveryId,user.id,row.id,fingerprint,JSON.stringify(result),created,students.length,user.id,JSON.stringify(recipients)])];
  for(let n=0;n<students.length;n++){
    const pupil=students[n],delivery=deliveries[n],used=reservations[n];
    commands.push(prepare(db,'INSERT INTO practice(id,user_id,items,created,total_items,answered_count,topic_summary,levels_json,types_json) VALUES(?,?,?,?,?,?,?,?,?)',[delivery.practiceId,pupil.id,row.items,created,...metadata(items,[])]));
    commands.push(prepare(db,'INSERT INTO assignments(id,teacher_id,student_id,practice_id,title,created) VALUES(?,?,?,?,?,?)',[delivery.assignmentId,user.id,pupil.id,delivery.practiceId,title,created]));
    if(used.legacy?.length)commands.push(prepare(db,"INSERT OR IGNORE INTO assignment_sentences(student_id,sentence_key,assignment_id) SELECT ?,json_extract(value,'$.key'),json_extract(value,'$.assignment') FROM json_each(?)",[pupil.id,JSON.stringify(used.legacy)]));
    commands.push(prepare(db,`INSERT ${data.allowRepeat?'OR IGNORE ':''}INTO assignment_sentences(student_id,sentence_key,assignment_id) SELECT ?,value,? FROM json_each(?)`,[pupil.id,delivery.assignmentId,JSON.stringify(keys)]));
  }
  try{await db.batch(commands);}catch(error){
    const saved=await one(db,'SELECT fingerprint,result FROM teacher_set_deliveries WHERE id=? AND teacher_id=?',[deliveryId,user.id]);
    if(saved?.fingerprint===fingerprint)return [{...JSON.parse(saved.result),replayed:true},{}];
    if(/constraint failed/i.test(error.message))throw new Problem('Назначение изменилось в другой вкладке или кабинет отключён. Обновите список.',409);
    throw error;
  }
  return [result,{}];
}
