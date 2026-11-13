import { Router } from 'express';
import { asyncHandler } from '../../core/http-error.js';
import { requireAdminKey } from '../../core/middleware/admin-auth.js';
import { retryCrmSync } from '../submissions/submission.service.js';
import { importJson, importProducts, listAllProducts } from './products.admin.js';

const router = Router();

router.use(requireAdminKey);

router.get('/products', listAllProducts);
router.post('/products/import', importJson, importProducts);

// Surfaces failed CRM syncs so staff can see and retry them instead of losing leads silently.
router.get(
  '/submissions',
  asyncHandler(async (req, res) => {
    const crmStatus = ['pending', 'synced', 'failed', 'skipped'].includes(req.query.crmStatus)
      ? req.query.crmStatus
      : undefined;
    res.json(await req.repo.listSubmissions({ crmStatus }));
  })
);

router.post(
  '/submissions/:reference/retry-crm',
  asyncHandler(async (req, res) => {
    res.json(await retryCrmSync(req.repo, req.params.reference));
  })
);

export default router;
