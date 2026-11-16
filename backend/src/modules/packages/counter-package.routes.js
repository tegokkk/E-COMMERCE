import { Router } from 'express';
import { counterPackageCreateSchema, counterPackageParamsSchema, packageListQuerySchema, packageUpdateSchema } from '@konter/shared';
import { PackageController } from './package.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';

const router = Router({ mergeParams: true });
const controller = new PackageController();
const params = validate(counterPackageParamsSchema, 'params');

router.use(requireAdmin);
router.get('/', params, validate(packageListQuerySchema, 'query'), controller.list);
router.post('/', params, checkOrigin, csrfSynchronisedProtection, validate(counterPackageCreateSchema), controller.create);
router.get('/:id', params, controller.getById);
router.patch('/:id', params, checkOrigin, csrfSynchronisedProtection, validate(packageUpdateSchema), controller.update);
router.delete('/:id', params, checkOrigin, csrfSynchronisedProtection, controller.remove);

export default router;
