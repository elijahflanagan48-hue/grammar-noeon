// Authenticated routes called after the Worker's session/CSRF checks.
export async function handleTaskIssues(context) {
  const {db,user,path,method,data,one,all,run,now,token,Problem,rateLimit}=context;
  if(path==='/api/task-issues'&&method==='POST') {
    if(typeof data?.practiceId!=='string'||!Number.isInteger(data.index)||data.index<0||typeof data.comment!=='string'||!data.comment.trim()||data.comment.length>2000||typeof data.requestId!=='string'||! /^[\w-]{16,100}$/.test(data.requestId))throw new Problem('Укажите задание и комментарий до 2000 символов.');
    const row=await one(db,'SELECT p.id,p.user_id,p.items,u.teacher_id,u.active FROM practice p JOIN users u ON u.id=p.user_id WHERE p.id=?',[data.practiceId]);
    if(!row||!(row.user_id===user.id||user.role==='teacher'&&row.teacher_id===user.id))throw new Problem('Работа не найдена.',404);
    const teacherId=user.role==='teacher'?user.id:row.teacher_id;
    if(!teacherId||!await one(db,"SELECT id FROM users WHERE id=? AND role='teacher' AND active=1",[teacherId]))throw new Problem('Преподаватель сейчас недоступен.',409);
    const items=JSON.parse(row.items),item=items[data.index];
    if(!item)throw new Problem('Задание не найдено.',404);
    const replay=saved=>{
      if(saved.practice_id!==data.practiceId||saved.item_index!==data.index||saved.comment!==data.comment.trim())throw new Problem('Запрос уже использован для другого сообщения. Откройте форму заново.',409);
      return [{id:saved.id,status:saved.status},{}];
    };
    const previous=await one(db,'SELECT id,status,practice_id,item_index,comment FROM task_issues WHERE reporter_id=? AND request_id=?',[user.id,data.requestId]);
    if(previous)return replay(previous);
    await rateLimit(db,'task-issue:'+user.id,30);
    const id=token(),created=now();
    await run(db,"INSERT INTO task_issues(id,teacher_id,reporter_id,practice_id,item_index,item_id,item_version,snapshot,comment,request_id,created) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(reporter_id,request_id) DO NOTHING",[id,teacherId,user.id,row.id,data.index,item.id,String(item.content_version||item.version||item.assessment_id||'archive'),JSON.stringify(item),data.comment.trim(),data.requestId,created]);
    const saved=await one(db,'SELECT id,status,practice_id,item_index,comment FROM task_issues WHERE reporter_id=? AND request_id=?',[user.id,data.requestId]);
    return replay(saved);
  }
  if(path==='/api/teacher/task-issues'&&method==='GET') {
    if(user.role!=='teacher')throw new Problem('Раздел доступен преподавателю.',403);
    const open=await all(db,"SELECT i.id,i.reporter_id,i.practice_id,i.item_index,i.item_id,i.item_version,i.snapshot,i.comment,i.created,i.status,i.resolved,u.name,u.teacher_name FROM task_issues i JOIN users u ON u.id=i.reporter_id WHERE i.teacher_id=? AND i.status='open' ORDER BY i.created,i.id LIMIT 100",[user.id]);
    const recent=await all(db,"SELECT i.id,i.reporter_id,i.practice_id,i.item_index,i.item_id,i.item_version,i.snapshot,i.comment,i.created,i.status,i.resolved,u.name,u.teacher_name FROM task_issues i JOIN users u ON u.id=i.reporter_id WHERE i.teacher_id=? AND i.status='resolved' ORDER BY i.resolved DESC,i.id LIMIT 25",[user.id]);
    const total=await one(db,"SELECT COUNT(*) AS n FROM task_issues WHERE teacher_id=? AND status='open'",[user.id]);
    const view=row=>{const item=JSON.parse(row.snapshot);return {id:row.id,practiceId:row.practice_id,index:row.item_index,itemId:row.item_id,version:row.item_version,comment:row.comment,created:row.created,status:row.status,resolved:row.resolved,reporter:row.teacher_name||row.name,prompt:item.prompt||'',instruction:item.instruction_ru||'',options:item.options||[]};};
    return [{items:open.map(view),recent:recent.map(view),totalOpen:total.n},{}];
  }
  const resolve=path.match(/^\/api\/teacher\/task-issues\/([\w-]+)\/resolve$/);
  if(resolve&&method==='POST') {
    if(user.role!=='teacher')throw new Problem('Раздел доступен преподавателю.',403);
    const issue=await one(db,'SELECT id FROM task_issues WHERE id=? AND teacher_id=?',[resolve[1],user.id]);
    if(!issue)throw new Problem('Сообщение не найдено.',404);
    await run(db,"UPDATE task_issues SET status='resolved',resolved=COALESCE(resolved,?) WHERE id=? AND teacher_id=?",[now(),issue.id,user.id]);
    return [{ok:true},{}];
  }
  return null;
}
