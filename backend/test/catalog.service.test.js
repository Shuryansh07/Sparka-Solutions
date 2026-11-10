import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { getProduct, invalidateCatalog, searchProducts } from '../src/modules/products/catalog.service.js';

const p = (sku, name, extra = {}) => ({
  sku,
  name,
  brand: 'Brand',
  category: 'Cameras & Safety',
  summary: '',
  description: '',
  specs: {},
  vehicleTypes: [],
  tags: [],
  active: true,
  ...extra,
});

const PRODUCTS = [
  p('CAM-DESC', 'Road recorder', { description: 'A compact dash cam for vans' }),
  p('CAM-NAME', 'Dual dash cam'),
  p('GPS-1', 'Plug-in GPS tracker', { category: 'GPS & Telematics', vehicleTypes: ['Trailers'] }),
  p('CAM-OLD', 'Old dash cam', { active: false }),
];

function fakeRepo(products = PRODUCTS) {
  const repo = { calls: 0, listProducts: async () => (repo.calls++, products) };
  return repo;
}

beforeEach(() => invalidateCatalog());

test('searchProducts ranks name matches above description matches', async () => {
  const results = await searchProducts(fakeRepo(), { query: 'dash cam' });
  assert.equal(results[0].sku, 'CAM-NAME');
  assert.ok(results.some((r) => r.sku === 'CAM-DESC'));
});

test('searchProducts returns summaries only', async () => {
  const [first] = await searchProducts(fakeRepo(), { query: 'dash cam' });
  assert.deepEqual(Object.keys(first).sort(), ['brand', 'category', 'name', 'sku', 'summary']);
});

test('searchProducts filters by category', async () => {
  const results = await searchProducts(fakeRepo(), { category: 'Cameras & Safety' });
  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.category === 'Cameras & Safety'));
});

test('searchProducts filters by vehicle type', async () => {
  const results = await searchProducts(fakeRepo(), { vehicleType: 'Trailers' });
  assert.deepEqual(results.map((r) => r.sku), ['GPS-1']);
});

test('searchProducts returns [] for unmatched query', async () => {
  assert.deepEqual(await searchProducts(fakeRepo(), { query: 'asdfgh' }), []);
});

test('searchProducts never returns inactive products', async () => {
  const results = await searchProducts(fakeRepo(), { query: 'old dash cam' });
  assert.ok(results.every((r) => r.sku !== 'CAM-OLD'));
});

test('searchProducts with no query and no filters returns []', async () => {
  assert.deepEqual(await searchProducts(fakeRepo(), {}), []);
});

test('searchProducts caps limit at 10', async () => {
  const many = Array.from({ length: 15 }, (_, i) => p(`CAM-${i}`, `Camera ${i}`));
  assert.equal((await searchProducts(fakeRepo(many), { query: 'camera', limit: 50 })).length, 10);
  invalidateCatalog();
  assert.equal((await searchProducts(fakeRepo(many), { query: 'camera' })).length, 5);
});

test('catalog is cached until invalidated', async () => {
  const repo = fakeRepo();
  await searchProducts(repo, { query: 'gps' });
  await searchProducts(repo, { query: 'cam' });
  assert.equal(repo.calls, 1);
  invalidateCatalog();
  await searchProducts(repo, { query: 'gps' });
  assert.equal(repo.calls, 2);
});

test('getProduct returns null for unknown or inactive sku', async () => {
  const repo = fakeRepo();
  assert.equal(await getProduct(repo, 'NOPE'), null);
  assert.equal(await getProduct(repo, 'CAM-OLD'), null);
  assert.equal((await getProduct(repo, 'GPS-1')).name, 'Plug-in GPS tracker');
});

test('searchProducts matches a loose vehicle type like "vans"', async () => {
  const products = [
    p('CAM-VAN', 'Dual dash cam', { vehicleTypes: ['Light-duty vans / pickups'] }),
    p('CAM-TRUCK', 'Truck dash cam', { vehicleTypes: ['Heavy-duty trucks'] }),
  ];
  const results = await searchProducts(fakeRepo(products), { query: 'dash cam', vehicleType: 'vans' });
  assert.deepEqual(results.map((r) => r.sku), ['CAM-VAN']);
});
