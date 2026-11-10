import { z } from 'zod';
import { HttpError } from '../../core/http-error.js';
import { cleanContact, cleanText } from '../../core/validation.js';
import { library } from '../discovery/discovery.service.js';
import { getProduct, searchProducts } from '../products/catalog.service.js';
import { CATEGORIES, VEHICLE_TYPES } from '../products/products.validation.js';
import { createSubmission } from '../submissions/submission.service.js';

// OpenAI strict function tools: every property is required; optional ones are nullable.
const nullable = (schema) => ({ ...schema, type: [schema.type, 'null'] });
const strictTool = (name, description, properties) => ({
  type: 'function',
  name,
  description,
  strict: true,
  parameters: { type: 'object', properties, required: Object.keys(properties), additionalProperties: false },
});

const DEFINITIONS = [
  strictTool(
    'search_products',
    'Search the Sparka product catalog. Use it before naming or recommending any product. Returns short summaries; ' +
      'an empty list means nothing matched.',
    {
      query: nullable({ type: 'string', description: 'Keywords in English (translate if the visitor writes in another language), e.g. "dash cam vans". Null if filtering only.' }),
      category: { type: ['string', 'null'], enum: [...CATEGORIES, null], description: 'Approved category, or null.' },
      vehicleType: {
        type: ['string', 'null'],
        enum: [...VEHICLE_TYPES, null],
        description: 'The approved vehicle type closest to what the visitor described, or null if unclear.',
      },
      limit: nullable({ type: 'integer', description: 'Max results, 1-10. Null for the default of 5.' }),
    }
  ),
  strictTool('get_product', 'Get full details and specs for one product by its SKU from search results.', {
    sku: { type: 'string', description: 'The product SKU.' },
  }),
  strictTool(
    'request_follow_up',
    'Ask a Sparka representative to contact the visitor. Only call this after the visitor has typed their own name and ' +
      'an email or phone number in this chat AND said yes to being contacted. Never invent contact details.',
    {
      name: { type: 'string', description: "The visitor's name, as they typed it." },
      email: nullable({ type: 'string', description: 'Email they typed, or null.' }),
      phone: nullable({ type: 'string', description: 'Phone they typed, or null.' }),
      company: nullable({ type: 'string', description: 'Company they mentioned, or null.' }),
      summary: { type: 'string', description: 'One or two sentences on what they need, for the representative.' },
      skus: { type: ['array', 'null'], items: { type: 'string' }, description: 'SKUs discussed, or null.' },
      consent: { type: 'boolean', description: 'True only if the visitor explicitly agreed to be contacted.' },
    }
  ),
];

const SCHEMAS = {
  search_products: z.object({
    query: z.string().max(200).nullable(),
    category: z.enum(CATEGORIES).nullable(),
    vehicleType: z.string().max(80).nullable(),
    limit: z.number().int().min(1).max(10).nullable(),
  }),
  get_product: z.object({ sku: z.string().max(64) }),
  request_follow_up: z.object({
    name: z.string().max(120),
    email: z.string().max(254).nullable(),
    phone: z.string().max(25).nullable(),
    company: z.string().max(160).nullable(),
    summary: z.string().max(1000),
    skus: z.array(z.string().max(64)).max(20).nullable(),
    consent: z.boolean(),
  }),
};

export function createChatTools({ repo, emit }) {
  const handlers = {
    async search_products({ query, category, vehicleType, limit }) {
      const results = await searchProducts(repo, {
        query: query ?? undefined,
        category: category ?? undefined,
        vehicleType: vehicleType ?? undefined,
        limit: limit ?? undefined,
      });
      if (results.length) emit('products', { items: results });
      return { results };
    },

    async get_product({ sku }) {
      const product = await getProduct(repo, sku);
      return product ? { product } : { error: 'not_found' };
    },

    async request_follow_up({ name, email, phone, company, summary, skus, consent }) {
      if (!consent) return { error: 'consent_required' };
      let contact;
      try {
        contact = cleanContact({ name, email: email ?? '', phone: phone ?? '', company: company ?? '' });
      } catch (err) {
        if (err instanceof HttpError) return { error: 'contact_required', details: err.details };
        throw err;
      }
      const submission = await createSubmission(
        repo,
        { route: 'chat', contact, chat: { summary: cleanText(summary, 1000), skus: skus ?? [] } },
        library
      );
      emit('lead', { reference: submission.reference });
      return { reference: submission.reference };
    },
  };

  return {
    definitions: DEFINITIONS,

    // Always resolves to the JSON string sent back as function_call_output.output.
    async execute(name, argsJson) {
      const schema = SCHEMAS[name];
      if (!schema) return JSON.stringify({ error: 'unknown_tool' });
      let args;
      try {
        args = schema.parse(JSON.parse(argsJson));
      } catch {
        return JSON.stringify({ error: 'invalid_arguments' });
      }
      return JSON.stringify(await handlers[name](args));
    },
  };
}
