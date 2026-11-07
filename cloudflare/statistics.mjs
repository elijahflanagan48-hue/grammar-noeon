// Only trusted stored grades enter these totals. History pagination is unrelated.
const sections = ['tenses', 'comparison', 'passive', 'modals', 'reported', 'nouns'];
const kindSql = "CASE WHEN json_extract(p.items,'$[0].assessment_id') IS NOT NULL THEN 'assessment' ELSE 'practice' END";
const answerSectionSql = "CASE WHEN json_extract(a.value,'$.item.topic')='nouns' OR json_extract(a.value,'$.item.id') GLOB 'n-[0-9]*' THEN 'nouns' WHEN json_extract(a.value,'$.item.topic')='reported' OR json_extract(a.value,'$.item.id') GLOB 'rs-*' THEN 'reported' WHEN json_extract(a.value,'$.item.topic')='modals' THEN 'modals' WHEN json_extract(a.value,'$.item.topic')='passive' OR json_extract(a.value,'$.item.id') GLOB 'pv-*' OR json_extract(a.value,'$.item.id') GLOB 'pv[0-9]-*' THEN 'passive' WHEN json_extract(a.value,'$.item.topic')='comparison' OR json_extract(a.value,'$.item.id') GLOB 'cmp-*' THEN 'comparison' ELSE 'tenses' END";
const iso = value => value === null || value === undefined ? null : new Date(value * 1000).toISOString();

export async function statistics(db, ownerId, {all, materialize}) {
  const legacy = await all(db, 'SELECT id FROM practice WHERE user_id=? AND completed IS NOT NULL AND topic_summary IS NULL', [ownerId]);
  for (let start=0; start<legacy.length; start+=100) await materialize(db, legacy.slice(start,start+100).map(row=>row.id));
  const [works, fieldRows, topicRows] = await Promise.all([
    all(db, `SELECT ${kindSql} AS kind,COUNT(*) AS sessions,MAX(p.completed) AS lastWork FROM practice p WHERE p.user_id=? AND p.completed IS NOT NULL GROUP BY kind`, [ownerId]),
    // A field may have multiple grammar targets: count it once in its section.
    all(db, `SELECT ${kindSql} AS kind,${answerSectionSql} AS section,
      SUM(CASE WHEN COALESCE(json_extract(f.value,'$.verified'),1)<>0 AND json_extract(f.value,'$.correct')=1 THEN 1 ELSE 0 END) AS correct,
      SUM(CASE WHEN COALESCE(json_extract(f.value,'$.verified'),1)<>0 THEN 1 ELSE 0 END) AS checked,
      SUM(CASE WHEN json_extract(f.value,'$.verified')=0 THEN 1 ELSE 0 END) AS pending,
      MAX(p.completed) AS lastWork
      FROM practice p,json_each(p.answers) a,json_each(a.value,'$.fields') f
      WHERE p.user_id=? AND p.completed IS NOT NULL GROUP BY kind,section`, [ownerId]),
    all(db, `SELECT ${kindSql} AS kind,t.key AS id,SUM(json_extract(t.value,'$[0]')) AS correct,
      SUM(json_extract(t.value,'$[1]')) AS checked,MAX(p.completed) AS lastWork
      FROM practice p,json_each(p.topic_summary) t WHERE p.user_id=? AND p.completed IS NOT NULL GROUP BY kind,t.key`, [ownerId]),
  ]);
  const kinds = Object.fromEntries(['practice','assessment'].map(kind=>[kind,{sessions:0,correct:0,checked:0,pending:0,lastWork:null,
    sections:sections.map(id=>({id,correct:0,checked:0,pending:0,lastWork:null,topics:[]}))}]));
  for (const row of works) Object.assign(kinds[row.kind], {sessions:Number(row.sessions),lastWork:iso(row.lastWork)});
  for (const row of fieldRows) {
    const kind=kinds[row.kind],section=kind.sections.find(value=>value.id===row.section);
    const counts={correct:Number(row.correct),checked:Number(row.checked),pending:Number(row.pending)};
    Object.assign(section,counts,{lastWork:iso(row.lastWork)});
    for(const key of ['correct','checked','pending'])kind[key]+=counts[key];
  }
  for (const row of topicRows) {
    const section=row.id.startsWith('noun_')?'nouns':/^rs(?:\d|_)/.test(row.id)?'reported':row.id.startsWith('mv_')?'modals':row.id.startsWith('pv_')?'passive':row.id.startsWith('cmp_')?'comparison':'tenses';
    kinds[row.kind].sections.find(value=>value.id===section).topics.push({id:row.id,correct:Number(row.correct),checked:Number(row.checked),lastWork:iso(row.lastWork)});
  }
  return {scope:'completed',kinds};
}
