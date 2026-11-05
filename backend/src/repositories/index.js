import { config } from '../config/index.js';
import { memoryRepository } from './memory.repository.js';
import { createCatalystRepository } from './catalyst.repository.js';

export function attachRepository(req, _res, next) {
  try {
    req.repo = config.storeDriver === 'catalyst' ? createCatalystRepository(req) : memoryRepository;
    next();
  } catch (err) {
    next(err);
  }
}
