// The schema contains trigger bodies; their internal semicolons are not statement boundaries.
export function sqlStatements(source) {
  const sql=source.replace(/^--.*$/gm,'');
  const triggers=sql.match(/CREATE TRIGGER\b[\s\S]*?\bEND;/gi)||[];
  return [...sql.replace(/CREATE TRIGGER\b[\s\S]*?\bEND;/gi,'').split(';').map(s=>s.trim()).filter(Boolean),...triggers];
}
