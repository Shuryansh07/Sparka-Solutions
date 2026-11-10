import { createSseParser } from '../lib/sse';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getChatStatus() {
  try {
    const res = await fetch(`${BASE}/chat/status`);
    if (!res.ok) return { enabled: false };
    return { enabled: (await res.json()).enabled === true };
  } catch {
    return { enabled: false };
  }
}

// Streams one assistant reply. axios can't read a streaming body in the browser, so this uses
// fetch + ReadableStream. Resolves when the stream ends (or is aborted via `signal`).
export async function streamChat(messages, { onText, onProducts, onLead, onError, onDone }, signal) {
  let res;
  try {
    res = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    if (err.name !== 'AbortError') onError('We could not reach Sparka right now. Check your connection and try again.');
    return;
  }

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    onError(body.error || 'The assistant is unavailable right now.');
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  const parse = createSseParser();
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      for (const { event, data } of parse(value)) {
        if (event === 'text') onText(data.delta);
        else if (event === 'products') onProducts(data.items);
        else if (event === 'lead') onLead(data.reference);
        else if (event === 'error') onError(data.message);
        else if (event === 'done') onDone();
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') onError('The connection dropped. Please try again.');
  }
}
