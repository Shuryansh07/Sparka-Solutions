import { Router } from 'express';
import { config } from '../../config/index.js';
import { HttpError } from '../../core/http-error.js';
import { chatLimiter } from '../../core/middleware/rate-limit.js';
import { cleanHistory, runChat } from './chat.service.js';

const UNAVAILABLE = 'The assistant is unavailable right now. You can still send us your details.';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({ enabled: config.chat.enabled });
});

router.post('/', chatLimiter, async (req, res, next) => {
  if (!config.chat.enabled) return next(new HttpError(503, 'The assistant is not available.'));

  let messages;
  try {
    messages = cleanHistory(req.body?.messages);
  } catch (err) {
    return next(err);
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // ask proxies not to buffer the stream
  });
  res.flushHeaders();

  const send = (event, data) => {
    if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Stop paying for tokens nobody will read when the visitor closes the chat mid-reply.
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) abort.abort();
  });

  try {
    await runChat({ repo: req.repo, messages, emit: send, signal: abort.signal });
  } catch (err) {
    if (!abort.signal.aborted) {
      // Log the kind of failure only: messages and errors may contain contact details.
      console.error(`[chat] ${err.name}${err.status ? ` ${err.status}` : ''}`);
      send('error', { message: UNAVAILABLE });
    }
  }
  send('done', {});
  res.end();
});

export default router;
