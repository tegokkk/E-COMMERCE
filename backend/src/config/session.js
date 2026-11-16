import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { env } from './env.js';

const PgSession = connectPgSimple(session);

const pgPool = new pg.Pool({
  connectionString: env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL || env.DATABASE_URL : env.DATABASE_URL,
  max: process.env.VERCEL === '1' ? 2 : 10,
  idleTimeoutMillis: process.env.VERCEL === '1' ? 5000 : 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});
if (process.env.VERCEL === '1') attachDatabasePool(pgPool);

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'admin_sessions',
    createTableIfMissing: false, // Sudah dibuat oleh migration 002
    ...(process.env.VERCEL === '1' ? { pruneSessionInterval: false } : {}),
  }),
  name: 'konter_sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: false, // Absolute lifetime 8 jam
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 Jam
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
});

