import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflows = {
  'frontend-checks': ['front/**', 'backend/**'],
  'backend-tests': ['backend/**'],
  'backend-pylint': ['backend/**'],
};

for (const [name, paths] of Object.entries(workflows)) {
  test(`${name} runs on relevant main pushes as well as PRs and merge groups`, () => {
    const file = `.github/workflows/${name}.yml`;
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    // This repository uses block-style workflow event mappings. Check only that
    // top-level block, not occurrences of "push" in job commands or comments.
    const events = /^on:\n((?:[ \t].*\n|\n)*)/m.exec(source)?.[1];
    assert.ok(events, `${file}: missing event block`);
    const expectedPaths = [...paths, file].map(path => `      - "${path}"`).join('\n');
    assert.equal(events.trimEnd(), [
      '  push:',
      '    branches:',
      '      - main',
      '    paths:',
      expectedPaths,
      '  pull_request:',
      '    paths:',
      expectedPaths,
      '  merge_group:',
    ].join('\n'), `${file}: expected main push with existing PR path filters`);
  });
}
