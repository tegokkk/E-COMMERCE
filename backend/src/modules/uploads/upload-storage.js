import { mkdir, writeFile, unlink, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export const counterImageDirectory = path.join(env.UPLOAD_DIR, 'counters');
export const counterImageFilenamePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;
const uploadedPathPattern = /^\/api\/v1\/uploads\/counters\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp)$/i;

export async function saveCounterPhoto(filename, buffer) {
  if (!counterImageFilenamePattern.test(filename)) throw new Error('Nama foto tidak valid.');
  if (env.UPLOAD_STORAGE === 'blob') {
    const { put } = await import('@vercel/blob');
    await put(`counters/${filename}`, buffer, { access: 'private', contentType: 'image/webp', addRandomSuffix: false, allowOverwrite: false });
  } else {
    await mkdir(counterImageDirectory, { recursive: true });
    await writeFile(path.join(counterImageDirectory, filename), buffer, { flag: 'wx', mode: 0o644 });
  }
  return `/api/v1/uploads/counters/${filename}`;
}

export async function getCounterPhotoBlob(filename) {
  if (!counterImageFilenamePattern.test(filename)) return null;
  const { get } = await import('@vercel/blob');
  return get(`counters/${filename}`, { access: 'private' });
}

async function deleteCounterPhoto(filename) {
  if (env.UPLOAD_STORAGE === 'blob') {
    const { del } = await import('@vercel/blob');
    await del(`counters/${filename}`);
  } else {
    await unlink(path.join(counterImageDirectory, filename));
  }
}

export async function removeUnreferencedCounterPhoto(photoUrl, counterRepository) {
  const match = uploadedPathPattern.exec(photoUrl);
  if (!match) return;
  try {
    if (await counterRepository.countPhotoReferences(photoUrl)) return;
    await deleteCounterPhoto(match[1]);
  } catch (error) {
    if (error.code !== 'ENOENT') logger.warn({ err: error }, 'Gagal menghapus foto konter yang tidak dipakai');
  }
}

export async function cleanupCounterPhotos(database, now = Date.now()) {
  const threshold = now - 7 * 24 * 60 * 60 * 1000;
  let removed = 0;
  const removeIfUnused = async (filename, uploadedAt) => {
    const timestamp = new Date(uploadedAt).getTime();
    if (!counterImageFilenamePattern.test(filename) || !Number.isFinite(timestamp) || timestamp >= threshold) return;
    const photoUrl = `/api/v1/uploads/counters/${filename}`;
    if (await database('counters').where({ photo_url: photoUrl }).first('id')) return;
    await deleteCounterPhoto(filename);
    removed++;
  };
  if (env.UPLOAD_STORAGE === 'blob') {
    const { list } = await import('@vercel/blob');
    let cursor;
    do {
      const page = await list({ prefix: 'counters/', cursor });
      for (const blob of page.blobs) {
        await removeIfUnused(blob.pathname.slice('counters/'.length), blob.uploadedAt);
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } else {
    let entries;
    try { entries = await readdir(counterImageDirectory, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return 0; throw error; }
    for (const entry of entries) {
      if (!entry.isFile() || !counterImageFilenamePattern.test(entry.name)) continue;
      const info = await stat(path.join(counterImageDirectory, entry.name));
      await removeIfUnused(entry.name, info.mtime);
    }
  }
  return removed;
}
