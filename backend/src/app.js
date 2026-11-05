import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler, notFound } from './core/middleware/error-handler.js';
import { attachRepository } from './repositories/index.js';
import routes from './routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins.length ? config.corsOrigins : false,
      methods: ['GET', 'POST', 'PUT'],
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', attachRepository, routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
