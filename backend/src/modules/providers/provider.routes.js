import { Router } from 'express';
import { ProviderController } from './provider.controller.js';
import { validate } from '../../middleware/validate.js';
import { providerSchema, providerUpdateSchema } from '@konter/shared';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';

const router = Router();
const controller = new ProviderController();

router.use(requireAdmin);

router.get('/', controller.list);
router.post('/', checkOrigin, csrfSynchronisedProtection, validate(providerSchema), controller.create);
router.patch('/:id', checkOrigin, csrfSynchronisedProtection, validate(providerUpdateSchema), controller.update);
router.get('/:id/impact', controller.getImpact);
router.delete('/:id', checkOrigin, csrfSynchronisedProtection, controller.remove);

export default router;

