import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const storeFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sparka-')), 'store.json');
process.env.STORE_FILE = storeFile;
const { memoryRepository: repo } = await import('../src/repositories/memory.repository.js');

const product = (sku, name) => ({
  sku,
  name,
  brand: 'B',
  category: 'Cameras & Safety',
  summary: '',
  description: '',
  specs: {},
  vehicleTypes: [],
  tags: [],
  active: true,
});

test('listProducts loads the seed catalog when empty', async () => {
  const products = await repo.listProducts();
  assert.ok(products.length >= 10, 'seed catalog should load');
});

test('upsertProducts inserts then updates by sku', async () => {
  assert.deepEqual(await repo.upsertProducts([product('T-1', 'One'), product('T-2', 'Two')]), {
    inserted: 2,
    updated: 0,
  });
  assert.deepEqual(await repo.upsertProducts([product('T-1', 'One v2')]), { inserted: 0, updated: 1 });
  const bySku = Object.fromEntries((await repo.listProducts()).map((p) => [p.sku, p]));
  assert.equal(bySku['T-1'].name, 'One v2');
  assert.ok(bySku['T-2']);
});

test('products are persisted to the store file', () => {
  const saved = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
  assert.equal(saved.products['T-1'].name, 'One v2');
});
