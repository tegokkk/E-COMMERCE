# KonterKuota — Direktori Kuota UMKM

Website direktori dan wadah pemasaran bersama untuk konter kuota internet UMKM. Menampilkan konter di sekitar pengguna, katalog paket kuota berbagai operator (Telkomsel, Indosat, XL, Tri), perbandingan harga, dan tombol kontak langsung ke penjual via WhatsApp resmi.

---

## 1. Arsitektur & Teknologi

- **Frontend:** Next.js 16 (App Router, Server & Client Components), React 19, Tailwind CSS 4, Radix Dialog, TanStack Query 5.
- **Backend:** Node.js 24 LTS, Express, PostgreSQL 17, Knex.js, express-session (PostgreSQL Store), Argon2id, CSRF Protection, Pino.
- **Shared Package:** `@konter/shared` (Zod schemas dan konstanta bisnis publik).
- **Pengujian:** Vitest, Supertest, React Testing Library, Playwright.

---

## 2. Struktur Repositori (npm Workspaces)

```text
ZYROSPACE/
├── frontend/         # Next.js App Router (Port 3000)
├── backend/          # Express REST API (Port 4000)
├── shared/           # Skema validasi Zod dan konstanta bersama
├── infra/            # Dockerfiles, compose produksi, nginx.conf
├── docs/             # api.md, operations.md, dan referensi desain
└── tests/e2e/        # Playwright E2E tests
```

---

## 3. Panduan Menjalankan Lingkungan Lokal

### Prasyarat
- **Node.js 24 LTS** (`node -v` minimal v24.x)
- **PostgreSQL 15+** (Lokal atau via Docker Compose dengan `DEV_DB_PASSWORD` pribadi)

### Langkah Instalasi
1. **Clone & Install Dependencies:**
   ```bash
   npm install
   ```

2. **Siapkan Environment Variables:**
   - Salin file konfigurasi contoh:
     - `frontend/.env.example` -> `frontend/.env.local`
     - `backend/.env.example` -> `backend/.env`
   - Isi `DATABASE_URL`, `TEST_DATABASE_URL`, `SESSION_SECRET`, dan `DEVELOPMENT_ADMIN_PASSWORD` dengan nilai lokal milik Anda. Contoh file tidak berisi sandi siap pakai.
   - Jika memakai `compose.yaml`, set `DEV_DB_PASSWORD` ke sandi yang sama dengan URL database sebelum menjalankan `docker compose up -d db`.

3. **Jalankan Migrasi & Fixture Data:**
   ```bash
   # Jalankan migrasi tabel
   npm run db:migrate

   # Masukkan data contoh lokal (6 konter, provider, dan paket)
   ALLOW_DEVELOPMENT_SEED=true npm run db:seed
   ```
   Pada PowerShell: `$env:ALLOW_DEVELOPMENT_SEED='true'; npm run db:seed`.

4. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
   - **Panel Admin:** [http://localhost:3000/admin](http://localhost:3000/admin) (email development: `admin@konterkuota.id`; sandi sesuai `DEVELOPMENT_ADMIN_PASSWORD` Anda)

   Data dari `db:seed` diberi label **Data contoh** dan tombol kontaknya dinonaktifkan.
   Data tersebut tidak ditampilkan saat `NODE_ENV=production`. Tambahkan konter asli melalui
   panel admin; konter baru bukan data contoh. Admin dapat mengunggah foto konter langsung
   dari formulir dan menghapus konter, paket, provider, atau wilayah dari daftar admin.
   Penghapusan konter juga menghapus paketnya; provider dan wilayah yang masih dipakai
   harus dikosongkan terlebih dahulu. Isi nomor WhatsApp pengelola yang asli pada
   Pengaturan agar tombol pendaftaran konter aktif.

### Mengelola paket per konter

Buka **Konter → Kelola Paket** pada konter yang sudah diterbitkan. Daftar,
pencarian, filter, jumlah, dan pagination hanya mencakup paket milik konter itu.
Form tambah otomatis memakai konter asal; konter pemilik tidak dapat dipindahkan.
Simpan dan Batal kembali ke daftar paket konter yang sama.

Konter draft/nonaktif harus diterbitkan sebelum dapat menerima paket baru.
Jika konter yang sudah memiliki paket dinonaktifkan, paketnya tetap dapat dikelola,
tetapi tidak tampil di katalog publik. Menu Paket global sudah diganti akses
melalui Konter. URL paket lama mengarah ke alur baru.

API pengelolaan berada di `/api/v1/admin/counters/:counterId/packages` dan
`/api/v1/admin/counters/:counterId/packages/:id`. Semua aksi memeriksa konter
pemilik di backend. Endpoint lama tetap kompatibel, dengan larangan menambah
paket pada konter belum terbit dan memindahkan kepemilikan paket.

Pengujian khusus alur ini tidak menjalankan seed atau mereset database. Jalankan
pada `TEST_DATABASE_URL` terpisah yang sudah dimigrasi dan bernama akhiran `_test`:

```powershell
$env:NODE_ENV='test'
npm run test --workspace=@konter/backend -- tests/integration/counter-packages.test.js
```

Untuk uji browser desktop dan mobile, jalankan frontend lokal terlebih dahulu:

```powershell
$env:NODE_ENV='test'
$env:COUNTER_PACKAGE_E2E='true'
npx playwright test tests/e2e/counter-packages.spec.js --workers=1
```

Uji browser meneruskan request ke API nyata dengan database test terpisah;
fixture khusus pengujian dibersihkan setelah selesai. `PLAYWRIGHT_CHROME_PATH`
dapat diisi path Chrome lokal jika browser bawaan Playwright belum terpasang.

### Lokasi dan waktu penayangan

Filter **Lokasi** pada direktori mencakup provinsi, kota/kabupaten, dan wilayah.
Kota tetap dapat dipilih saat konter tidak memiliki kecamatan/wilayah. Pilihan
dibangun dari konter terbit; kota bernama sama dibedakan berdasarkan provinsinya.

Batas penayangan pada form paket mengikuti waktu lokal perangkat admin dan
disimpan sebagai UTC. Mengubah harga atau field lain tanpa mengubah tanggal
mempertahankan waktu penayangan asli, termasuk detik dan milidetiknya.

Pengujian regresi tanpa seed:

```powershell
$env:NODE_ENV='test'
npm run test --workspace=@konter/backend -- tests/unit tests/integration/counter-packages.test.js tests/integration/catalog-locations.test.js
npm run test --workspace=@konter/frontend
```

Setelah `npm run build`, jalankan `node infra/check-frontend-runtime.mjs` untuk
memeriksa konfigurasi runtime, aturan gambar, dan rewrite API. CI juga membangun
image backend/frontend dan menjalankan pemeriksaan tersebut di image frontend.
Uji browser produksi untuk filter lokasi dapat dijalankan dengan
`COUNTER_PACKAGE_E2E=true`, `NODE_ENV=test`, dan
`npx playwright test tests/e2e/public-locations.spec.js --workers=1`.

---

## 4. Perintah Pengembangan Utama

| Perintah | Deskripsi |
| --- | --- |
| `npm run dev` | Menjalankan frontend dan backend secara bersamaan |
| `npm run build` | Menjalankan build produksi Next.js |
| `npm run test` | Menjalankan unit dan integration test pada seluruh workspace |
| `npm run lint` | Memeriksa kepatuhan kode dengan ESLint |
| `npm run db:migrate` | Menjalankan migrasi database Knex |
| `ALLOW_DEVELOPMENT_SEED=true npm run db:seed` | Mengisi database development dengan fixture contoh; ditolak di produksi |
| `npm run admin:create` | Membuat akun admin baru secara interaktif |
| `npm run admin:reset-password` | Mereset password admin dan mencabut seluruh sesi terkait |
| `npm run analytics:report` | Menampilkan metrik rasio minat WhatsApp dan sesi pilot |
| `npm run analytics:cleanup` | Membersihkan event analitik yang lebih lama dari retensi |
| `npm run uploads:cleanup --workspace=@konter/backend` | Membersihkan foto unggahan yang tidak dipakai setelah tujuh hari |

