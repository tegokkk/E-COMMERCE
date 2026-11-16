import knex from 'knex';
import { env } from '../config/env.js';

const connectionUrl =
  env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL || env.DATABASE_URL : env.DATABASE_URL;

export const db = knex({
  client: 'pg',
  connection: connectionUrl,
  pool: {
    min: process.env.VERCEL === '1' ? 0 : 2,
    max: process.env.VERCEL === '1' ? 2 : 10,
    idleTimeoutMillis: process.env.VERCEL === '1' ? 5000 : 30000,
    acquireTimeoutMillis: 10000,
  },
});

export async function closeDatabaseConnection() {
  await db.destroy();
}

