import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, cleanProduct } from '../modules/products/products.validation.js';

// STORE_FILE lets tests point the store at a temp file.
const dataFile =
  process.env.STORE_FILE || path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.data'), 'store.json');
const dataDir = path.dirname(dataFile);
const seedFile = new URL('../modules/products/data/products.seed.json', import.meta.url);

const state = load();

function load() {
  try {
    return { products: {}, ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) };
  } catch {
    return { drafts: {}, submissions: {}, products: {} };
  }
}

// Dev convenience: an empty catalog is filled once from the placeholder seed file.
function ensureSeeded() {
  if (Object.keys(state.products).length) return;
  const { products } = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  for (const raw of products) {
    const product = cleanProduct(raw, CATEGORIES);
    state.products[product.sku] = product;
  }
  persist();
}

function persist() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

export const memoryRepository = {
  async listProducts() {
    ensureSeeded();
    return Object.values(state.products);
  },

  async upsertProducts(products) {
    ensureSeeded();
    let inserted = 0;
    let updated = 0;
    for (const product of products) {
      if (state.products[product.sku]) updated++;
      else inserted++;
      state.products[product.sku] = product;
    }
    persist();
    return { inserted, updated };
  },

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
