import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { env } from './env.js';

const PgSession = connectPgSimple(session);

const pgPool = new pg.Pool({
  connectionString: env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL || env.DATABASE_URL : env.DATABASE_URL,
});

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'admin_sessions',
    createTableIfMissing: false, // Sudah dibuat oleh migration 002
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

