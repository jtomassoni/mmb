import fs from 'node:fs'; import path from 'node:path'; import child from 'node:child_process';
const statusPath = path.join(process.cwd(), 'docs/status.json');
const foobarPath = path.join(process.cwd(), 'FOOBAR.md');

function getBranch() {
  try { return child.execSync('git rev-parse --abbrev-ref HEAD').toString().trim(); }
  catch { return ''; }
}
function injectChecklist(md: string, list: string) {
  const marker = '<!-- TASKS-LIST:DO-NOT-EDIT-MANUALLY -->';
  const [head] = md.split(marker);
  return head + marker + '\n' + list + '\n';
}
function main() {
  const args = process.argv.slice(2); // e.g. --set TASK-05=done
  const json = JSON.parse(fs.readFileSync(statusPath, 'utf8'));

  if (args[0] === '--set' && args[1]) {
    const [id, state] = args[1].split('=');
    const t = json.tasks.find((x:any)=>x.id===id);
    if (t) t.state = state;
  }

  json.meta.lastUpdated = new Date().toISOString();
  json.meta.branch = getBranch();
  fs.writeFileSync(statusPath, JSON.stringify(json, null, 2));

  const checklist = json.tasks.map((t:any)=>`- [${t.state==='done'?'x':' '}] ${t.id} — ${t.title}`).join('\n');
  const md = fs.readFileSync(foobarPath, 'utf8');
  fs.writeFileSync(foobarPath, injectChecklist(md, checklist));
  console.log('Updated FOOBAR.md and docs/status.json');
}
main();
