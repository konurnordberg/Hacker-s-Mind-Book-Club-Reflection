// Catch broken DOM hooks and asset links without adding a test dependency.
// Interactive behavior is also checked in the actual browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
test('browser modules and helper scripts parse as JavaScript', () => {
  for (const name of ['src/app.js', 'src/models.js', 'scripts/serve.mjs', 'scripts/build.mjs']) {
    const result = spawnSync(process.execPath, ['--check', fileURLToPath(new URL('../' + name, import.meta.url))], { encoding: 'utf8' });
    assert.equal(result.status, 0, name + ': ' + result.stderr);
  }
});

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

test('every application ID selector has exactly one target', () => {
  const hooks = [...app.matchAll(/(?:\$|setText)\('#([\w-]+)'/g)].map((match) => match[1]);
  assert.ok(hooks.length > 30);
  for (const id of new Set(hooks)) assert.equal(ids.filter((candidate) => candidate === id).length, 1, id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate HTML id');
});

test('internal links, tab panels, and labels point to existing elements', () => {
  for (const match of html.matchAll(/(?:href="#|aria-controls="|for=")([\w-]+)"/g)) {
    assert.ok(ids.includes(match[1]), 'Missing target: ' + match[1]);
  }
});

test('relative assets exist, including GitHub project-path compatible imports', async () => {
  for (const match of html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)) {
    await access(new URL('../' + match[1], import.meta.url));
  }
  assert.match(html, /lang="en"/);
  assert.match(html, /prefers|motion-toggle/);

});
