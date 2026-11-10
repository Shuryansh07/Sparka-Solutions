import assert from 'node:assert/strict';
import { test } from 'node:test';
import { library } from '../src/modules/discovery/discovery.service.js';
import { cleanProduct } from '../src/modules/products/products.validation.js';

const CATEGORIES = library.questions.find((q) => q.id === 'interests').options;

const VALID = {
  sku: 'CAM-100',
  name: 'Dual dash cam',
  brand: 'Acme',
  category: 'Cameras & Safety',
  summary: 'Front + cab',
  description: 'x',
  specs: { Channels: '2' },
  vehicleTypes: ['Light-duty vans / pickups'],
  tags: ['dashcam'],
};

test('cleanProduct accepts a valid row and trims fields', () => {
  const p = cleanProduct({ ...VALID, sku: ' CAM-100 ', price: 499 }, CATEGORIES);
  assert.equal(p.sku, 'CAM-100');
  assert.equal(p.active, true);
  assert.equal('price' in p, false);
  assert.deepEqual(p.specs, { Channels: '2' });
  assert.deepEqual(p.vehicleTypes, ['Light-duty vans / pickups']);
});

test('cleanProduct rejects unknown category', () => {
  assert.throws(() => cleanProduct({ ...VALID, category: 'Snacks' }, CATEGORIES), { status: 422 });
});

test('cleanProduct rejects bad sku', () => {
  assert.throws(() => cleanProduct({ ...VALID, sku: "x'; DROP" }, CATEGORIES), { status: 422 });
});

test('cleanProduct rejects missing name', () => {
  assert.throws(() => cleanProduct({ ...VALID, name: '  ' }, CATEGORIES), { status: 422 });
});

test('cleanProduct drops unknown vehicle types and lowercases tags', () => {
  const p = cleanProduct({ ...VALID, vehicleTypes: ['Spaceship', 'Trailers'], tags: ['DashCam', 'GPS'] }, CATEGORIES);
  assert.deepEqual(p.vehicleTypes, ['Trailers']);
  assert.deepEqual(p.tags, ['dashcam', 'gps']);
});

test('cleanProduct keeps active false when given', () => {
  assert.equal(cleanProduct({ ...VALID, active: false }, CATEGORIES).active, false);
});
