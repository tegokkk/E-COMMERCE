import { z } from 'zod';
import { ANALYTICS_EVENT_NAMES } from '../constants/analytics-events.js';

export const analyticsEventSchema = z.object({
  eventName: z.enum(ANALYTICS_EVENT_NAMES, {
    error: 'Nama event analitik tidak diizinkan',
  }),
  sessionId: z
    .string({ error: 'ID sesi anonim wajib diisi' })
    .regex(/^sid_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'ID sesi tidak valid'),
  properties: z
    .record(z.string().max(50), z.union([z.string().max(100), z.number(), z.boolean(), z.null()]))
    .optional()
    .default({}),
});

