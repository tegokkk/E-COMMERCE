import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { Router } from 'express';
import { db } from '../../database/connection.js';
import { env } from '../../config/env.js';
import { cleanupCounterPhotos } from '../uploads/upload-storage.js';

const router = Router();
router.get('/internal/maintenance', async (req, res, next) => {
  const expected = env.CRON_SECRET ? Buffer.from(`Bearer ${env.CRON_SECRET}`) : null;
  const supplied = Buffer.from(req.get('authorization') || '');
  if (!expected || expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Akses ditolak.' } });
  }
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const analytics = await db('analytics_events').where('created_at', '<', cutoff).del();
    const sessions = await db('admin_sessions').where('expire', '<', db.fn.now()).del();
    const rateLimits = await db('rate_limit_counters').where('reset_at', '<', db.fn.now()).del();
    const photos = await cleanupCounterPhotos(db);
    res.json({ data: { analytics, sessions, rateLimits, photos } });
  } catch (error) { next(error); }
});
export default router;
