import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
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
}

