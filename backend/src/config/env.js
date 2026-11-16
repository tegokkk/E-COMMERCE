import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default(process.env.VERCEL === '1' ? 'production' : 'development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  TEST_DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET minimal 32 karakter'),
  PUBLIC_ORIGIN: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.string().default('false').transform((val) => val === 'true'),
  DISPLAY_TIME_ZONE: z.string().default('Asia/Jakarta'),
  IMAGE_ALLOWED_HOSTS: z.string().default('lh3.googleusercontent.com,images.unsplash.com'),
  UPLOAD_DIR: z.string().default(path.resolve(__dirname, '../../uploads')),
  ANALYTICS_ENABLED: z.string().default('true').transform((val) => val === 'true'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  UPLOAD_STORAGE: z.enum(['local', 'blob']).default(process.env.VERCEL === '1' ? 'blob' : 'local'),
  BLOB_STORE_ID: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().min(32).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Konfigurasi environment backend tidak valid pada:', parsed.error.issues.map((issue) => issue.path.join('.')));
  throw new Error('Konfigurasi environment backend tidak lengkap atau tidak valid.');
}

export const env = parsed.data;

if (env.NODE_ENV === 'production') {
  const origin = new URL(env.PUBLIC_ORIGIN);
  const databaseUrl = new URL(env.DATABASE_URL);
  const unsafePlaceholder = /CHANGE_ME|REPLACE_WITH|konter_prod_password|090902/i;
  if (origin.protocol !== 'https:' || ['localhost', 'example.com'].includes(origin.hostname)
    || !env.TRUST_PROXY || unsafePlaceholder.test(env.SESSION_SECRET)
    || unsafePlaceholder.test(decodeURIComponent(databaseUrl.password))) {
    throw new Error('Konfigurasi produksi memerlukan domain HTTPS, trust proxy, dan secret nyata.');
  }
  if (process.env.VERCEL === '1' && env.UPLOAD_STORAGE !== 'blob') {
    throw new Error('Konfigurasi produksi Vercel memerlukan UPLOAD_STORAGE=blob.');
  }
  if (process.env.VERCEL === '1' && !env.BLOB_STORE_ID && !env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[Vercel Blob] PERINGATAN: Vercel Blob belum dihubungkan. Hubungkan Blob store di tab Storage Vercel agar upload foto berfungsi.');
  }
  if (process.env.VERCEL === '1' && ['localhost', '127.0.0.1', '::1', 'db'].includes(databaseUrl.hostname)) {
    throw new Error('DATABASE_URL di Vercel harus menggunakan PostgreSQL online.');
  }
  if (process.env.VERCEL === '1' && !env.CRON_SECRET) {
    throw new Error('Isi CRON_SECRET untuk pemeliharaan analitik dan foto terjadwal di Vercel.');
  }
}

