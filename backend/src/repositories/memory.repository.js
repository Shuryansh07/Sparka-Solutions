import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.data');
const dataFile = path.join(dataDir, 'store.json');

const state = load();

function load() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return { drafts: {}, submissions: {} };
  }
}

function persist() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

export const memoryRepository = {
  async createDraft(draft) {
    state.drafts[draft.token] = draft;
    persist();
    return draft;
  },

  async getDraft(token) {
    return state.drafts[token] || null;
  },

  async updateDraft(token, patch) {
    if (!state.drafts[token]) return null;
    state.drafts[token] = { ...state.drafts[token], ...patch };
    persist();
    return state.drafts[token];
  },

  async createSubmission(submission) {
    state.submissions[submission.reference] = submission;
    persist();
    return submission;
  },

  async getSubmission(reference) {
    return state.submissions[reference] || null;
  },

  async updateSubmission(reference, patch) {
    if (!state.submissions[reference]) return null;
    state.submissions[reference] = { ...state.submissions[reference], ...patch };
    persist();
    return state.submissions[reference];
  },

  async listSubmissions({ crmStatus } = {}) {
    return Object.values(state.submissions)
      .filter((s) => !crmStatus || s.crm.status === crmStatus)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
