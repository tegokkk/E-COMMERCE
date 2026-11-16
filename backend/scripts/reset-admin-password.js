import { input, password } from '@inquirer/prompts';
import { db, closeDatabaseConnection } from '../src/database/connection.js';
import { hashPassword } from '../src/lib/password.js';

async function main() {
  console.info('=== Reset Password Admin KonterKuota ===');
  try {
    const email = await input({
      message: 'Masukkan email admin yang ingin direset:',
      validate: (val) => (val && val.includes('@') ? true : 'Email wajib valid'),
    });

    const admin = await db('admins').where({ email: email.toLowerCase().trim() }).first();
    if (!admin) {
      console.error(`Akun dengan email ${email} tidak ditemukan.`);
      process.exit(1);
    }

    const newPass = await password({
      message: 'Masukkan password baru (minimal 8 karakter):',
      mask: '*',
      validate: (val) => (val && val.length >= 8 ? true : 'Password minimal 8 karakter'),
    });

    const confirmPass = await password({
      message: 'Konfirmasi password baru:',
      mask: '*',
      validate: (val) => (val === newPass ? true : 'Konfirmasi password tidak cocok'),
    });

    const newHash = await hashPassword(confirmPass);

    await db.transaction(async (trx) => {
      // 1. Update password
      await trx('admins')
        .where({ id: admin.id })
        .update({
          password_hash: newHash,
          updated_at: trx.fn.now(),
        });

      // 2. Cabut seluruh sesi aktif yang terkait dengan admin ini
      await trx('admin_sessions')
        .whereRaw("(sess->>'adminId') = ?", [admin.id])
        .del();
    });

    console.info(`Password admin ${admin.email} berhasil direset dan seluruh sesi aktifnya telah dicabut.`);
  } catch (err) {
    console.error('Gagal mereset password:', err.message);
  } finally {
    await closeDatabaseConnection();
  }
}

main();

