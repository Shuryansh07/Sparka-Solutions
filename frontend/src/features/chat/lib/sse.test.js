import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSseParser } from './sse.js';

test('parses complete events', () => {
  const parse = createSseParser();
  assert.deepEqual(parse('event: text\ndata: {"delta":"Hi"}\n\nevent: done\ndata: {}\n\n'), [
    { event: 'text', data: { delta: 'Hi' } },
    { event: 'done', data: {} },
  ]);
});

test('buffers events split across chunks', () => {
  const parse = createSseParser();
  assert.deepEqual(parse('event: text\ndata: {"del'), []);
  assert.deepEqual(parse('ta":"lo"}\n'), []);
  assert.deepEqual(parse('\n'), [{ event: 'text', data: { delta: 'lo' } }]);
});

test('handles CRLF line endings', () => {
  const parse = createSseParser();
  assert.deepEqual(parse('event: lead\r\ndata: {"reference":"SPK-ABC123"}\r\n\r\n'), [
    { event: 'lead', data: { reference: 'SPK-ABC123' } },
  ]);
});

test('skips malformed blocks instead of throwing', () => {
  const parse = createSseParser();
  assert.deepEqual(parse('event: text\ndata: {not json\n\nevent: done\ndata: {}\n\n'), [{ event: 'done', data: {} }]);
});
