import { HttpError } from '../../core/http-error.js';
import { cleanText } from '../../core/validation.js';

export const ROUTES = ['guide', 'describe', 'talk'];
const ANSWER_STATUSES = ['answered', 'unsure', 'skipped'];

export function cleanAnswers(input, library) {
  if (!input || typeof input !== 'object') return {};
  const byId = new Map(library.questions.map((q) => [q.id, q]));
  const answers = {};

  for (const [id, raw] of Object.entries(input)) {
    const question = byId.get(id);
    if (!question || !raw || !ANSWER_STATUSES.includes(raw.status)) continue;
    if (raw.status !== 'answered') {
      answers[id] = { status: raw.status, value: null };
      continue;
    }

    let value;
    if (question.type === 'multi') {
      value = Array.isArray(raw.value) ? raw.value.filter((v) => question.options.includes(v)) : [];
      if (!value.length) continue;
    } else if (question.type === 'single') {
      if (!question.options.includes(raw.value)) continue;
      value = raw.value;
    } else {
      value = cleanText(raw.value, 4000);
      if (!value) continue;
    }
    answers[id] = { status: 'answered', value };
  }
  return answers;
}

export function cleanOrganized(rawInput, library) {
  // Optional suggestions: null or any non-object means "none".
  const input = rawInput && typeof rawInput === 'object' && !Array.isArray(rawInput) ? rawInput : {};
  const options = (id) => library.questions.find((q) => q.id === id).options;
  const someOf = (values, id) => (Array.isArray(values) ? values.filter((v) => options(id).includes(v)) : []);
  const oneOf = (value, id) => (options(id).includes(value) ? value : '');
  return {
    interests: someOf(input.interests, 'interests'),
    fleetSize: cleanText(input.fleetSize, 20),
    timing: cleanText(input.timing, 40),
    installation: cleanText(input.installation, 40),
    // Extra Lead fields filled by the AI organizer (absent from older drafts).
    vehicleTypes: someOf(input.vehicleTypes, 'vehicleTypes'),
    currentSolution: oneOf(input.currentSolution, 'currentSolution'),
    objective: cleanText(input.objective, 4000),
    mustHaves: cleanText(input.mustHaves, 4000),
    budget: cleanText(input.budget, 255),
    location: cleanText(input.location, 255),
  };
}

export function assertToken(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{32}$/.test(token)) {
    throw new HttpError(404, 'We could not find that saved Discovery.');
  }
  return token;
}
