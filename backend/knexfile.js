import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL wajib diisi (TEST_DATABASE_URL saat NODE_ENV=test).');
}

/** @type {import('knex').Knex.Config} */
const config = {
  client: 'pg',
  connection: connectionString,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: path.resolve(__dirname, 'src/database/migrations'),
    extension: 'js',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: path.resolve(__dirname, 'src/database/seeds'),
    extension: 'js',
    loadExtensions: ['.js'],
  },
};

export default config;

