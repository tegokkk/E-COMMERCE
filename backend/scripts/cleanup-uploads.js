import { db, closeDatabaseConnection } from '../src/database/connection.js';
import { cleanupCounterPhotos } from '../src/modules/uploads/upload-storage.js';

try {
  const removed = await cleanupCounterPhotos(db);
  console.info(`Foto tidak terpakai yang dihapus: ${removed}`);
} catch {
  console.error('Pembersihan foto gagal. Periksa koneksi database dan penyimpanan foto.');
  process.exitCode = 1;
} finally {
  await closeDatabaseConnection();
}
