import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { db, closeDatabaseConnection } from '../src/database/connection.js';
import { counterImageDirectory, counterImageFilenamePattern } from '../src/modules/uploads/upload-storage.js';

const minAgeMs = 7 * 24 * 60 * 60 * 1000;
let removed = 0;

try {
  let entries;
  try {
    entries = await readdir(counterImageDirectory, { withFileTypes: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    entries = [];
  }

  for (const entry of entries) {
    if (!entry.isFile() || !counterImageFilenamePattern.test(entry.name)) continue;
    const filePath = path.join(counterImageDirectory, entry.name);
    const fileInfo = await stat(filePath);
    if (Date.now() - fileInfo.mtimeMs < minAgeMs) continue;
    const photoUrl = `/api/v1/uploads/counters/${entry.name}`;
    const reference = await db('counters').where({ photo_url: photoUrl }).first('id');
    if (!reference) {
      await unlink(filePath);
      removed += 1;
    }
  }
  console.info(`Foto tidak terpakai yang dihapus: ${removed}`);
} finally {
  await closeDatabaseConnection();
}
