// In-process catalog cache + keyword search. Search runs over the cached array only, so no
// model- or visitor-supplied text ever reaches a database query.
const TTL_MS = 5 * 60 * 1000;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

let cache = null; // { products, loadedAt }

export function invalidateCatalog() {
  cache = null;
}

async function activeProducts(repo) {
  if (!cache || Date.now() - cache.loadedAt > TTL_MS) {
    const products = await repo.listProducts();
    cache = { products: products.filter((p) => p.active !== false), loadedAt: Date.now() };
  }
  return cache.products;
}

const toSummary = ({ sku, name, brand, category, summary }) => ({ sku, name, brand, category, summary });

function score(product, words) {
  const name = product.name.toLowerCase();
  const tags = product.tags.join(' ');
  const brandCategory = `${product.brand} ${product.category}`.toLowerCase();
  const text = `${product.summary} ${product.description}`.toLowerCase();
  let total = 0;
  for (const word of words) {
    if (name.includes(word)) total += 5;
    if (tags.includes(word)) total += 3;
    if (brandCategory.includes(word)) total += 2;
    if (text.includes(word)) total += 1;
  }
  return total;
}

export async function searchProducts(repo, { query, category, vehicleType, limit } = {}) {
  const words = String(query || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
  if (!words.length && !category && !vehicleType) return [];

  const max = Math.min(Math.max(Number.isInteger(limit) ? limit : DEFAULT_LIMIT, 1), MAX_LIMIT);
  return (await activeProducts(repo))
    .filter((p) => !category || p.category === category)
    .filter((p) => !vehicleType || p.vehicleTypes.includes(vehicleType))
    .map((p) => ({ p, s: words.length ? score(p, words) : 1 }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
    .slice(0, max)
    .map(({ p }) => toSummary(p));
}

export async function getProduct(repo, sku) {
  return (await activeProducts(repo)).find((p) => p.sku === sku) || null;
}
