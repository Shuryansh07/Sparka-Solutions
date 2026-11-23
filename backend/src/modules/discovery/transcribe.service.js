// Speech-to-text for the "I'll Tell You What I Need" path: the browser records the customer
// while they hold the mic button and uploads the raw audio; we return the transcript, which
// the page adds to the notes before organizing them.

import { toFile } from 'openai';
import { config } from '../../config/index.js';
import { HttpError } from '../../core/http-error.js';
import { getOpenAI } from '../../integrations/openai/client.js';

// Formats MediaRecorder produces (Chrome/Firefox: webm/ogg, Safari: mp4) plus common uploads.
export const AUDIO_TYPES = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/x-m4a': 'm4a',
};
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // ~10 minutes of opus; the page caps recordings at 2.
const MIN_AUDIO_BYTES = 1024;

// Domain words improve recognition of fleet jargon and brand-style terms.
const PROMPT =
  'A fleet manager describing what they need: vans, pickups, semis, trailers, dash cams, forward-facing cameras, GPS tracking, telematics, ELD, upfitting, racks, LED lighting, installation, budget.';

export const baseType = (contentType = '') => contentType.split(';')[0].trim().toLowerCase();

export async function transcribeAudio(buffer, contentType, { client = getOpenAI(), model = config.transcribeModel } = {}) {
  if (!config.chat.apiKey) throw new HttpError(503, 'Voice input is not available right now. Please type your notes.');
  const type = baseType(contentType);
  const ext = AUDIO_TYPES[type];
  if (!ext) throw new HttpError(415, 'Unsupported audio format.');
  if (!Buffer.isBuffer(buffer) || buffer.length < MIN_AUDIO_BYTES) {
    throw new HttpError(422, 'That recording was too short. Hold the button while you speak.');
  }

  const result = await client.audio.transcriptions.create(
    { file: await toFile(buffer, `speech.${ext}`, { type }), model, prompt: PROMPT, response_format: 'json' },
    { timeout: 60_000 }
  );
  const text = (result?.text || '').trim();
  if (!text) throw new HttpError(422, 'We couldn’t hear anything in that recording. Please try again.');
  return { text: text.slice(0, 8000) };
}
