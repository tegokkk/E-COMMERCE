# Deploy KonterKuota: Vercel (frontend + backend) + Supabase (database)

Arsitektur: dua project Vercel dari satu repo, satu database Supabase.

```
Browser ──► Frontend (Next.js, Vercel) ──rewrite /api/v1/*──► Backend (Express, Vercel) ──► Supabase Postgres
                                                                         └──► Vercel Blob (foto konter, private)
```

Browser hanya berbicara dengan domain frontend. Rewrite `/api/v1/*` meneruskan ke backend, sehingga cookie sesi admin tetap first-party dan CSRF/Origin check berjalan.

## 0. Prasyarat

- Repo sudah di GitHub: `tegokkk/E-COMMERCE` (branch `main`).
- Akun Vercel dan Supabase.

**Jalan pintas env:** setelah project Supabase dibuat, jalankan `npm run vercel:env` di root repo. Script meminta connection string pooler Supabase (salin apa adanya dari Connect), nama project frontend/backend, dan email admin. Hasilnya dua file siap tempel (`vercel-env.backend.local`, `vercel-env.frontend.local`, diabaikan git) berisi seluruh variabel di bagian 2 dan 3, termasuk secret acak dan URL migrasi port 5432. Buat project Vercel dengan nama persis seperti yang Anda masukkan agar domain cocok. Menjalankan ulang script mempertahankan secret dan password admin yang sudah ada.

Jika memilih manual, ikuti bagian di bawah:


**Jalan pintas env:** setelah project Supabase dibuat, jalankan `npm run vercel:env` di root repo. Script meminta connection string pooler Supabase (salin apa adanya dari Connect), nama project frontend/backend, dan email admin. Hasilnya dua file siap tempel (`vercel-env.backend.local`, `vercel-env.frontend.local`, diabaikan git) berisi seluruh variabel di bagian 2 dan 3, termasuk secret acak dan URL migrasi port 5432. Buat project Vercel dengan nama persis seperti yang Anda masukkan agar domain cocok. Menjalankan ulang script mempertahankan secret dan password admin yang sudah ada.

Jika memilih manual, ikuti bagian di bawah:
- Tentukan dulu **dua domain produksi** (agar env saling merujuk benar), mis.:
  - Frontend: `https://konterkuota.vercel.app`
  - Backend: `https://konterkuota-api.vercel.app`
    Nama project Vercel menentukan subdomain `.vercel.app`. Jika nama sudah dipakai orang lain, Vercel menambah akhiran; cek domain final di tab Domains sebelum mengisi env.

## 1. Supabase

1. Buat project baru (catat password database; simpan di password manager).
2. Buka **Connect** pada dashboard dan salin dua connection string **Supavisor pooler** (bukan "Direct connection"):
   - **Runtime** (transaction pooler, port `6543`) -> `DATABASE_URL`
   - **Migrasi** (session pooler, port `5432`) -> `DATABASE_MIGRATION_URL`
3. Tambahkan `?sslmode=no-verify` di akhir kedua URL.
   - Alasan: `sslmode=require` pada `pg` diperlakukan sebagai `verify-full`, dan sertifikat pooler Supabase tidak ada di trust store Node, sehingga koneksi gagal dengan `SELF_SIGNED_CERT_IN_CHAIN`. `no-verify` tetap mengenkripsi koneksi, tetapi tidak memverifikasi sertifikat server. Jika Anda butuh verifikasi penuh, unduh CA Supabase dan konfigurasikan `ssl.ca` pada kode.
4. Jika password mengandung karakter khusus (`@ : / ? # %`), URL-encode di connection string.
5. Gunakan session pooler (5432) untuk migrasi, bukan direct connection: direct connection Supabase hanya IPv6 pada paket gratis dan mesin build Vercel bisa tidak menjangkaunya. Knex memakai advisory lock saat migrasi, yang tidak didukung transaction pooler (6543).

Database baru kosong. Data lokal tidak ikut terbawa.

## 2. Project backend di Vercel

- Import repo, **Root Directory: `backend`**. Preset sudah dibaca dari `backend/vercel.json` (Express, `installCommand: cd .. && npm ci`, `buildCommand: npm run vercel:build`).
- Pastikan opsi **Include source files outside of the Root Directory in the Build Step** aktif (monorepo workspace `@konter/shared`).
- Storage: tab **Storage** -> buat **Blob store, access Private**, hubungkan ke project backend. Ini menyediakan `BLOB_STORE_ID`/token otomatis. Foto konter tidak bisa disimpan di disk Vercel.
- Environment Variables (Production):

| Variabel                 | Nilai                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| *(NODE_ENV)*             | *(Otomatis diset `production` oleh Vercel, jangan dimasukkan manual)*                                      |
| `DATABASE_URL`           | pooler 6543 + `?sslmode=no-verify`                                                                          |
| `DATABASE_MIGRATION_URL` | pooler 5432 + `?sslmode=no-verify`                                                                          |
| `SESSION_SECRET`         | string acak >= 32 karakter, mis. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `PUBLIC_ORIGIN`          | domain **frontend**, `https://...` (dipakai CORS dan pemeriksaan Origin)                                    |
| `TRUST_PROXY`            | `true`                                                                                                      |
| `UPLOAD_STORAGE`         | `blob`                                                                                                      |
| `CRON_SECRET`            | string acak >= 32 karakter                                                                                  |
| `IMAGE_ALLOWED_HOSTS`    | `lh3.googleusercontent.com,images.unsplash.com`                                                             |
| `INITIAL_ADMIN_EMAIL`    | email admin produksi                                                                                        |
| `INITIAL_ADMIN_PASSWORD` | password **baru** >= 12 karakter (jangan pakai password dev lokal)                                          |
| `INITIAL_ADMIN_NAME`     | nama tampilan admin                                                                                         |

- Build akan menjalankan semua migrasi, lalu membuat admin pertama **hanya jika belum ada**. Admin yang sudah ada dipertahankan.
- Setelah admin terbentuk, `INITIAL_ADMIN_PASSWORD` boleh dihapus dari env.
- Cron `GET /api/v1/internal/maintenance` berjalan harian (`0 19 * * *` UTC) dengan header `Authorization: Bearer $CRON_SECRET` yang disuntik Vercel.

## 3. Project frontend di Vercel

- Import repo yang sama, **Root Directory: `frontend`** (preset Next.js dari `frontend/vercel.json`).
- Environment Variables (Production):

| Variabel              | Nilai                                           |
| --------------------- | ----------------------------------------------- |
| `API_INTERNAL_URL`    | `https://<domain-backend>/api/v1`               |
| `SITE_URL`            | `https://<domain-frontend>`                     |
| `IMAGE_ALLOWED_HOSTS` | `lh3.googleusercontent.com,images.unsplash.com` |

- `next.config.mjs` sengaja menggagalkan build jika `API_INTERNAL_URL`/`SITE_URL` kosong, bukan HTTPS, atau origin keduanya sama.

## 4. Urutan deploy

1. Buat database Supabase, kumpulkan dua connection string.
2. Buat kedua project Vercel (tanpa deploy dulu), catat domain final, isi semua env.
3. Deploy **backend** dahulu; cek log build menampilkan "Migrasi selesai".
4. Deploy **frontend**.
5. Buka `https://<domain-backend>/api/v1/health` -> harus `{"status":"ok"}`.

## 5. Verifikasi

- `https://<domain-frontend>/` memuat halaman publik; `/robots.txt` dan `/sitemap.xml` memakai domain produksi.
- `https://<domain-frontend>/admin/login`: login dengan `INITIAL_ADMIN_EMAIL`, buka dashboard, logout.
- Tambah satu konter dengan foto: foto muncul (diambil lewat `/api/v1/uploads/counters/...` dari Blob).
- `GET https://<domain-backend>/api/v1/admin/overview` tanpa login -> `401`.
- `GET https://<domain-backend>/api/v1/internal/maintenance` tanpa token -> `401`.

## 6. Masalah umum

| Gejala                                                   | Penyebab                                                                                                                 | Solusi                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `SELF_SIGNED_CERT_IN_CHAIN`                              | URL tanpa `sslmode=no-verify`                                                                                            | Tambahkan pada kedua URL database                  |
| Build backend gagal "Konfigurasi produksi memerlukan..." | `PUBLIC_ORIGIN` bukan HTTPS/localhost, `TRUST_PROXY` bukan `true`, atau secret mengandung placeholder                    | Perbaiki env                                       |
| Build backend gagal soal Blob                            | Blob store belum terhubung                                                                                               | Hubungkan Blob private ke project backend          |
| Login 403 `invalid csrf token` terus-menerus             | `PUBLIC_ORIGIN` tidak sama persis dengan domain frontend, atau frontend memanggil backend langsung (bukan lewat rewrite) | Samakan `PUBLIC_ORIGIN` dengan `SITE_URL` frontend |
| Migrasi hang/gagal advisory lock                         | `DATABASE_MIGRATION_URL` memakai port 6543                                                                               | Pakai session pooler port 5432                     |
| `too many connections`                                   | Pool tidak lewat pooler                                                                                                  | Pastikan `DATABASE_URL` memakai port 6543          |
