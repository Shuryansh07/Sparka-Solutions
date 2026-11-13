import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './core/middleware/error-handler.js';
import { IMPORT_PATH } from './modules/admin/products.admin.js';
import { attachRepository } from './repositories/index.js';
import routes from './routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  const json = express.json({ limit: '100kb' });
  // The admin product import parses its own larger body (see products.admin.js).
  app.use((req, res, next) => (req.path === IMPORT_PATH ? next() : json(req, res, next)));

  app.use('/api', attachRepository, routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
