import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

process.env.STORE_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sparka-')), 'store.json');
process.env.STORE_DRIVER = 'memory';
for (const key of ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']) process.env[key] = '';
const { createApp } = await import('../src/app.js');

let server;
let base;
before(() => {
  server = createApp().listen(0);
  base = `http://localhost:${server.address().port}/api`;
});
after(() => server.close());

const post = (url, body, method = 'POST') =>
  fetch(base + url, { method, headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });

// Malformed input must get a clear 4xx answer, never a 500.

test('discovery submission with contact: null → 422 with field errors', async () => {
  const res = await post('/discovery/submissions', { route: 'guide', contact: null });
  assert.equal(res.status, 422);
  assert.ok((await res.json()).details.name);
});

test('describe submission with organized: null is treated as "no suggestions" → 201', async () => {
  const res = await post('/discovery/submissions', {
    route: 'describe', narrative: 'Need cameras on 30 vans', organized: null, contact: { name: 'Pat', email: 'pat@example.com' },
  });
  assert.equal(res.status, 201);
});

test('consultation with contact: null → 422 with field errors', async () => {
  const res = await post('/consultations', { contact: null });
  assert.equal(res.status, 422);
  assert.ok((await res.json()).details.name);
});

test('consultation with a non-object contact (string) → 422', async () => {
  assert.equal((await post('/consultations', { contact: 'pat@example.com' })).status, 422);
});

test('saving a draft with contact: null and organized: null → 201', async () => {
  const res = await post('/discovery/drafts', { route: 'describe', contact: null, organized: null });
  assert.equal(res.status, 201);
});

test('request body over 100kb → 413 with a JSON error', async () => {
  const res = await post('/consultations', { topic: 'x'.repeat(200_000), contact: { name: 'x', email: 'x@y.co' } });
  assert.equal(res.status, 413);
  assert.match((await res.json()).error, /too large/i);
});

test('a JSON body that is not an object → 4xx, not 500', async () => {
  // Arrays parse, then fail validation; bare null/strings are rejected by the strict JSON parser.
  assert.equal((await post('/consultations', '[1,2,3]')).status, 422);
  assert.equal((await post('/discovery/submissions', 'null')).status, 400);
});
