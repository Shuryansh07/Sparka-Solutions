import crypto from 'node:crypto';
import { config } from '../../config/index.js';
import { HttpError } from '../http-error.js';

export function requireAdminKey(req, _res, next) {
  const provided = Buffer.from(String(req.get('x-admin-key') || ''));
  const expected = Buffer.from(config.adminApiKey);
  const ok =
    expected.length > 0 && provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  next(ok ? undefined : new HttpError(401, 'Unauthorized'));
}
