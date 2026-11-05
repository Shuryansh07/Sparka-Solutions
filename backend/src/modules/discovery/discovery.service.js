import crypto from 'node:crypto';
import fs from 'node:fs';
import { config } from '../../config/index.js';
import { HttpError } from '../../core/http-error.js';
import { cleanContact, cleanText } from '../../core/validation.js';
import { createSubmission } from '../submissions/submission.service.js';
import { organize } from './summarizer.service.js';
import { ROUTES, assertToken, cleanAnswers, cleanOrganized } from './discovery.validation.js';

export const library = JSON.parse(
  fs.readFileSync(new URL('./data/question-library.json', import.meta.url), 'utf8')
);

const expiry = () => new Date(Date.now() + config.draftTtlDays * 86_400_000).toISOString();

// Research can begin once we know the area and the goal; quoting always needs a human consultation first.
function readinessOf({ route, answers, narrative, organized }) {
  const hasArea =
    answers?.interests?.status === 'answered' || (route === 'describe' && organized?.interests?.length);
  const hasGoal = answers?.objective?.status === 'answered' || (route === 'describe' && narrative);
  return hasArea && hasGoal ? 'Research ready' : 'Discovery incomplete';
}

function cleanDraftPayload(body = {}) {
  return {
    route: ROUTES.includes(body.route) ? body.route : 'guide',
    step: Number.isInteger(body.step) && body.step >= 0 && body.step < 50 ? body.step : 0,
    extended: Boolean(body.extended),
    answers: cleanAnswers(body.answers, library),
    narrative: cleanText(body.narrative, 8000),
    organized: cleanOrganized(body.organized, library),
    contact: cleanContact(body.contact, { required: false }),
  };
}

export function organizeText(text) {
  const clean = cleanText(text, 8000);
  if (clean.length < 10) throw new HttpError(422, 'Tell us a little more so we can organize it.');
  return organize(clean);
}

export async function createDraft(repo, body) {
  const draft = { token: crypto.randomBytes(16).toString('hex'), expiresAt: expiry(), ...cleanDraftPayload(body) };
  await repo.createDraft(draft);
  return { token: draft.token, expiresAt: draft.expiresAt };
}

export async function getDraft(repo, token) {
  const draft = await repo.getDraft(assertToken(token));
  if (!draft || new Date(draft.expiresAt) < new Date()) {
    throw new HttpError(404, 'That saved Discovery has expired or could not be found.');
  }
  const { rowId, ...rest } = draft;
  return rest;
}

export async function updateDraft(repo, token, body) {
  const updated = await repo.updateDraft(assertToken(token), { ...cleanDraftPayload(body), expiresAt: expiry() });
  if (!updated) throw new HttpError(404, 'That saved Discovery could not be found.');
  return { token, expiresAt: updated.expiresAt };
}

export async function submitDiscovery(repo, body = {}) {
  const route = body.route;
  if (route !== 'guide' && route !== 'describe') throw new HttpError(422, 'Unknown Discovery route.');

  const data = {
    route,
    answers: route === 'guide' ? cleanAnswers(body.answers, library) : {},
    narrative: route === 'describe' ? cleanText(body.narrative, 8000) : '',
    organized: route === 'describe' ? cleanOrganized(body.organized, library) : null,
    contact: cleanContact(body.contact),
  };
  if (route === 'describe' && data.narrative.length < 10) {
    throw new HttpError(422, 'Please describe what you need.', { narrative: 'Tell us a little more.' });
  }
  data.readiness = readinessOf(data);

  return createSubmission(repo, data, library);
}
