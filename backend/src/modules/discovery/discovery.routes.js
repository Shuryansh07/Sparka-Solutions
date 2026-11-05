import { Router } from 'express';
import { asyncHandler } from '../../core/http-error.js';
import { submitLimiter } from '../../core/middleware/rate-limit.js';
import * as controller from './discovery.controller.js';

const router = Router();

router.get('/questions', controller.getQuestions);
router.post('/organize', submitLimiter, controller.organize);
router.post('/drafts', submitLimiter, asyncHandler(controller.createDraft));
router.get('/drafts/:token', asyncHandler(controller.getDraft));
router.put('/drafts/:token', submitLimiter, asyncHandler(controller.updateDraft));
router.post('/submissions', submitLimiter, asyncHandler(controller.submit));

export default router;
