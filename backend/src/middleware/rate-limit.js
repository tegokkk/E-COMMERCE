import rateLimit from 'express-rate-limit';
import { PgRateLimitStore } from '../lib/pg-rate-limit-store.js';

const sharedStore = (prefix) => process.env.VERCEL === '1' ? new PgRateLimitStore(prefix) : undefined;

export const loginLimiter = rateLimit({
  store: sharedStore('login'),
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan gagal per IP
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Terlalu banyak percobaan login. Silakan tunggu 15 menit sebelum mencoba kembali.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactLimiter = rateLimit({
  store: sharedStore('contact'),
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 60, // 60 request per menit
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Terlalu banyak permintaan kontak. Silakan tunggu sebentar.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const eventsLimiter = rateLimit({
  store: sharedStore('events'),
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 120, // 120 events per menit
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Batas pengiriman event terlampaui.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

