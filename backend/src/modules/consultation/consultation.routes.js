import { Router } from 'express';
import { asyncHandler } from '../../core/http-error.js';
import { submitLimiter } from '../../core/middleware/rate-limit.js';
import { publicReceipt } from '../submissions/submission.service.js';
import { requestConsultation } from './consultation.service.js';

const router = Router();

router.post(
  '/',
  submitLimiter,
  asyncHandler(async (req, res) => {
    const submission = await requestConsultation(req.repo, req.body);
    res.status(201).json(publicReceipt(submission));
  })
);

export default router;
