import express from 'express';
import { HttpError, asyncHandler } from '../../core/http-error.js';
import { invalidateCatalog } from '../products/catalog.service.js';
import { CATEGORIES, cleanProduct } from '../products/products.validation.js';

const MAX_ROWS = 500;

// The import body can be far larger than the app-wide 100kb JSON limit (app.js skips that
// parser for this path), so this route parses with its own 2mb limit.
export const IMPORT_PATH = '/api/admin/products/import';
export const importJson = express.json({ limit: '2mb' });

// Valid rows are upserted; invalid rows are reported back. Never all-or-nothing, so one bad
// row in a spreadsheet export doesn't block the rest of the catalog.
export const importProducts = asyncHandler(async (req, res) => {
  const rows = req.body?.products;
  if (!Array.isArray(rows)) throw new HttpError(422, 'Send { "products": [...] }.');
  if (rows.length > MAX_ROWS) throw new HttpError(422, `Import at most ${MAX_ROWS} products per request.`);

  const valid = [];
  const rejected = [];
  rows.forEach((row, index) => {
    try {
      valid.push(cleanProduct(row, CATEGORIES));
    } catch (err) {
      if (!(err instanceof HttpError)) throw err;
      rejected.push({ index, sku: typeof row?.sku === 'string' ? row.sku : null, errors: err.details });
    }
  });

  const result = valid.length ? await req.repo.upsertProducts(valid) : { inserted: 0, updated: 0 };
  invalidateCatalog();
  res.json({ ...result, rejected });
});

export const listAllProducts = asyncHandler(async (req, res) => {
  res.json(await req.repo.listProducts());
});
