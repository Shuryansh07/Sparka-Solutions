import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

// Never reach the real CRM from tests.
for (const key of ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']) process.env[key] = '';
const { createChatTools } = await import('../src/modules/chat/chat.tools.js');
const { invalidateCatalog } = await import('../src/modules/products/catalog.service.js');

const PRODUCTS = [
  { sku: 'CAM-1', name: 'Dual dash cam', brand: 'B', category: 'Cameras & Safety', summary: 'Front + cab',
    description: '', specs: { Channels: '2' }, vehicleTypes: [], tags: ['dashcam'], active: true },
];

function setup() {
  const submissions = [];
  const repo = {
    listProducts: async () => PRODUCTS,
    createSubmission: async (s) => (submissions.push(s), s),
    updateSubmission: async (_ref, patch) => patch,
  };
  const events = [];
  const tools = createChatTools({ repo, emit: (event, data) => events.push([event, data]) });
  const run = async (name, args) => JSON.parse(await tools.execute(name, typeof args === 'string' ? args : JSON.stringify(args)));
  return { tools, run, events, submissions };
}

const SEARCH = { query: 'dash cam', category: null, vehicleType: null, limit: null };
const LEAD = { name: 'Pat Lee', email: 'pat@example.com', phone: null, company: 'Lee Fleet',
  summary: 'Wants dash cams for 30 vans', skus: ['CAM-1'], consent: true };

beforeEach(() => invalidateCatalog());

test('definitions are strict and list every property as required', () => {
  const { tools } = setup();
  assert.deepEqual(tools.definitions.map((d) => d.name).sort(), ['get_product', 'request_follow_up', 'search_products']);
  for (const d of tools.definitions) {
    assert.equal(d.type, 'function');
    assert.equal(d.strict, true);
    assert.equal(d.parameters.additionalProperties, false);
    assert.deepEqual([...d.parameters.required].sort(), Object.keys(d.parameters.properties).sort());
  }
});

test('search_products emits products and returns results JSON', async () => {
  const { run, events } = setup();
  const out = await run('search_products', SEARCH);
  assert.equal(out.results[0].sku, 'CAM-1');
  assert.deepEqual(events, [['products', { items: out.results }]]);
});

test('search_products with no match returns {results: []} and does not emit', async () => {
  const { run, events } = setup();
  assert.deepEqual(await run('search_products', { ...SEARCH, query: 'asdfgh' }), { results: [] });
  assert.equal(events.length, 0);
});

test('null optional fields are treated as not given', async () => {
  const { run } = setup();
  const out = await run('search_products', { query: 'camera dash', category: null, vehicleType: null, limit: null });
  assert.equal(out.results.length, 1);
});

test('get_product returns the product without any price field', async () => {
  const { run } = setup();
  const { product } = await run('get_product', { sku: 'CAM-1' });
  assert.equal(product.name, 'Dual dash cam');
  assert.equal('price' in product, false);
});

test('get_product unknown sku returns {error: not_found}', async () => {
  const { run } = setup();
  assert.deepEqual(await run('get_product', { sku: 'NOPE' }), { error: 'not_found' });
});

test('returns error output for unparseable arguments', async () => {
  const { run } = setup();
  assert.deepEqual(await run('get_product', '{bad'), { error: 'invalid_arguments' });
  assert.deepEqual(await run('search_products', { query: 5 }), { error: 'invalid_arguments' });
});

test('unknown tool returns {error: unknown_tool}', async () => {
  const { run } = setup();
  assert.deepEqual(await run('delete_everything', {}), { error: 'unknown_tool' });
});

test('request_follow_up rejects missing consent', async () => {
  const { run, submissions } = setup();
  assert.deepEqual(await run('request_follow_up', { ...LEAD, consent: false }), { error: 'consent_required' });
  assert.equal(submissions.length, 0);
});

test('request_follow_up rejects invalid contact', async () => {
  const { run, submissions } = setup();
  const out = await run('request_follow_up', { ...LEAD, email: null, phone: null });
  assert.equal(out.error, 'contact_required');
  assert.equal(submissions.length, 0);
});

test('request_follow_up creates a chat submission', async () => {
  const { run, submissions, events } = setup();
  const out = await run('request_follow_up', LEAD);
  assert.match(out.reference, /^SPK-[0-9A-F]{6}$/);
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].route, 'chat');
  assert.ok(submissions[0].heard.some((l) => l === 'Summary: Wants dash cams for 30 vans'));
  assert.ok(submissions[0].heard.some((l) => l === 'Products discussed: CAM-1'));
  assert.ok(submissions[0].heard[0].includes('Chat Assistant'));
  assert.deepEqual(events.at(-1), ['lead', { reference: out.reference }]);
});

test('search_products offers the approved vehicle types as an enum', async () => {
  const { tools } = setup();
  const { VEHICLE_TYPES } = await import('../src/modules/products/products.validation.js');
  const search = tools.definitions.find((d) => d.name === 'search_products');
  assert.deepEqual(search.parameters.properties.vehicleType.enum, [...VEHICLE_TYPES, null]);
});

test('search_products asks for English keywords', () => {
  const { tools } = setup();
  const search = tools.definitions.find((d) => d.name === 'search_products');
  assert.match(search.parameters.properties.query.description, /English/);
});
