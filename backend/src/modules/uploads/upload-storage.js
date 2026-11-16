import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export const counterImageDirectory = path.join(env.UPLOAD_DIR, 'counters');
export const counterImageFilenamePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;
const uploadedPathPattern = /^\/api\/v1\/uploads\/counters\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp)$/i;

export async function removeUnreferencedCounterPhoto(photoUrl, counterRepository) {
  const match = uploadedPathPattern.exec(photoUrl);
  if (!match) return;
  try {
    if (await counterRepository.countPhotoReferences(photoUrl)) return;
    await unlink(path.join(counterImageDirectory, match[1]));
  } catch (error) {
    if (error.code !== 'ENOENT') logger.warn({ err: error }, 'Gagal menghapus foto konter yang tidak dipakai');
  }
}
