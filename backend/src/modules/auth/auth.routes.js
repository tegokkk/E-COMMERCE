import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema } from '@konter/shared';
import { loginLimiter } from '../../middleware/rate-limit.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';

const router = Router();
const controller = new AuthController();

router.get('/csrf', controller.getCsrf);
router.post('/login', loginLimiter, checkOrigin, csrfSynchronisedProtection, validate(loginSchema), controller.login);
router.get('/me', requireAdmin, controller.getMe);
router.post('/logout', checkOrigin, csrfSynchronisedProtection, requireAdmin, controller.logout);

export default router;

