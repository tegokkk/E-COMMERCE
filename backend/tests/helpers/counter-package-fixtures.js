import { randomUUID } from 'node:crypto';
import { db } from '../../src/database/connection.js';
import { env } from '../../src/config/env.js';
import { hashPassword } from '../../src/lib/password.js';

// Add and remove only records owned by this run. Never seed/reset an existing DB.
export async function createCounterPackageFixtures() {
  if (env.NODE_ENV !== 'test' || !env.TEST_DATABASE_URL || env.TEST_DATABASE_URL === env.DATABASE_URL) {
    throw new Error('Counter package checks require a separate TEST_DATABASE_URL.');
  }
  // Playwright can reuse a worker after another suite has closed its pool.
  if (!db.client.pool) db.initialize();
  const database = (await db.raw('select current_database() as name')).rows[0].name;
  if (!database.endsWith('_test')) throw new Error('Refusing to write outside a test database.');

  const runId = randomUUID();
  const adminId = randomUUID();
  const regionId = randomUUID();
  const providerId = randomUUID();
  const otherProviderId = randomUUID();
  const counterA = randomUUID();
  const counterB = randomUUID();
  const draftCounter = randomUUID();
  const emptyCounter = randomUUID();
  const packageA = randomUUID();
  const packageB = randomUUID();
  const email = `package-check-${runId}@example.test`;
  const password = `Test-${randomUUID()}!`;
  const basePackage = {
    providerId, name: 'Paket Uji Baru', quotaSummary: '10 GB', activePeriod: '30 Hari',
    price: 25000, availabilityStatus: 'available', publicationStatus: 'draft',
  };
  const counterIds = [counterA, counterB, draftCounter, emptyCounter];

  await db.transaction(async (trx) => {
    await trx('admins').insert({ id: adminId, email, name: 'Package flow test', password_hash: await hashPassword(password), is_active: true });
    await trx('regions').insert({ id: regionId, name: `Test ${runId}` });
    await trx('providers').insert([
      { id: providerId, name: `Provider A ${runId}`, is_active: true },
      { id: otherProviderId, name: `Provider B ${runId}`, is_active: true },
    ]);
    await trx('counters').insert(counterIds.map((id, index) => ({
      id, name: `Konter Uji ${['A', 'B', 'Draft', 'Kosong'][index]} ${runId.slice(0, 8)}`,
      region_id: regionId, address: 'Alamat pengujian', whatsapp: '081234567890', is_demo: true,
      publication_status: id === draftCounter ? 'draft' : 'published',
    })));
    await trx('packages').insert([
      ...Array.from({ length: 11 }, (_, i) => ({
        id: i === 0 ? packageA : randomUUID(), counter_id: counterA, provider_id: providerId,
        name: `Paket Bersama A ${String(i + 1).padStart(2, '0')}`, quota_summary: '10 GB', active_period: '30 Hari',
        price: 25000, availability_status: 'available', publication_status: i === 0 ? 'published' : 'draft',
      })),
      { id: packageB, counter_id: counterB, provider_id: otherProviderId, name: 'Paket Bersama B', quota_summary: '20 GB', active_period: '30 Hari', price: 50000, availability_status: 'available', publication_status: 'published' },
    ]);
  });

  return {
    runId, adminId, email, password, regionId, providerId, otherProviderId,
    counterA, counterB, draftCounter, emptyCounter, packageA, packageB, basePackage,
    async cleanup() {
      await db.transaction(async (trx) => {
        await trx('admin_sessions').whereRaw("sess->>'adminId' = ?", [adminId]).del();
        await trx('counters').whereIn('id', counterIds).del();
        await trx('providers').whereIn('id', [providerId, otherProviderId]).del();
        await trx('regions').where({ id: regionId }).del();
        await trx('admins').where({ id: adminId }).del();
      });
    },
  };
}
