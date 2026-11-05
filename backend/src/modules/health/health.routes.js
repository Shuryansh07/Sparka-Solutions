import { Router } from 'express';
import { config } from '../../config/index.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', store: config.storeDriver, crm: config.crmEnabled ? 'configured' : 'not-configured' });
});

export default router;
