# Audit kesiapan deploy KonterKuota

Tanggal: 16 November 2026, Asia/Bangkok.

## Keputusan

**Kelima temuan kode P1/P2 telah diperbaiki.** Konfigurasi Docker/CI, pencarian lokasi, filter lokasi, dan konversi waktu paket sudah ditindaklanjuti. Go-live tetap memerlukan verifikasi image Docker sebenarnya, domain, TLS, rahasia produksi, dan pemulihan backup pada server tujuan.

Audit ini memeriksa checkout lokal dan rencana deployment Linux/Docker Compose yang sudah ada. Tidak ada deployment, perubahan kode aplikasi, reset password, migrasi, atau seed yang dijalankan. Pengujian database memakai fixture unik dalam database test terpisah, kemudian membersihkan hanya fixture milik pengujian. Request analitik pada smoke test frontend produksi diblokir agar tidak menambah event pada database aplikasi utama.

## Tindak lanjut P1/P2

| Temuan | Perbaikan yang diterapkan |
| --- | --- |
| P1: konfigurasi hilang pada runner Docker | `next.config.mjs` disalin ke runner. CI membangun image backend/frontend lalu menjalankan `infra/check-frontend-runtime.mjs` di image frontend untuk memeriksa konfigurasi, allowlist gambar, dan rewrite API. |
| P1: URL database CI identik | URL database aplikasi dan test dibedakan di kedua langkah migrasi/pengujian. Pengaman database test tetap dipertahankan. |
| P2: pencarian kota/provinsi menghilangkan harga | Pencocokan konter mencakup kota dan provinsi. Pengujian memeriksa harga pada pencarian nama, alamat, wilayah, kota, provinsi, provider, dan paket. |
| P2: waktu paket bergeser | Input dikonversi ke waktu lokal perangkat dan edit dikonversi kembali ke UTC. Nilai yang tidak diubah mempertahankan detik/milidetik. Pengujian mencakup UTC+7, UTC, dan New York. |
| P2: kota tanpa regionId tidak bisa difilter | API `/public/locations` menyediakan provinsi, kota, dan wilayah. Filter API mendukung `province`/`city`, termasuk kota bernama sama di provinsi berbeda. API wilayah lama tetap tersedia. |

Reproduksi dan uraian temuan awal di bawah disimpan sebagai konteks audit, bukan daftar masalah kode yang masih terbuka. Tidak ada seed, perubahan data utama, perubahan kredensial, atau deployment dalam tindak lanjut ini.

## Hasil pemeriksaan

| Pemeriksaan | Hasil dan batas cakupan |
| --- | --- |
| ESLint seluruh proyek | Lulus |
| Build produksi Next.js 16.4.5 | Lulus, termasuk tiga route paket per konter |
| Audit dependensi produksi | `npm audit --omit=dev`: 0 kerentanan yang dilaporkan registry saat audit; tidak mencakup image OS/container |
| Backend | 27 pengujian terpilih lulus: unit, paket per konter, dan lokasi/harga katalog, tanpa seed |
| Frontend | 16 pengujian lulus, termasuk filter lokasi dan konversi waktu di tiga zona |
| Browser desktop/mobile | 12 pengujian autentikasi, CRUD paket dan preservasi waktu UTC+7 lulus; 2 pengujian lokasi/harga publik dengan frontend produksi dan database test terpisah lulus |
| Smoke frontend mode produksi | `/`, `/privasi`, `/admin/login`, `/robots.txt`, `/sitemap.xml` berhasil; `/admin/konter` tanpa cookie diarahkan ke login dengan 307 |
| Responsivitas produksi | Halaman utama pada 360 dan 1440 px tidak overflow; tidak ada page error JavaScript |
| Halaman admin | Login mengirim `noindex, nofollow` dan `private, no-store`; tautan admin publik tidak ditemukan |
| Database lokal | PostgreSQL 15.19; semua 12 migrasi sudah diterapkan; snapshot saat pemeriksaan: 1 konter terbit non-demo, 1 paket, 1 admin aktif |
| Konfigurasi runtime / CI | Pemeriksaan runtime frontend dan parsing YAML CI lulus; allowlist gambar serta rewrite API terjaga |
| Docker Compose produksi | Build/run image sebenarnya belum dijalankan lokal: CLI Docker tidak tersedia; workflow CI kini memuat build image dan pemeriksaan runtime dalam container |
| HTTPS dan server tujuan | Belum diperiksa karena akses/target produksi belum tersedia dalam konteks audit |

Smoke frontend produksi menggunakan backend lokal yang sedang berjalan. Ini bukan uji stack Nginx + backend mode produksi melalui TLS. Suite integrasi lama yang memanggil seed tidak dijalankan. Tidak ada klaim bahwa seluruh suite, image container, atau server produksi sudah lulus.

## Temuan awal P1 — sudah diperbaiki di kode

### P1 — Runner Docker frontend kehilangan konfigurasi Next.js

Lokasi: `infra/frontend.Dockerfile:47` dan `frontend/next.config.mjs`.

Stage runner menyalin `public`, `.next`, dependensi, manifest, dan shared package, tetapi tidak menyalin `frontend/next.config.mjs`. Container menjalankan `next start`, yang tetap memuat konfigurasi runtime. Akibat yang berhasil direproduksi: URL gambar dari host yang diizinkan diterima dengan konfigurasi lengkap, tetapi ditolak dengan pesan `"url" parameter is not allowed` ketika konfigurasi hilang. Jumlah `images.remotePatterns` berubah dari 2 menjadi 0.

Perbaikan: sertakan konfigurasi Next.js dalam runner, atau gunakan output standalone yang membawa konfigurasi dan dependensi runtime dengan benar. Setelahnya bangun dan jalankan image asli, lalu uji optimasi foto eksternal dan foto unggahan. Dokumentasi resmi menyatakan gambar eksternal memerlukan konfigurasi `remotePatterns`: [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns).

### P1 — Environment CI bertentangan dengan pengaman database pengujian

Lokasi: `.github/workflows/ci.yml:56` dan `backend/tests/helpers/counter-package-fixtures.js:8`.

Workflow memberikan nilai identik untuk `DATABASE_URL` dan `TEST_DATABASE_URL`. Helper pengujian paket menolak kondisi tersebut. Simulasi environment workflow menghasilkan `Counter package checks require a separate TEST_DATABASE_URL.` sebelum fixture dibuat. Dengan konfigurasi sekarang, job backend akan gagal meskipun pengujian lokal dengan database terpisah lulus.

Perbaikan: bedakan URL database aplikasi dan database test di environment job, sambil tetap memastikan seluruh koneksi pengujian dan migrasi hanya menggunakan database test. Jalankan kembali job CI dari awal. Jangan melemahkan pengaman database untuk sekadar meloloskan pengujian.

## Temuan awal P2 — sudah diperbaiki di kode

### P2 — Pencarian kota/provinsi membuat harga paket menghilang

Lokasi: `backend/src/modules/catalog/catalog.repository.js:191`.

SQL mencari nama kota/provinsi, tetapi penentuan `counterMatches` hanya memeriksa nama konter, alamat, dan nama wilayah lama. Ketika kata kunci hanya cocok pada kota/provinsi, paket kemudian disaring seolah kata kunci wajib cocok dengan nama paket/provider.

Reproduksi pada fixture yang sama: pencarian nama konter menghasilkan `minPrice: 25000`; pencarian kota atau provinsi menghasilkan `minPrice: null`, walaupun `hasPublicPackages: true`. Kartu beralih ke pesan “Informasi paket sedang diperbarui”.

Perbaikan: masukkan kota/provinsi dalam penentuan kecocokan konter dan tambahkan pengujian regresi untuk nama, alamat, wilayah, kota, provinsi, provider, dan paket.

### P2 — Batas tayang paket bergeser saat form edit disimpan

Lokasi: `frontend/src/features/admin/packages/PackageForm.jsx:31` dan `:67`.

ISO UTC dipotong langsung menjadi nilai `datetime-local`, lalu saat disimpan ditafsirkan sebagai waktu lokal. Pada Asia/Bangkok/UTC+7, nilai `2026-11-20T12:00:00.000Z` berubah menjadi `2026-11-20T05:00:00.000Z` meskipun pengguna tidak bermaksud mengubah tanggal. Pergeseran dapat berulang pada penyimpanan berikutnya.

Perbaikan: konversi ISO ke tanggal/jam lokal sebelum mengisi input, dan konversi kembali ke UTC saat menyimpan. Verifikasi nilai tetap sama jika tanggal tidak diedit, termasuk ketika paket sudah memiliki batas tayang.

### P2 — Filter wilayah belum mencakup konter dengan kota tanpa regionId

Lokasi: `backend/src/modules/catalog/catalog.repository.js:43`, `shared/src/schemas/counter.schema.js:74`, dan form konter.

Form mengizinkan kota/kabupaten dengan kecamatan/wilayah kosong. Namun opsi filter publik berasal dari join `regions` dengan `counters.region_id`. Konter yang hanya memiliki kota tidak mendapat opsi kota di filter wilayah. Pemeriksaan fixture dengan `region_id: null` mengonfirmasi kota tersebut tidak ada dalam opsi filter.

Perbaikan: tentukan model filter lokasi yang konsisten. Jika seluruh Indonesia didukung melalui provinsi/kota, sediakan opsi dan filter API untuk lokasi tersebut atau pastikan pengaitan wilayah dilakukan secara jelas saat menyimpan konter.

## Gate konfigurasi dan operasional

- **Password admin lokal:** password contoh dari sesi debugging masih cocok dengan salah satu akun aktif. Jangan membawa kredensial ini ke produksi. Buat admin produksi dengan password unik atau reset sebelum membuka domain. Audit tidak mengubah password.
- **Kontak pengelola:** WhatsApp pengelola masih kosong; email publik masih nilai template `halo@konterkuota.id`. Tombol pendaftaran mitra tetap tidak aktif. Isi kontak yang benar-benar dikelola sebelum membuka pendaftaran.
- **Environment produksi:** file lokal masih memakai mode development dan origin localhost. Template produksi sudah menyediakan variabel wajib, tetapi nilai domain HTTPS, secret, password database, release tag, dan sertifikat sebenarnya belum diperiksa. Metadata robots/sitemap pada build lokal masih memuat localhost; bangun image produksi dengan `SITE_URL`/`PUBLIC_ORIGIN` domain yang benar.
- **Migrasi data lama:** migrasi 012 mengisi semua konter dengan provinsi kosong menjadi Jawa Barat/Kota Bandung. Jika produksi berisi konter lama dari daerah lain dan migrasi ini belum diterapkan, tinjau pemetaan datanya sebelum upgrade. Tidak ada migrasi yang dijalankan saat audit.
- **TLS dan reverse proxy:** Compose hanya mengekspos 80/443; backend memakai trust proxy satu hop. Verifikasi jalur proxy sesungguhnya, cookie Secure, pembatasan login per IP, redirect, dan upload melalui Nginx pada staging. Konfigurasi proxy harus sesuai topologi nyata: [Express behind proxies](https://expressjs.com/en/guide/behind-proxies/).
- **Backup:** volume database dan foto persisten serta script backup/restore sudah tersedia. Keberhasilan cron, salinan di luar server, restore database bersama foto, dan pemantauan kegagalan belum terbukti pada server target.
- **CI/CD:** Workflow sekarang membangun image backend/frontend dan memeriksa konfigurasi runtime dalam image frontend. Eksekusi workflow GitHub sebenarnya, pemeriksaan Nginx, serta uji stack HTTPS pada server tujuan belum diverifikasi dari lingkungan lokal ini.
- **Admin publik:** link admin tidak tampil, tetapi footer masih memiliki gestur lima ketukan menuju login. Perlindungan tetap berasal dari autentikasi backend, bukan dari penyembunyian akses UI.

## Bagian yang sudah memiliki fondasi sesuai

Backend memakai Argon2id, sesi PostgreSQL, regenerasi sesi saat login, pemeriksaan akun aktif, CSRF dan Origin pada mutasi, serta pembatasan percobaan login. Cookie dikonfigurasi HttpOnly/SameSite=Lax dan Secure pada mode produksi. Aksi paket memeriksa hubungan paket–konter di backend. Pemeriksaan kontak menolak paket dari konter lain dan URL WhatsApp valid dapat dibentuk tanpa mengirim pesan.

Unggahan dibatasi format, ukuran, dan jumlah piksel, diperiksa menggunakan Sharp, dikonversi menjadi WebP dengan nama UUID, dan disimpan dalam volume persisten. Secret environment dikecualikan dari konteks build Docker. Data contoh disembunyikan pada mode produksi dan seed menolak produksi. Compose memisahkan migrasi sebelum backend serta memiliki health check.

Fondasi tersebut diperiksa dari implementasi dan pengujian lokal; statusnya bukan pengganti uji stack produksi melalui HTTPS.

## Urutan menuju go-live

1. Selesai di kode: runner Docker frontend dan environment CI diperbaiki.
2. Selesai di kode: pencarian lokasi, konversi waktu paket, dan filter lokasi diperbaiki.
3. Siapkan domain, TLS, secret produksi, admin unik, dan kontak pengelola yang benar.
4. Build image dari lockfile pada staging terisolasi; jalankan migrasi di database staging dan verifikasi seluruh health check.
5. Uji login/logout, konter dan paket, foto, filter, detail, serta URL WhatsApp melalui HTTPS tanpa mengirim pesan transaksi.
6. Uji backup dan restore database beserta foto, lalu pastikan monitoring/cron dan rollback siap sebelum membuka trafik publik.
