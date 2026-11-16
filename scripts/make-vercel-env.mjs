// Membuat file env Vercel siap tempel. Jalankan: npm run vercel:env
// Output (diabaikan git karena berakhiran .local): vercel-env.backend.local, vercel-env.frontend.local
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { input, password } from '@inquirer/prompts';

const outDir = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : process.cwd();
const backendFile = path.join(outDir, 'vercel-env.backend.local');
const frontendFile = path.join(outDir, 'vercel-env.frontend.local');

const randomHex = () => crypto.randomBytes(48).toString('hex');

// Pertahankan secret yang sudah pernah dibuat agar password admin yang sudah dicatat tidak berubah.
function readExisting(key) {
  if (!fs.existsSync(backendFile)) return null;
  const match = fs.readFileSync(backendFile, 'utf8').match(new RegExp(`^${key}=(\\S+)$`, 'm'));
  return match && !match[1].startsWith('ISI_') ? match[1] : null;
}

export function buildDatabaseUrls(raw) {
  const value = String(raw || '').trim();
  if (/\[YOUR-PASSWORD\]|\[PASSWORD\]/i.test(value)) {
    throw new Error('Ganti [YOUR-PASSWORD] dengan password database Supabase Anda.');
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Format URL tidak valid. Jika password memuat @ : / ? # %, encode dulu (mis. @ menjadi %40).');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('URL harus diawali postgresql://');
  }
  if (!url.password) throw new Error('URL tidak memuat password database.');
  if (!url.hostname.endsWith('.pooler.supabase.com')) {
    throw new Error('Gunakan connection string pooler (host berakhiran .pooler.supabase.com), bukan Direct connection.');
  }
  url.searchParams.set('sslmode', 'no-verify');
  const runtime = new URL(url.toString());
  runtime.port = '6543';
  const migration = new URL(url.toString());
  migration.port = '5432';
  return { runtime: runtime.toString(), migration: migration.toString() };
}

const projectNamePattern = /^[a-z0-9][a-z0-9-]{0,98}$/;

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || (await password({
    message: 'Tempel connection string Supabase (Connect > pooler, salin apa adanya):',
    mask: '*',
    validate: (v) => { try { buildDatabaseUrls(v); return true; } catch (e) { return e.message; } },
  }));
  const frontendName = process.env.FRONTEND_NAME || (await input({
    message: 'Nama project frontend di Vercel (menentukan domain .vercel.app):',
    default: 'konterkuota-web',
    validate: (v) => projectNamePattern.test(v) || 'Hanya huruf kecil, angka, dan tanda minus.',
  }));
  const backendName = process.env.BACKEND_NAME || (await input({
    message: 'Nama project backend di Vercel:',
    default: 'konterkuota-api',
    validate: (v) => projectNamePattern.test(v) || 'Hanya huruf kecil, angka, dan tanda minus.',
  }));
  const adminEmail = process.env.ADMIN_EMAIL || (await input({
    message: 'Email admin produksi:',
    default: 'admin@konterkuota.id',
    validate: (v) => /^\S+@\S+\.\S+$/.test(v) || 'Email tidak valid.',
  }));

  if (frontendName === backendName) throw new Error('Nama project frontend dan backend harus berbeda.');

  const { runtime, migration } = buildDatabaseUrls(supabaseUrl);
  const frontendOrigin = `https://${frontendName}.vercel.app`;
  const backendOrigin = `https://${backendName}.vercel.app`;

  const sessionSecret = readExisting('SESSION_SECRET') || randomHex();
  const cronSecret = readExisting('CRON_SECRET') || randomHex();
  const adminPassword = readExisting('INITIAL_ADMIN_PASSWORD') || crypto.randomBytes(18).toString('base64url');

  const backend = [
    'NODE_ENV=production',
    'TRUST_PROXY=true',
    'UPLOAD_STORAGE=blob',
    `DATABASE_URL=${runtime}`,
    `DATABASE_MIGRATION_URL=${migration}`,
    `PUBLIC_ORIGIN=${frontendOrigin}`,
    `SESSION_SECRET=${sessionSecret}`,
    `CRON_SECRET=${cronSecret}`,
    `INITIAL_ADMIN_EMAIL=${adminEmail}`,
    `INITIAL_ADMIN_PASSWORD=${adminPassword}`,
    'INITIAL_ADMIN_NAME=Admin KonterKuota',
    'IMAGE_ALLOWED_HOSTS=lh3.googleusercontent.com,images.unsplash.com',
    '',
  ].join('\n');

  const frontend = [
    `API_INTERNAL_URL=${backendOrigin}/api/v1`,
    `SITE_URL=${frontendOrigin}`,
    'IMAGE_ALLOWED_HOSTS=lh3.googleusercontent.com,images.unsplash.com',
    '',
  ].join('\n');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(backendFile, backend);
  fs.writeFileSync(frontendFile, frontend);

  console.info('\nSelesai. File siap tempel (diabaikan git):');
  console.info(`  ${backendFile}`);
  console.info(`  ${frontendFile}`);
  console.info(`\nDomain frontend : ${frontendOrigin}`);
  console.info(`Domain backend  : ${backendOrigin}`);
  console.info(`Login admin     : ${adminEmail} (password ada di INITIAL_ADMIN_PASSWORD pada file backend)`);
  console.info('\nPenting: buat project Vercel dengan nama persis seperti di atas agar domain cocok.');
}

if (import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href) {
  main().catch((error) => {
    console.error(`\nGagal: ${error.message}`);
    process.exitCode = 1;
  });
}
