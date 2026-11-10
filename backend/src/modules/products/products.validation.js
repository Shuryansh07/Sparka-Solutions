import fs from 'node:fs';
import { HttpError } from '../../core/http-error.js';
import { cleanText } from '../../core/validation.js';

const SKU = /^[A-Za-z0-9-]{2,64}$/;

const library = JSON.parse(
  fs.readFileSync(new URL('../discovery/data/question-library.json', import.meta.url), 'utf8')
);
const VEHICLE_TYPES = library.questions.find((q) => q.id === 'vehicleTypes').options;
// The approved categories: the "interests" options of the management-approved question library.
export const CATEGORIES = library.questions.find((q) => q.id === 'interests').options;

// Spec rows that could carry pricing are dropped too, not just a top-level price field.
const PRICE_LIKE = /price|pricing|cost|msrp|discount/i;

function cleanSpecs(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const specs = {};
  for (const [key, value] of Object.entries(input).slice(0, 30)) {
    const k = cleanText(key, 80);
    const v = cleanText(typeof value === 'number' ? String(value) : value, 200);
    if (k && v && !PRICE_LIKE.test(k)) specs[k] = v;
  }
  return specs;
}

// Shapes one catalog row. Unknown fields (including any price) are dropped on purpose:
// the assistant must never be able to quote prices.
export function cleanProduct(input = {}, categories) {
  const src = input && typeof input === 'object' ? input : {};
  const product = {
    sku: cleanText(src.sku, 64),
    name: cleanText(src.name, 160),
    brand: cleanText(src.brand, 80),
    category: cleanText(src.category, 60),
    summary: cleanText(src.summary, 280),
    description: cleanText(src.description, 4000),
    specs: cleanSpecs(src.specs),
    vehicleTypes: Array.isArray(src.vehicleTypes) ? src.vehicleTypes.filter((v) => VEHICLE_TYPES.includes(v)) : [],
    tags: Array.isArray(src.tags)
      ? src.tags.map((t) => cleanText(t, 40).toLowerCase()).filter(Boolean).slice(0, 20)
      : [],
    active: src.active !== false,
  };

  const errors = {};
  if (!SKU.test(product.sku)) errors.sku = 'SKU must be 2-64 letters, numbers or dashes.';
  if (!product.name) errors.name = 'Name is required.';
  if (!categories.includes(product.category)) errors.category = 'Category must be one of the approved categories.';
  if (Object.keys(errors).length) throw new HttpError(422, 'Invalid product.', errors);
  return product;
}
