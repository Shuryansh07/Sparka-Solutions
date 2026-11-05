import { publicReceipt } from '../submissions/submission.service.js';
import * as discovery from './discovery.service.js';

export const getQuestions = (_req, res) => {
  const { version, maxQuestions, questions } = discovery.library;
  res.json({ version, maxQuestions, questions });
};

export const organize = (req, res) => {
  res.json(discovery.organizeText(req.body?.text));
};

export const createDraft = async (req, res) => {
  res.status(201).json(await discovery.createDraft(req.repo, req.body));
};

export const getDraft = async (req, res) => {
  res.json(await discovery.getDraft(req.repo, req.params.token));
};

export const updateDraft = async (req, res) => {
  res.json(await discovery.updateDraft(req.repo, req.params.token, req.body));
};

export const submit = async (req, res) => {
  const submission = await discovery.submitDiscovery(req.repo, req.body);
  res.status(201).json(publicReceipt(submission));
};
