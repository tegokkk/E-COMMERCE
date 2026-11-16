import { Router } from 'express';
import { db } from '../../database/connection.js';
import { requireAdmin } from '../../middleware/require-admin.js';

const router = Router();
router.use(requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    // 1. Counters summary
    const counterCounts = await db('counters')
      .select('publication_status')
      .count('id as count')
      .groupBy('publication_status');

    let totalCounters = 0;
    const countersByStatus = { draft: 0, published: 0, inactive: 0 };
    for (const r of counterCounts) {
      const c = parseInt(r.count, 10);
      countersByStatus[r.publication_status] = c;
      totalCounters += c;
    }

    // 2. Packages summary
    const packageCounts = await db('packages')
      .select('publication_status')
      .count('id as count')
      .groupBy('publication_status');

    let totalPackages = 0;
    const packagesByStatus = { draft: 0, published: 0, inactive: 0 };
    for (const r of packageCounts) {
      const c = parseInt(r.count, 10);
      packagesByStatus[r.publication_status] = c;
      totalPackages += c;
    }

    // 3. Active providers
    const activeProvidersCount = await db('providers')
      .count('id as count')
      .where({ is_active: true })
      .first();

    // 4. Regions with published counters
    const activeRegionsCount = await db('regions')
      .countDistinct('regions.id as count')
      .join('counters', 'counters.region_id', 'regions.id')
      .where('counters.publication_status', 'published')
      .first();

    // 5. Attention list
    // a. Counters without packages
    const countersWithoutPackages = await db('counters')
      .select('counters.id', 'counters.name', 'counters.publication_status as publicationStatus')
      .leftJoin('packages', 'packages.counter_id', 'counters.id')
      .whereNull('packages.id')
      .limit(5);

    // Summarize expiring packages by owner instead of mixing package rows.
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    const expiringCounters = await db('packages')
      .select('counters.id', 'counters.name')
      .count('packages.id as packageCount')
      .min('packages.display_until as nextDisplayUntil')
      .join('counters', 'counters.id', 'packages.counter_id')
      .whereNotNull('packages.display_until')
      .andWhere('packages.display_until', '<=', threeDaysLater)
      .andWhere('packages.publication_status', 'published')
      .groupBy('counters.id', 'counters.name')
      .orderBy('nextDisplayUntil')
      .limit(5);

    // c. Inactive providers
    const inactiveProviders = await db('providers')
      .select('id', 'name')
      .where({ is_active: false })
      .limit(5);

    res.json({
      data: {
        summary: {
          counters: {
            total: totalCounters,
            published: countersByStatus.published,
            draft: countersByStatus.draft,
            inactive: countersByStatus.inactive,
          },
          packages: {
            total: totalPackages,
            published: packagesByStatus.published,
            draft: packagesByStatus.draft,
            inactive: packagesByStatus.inactive,
          },
          activeProviders: parseInt(activeProvidersCount?.count || 0, 10),
          activeRegions: parseInt(activeRegionsCount?.count || 0, 10),
        },
        attention: {
          countersWithoutPackages: countersWithoutPackages.map((c) => ({
            id: c.id,
            name: c.name,
            publicationStatus: c.publicationStatus,
          })),
          expiringCounters: expiringCounters.map((counter) => ({
            ...counter,
            packageCount: Number(counter.packageCount),
          })),
          inactiveProviders: inactiveProviders.map((pr) => ({
            id: pr.id,
            name: pr.name,
          })),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

