import { Router } from 'express';
import { PackageController } from './package.controller.js';
import { validate } from '../../middleware/validate.js';
import { packageCreateSchema, packageUpdateSchema, packageListQuerySchema } from '@konter/shared';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';

const router = Router();
const controller = new PackageController();

router.use(requireAdmin);

router.get('/', validate(packageListQuerySchema, 'query'), controller.list);
router.post('/', checkOrigin, csrfSynchronisedProtection, validate(packageCreateSchema), controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', checkOrigin, csrfSynchronisedProtection, validate(packageUpdateSchema), controller.update);
router.delete('/:id', checkOrigin, csrfSynchronisedProtection, controller.remove);

export default router;

