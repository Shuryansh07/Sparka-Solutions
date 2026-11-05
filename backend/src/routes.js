import { Router } from 'express';
import adminRoutes from './modules/admin/admin.routes.js';
import consultationRoutes from './modules/consultation/consultation.routes.js';
import discoveryRoutes from './modules/discovery/discovery.routes.js';
import healthRoutes from './modules/health/health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/consultations', consultationRoutes);
router.use('/admin', adminRoutes);

export default router;
