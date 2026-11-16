import { db, closeDatabaseConnection } from '../src/database/connection.js';

async function generatePilotReport() {
  console.info('==================================================');
  console.info('       LAPORAN METRIK PILOT — KONTERKUOTA        ');
  console.info('==================================================\n');

  try {
    // 1. Total sesi publik unik (penyebut rasio minat)
    const sessionsRes = await db('analytics_events')
      .countDistinct('session_id as totalSessions')
      .first();
    const totalSessions = parseInt(sessionsRes?.totalSessions || 0, 10);

    // 2. Sesi unik yang menekan tombol WhatsApp penjual
    const whatsappSessionsRes = await db('analytics_events')
      .countDistinct('session_id as whatsappSessions')
      .where({ event_name: 'whatsapp_clicked' })
      .first();
    const whatsappSessions = parseInt(whatsappSessionsRes?.whatsappSessions || 0, 10);

    // 3. Total klik WhatsApp penjual secara keseluruhan
    const totalWhatsappClicksRes = await db('analytics_events')
      .count('id as totalClicks')
      .where({ event_name: 'whatsapp_clicked' })
      .first();
    const totalWhatsappClicks = parseInt(totalWhatsappClicksRes?.totalClicks || 0, 10);

    // 4. Klik pendaftaran mitra (terpisah, bukan pembelian)
    const partnerClicksRes = await db('analytics_events')
      .count('id as totalPartnerClicks')
      .where({ event_name: 'partner_signup_clicked' })
      .first();
    const totalPartnerClicks = parseInt(partnerClicksRes?.totalPartnerClicks || 0, 10);

    // 5. Rasio Minat Menghubungi Penjual
    const interestRatio = totalSessions > 0 ? ((whatsappSessions / totalSessions) * 100).toFixed(2) : '0.00';

    console.info(`1. Total Sesi Pengunjung Publik : ${totalSessions} sesi`);
    console.info(`2. Sesi Menghubungi Penjual (WA): ${whatsappSessions} sesi`);
    console.info(`3. Total Klik WhatsApp Penjual  : ${totalWhatsappClicks} kali`);
    console.info(`4. Rasio Minat Menghubungi (WA) : ${interestRatio}% (Target Pilot: 10%)`);
    console.info(`5. Klik Pendaftaran Mitra (WA)  : ${totalPartnerClicks} kali (dicatat terpisah)`);
    console.info('\nCatatan Operasional:');
    console.info('- Klik WhatsApp merepresentasikan niat menghubungi penjual, bukan jaminan konversi transaksi.');
    console.info('- Target 10% adalah hipotesis awal evaluasi pilot 30 hari.');
  } catch (err) {
    console.error('Gagal menghasilkan laporan analitik:', err.message);
  } finally {
    await closeDatabaseConnection();
  }
}

generatePilotReport();

