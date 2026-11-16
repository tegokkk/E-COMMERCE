import { AppError } from '../lib/app-error.js';
import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, _next) {
  if (res.headersSent) return _next(err);
  const statusCode = err.statusCode || (err instanceof AppError ? err.statusCode : 500);
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message =
    statusCode === 500
      ? 'Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi.'
      : err.message || 'Terjadi kesalahan.';

  // Catat error internal ke log
  if (statusCode >= 500) {
    logger.error({
      code,
      statusCode,
      path: req.path,
      method: req.method,
      ...(process.env.NODE_ENV === 'production' ? {} : { err }),
    }, 'Unhandled Exception');
  }

  const responseBody = {
    error: {
      code,
      message,
    },
  };

  if (err.fields) {
    responseBody.error.fields = err.fields;
  }

  res.status(statusCode).json(responseBody);
}

