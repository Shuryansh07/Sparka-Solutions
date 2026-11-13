import rateLimit from 'express-rate-limit';

export const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
});

// Each chat message costs a model call, so the assistant gets its own, tighter budget.
export const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'You’ve sent a lot of messages. Please wait a few minutes and try again.' },
});
