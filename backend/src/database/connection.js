import knex from 'knex';
import { env } from '../config/env.js';

const connectionUrl =
  env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL || env.DATABASE_URL : env.DATABASE_URL;

export const db = knex({
  client: 'pg',
  connection: connectionUrl,
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 10000,
  },
});

export async function closeDatabaseConnection() {
  await db.destroy();
}

