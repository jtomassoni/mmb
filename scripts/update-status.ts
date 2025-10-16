// scripts/update-status.ts
import fs from 'node:fs';
import path from 'node:path';
import child from 'node:child_process';

const statusPath = path.join(process.cwd(), 'docs/status.json');
const foobarPath = path.join(process.cwd(), 'FOOBAR.md');

function getBranch() {
  try {
    return child.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch {
    return '';
  }
}

type Subtask = { id: string; title: string; state: 'todo' | 'done' };
type Task = {
  id: string;
  title: string;
  state: 'todo' | 'done';
  subtasks?: Subtask[];
  acceptance?: string;
  artifacts?: string[];
};
type StatusJson = {
  meta: { lastUpdated: string; branch: string };
  tasks: Task[];
};

function parseArgs() {
  // Supports:
  //   --set TASK-09=done
  //   --set TASK-09/09A=done
  //   --reset
  const args = process.argv.slice(2);
  const opts: { set?: string; reset?: boolean } = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--set') opts.set = args[i + 1];
    if (a === '--reset') opts.reset = true;
  }
  return opts;
}

function markAllTodo(json: StatusJson) {
  json.tasks.forEach(t => {
    t.state = 'todo';
    if (Array.isArray(t.subtasks)) t.subtasks.forEach(s => (s.state = 'todo'));
  });
}

function setState(json: StatusJson, raw: string) {
  // raw example: "TASK-09=done" or "TASK-09/09A=done"
  const [idPart, state] = raw.split('=');
  const [taskId, subId] = idPart.split('/');
  const t = json.tasks.find(x => x.id === taskId);
  if (!t) return;

  if (subId && Array.isArray(t.subtasks) && t.subtasks.length) {
    const st = t.subtasks.find(x => x.id === subId);
    if (st) st.state = state as any;
    // If all subtasks done → mark parent done
    if (t.subtasks.every(x => x.state === 'done')) t.state = 'done';
  } else {
    t.state = state as any;
  }
}

function firstTodo(json: StatusJson): string {
  for (const t of json.tasks) {
    if (t.state !== 'done') {
      if (Array.isArray(t.subtasks) && t.subtasks.length) {
        const st = t.subtasks.find(s => s.state !== 'done');
        if (st) return `${t.id}/${st.id} - ${st.title}`;
      }
      return `${t.id} - ${t.title}`;
    }
  }
  return 'All tasks complete 🎉';
}

function renderChecklist(tasks: Task[]) {
  const lines: string[] = [];
  for (const t of tasks) {
    lines.push(`- [${t.state === 'done' ? 'x' : ' '}] ${t.id} - ${t.title}`);
    if (t.subtasks && t.subtasks.length) {
      for (const s of t.subtasks) {
        lines.push(`  - [${s.state === 'done' ? 'x' : ' '}] ${s.id} - ${s.title}`);
      }
    }
  }
  return lines.join('\n');
}

function injectChecklist(md: string, list: string, nextStep: string, meta: StatusJson['meta']) {
  const marker = '<!-- TASKS-LIST:DO-NOT-EDIT-MANUALLY -->';

  // Replace the checklist block
  const [beforeMarker] = md.split(marker);
  let rebuilt = beforeMarker + marker + '\n' + list + '\n';

  // Try to inject **Next Step:** after “Last Updated” line in the “📍 Current Status & Next Step” section
  // We’ll add (or replace) a line that starts with **Next Step:**
  const nextStepLine = `**Next Step:** ${nextStep}\n`;

  const currentStatusHeader = '## 📍 Current Status & Next Step';
  const hasSection = rebuilt.includes(currentStatusHeader);

  if (hasSection) {
    // After the Last Updated line inside that section
    rebuilt = rebuilt.replace(
      /(## 📍 Current Status & Next Step[\s\S]*?- \*\*Last Updated:\*\*.*?\n)(?:\*\*Next Step:\*\*.*\n)?/,
      (_m, prefix) => prefix + nextStepLine
    );

    // Optionally fill Branch line if present as plain text “- **Branch:** (...)”
    if (meta?.branch) {
      rebuilt = rebuilt.replace(
        /(- \*\*Branch:\*\*)[^\n]*/i,
        `$1 ${meta.branch}`
      );
    }
    if (meta?.lastUpdated) {
      rebuilt = rebuilt.replace(
        /(- \*\*Last Updated:\*\*)[^\n]*/i,
        `$1 ${new Date(meta.lastUpdated).toISOString()}`
      );
    }
  }

  return rebuilt;
}

function main() {
  const opts = parseArgs();
  const json = JSON.parse(fs.readFileSync(statusPath, 'utf8')) as StatusJson;

  if (opts.reset) {
    markAllTodo(json);
  }
  if (opts.set) {
    setState(json, opts.set);
  }

  // stamp meta
  json.meta.lastUpdated = new Date().toISOString();
  json.meta.branch = getBranch();

  // write status.json
  fs.writeFileSync(statusPath, JSON.stringify(json, null, 2));

  // build checklist
  const checklist = renderChecklist(json.tasks);
  const next = firstTodo(json);

  // rewrite FOOBAR.md
  const md = fs.readFileSync(foobarPath, 'utf8');
  const updatedMd = injectChecklist(md, checklist, next, json.meta);
  fs.writeFileSync(foobarPath, updatedMd);

  console.log('Updated FOOBAR.md and docs/status.json');
  console.log('Next:', next);
}

main();
