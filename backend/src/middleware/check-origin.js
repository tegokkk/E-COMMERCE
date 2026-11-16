import { AppError } from '../lib/app-error.js';
import { env } from '../config/env.js';

export function checkOrigin(req, res, next) {
  // Hanya berlaku untuk mutasi
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  if (!origin) {
    // Jika tidak ada origin/referer (misalnya server-to-server atau script terotorisasi), izinkan bila dev/test
    if (env.NODE_ENV !== 'production') return next();
    return next(new AppError('Akses ditolak: Origin header wajib ada.', 403, 'FORBIDDEN_ORIGIN'));
  }

  try {
    const originUrl = new URL(origin);
    const allowedUrl = new URL(env.PUBLIC_ORIGIN);

    if (originUrl.origin !== allowedUrl.origin) {
      return next(new AppError('Akses ditolak: Origin tidak diizinkan.', 403, 'FORBIDDEN_ORIGIN'));
    }
  } catch {
    return next(new AppError('Akses ditolak: Format Origin tidak valid.', 403, 'FORBIDDEN_ORIGIN'));
  }

  next();
}

