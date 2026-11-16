import { AppError } from '../lib/app-error.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404, 'NOT_FOUND'));
}

