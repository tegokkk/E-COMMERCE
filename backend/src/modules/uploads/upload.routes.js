import { Router, raw } from 'express';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { requireAdmin } from '../../middleware/require-admin.js';
import { checkOrigin } from '../../middleware/check-origin.js';
import { csrfSynchronisedProtection } from '../../config/csrf.js';
import { AppError } from '../../lib/app-error.js';
import { counterImageDirectory, counterImageFilenamePattern } from './upload-storage.js';

export const adminUploadRoutes = Router();
adminUploadRoutes.use(requireAdmin);
adminUploadRoutes.post(
  '/counter-photo',
  checkOrigin,
  csrfSynchronisedProtection,
  raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb', inflate: false }),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        throw new AppError('Pilih foto JPG, PNG, atau WebP maksimal 5 MB.', 415, 'INVALID_IMAGE_TYPE');
      }

      let converted;
      try {
        const image = sharp(req.body, { limitInputPixels: 20_000_000, pages: 1 });
        const metadata = await image.metadata();
        if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) > 1) {
          throw new Error('Unsupported image format');
        }
        converted = await image.rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 }).toBuffer();
      } catch {
        throw new AppError('File foto tidak valid. Gunakan JPG, PNG, atau WebP statis di bawah 20 megapiksel.', 400, 'INVALID_IMAGE');
      }

      const filename = `${randomUUID()}.webp`;
      await mkdir(counterImageDirectory, { recursive: true });
      await writeFile(path.join(counterImageDirectory, filename), converted, { flag: 'wx', mode: 0o644 });
      res.status(201).json({ data: { photoUrl: `/api/v1/uploads/counters/${filename}` } });
    } catch (error) {
      next(error);
    }
  }
);

export const publicUploadRoutes = Router();
publicUploadRoutes.get('/counters/:filename', (req, res, next) => {
  if (!counterImageFilenamePattern.test(req.params.filename)) {
    return next(new AppError('Foto tidak ditemukan.', 404, 'NOT_FOUND'));
  }
  res.type('webp');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(path.join(counterImageDirectory, req.params.filename), (error) => {
    if (error) {
      res.removeHeader('Cache-Control');
      res.removeHeader('Content-Type');
      next(new AppError('Foto tidak ditemukan.', 404, 'NOT_FOUND'));
    }
  });
});
