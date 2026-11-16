import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { validate } from '../../middleware/validate.js';
import { catalogQuerySchema, contactQuerySchema } from '@konter/shared';
import { contactLimiter } from '../../middleware/rate-limit.js';

const router = Router();
const controller = new CatalogController();

router.get('/settings', controller.getSettings);
router.get('/providers', controller.getProviders);
router.get('/regions', controller.getRegions);
router.get('/locations', controller.getLocations);
router.get('/counters', validate(catalogQuerySchema, 'query'), controller.getCounters);
router.get('/counters/:id', controller.getCounterDetail);
router.get('/contact', contactLimiter, validate(contactQuerySchema, 'query'), controller.getContact);

export default router;

