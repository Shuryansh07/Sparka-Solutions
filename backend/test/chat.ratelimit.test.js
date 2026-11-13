import assert from 'node:assert/strict';
import { test } from 'node:test';

// Chat disabled: requests still pass through the limiter first (then get 503).
process.env.CHAT_ENABLED = 'false';
const { createApp } = await import('../src/app.js');

test('rate limited after 20 requests in the window → 429', async () => {
  const server = createApp().listen(0);
  const url = `http://localhost:${server.address().port}/api/chat`;
  try {
    const statuses = [];
    for (let i = 0; i < 21; i++) {
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
      statuses.push(res.status);
    }
    assert.ok(statuses.slice(0, 20).every((s) => s === 503));
    assert.equal(statuses[20], 429);
  } finally {
    server.close();
  }
});
