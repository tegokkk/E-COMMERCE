import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import counterRoutes from './modules/counters/counter.routes.js';
import packageRoutes from './modules/packages/package.routes.js';
import providerRoutes from './modules/providers/provider.routes.js';
import regionRoutes from './modules/regions/region.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import overviewRoutes from './modules/overview/overview.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import { adminUploadRoutes, publicUploadRoutes } from './modules/uploads/upload.routes.js';
import { db } from './database/connection.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';

const router = Router();

// Endpoint Health Check
router.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      service: 'konterkuota-backend',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      service: 'konterkuota-backend',
      timestamp: new Date().toISOString(),
    });
  }
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/public', catalogRoutes);
router.use('/uploads', publicUploadRoutes);
router.use('/admin/uploads', adminUploadRoutes);
router.use('/admin/counters', counterRoutes);
router.use('/admin/packages', packageRoutes);
router.use('/admin/providers', providerRoutes);
router.use('/admin/regions', regionRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin/overview', overviewRoutes);
router.use('/', analyticsRoutes);
router.use('/', maintenanceRoutes);

export default router;

