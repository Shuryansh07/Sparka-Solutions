import crypto from 'node:crypto';
import { syncSubmissionToCrm } from '../../integrations/zoho-crm/crm.service.js';
import { HttpError } from '../../core/http-error.js';

const ROUTE_LABEL = {
  guide: 'Guide Me',
  describe: "I'll Tell You What I Need",
  talk: "Let's Talk",
  chat: 'Chat Assistant',
};

function newReference() {
  return `SPK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function formatValue(answer) {
  if (answer.status === 'unsure') return "Not sure yet";
  if (answer.status === 'skipped') return 'Skipped';
  return Array.isArray(answer.value) ? answer.value.join(', ') : answer.value;
}

// Plain-text recap shared by the confirmation screen and the CRM note.
export function buildHeard({ route, answers = {}, narrative, organized, talk, chat, contact, readiness }, library) {
  const lines = [`Route: ${ROUTE_LABEL[route]}`];
  if (readiness) lines.push(`Readiness: ${readiness}`);

  if (route === 'guide') {
    for (const q of library.questions) {
      if (answers[q.id]) lines.push(`${q.prompt} ${formatValue(answers[q.id])}`);
    }
  }
  if (route === 'describe') {
    lines.push(`In their words: ${narrative}`);
    if (organized?.interests?.length) lines.push(`Areas: ${organized.interests.join(', ')}`);
    if (organized?.fleetSize) lines.push(`Fleet size: ${organized.fleetSize}`);
    if (organized?.timing) lines.push(`Timing: ${organized.timing}`);
    if (organized?.installation) lines.push(`Installation: ${organized.installation}`);
  }
  if (route === 'chat') {
    if (chat?.summary) lines.push(`Summary: ${chat.summary}`);
    if (chat?.skus?.length) lines.push(`Products discussed: ${chat.skus.join(', ')}`);
  }
  if (route === 'talk') {
    if (talk?.method) lines.push(`Preferred: ${talk.method}`);
    if (talk?.topic) lines.push(`Topic: ${talk.topic}`);
  }

  lines.push(
    `Contact: ${[contact.name, contact.company, contact.email, contact.phone].filter(Boolean).join(' | ')}`
  );
  if (contact.location) lines.push(`Location: ${contact.location}`);
  if (contact.bestTime) lines.push(`Best time: ${contact.bestTime}`);
  return lines;
}

export async function createSubmission(repo, data, library) {
  const submission = {
    reference: newReference(),
    createdAt: new Date().toISOString(),
    ...data,
    heard: buildHeard(data, library),
    crm: { status: 'pending', leadId: null, error: null },
  };
  await repo.createSubmission(submission);

  const crm = await syncSubmissionToCrm(submission);
  await repo.updateSubmission(submission.reference, { crm });
  return { ...submission, crm };
}

export async function retryCrmSync(repo, reference) {
  const submission = await repo.getSubmission(reference);
  if (!submission) throw new HttpError(404, 'Submission not found.');
  if (submission.crm.status === 'synced') return submission;

  const crm = await syncSubmissionToCrm(submission);
  return repo.updateSubmission(reference, { crm });
}

export const publicReceipt = (s) => ({
  reference: s.reference,
  route: s.route,
  createdAt: s.createdAt,
  heard: s.heard,
  readiness: s.readiness || null,
});
