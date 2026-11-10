import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSystemPrompt } from '../src/modules/chat/chat.prompt.js';
import { CATEGORIES } from '../src/modules/products/products.validation.js';

test('contains every category', () => {
  const prompt = buildSystemPrompt(CATEGORIES);
  for (const category of CATEGORIES) assert.ok(prompt.includes(category), category);
});

test('forbids prices', () => {
  assert.ok(buildSystemPrompt(CATEGORIES).includes('Never state or estimate prices, discounts, quotes, or delivery costs.'));
});

test('is deterministic', () => {
  assert.equal(buildSystemPrompt(CATEGORIES), buildSystemPrompt(CATEGORIES));
});

test('requires search before naming products and gates request_follow_up on consent', () => {
  const prompt = buildSystemPrompt(CATEGORIES);
  assert.ok(prompt.includes('search_products'));
  assert.ok(prompt.includes('request_follow_up'));
  assert.match(prompt, /consent: true/);
});
