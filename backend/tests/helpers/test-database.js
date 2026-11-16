import { db } from '../../src/database/connection.js';
import { env } from '../../src/config/env.js';
import { seed } from '../../src/database/seeds/development.js';

/**
 * Memastikan pengujian HANYA berjalan pada database pengujian terpisah,
 * TIDAK PERNAH menyentuh database development atau produksi.
 */
export async function assertAndResetTestDatabase() {
  const currentDbUrl = env.TEST_DATABASE_URL || env.DATABASE_URL;

  if (!currentDbUrl.includes('_test')) {
    throw new Error(
      'KEAMANAN DATABASE GAGAL: Tes mencoba mereset database yang bukan test database!'
    );
  }

  // Jalankan seed fixture untuk reset data
  process.env.DEVELOPMENT_ADMIN_PASSWORD = 'AdminPassword123!';
  await seed(db);
  await db('platform_settings').where({ id: 1 }).update({ platform_name: 'KonterKuota' });
}

