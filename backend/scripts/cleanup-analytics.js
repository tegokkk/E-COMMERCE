import { db, closeDatabaseConnection } from '../src/database/connection.js';

async function cleanupAnalytics() {
  console.info('=== Pembersihan Data Analitik (Retention Cleanup) ===');
  try {
    const retentionDays = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90', 10);
    const thresholdDate = new Date(Date.now() - retentionDays * 24 * 3600 * 1000);

    console.info(`Menghapus event analitik yang lebih lama dari ${retentionDays} hari (sebelum ${thresholdDate.toISOString()})...`);

    const deletedCount = await db('analytics_events')
      .where('created_at', '<', thresholdDate)
      .del();

    console.info(`Pembersihan selesai: ${deletedCount} record event berhasil dihapus.`);
  } catch (err) {
    console.error('Gagal membersihkan data analitik:', err.message);
  } finally {
    await closeDatabaseConnection();
  }
}

cleanupAnalytics();

