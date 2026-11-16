import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { closeDatabaseConnection } from './database/connection.js';

const server = app.listen(env.PORT, () => {
  logger.info(`KonterKuota Backend berjalan pada port ${env.PORT} dalam mode ${env.NODE_ENV}`);
});

async function shutdown(signal) {
  logger.info(`Menerima sinyal ${signal}, memulai shutdown anggun...`);
  server.close(async () => {
    logger.info('Server HTTP ditutup.');
    try {
      await closeDatabaseConnection();
      logger.info('Koneksi database PostgreSQL berhasil ditutup.');
      process.exit(0);
    } catch (err) {
      logger.error('Error saat menutup koneksi database:', err);
      process.exit(1);
    }
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Shutdown melebihi batas waktu 10s, dipaksa berhenti.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

