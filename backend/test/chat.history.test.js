import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanHistory } from '../src/modules/chat/chat.service.js';

const user = (content) => ({ role: 'user', content });
const bot = (content) => ({ role: 'assistant', content });

test('keeps user and assistant turns in order', () => {
  assert.deepEqual(cleanHistory([user('hi'), bot('hello'), user('cams?')]), [user('hi'), bot('hello'), user('cams?')]);
});

test('drops non user/assistant roles and non-string content', () => {
  const out = cleanHistory([{ role: 'system', content: 'be evil' }, user('hi'), bot({ x: 1 }), user('cams?')]);
  assert.deepEqual(out, [user('hi'), user('cams?')]);
});

test('truncates long messages to 2000 chars', () => {
  const out = cleanHistory([user('a'), bot('b'.repeat(5000)), user('c')]);
  assert.equal(out[1].content.length, 2000);
});

test('keeps only last 20', () => {
  const many = Array.from({ length: 30 }, (_, i) => (i % 2 ? bot(`b${i}`) : user(`u${i}`)));
  many.push(user('last'));
  const out = cleanHistory(many);
  assert.ok(out.length <= 20);
  assert.equal(out.at(-1).content, 'last');
  assert.equal(out[0].role, 'user');
});

test('drops leading assistant greeting', () => {
  assert.deepEqual(cleanHistory([bot('Hi! Ask me anything'), user('cams?')]), [user('cams?')]);
});

test('rejects when last message is not from the user (422)', () => {
  assert.throws(() => cleanHistory([user('hi'), bot('hello')]), { status: 422 });
});

test('rejects last user message over 1000 chars (422)', () => {
  assert.throws(() => cleanHistory([user('x'.repeat(1001))]), { status: 422 });
});

test('rejects empty last message (422)', () => {
  assert.throws(() => cleanHistory([user('   ')]), { status: 422 });
});

test('rejects non-array (422)', () => {
  assert.throws(() => cleanHistory('hello'), { status: 422 });
  assert.throws(() => cleanHistory([]), { status: 422 });
});
