import { Router } from 'express';
import { db } from '../../database/connection.js';
import { validate } from '../../middleware/validate.js';
import { analyticsEventSchema } from '@konter/shared';
import { eventsLimiter } from '../../middleware/rate-limit.js';
import { env } from '../../config/env.js';
import { checkOrigin } from '../../middleware/check-origin.js';

const router = Router();

router.post('/events', eventsLimiter, checkOrigin, validate(analyticsEventSchema), async (req, res, next) => {
  try {
    if (!env.ANALYTICS_ENABLED) {
      return res.status(204).end();
    }

    const { eventName, sessionId, properties } = req.body;

    // Only event-specific operational IDs and UI positions are accepted.
    const sanitizedProps = {};
    const allowedKeys = {
      page_view: [],
      directory_view: [],
      search_used: [],
      filter_applied: ['providerId', 'regionId'],
      counter_detail_opened: ['counterId', 'source'],
      whatsapp_clicked: ['counterId', 'packageId', 'buttonPosition'],
      partner_signup_clicked: ['buttonPosition'],
    };
    const idKeys = new Set(['counterId', 'packageId', 'providerId', 'regionId']);
    const guidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
    const buttonPositions = new Set(['counter_card', 'detail_modal_header', 'package_card', 'partner_section']);

    if (properties && typeof properties === 'object') {
      for (const [k, v] of Object.entries(properties)) {
        const safeId = idKeys.has(k) && (guidPattern.test(v)
          || (v === '' && (k === 'providerId' || k === 'regionId')));
        const safePosition = k === 'buttonPosition' && buttonPositions.has(v);
        const safeSource = k === 'source' && v === 'directory_card';
        if (allowedKeys[eventName]?.includes(k) && typeof v === 'string'
          && (safeId || safePosition || safeSource)) {
          sanitizedProps[k] = v;
        }
      }
    }

    await db('analytics_events').insert({
      event_name: eventName,
      session_id: sessionId,
      properties: JSON.stringify(sanitizedProps),
    });

    res.status(204).end();
  } catch (err) {
    // Analytics error must never block the client (PRD FR-14 / T10.05)
    next(err);
  }
});

export default router;

