import OpenAI from 'openai';
import { config } from '../../config/index.js';

let client = null;

// Created on first use so the API starts fine without an OpenAI key (chat is then disabled).
export function getOpenAI() {
  if (!client) client = new OpenAI({ apiKey: config.chat.apiKey, timeout: 60_000, maxRetries: 1 });
  return client;
}

export function setOpenAIForTests(fake) {
  client = fake;
}
