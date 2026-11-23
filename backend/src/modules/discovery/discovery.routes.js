import express, { Router } from 'express';
import { asyncHandler } from '../../core/http-error.js';
import { submitLimiter } from '../../core/middleware/rate-limit.js';
import * as controller from './discovery.controller.js';
import { AUDIO_TYPES, MAX_AUDIO_BYTES, baseType } from './transcribe.service.js';

const router = Router();

router.get('/questions', controller.getQuestions);
router.post('/organize', submitLimiter, asyncHandler(controller.organize));
// Raw audio body (not multipart): Content-Type is the recording's MIME type.
const audioBody = express.raw({ type: (req) => baseType(req.headers['content-type']) in AUDIO_TYPES, limit: MAX_AUDIO_BYTES });
router.post('/transcribe', submitLimiter, audioBody, asyncHandler(controller.transcribe));
router.post('/drafts', submitLimiter, asyncHandler(controller.createDraft));
router.get('/drafts/:token', asyncHandler(controller.getDraft));
router.put('/drafts/:token', submitLimiter, asyncHandler(controller.updateDraft));
router.post('/submissions', submitLimiter, asyncHandler(controller.submit));

export default router;
