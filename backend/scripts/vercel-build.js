// Deployment-only setup. Never run seeds or apply this script to the local DB.
import knex from 'knex';
import config from '../knexfile.js';
import { env } from '../src/config/env.js';
import { ensureInitialAdmin } from '../src/lib/initial-admin.js';

async function main() {
  if (process.env.VERCEL !== '1' || env.NODE_ENV !== 'production') {
    throw new Error('vercel:build hanya boleh dijalankan oleh build Vercel dengan konfigurasi PostgreSQL online.');
  }
  const database = knex({ ...config, pool: { min: 0, max: 2 } });
  try {
    await database.migrate.latest();
    const admin = await ensureInitialAdmin(database, {
      email: process.env.INITIAL_ADMIN_EMAIL,
      password: process.env.INITIAL_ADMIN_PASSWORD,
      name: process.env.INITIAL_ADMIN_NAME,
    });
    console.info(`Migrasi selesai. ${admin.created ? 'Admin pertama berhasil dibuat.' : 'Akun admin yang sudah ada dipertahankan.'}`);
  } finally { await database.destroy(); }
}

main().catch(() => {
  // Do not emit driver errors/connection strings or credential-bearing config.
  console.error('Setup database gagal. Periksa DATABASE_URL, izin migrasi, dan INITIAL_ADMIN_EMAIL/INITIAL_ADMIN_PASSWORD bila database masih kosong.');
  process.exitCode = 1;
});
