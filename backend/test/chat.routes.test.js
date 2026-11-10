import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import { fakeOpenAI, parseSse, textEvents, toolCallEvents } from './helpers/sse.js';

process.env.STORE_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sparka-')), 'store.json');
process.env.STORE_DRIVER = 'memory';
process.env.OPENAI_API_KEY = 'test-key';
process.env.CHAT_MODEL = 'test-model';
for (const key of ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']) process.env[key] = '';

const { createApp } = await import('../src/app.js');
const { config, chatConfig } = await import('../src/config/index.js');
const { setOpenAIForTests } = await import('../src/integrations/openai/client.js');

let server;
let base;
before(() => {
  server = createApp().listen(0);
  base = `http://localhost:${server.address().port}/api/chat`;
});
after(() => server.close());
beforeEach(() => {
  config.chat.enabled = true;
});

const ask = (messages = [{ role: 'user', content: 'Do you have dash cams?' }]) =>
  fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages }) });

test('status reports disabled without API key or model', () => {
  assert.equal(chatConfig({ OPENAI_API_KEY: 'k', CHAT_MODEL: 'm' }).enabled, true);
  assert.equal(chatConfig({ CHAT_MODEL: 'm' }).enabled, false);
  assert.equal(chatConfig({ OPENAI_API_KEY: 'k' }).enabled, false);
  assert.equal(chatConfig({ OPENAI_API_KEY: 'k', CHAT_MODEL: 'm', CHAT_ENABLED: 'false' }).enabled, false);
});

test('GET /status reflects config', async () => {
  assert.deepEqual(await (await fetch(`${base}/status`)).json(), { enabled: true });
  config.chat.enabled = false;
  assert.deepEqual(await (await fetch(`${base}/status`)).json(), { enabled: false });
});

test('503 when chat disabled', async () => {
  config.chat.enabled = false;
  assert.equal((await ask()).status, 503);
});

test('422 on invalid history', async () => {
  setOpenAIForTests(fakeOpenAI([textEvents('x')]));
  const res = await ask([{ role: 'assistant', content: 'hi' }]);
  assert.equal(res.status, 422);
  assert.match(res.headers.get('content-type'), /application\/json/);
});

test('streams text deltas then done', async () => {
  setOpenAIForTests(fakeOpenAI([textEvents('We have ', 'dash cams.')]));
  const res = await ask();
  assert.match(res.headers.get('content-type'), /text\/event-stream/);
  const events = parseSse(await res.text());
  assert.equal(events.filter((e) => e.event === 'text').map((e) => e.data.delta).join(''), 'We have dash cams.');
  assert.equal(events.at(-1).event, 'done');
});

test('every request sets store false, the configured model and the instructions', async () => {
  const client = fakeOpenAI([textEvents('ok')]);
  setOpenAIForTests(client);
  await (await ask()).text();
  const [params] = client.calls;
  assert.equal(params.store, false);
  assert.equal(params.stream, true);
  assert.equal(params.model, 'test-model');
  assert.ok(params.instructions.includes('Never state or estimate prices'));
  assert.deepEqual(params.include, ['reasoning.encrypted_content']);
  assert.deepEqual(params.input, [{ role: 'user', content: 'Do you have dash cams?' }]);
  assert.deepEqual(params.tools.map((t) => t.name).sort(), ['get_product', 'request_follow_up', 'search_products']);
});

test('runs a tool call and continues', async () => {
  const client = fakeOpenAI([
    toolCallEvents('search_products', { query: 'dash cam', category: null, vehicleType: null, limit: null }),
    textEvents('Here are two options.'),
  ]);
  setOpenAIForTests(client);
  const events = parseSse(await (await ask()).text());

  assert.equal(client.calls.length, 2);
  const second = client.calls[1].input;
  const callIndex = second.findIndex((i) => i.type === 'function_call');
  assert.equal(second[callIndex].call_id, 'call_1');
  assert.equal(second[callIndex + 1].type, 'function_call_output');
  assert.equal(second[callIndex + 1].call_id, 'call_1');
  assert.ok(JSON.parse(second[callIndex + 1].output).results.length > 0);

  const kinds = events.map((e) => e.event);
  assert.ok(kinds.indexOf('products') < kinds.indexOf('text'));
  assert.ok(events.find((e) => e.event === 'products').data.items.length > 0);
});

test('stops after 6 model calls', async () => {
  const client = fakeOpenAI(() => toolCallEvents('get_product', { sku: 'NOPE' }));
  setOpenAIForTests(client);
  const events = parseSse(await (await ask()).text());
  assert.equal(client.calls.length, 6);
  assert.equal(events.at(-2).event, 'error');
  assert.equal(events.at(-1).event, 'done');
});

test('a refusal ends the turn with a polite message', async () => {
  setOpenAIForTests(fakeOpenAI([[{ type: 'response.refusal.delta', delta: 'no' }, { type: 'response.completed', response: { output: [] } }]]));
  const events = parseSse(await (await ask()).text());
  const text = events.filter((e) => e.event === 'text').map((e) => e.data.delta).join('');
  assert.match(text, /representative can/);
  assert.equal(events.at(-1).event, 'done');
});

test('emits error event when the model call throws', async () => {
  setOpenAIForTests(fakeOpenAI([new Error('secret upstream detail')]));
  const original = console.error;
  console.error = () => {};
  try {
    const body = await (await ask()).text();
    const events = parseSse(body);
    assert.equal(events.at(-2).event, 'error');
    assert.equal(events.at(-2).data.message, 'The assistant is unavailable right now. You can still send us your details.');
    assert.ok(!body.includes('secret upstream detail'));
    assert.equal(events.at(-1).event, 'done');
  } finally {
    console.error = original;
  }
});

test('a failed response event becomes an error event', async () => {
  setOpenAIForTests(fakeOpenAI([[{ type: 'response.failed', response: { error: { code: 'server_error' } } }]]));
  const original = console.error;
  console.error = () => {};
  try {
    const events = parseSse(await (await ask()).text());
    assert.equal(events.at(-2).event, 'error');
  } finally {
    console.error = original;
  }
});

test('encrypted reasoning can be switched off for non-reasoning models', async () => {
  assert.equal(chatConfig({ OPENAI_API_KEY: 'k', CHAT_MODEL: 'm' }).encryptedReasoning, true);
  assert.equal(chatConfig({ OPENAI_API_KEY: 'k', CHAT_MODEL: 'm', CHAT_ENCRYPTED_REASONING: 'false' }).encryptedReasoning, false);
  const client = fakeOpenAI([textEvents('ok')]);
  setOpenAIForTests(client);
  config.chat.encryptedReasoning = false;
  try {
    await (await ask()).text();
    assert.equal('include' in client.calls[0], false);
  } finally {
    config.chat.encryptedReasoning = true;
  }
});
