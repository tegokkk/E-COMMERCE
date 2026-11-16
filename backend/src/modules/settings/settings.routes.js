import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { validate } from '../../middleware/validate.js';
import { platformSettingsUpdateSchema } from '@konter/shared';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';

const router = Router();
const controller = new SettingsController();

router.use(requireAdmin);

router.get('/', controller.get);
router.patch('/', checkOrigin, csrfSynchronisedProtection, validate(platformSettingsUpdateSchema), controller.update);

export default router;

