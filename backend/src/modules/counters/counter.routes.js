import { Router } from 'express';
import { CounterController } from './counter.controller.js';
import { validate } from '../../middleware/validate.js';
import { counterCreateSchema, counterUpdateSchema } from '@konter/shared';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';
import counterPackageRoutes from '../packages/counter-package.routes.js';

const router = Router();
const controller = new CounterController();

router.use(requireAdmin);
router.use('/:counterId/packages', counterPackageRoutes);

router.get('/', controller.list);
router.post('/', checkOrigin, csrfSynchronisedProtection, validate(counterCreateSchema), controller.create);
router.get('/:id/impact', controller.getImpact);
router.get('/:id', controller.getById);
router.patch('/:id', checkOrigin, csrfSynchronisedProtection, validate(counterUpdateSchema), controller.update);
router.delete('/:id', checkOrigin, csrfSynchronisedProtection, controller.remove);

export default router;

