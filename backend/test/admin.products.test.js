import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

process.env.STORE_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sparka-')), 'store.json');
process.env.STORE_DRIVER = 'memory';
process.env.ADMIN_API_KEY = 'test-admin-key';
const { createApp } = await import('../src/app.js');

let server;
let base;
before(() => {
  server = createApp().listen(0);
  base = `http://localhost:${server.address().port}/api/admin`;
});
after(() => server.close());

const product = (sku, extra = {}) => ({ sku, name: `Product ${sku}`, category: 'Cameras & Safety', ...extra });
const call = (method, url, body, key = 'test-admin-key') =>
  fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json', ...(key ? { 'x-admin-key': key } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

test('import without key → 401', async () => {
  const res = await call('POST', '/products/import', { products: [product('A-1')] }, null);
  assert.equal(res.status, 401);
});

test('import of 2 valid + 1 invalid → inserted 2, invalid reported', async () => {
  const res = await call('POST', '/products/import', {
    products: [product('IMP-1'), product('IMP-2'), product('IMP-3', { category: 'Snacks' })],
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.inserted, 2);
  assert.equal(body.updated, 0);
  assert.equal(body.rejected.length, 1);
  assert.equal(body.rejected[0].index, 2);
  assert.equal(body.rejected[0].sku, 'IMP-3');
  assert.ok(body.rejected[0].errors.category);
});

test('import of 501 rows → 422', async () => {
  const products = Array.from({ length: 501 }, (_, i) => product(`BULK-${i}`));
  assert.equal((await call('POST', '/products/import', { products })).status, 422);
});

test('import without a products array → 422', async () => {
  assert.equal((await call('POST', '/products/import', { nope: true })).status, 422);
});

test('import accepts a body larger than the app-wide 100kb limit', async () => {
  const products = Array.from({ length: 60 }, (_, i) => product(`BIG-${i}`, { description: 'x'.repeat(3000) }));
  const res = await call('POST', '/products/import', { products });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).inserted, 60);
});

test('after import, GET /products lists the new skus', async () => {
  const res = await call('GET', '/products');
  assert.equal(res.status, 200);
  const skus = (await res.json()).map((p) => p.sku);
  assert.ok(skus.includes('IMP-1') && skus.includes('IMP-2'));
});
