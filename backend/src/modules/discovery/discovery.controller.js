import { publicReceipt } from '../submissions/submission.service.js';
import * as discovery from './discovery.service.js';
import { transcribeAudio } from './transcribe.service.js';

export const getQuestions = (_req, res) => {
  const { version, maxQuestions, questions } = discovery.library;
  res.json({ version, maxQuestions, questions });
};

export const organize = async (req, res) => {
  res.json(await discovery.organizeText(req.body?.text));
};

export const transcribe = async (req, res) => {
  res.json(await transcribeAudio(req.body, req.headers['content-type']));
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
