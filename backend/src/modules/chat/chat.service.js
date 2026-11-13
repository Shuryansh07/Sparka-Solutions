import { config } from '../../config/index.js';
import { HttpError } from '../../core/http-error.js';
import { getOpenAI } from '../../integrations/openai/client.js';
import { CATEGORIES } from '../products/products.validation.js';
import { buildSystemPrompt } from './chat.prompt.js';
import { createChatTools } from './chat.tools.js';

const MAX_MODEL_CALLS = 6;
const REFUSAL_TEXT = 'I can’t help with that one, but a representative can. Want me to arrange a follow-up?';
const INSTRUCTIONS = buildSystemPrompt(CATEGORIES);

export class LoopLimitError extends Error {}

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

// One visitor turn: call the model, run any tools it asks for, feed the results back, and
// repeat (at most MAX_MODEL_CALLS times). Streams text through emit('text', { delta }).
export async function runChat({ repo, messages, emit, signal }) {
  const client = getOpenAI();
  const tools = createChatTools({ repo, emit });
  const input = [...messages];

  for (let call = 0; call < MAX_MODEL_CALLS; call++) {
    const stream = await client.responses.create(
      {
        model: config.chat.model,
        instructions: INSTRUCTIONS,
        input,
        tools: tools.definitions,
        store: false, // chats may contain contact details: don't keep them on OpenAI's side
        // Lets reasoning models continue statelessly; switchable for models that reject it.
        ...(config.chat.encryptedReasoning ? { include: ['reasoning.encrypted_content'] } : {}),
        stream: true,
        max_output_tokens: 4000,
      },
      { signal }
    );

    let final = null;
    let refused = false;
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') emit('text', { delta: event.delta });
      else if (event.type === 'response.refusal.delta') refused = true;
      else if (event.type === 'response.completed' || event.type === 'response.incomplete') final = event.response;
      else if (event.type === 'response.failed' || event.type === 'error') {
        throw new Error(`OpenAI response failed: ${event.response?.error?.code || event.code || 'unknown'}`);
      }
    }

    if (refused) {
      emit('text', { delta: REFUSAL_TEXT });
      return;
    }
    const calls = (final?.output || []).filter((item) => item.type === 'function_call');
    if (!calls.length) return;

    input.push(...final.output);
    for (const c of calls) {
      input.push({ type: 'function_call_output', call_id: c.call_id, output: await tools.execute(c.name, c.arguments) });
    }
  }
  throw new LoopLimitError(`Stopped after ${MAX_MODEL_CALLS} model calls`);
}
