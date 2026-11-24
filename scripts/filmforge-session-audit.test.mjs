import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const cli = path.resolve(import.meta.dirname, 'filmforge-session-audit.mjs');
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'filmforge-audit-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, '.scratch/filmforge-studio/issues'), { recursive: true });
  for (const locale of ['en-US', 'vi-VN']) {
    mkdirSync(path.join(root, 'front/src/locales', locale), { recursive: true });
    writeFileSync(path.join(root, 'front/src/locales', locale, 'ui.json'),
      JSON.stringify({a:locale === 'vi-VN' ? 'Xin chào' : 'Hello', b:'Video'}));
  }
  return root;
}
function ticket(root, id, progress, deps = 'None', status = 'ready-for-agent') {
  writeFileSync(path.join(root, '.scratch/filmforge-studio/issues', id+'-task.md'),
    '# '+id+' — Test\nStatus: '+status+'\nProgress: '+progress+'\nBlocked by: '+deps+'\n');
}
const run = root => spawnSync(process.execPath, [cli, root], { encoding:'utf8' });
test('counts tracker states and distinguishes catalog equality from translation completeness', t => {
  const root=fixture(t);
  ticket(root,'01','done'); ticket(root,'02','not-started','01');
  ticket(root,'03','not-started','02'); ticket(root,'04','blocked','None','ready-for-human');
  const r=run(root);
  assert.equal(r.status,0,r.stderr);
  const a=JSON.parse(r.stdout);
  assert.deepEqual(a.tracker.counts,{'not-started':2,'in-progress':0,blocked:1,done:1});
  assert.deepEqual(a.tracker.eligible,['02']);
  assert.deepEqual(a.locale,{keys:2,different:1,equal:1,keyParity:true});
});
test('rejects invalid dependency and cyclic tracker graph', t => {
  const root=fixture(t);
  ticket(root,'01','not-started','99');
  let r=run(root); assert.equal(r.status,1); assert.match(r.stderr,/unknown dependency 99/);
  ticket(root,'01','not-started','02'); ticket(root,'02','not-started','01');
  r=run(root); assert.equal(r.status,1); assert.match(r.stderr,/cycle/);
});
test('rejects missing locale keys rather than counting them translated', t => {
  const root=fixture(t); ticket(root,'01','done');
  writeFileSync(path.join(root,'front/src/locales/vi-VN/ui.json'),'{"a":"Xin chào"}');
  const r=run(root); assert.equal(r.status,1); assert.match(r.stderr,/key parity/);
});
