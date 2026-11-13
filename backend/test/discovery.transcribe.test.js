import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

process.env.STORE_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sparka-')), 'store.json');
process.env.STORE_DRIVER = 'memory';
process.env.OPENAI_API_KEY = 'test-key';
process.env.CHAT_MODEL = 'test-model';
for (const key of ['ZOHO_WEBFORM_XNQSJSDP', 'ZOHO_WEBFORM_XMIWTLD']) process.env[key] = '';

const { createApp } = await import('../src/app.js');
const { transcribeAudio } = await import('../src/modules/discovery/transcribe.service.js');
const { setOpenAIForTests } = await import('../src/integrations/openai/client.js');

const audio = Buffer.alloc(4096, 1);
const fakeClient = (text, calls = []) => ({
  calls,
  audio: {
    transcriptions: {
      create: async (params) => {
        calls.push(params);
        return { text };
      },
    },
  },
});

let server;
let base;
before(() => {
  server = createApp().listen(0);
  base = `http://localhost:${server.address().port}/api/discovery/transcribe`;
});
after(() => server.close());

test('transcribeAudio sends the recording to the transcription model and trims the text', async () => {
  const client = fakeClient('  We run 40 vans.  ');
  const out = await transcribeAudio(audio, 'audio/webm;codecs=opus', { client, model: 'm' });
  assert.deepEqual(out, { text: 'We run 40 vans.' });
  assert.equal(client.calls[0].model, 'm');
  assert.equal(client.calls[0].file.name, 'speech.webm');
  assert.match(client.calls[0].prompt, /fleet/);
});

test('transcribeAudio rejects unsupported formats, tiny recordings and silence', async () => {
  const client = fakeClient('hi');
  await assert.rejects(transcribeAudio(audio, 'video/mp4', { client }), { status: 415 });
  await assert.rejects(transcribeAudio(Buffer.alloc(10), 'audio/webm', { client }), { status: 422 });
  await assert.rejects(transcribeAudio(audio, 'audio/webm', { client: fakeClient('   ') }), { status: 422 });
});

test('POST /discovery/transcribe accepts a raw audio body and returns the transcript', async () => {
  const client = fakeClient('Forward-facing cameras for 12 trucks.');
  setOpenAIForTests(client);
  const res = await fetch(base, { method: 'POST', headers: { 'content-type': 'audio/mp4' }, body: audio });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { text: 'Forward-facing cameras for 12 trucks.' });
  assert.equal(client.calls[0].file.name, 'speech.mp4');
});

test('POST /discovery/transcribe with a non-audio body → 415', async () => {
  const res = await fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 415);
});
