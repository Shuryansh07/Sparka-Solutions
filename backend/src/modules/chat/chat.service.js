import { HttpError } from '../../core/http-error.js';

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;
const MAX_USER_CHARS = 1000;

// Turns whatever the browser sent into a safe Responses API `input`: text-only user/assistant
// turns, capped in count and length, starting with the visitor and ending with their new message.
export function cleanHistory(messages) {
  if (!Array.isArray(messages)) throw new HttpError(422, 'Send the conversation as an array of messages.');

  const last = messages.at(-1);
  if (last?.role !== 'user' || typeof last.content !== 'string' || !last.content.trim()) {
    throw new HttpError(422, 'The last message must be your question.');
  }
  if (last.content.length > MAX_USER_CHARS) {
    throw new HttpError(422, `Please keep messages under ${MAX_USER_CHARS} characters.`);
  }

  const turns = messages
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_MESSAGES);
  while (turns[0]?.role === 'assistant') turns.shift();
  return turns;
}
