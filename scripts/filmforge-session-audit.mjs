// Read-only snapshot. Counts are not product completion or test evidence.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

function audit(root) {
  const read = p => readFileSync(path.join(root,p),'utf8');
  const dir = '.scratch/filmforge-studio/issues';
  const counts = {'not-started':0,'in-progress':0,blocked:0,done:0};
  const statuses = ['needs-triage','needs-info','ready-for-agent','ready-for-human','wontfix'];
  const tickets = new Map();
  for (const file of readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.md')).sort()) {
    const id = /^(\d+)-/.exec(file)?.[1];
    if (!id || tickets.has(id)) throw Error('invalid or duplicate ticket '+file);
    const body = read(dir+'/'+file);
    const field = name => {
      const match = new RegExp('^'+name+':\\s*([^\\r\\n]+)$','m').exec(body);
      if (!match) throw Error(id+' missing '+name);
      return match[1].trim();
    };
    const status=field('Status'), progress=field('Progress'), blocked=field('Blocked by');
    if (!statuses.includes(status) || !Object.hasOwn(counts,progress)) throw Error(id+' invalid state');
    const deps=blocked==='None'?[]:blocked.split(',').map(x=>x.trim());
    counts[progress]++;
    tickets.set(id,{status,progress,deps});
  }
  const visiting=new Set(), visited=new Set();
  function visit(id) {
    if (visiting.has(id)) throw Error('dependency cycle at '+id);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of tickets.get(id).deps) {
      if (!tickets.has(dep)) throw Error(id+' unknown dependency '+dep);
      visit(dep);
    }
    visiting.delete(id); visited.add(id);
  }
  for(const id of tickets.keys()) visit(id);
  const eligible=[...tickets].filter(([,t])=>t.status==='ready-for-agent' &&
    ['not-started','in-progress'].includes(t.progress) && t.deps.every(d=>tickets.get(d).progress==='done')).map(([id])=>id);
  const en=JSON.parse(read('front/src/locales/en-US/ui.json'));
  const vi=JSON.parse(read('front/src/locales/vi-VN/ui.json'));
  const keys=Object.keys(en);
  if(keys.length!==Object.keys(vi).length||keys.some(k=>!Object.hasOwn(vi,k))) throw Error('locale key parity mismatch');
  const different=keys.filter(k=>en[k]!==vi[k]).length;
  return {tracker:{total:tickets.size,counts,eligible},locale:{keys:keys.length,different,equal:keys.length-different,keyParity:true}};
}
try {
  console.log(JSON.stringify(audit(path.resolve(process.argv[2]??path.join(import.meta.dirname,'..'))),null,2));
} catch(error) {
  console.error(error.message); process.exitCode=1;
}
