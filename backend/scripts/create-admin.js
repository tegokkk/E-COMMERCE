import { input, password } from '@inquirer/prompts';
import { db, closeDatabaseConnection } from '../src/database/connection.js';
import { hashPassword } from '../src/lib/password.js';

async function main() {
  console.info('=== Pembuatan Akun Admin KonterKuota ===');
  try {
    const email = await input({
      message: 'Masukkan email admin:',
      validate: (val) => (val && val.includes('@') ? true : 'Email wajib valid'),
    });

    const existing = await db('admins').where({ email: email.toLowerCase().trim() }).first();
    if (existing) {
      console.error(`Akun dengan email ${email} sudah terdaftar.`);
      process.exit(1);
    }

    const name = await input({
      message: 'Masukkan nama admin:',
      validate: (val) => (val && val.trim().length >= 2 ? true : 'Nama minimal 2 karakter'),
    });

    const pass = await password({
      message: 'Masukkan password admin (minimal 8 karakter):',
      mask: '*',
      validate: (val) => (val && val.length >= 8 ? true : 'Password minimal 8 karakter'),
    });

    const confirmPass = await password({
      message: 'Konfirmasi password admin:',
      mask: '*',
      validate: (val) => (val === pass ? true : 'Konfirmasi password tidak cocok'),
    });

    const passwordHash = await hashPassword(confirmPass);

    const [created] = await db('admins')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
      })
      .returning(['id', 'email', 'name', 'role']);

    console.info(`Akun admin berhasil dibuat: ${created.name} (${created.email}) [ID: ${created.id}]`);
  } catch (err) {
    console.error('Gagal membuat admin:', err.message);
  } finally {
    await closeDatabaseConnection();
  }
}

main();

