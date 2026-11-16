import { Router } from 'express';
import { RegionController } from './region.controller.js';
import { validate } from '../../middleware/validate.js';
import { regionSchema } from '@konter/shared';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';

const router = Router();
const controller = new RegionController();

router.use(requireAdmin);

router.get('/', controller.list);
router.post('/', checkOrigin, csrfSynchronisedProtection, validate(regionSchema), controller.create);
router.patch('/:id', checkOrigin, csrfSynchronisedProtection, validate(regionSchema), controller.update);
router.delete('/:id', checkOrigin, csrfSynchronisedProtection, controller.remove);

export default router;

