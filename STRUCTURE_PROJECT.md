# Structure Project — Frontend dan Backend

| Informasi | Keterangan |
| --- | --- |
| Tanggal | 5 November 2026 |
| Acuan | [PRD.md](./PRD.md) dan [TECH_STACK.md](./TECH_STACK.md) |
| Bahasa | JavaScript ES Modules, JSX untuk komponen React |
| Bentuk repositori | npm workspaces: `frontend`, `backend`, dan `shared` |
| Status | Rancangan struktur; folder, script, dan endpoint di bawah merupakan target implementasi |

## 1. Struktur Utama

```text
ZYROSPACE/
├── PRD.md
├── TECH_STACK.md
├── STRUCTURE_PROJECT.md
├── README.md
├── package.json                 # Workspaces dan perintah lint/test/dev bersama
├── package-lock.json            # Satu lockfile untuk seluruh workspace
├── .gitignore
├── .node-version                # Versi Node yang dipin
├── eslint.config.js
├── prettier.config.js
├── playwright.config.js
├── compose.yaml                 # PostgreSQL untuk pengembangan lokal
├── frontend/                    # @konter/frontend: Next.js
├── backend/                     # @konter/backend: Express
├── shared/                      # @konter/shared: skema dan konstanta publik
├── tests/
│   └── e2e/
│       ├── directory.spec.js
│       ├── contact.spec.js
│       └── admin.spec.js
├── docs/
│   ├── api.md                   # Kontrak request/response dan error
│   └── operations.md            # Release, backup, restore, reset admin
├── infra/
│   ├── compose.production.yaml
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
└── .github/
    └── workflows/
        └── ci.yml
```

Root `package.json` menggunakan `private: true`, `type: "module"`, dan `workspaces: ["frontend", "backend", "shared"]`. Masing-masing workspace mempunyai `package.json` sendiri dan menggunakan `type: "module"`.

`frontend` dan `backend` mendeklarasikan `@konter/shared` sebagai dependency lokal dengan versi yang cocok dengan versi package shared. npm workspaces menghubungkannya saat instalasi dari root. File backend menggunakan ekstensi `.js` pada import relatif agar sesuai ES Modules Node.js.

## 2. Struktur Frontend

```text
frontend/
├── package.json
├── next.config.mjs
├── postcss.config.mjs
├── jsconfig.json
├── vitest.config.js
├── .env.example
├── .env.local                   # Lokal saja, tidak masuk Git
├── public/
│   ├── images/
│   │   ├── counter-placeholder.webp
│   │   └── brand-logo.svg
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.jsx           # Root layout, metadata, dan providers
    │   ├── providers.jsx        # QueryClientProvider
    │   ├── globals.css          # Tailwind dan token tampilan
    │   ├── error.jsx
    │   ├── not-found.jsx
    │   ├── robots.js
    │   ├── sitemap.js
    │   ├── (public)/
    │   │   ├── layout.jsx       # Header dan footer publik
    │   │   ├── page.jsx         # /, mengambil data awal di server
    │   │   ├── loading.jsx
    │   │   └── privasi/
    │   │       └── page.jsx     # /privasi
    │   └── admin/
    │       ├── layout.jsx       # Metadata noindex seluruh halaman admin
    │       ├── login/
    │       │   └── page.jsx     # /admin/login
    │       └── (protected)/
    │           ├── layout.jsx  # RequireAdmin dan navigasi admin
    │           ├── page.jsx    # /admin, ringkasan pengelolaan
    │           ├── konter/
    │           │   ├── page.jsx
    │           │   ├── baru/
    │           │   │   └── page.jsx
    │           │   └── [id]/
    │           │       └── edit/
    │           │           └── page.jsx
    │           ├── paket/
    │           │   ├── page.jsx
    │           │   ├── baru/
    │           │   │   └── page.jsx
    │           │   └── [id]/
    │           │       └── edit/
    │           │           └── page.jsx
    │           ├── provider/
    │           │   └── page.jsx
    │           ├── wilayah/
    │           │   └── page.jsx
    │           └── pengaturan/
    │               └── page.jsx
    ├── components/
    │   ├── layout/
    │   │   ├── SiteHeader.jsx
    │   │   ├── SiteFooter.jsx
    │   │   └── AdminSidebar.jsx
    │   └── ui/
    │       ├── Button.jsx
    │       ├── Input.jsx
    │       ├── Select.jsx
    │       ├── Dialog.jsx      # Pembungkus Radix Dialog
    │       ├── EmptyState.jsx
    │       ├── ErrorState.jsx
    │       └── Skeleton.jsx
    ├── features/
    │   ├── landing/
    │   │   └── components/
    │   │       ├── HeroSection.jsx
    │   │       ├── HowToBuySection.jsx
    │   │       ├── PartnerSection.jsx
    │   │       └── FaqSection.jsx
    │   ├── directory/
    │   │   ├── components/
    │   │   │   ├── CounterDirectory.jsx
    │   │   │   ├── CounterFilters.jsx
    │   │   │   ├── CounterCard.jsx
    │   │   │   ├── CounterDetailDialog.jsx
    │   │   │   ├── PackageCard.jsx
    │   │   │   └── ContactButton.jsx
    │   │   ├── hooks/
    │   │   │   ├── useCounters.js
    │   │   │   └── useCounterDetail.js
    │   │   ├── api.js
    │   │   ├── query-keys.js
    │   │   └── directory.test.jsx
    │   ├── auth/
    │   │   ├── components/
    │   │   │   ├── LoginForm.jsx
    │   │   │   └── RequireAdmin.jsx
    │   │   ├── useSession.js
    │   │   └── api.js
    │   ├── admin/
    │   │   ├── counters/
    │   │   │   ├── CounterTable.jsx
    │   │   │   ├── CounterForm.jsx
    │   │   │   └── api.js
    │   │   ├── packages/
    │   │   │   ├── PackageTable.jsx
    │   │   │   ├── PackageForm.jsx
    │   │   │   └── api.js
    │   │   ├── providers/
    │   │   │   ├── ProviderManager.jsx
    │   │   │   └── api.js
    │   │   ├── regions/
    │   │   │   ├── RegionManager.jsx
    │   │   │   └── api.js
    │   │   └── settings/
    │   │       ├── SettingsForm.jsx
    │   │       └── api.js
    │   └── analytics/
    │       ├── AnalyticsTracker.jsx
    │       └── track-event.js
    ├── hooks/
    │   └── useDebouncedValue.js
    ├── lib/
    │   ├── api-client.js        # Fetch browser, error, dan header CSRF
    │   ├── api-server.js        # Fetch server-only melalui API_INTERNAL_URL
    │   ├── query-client.js
    │   ├── format.js            # Format Rupiah/tanggal
    │   └── env.server.js
    └── test/
        └── setup.js
```

### Tanggung jawab frontend

| Folder | Aturan |
| --- | --- |
| `app/` | Menetapkan URL dan menyusun halaman; logika fitur ditempatkan di `features/`. |
| `components/ui/` | Komponen umum tanpa ketergantungan pada aturan bisnis konter. |
| `features/directory/` | Seluruh interaksi pencarian, filter, detail konter, paket, dan kontak. |
| `features/admin/` | Formulir dan tampilan pengelolaan; seluruh simpan data melalui API admin. |
| `features/auth/` | Login, logout, status sesi, dan pengalihan ke halaman login bila diperlukan. |
| `lib/api-server.js` | Modul ditandai `server-only`; tidak boleh masuk bundel browser. |
| `lib/api-client.js` | Menggunakan URL relatif `/api/v1`; membawa cookie same-origin dan token CSRF untuk mutasi admin. |

Route group `(public)` dan `(protected)` mengelompokkan layout dan tidak menjadi bagian URL. Gunakan `@/` sebagai alias menuju `frontend/src/`. Konfigurasikan `transpilePackages: ['@konter/shared']` agar kode shared diproses oleh Next.js. Konvensi folder mengikuti [struktur App Router Next.js](https://nextjs.org/docs/app/getting-started/project-structure).

`RequireAdmin` memeriksa `/auth/me` dan menunda pemuatan data admin sampai sesi valid. Backend tetap memeriksa otorisasi pada setiap request. Data admin di TanStack Query dibersihkan saat logout atau sesi kedaluwarsa.

## 3. Struktur Backend

```text
backend/
├── package.json
├── knexfile.js
├── vitest.config.js
├── .env.example
├── .env                         # Lokal saja, tidak masuk Git
├── scripts/
│   ├── create-admin.js         # Input password tersembunyi
│   ├── reset-admin-password.js # Juga mencabut sesi admin terkait
│   ├── report-pilot.js         # Metrik agregat pilot
│   └── cleanup-analytics.js
├── src/
│   ├── server.js               # Listen, shutdown, tutup koneksi database
│   ├── app.js                  # Express app, dapat dipakai Supertest
│   ├── routes.js               # Mount endpoint /api/v1
│   ├── config/
│   │   ├── env.js              # Memuat dan memvalidasi environment
│   │   ├── session.js          # express-session + store PostgreSQL
│   │   ├── csrf.js
│   │   └── logger.js
│   ├── database/
│   │   ├── connection.js       # Knex/pg pool
│   │   ├── migrations/
│   │   │   ├── 001_create_admins.js
│   │   │   ├── 002_create_admin_sessions.js
│   │   │   ├── 003_create_regions.js
│   │   │   ├── 004_create_counters.js
│   │   │   ├── 005_create_providers.js
│   │   │   ├── 006_create_packages.js
│   │   │   ├── 007_create_platform_settings.js
│   │   │   └── 008_create_analytics_events.js
│   │   └── seeds/
│   │       └── development.js
│   ├── middleware/
│   │   ├── require-admin.js
│   │   ├── validate.js
│   │   ├── rate-limit.js
│   │   ├── check-origin.js
│   │   ├── error-handler.js
│   │   └── not-found.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.repository.js
│   │   ├── catalog/
│   │   │   ├── catalog.routes.js
│   │   │   ├── catalog.controller.js
│   │   │   ├── catalog.service.js
│   │   │   ├── catalog.repository.js
│   │   │   └── public-package-query.js
│   │   ├── counters/
│   │   │   ├── counter.routes.js
│   │   │   ├── counter.controller.js
│   │   │   ├── counter.service.js
│   │   │   └── counter.repository.js
│   │   ├── packages/
│   │   │   ├── package.routes.js
│   │   │   ├── package.controller.js
│   │   │   ├── package.service.js
│   │   │   └── package.repository.js
│   │   ├── providers/
│   │   │   ├── provider.routes.js
│   │   │   ├── provider.controller.js
│   │   │   ├── provider.service.js
│   │   │   └── provider.repository.js
│   │   ├── regions/
│   │   │   ├── region.routes.js
│   │   │   ├── region.controller.js
│   │   │   ├── region.service.js
│   │   │   └── region.repository.js
│   │   ├── settings/
│   │   │   ├── settings.routes.js
│   │   │   ├── settings.controller.js
│   │   │   ├── settings.service.js
│   │   │   └── settings.repository.js
│   │   └── analytics/
│   │       ├── analytics.routes.js
│   │       ├── analytics.controller.js
│   │       ├── analytics.service.js
│   │       └── analytics.repository.js
│   └── lib/
│       ├── app-error.js
│       ├── password.js
│       ├── whatsapp.js
│       └── pagination.js
└── tests/
    ├── unit/
    │   └── whatsapp.test.js
    ├── integration/
    │   ├── catalog.test.js
    │   ├── admin-access.test.js
    │   ├── admin-write.test.js
    │   └── analytics.test.js
    └── helpers/
        ├── test-database.js
        └── fixtures.js
```

### Tanggung jawab backend

| Modul | Tanggung jawab |
| --- | --- |
| `auth` | Login/logout, informasi admin aktif, penerbitan token CSRF, dan akses data admin. |
| `catalog` | Katalog publik, filter, detail, harga minimum, serta validasi tujuan kontak. |
| `counters` | Pengelolaan konter melalui endpoint admin. |
| `packages` | Pengelolaan paket, ketersediaan, status publikasi, dan batas penayangan. |
| `providers` | Pengelolaan provider dan dampak penonaktifan terhadap paket terkait. |
| `regions` | Data wilayah yang digunakan filter dan formulir konter. |
| `settings` | Nama platform, kontak pengelola, FAQ, serta pengaturan publik lainnya. |
| `analytics` | Validasi dan penyimpanan event dengan properti yang dibatasi. |

`public-package-query.js` membentuk kondisi Knex untuk paket publik: konter diterbitkan, provider aktif, paket diterbitkan, ketersediaan diperbolehkan, dan batas tayang belum lewat. Semua query publik yang bergantung pada paket menggunakan fungsi tersebut.

Repository tidak mengakses `req` atau `res`. Service menerima objek input yang sudah divalidasi dan dapat dipanggil dari controller maupun script. Controller tidak berisi SQL. Transaksi digunakan untuk perubahan yang melibatkan beberapa tabel.

Nama folder teknis menggunakan bahasa Inggris secara konsisten. Label UI tetap menggunakan bahasa Indonesia.

## 4. Struktur Shared

```text
shared/
├── package.json                 # name: @konter/shared, type: module
└── src/
    ├── constants/
    │   ├── publication-status.js
    │   ├── availability-status.js
    │   └── analytics-events.js
    └── schemas/
        ├── auth.schema.js
        ├── counter.schema.js
        ├── package.schema.js
        ├── provider.schema.js
        ├── region.schema.js
        ├── settings.schema.js
        ├── catalog-query.schema.js
        └── analytics.schema.js
```

Package ini hanya berisi konstanta dan skema validasi Zod yang aman digunakan di browser. Kredensial, koneksi database, hashing password, dan aturan otorisasi tetap berada pada backend.

Deklarasikan subpath pada `exports`, misalnya `@konter/shared/schemas/package` menuju `./src/schemas/package.schema.js`. Frontend dan backend mengimpor melalui nama package tersebut, bukan menelusuri folder aplikasi lain menggunakan `../../`.

Aturan yang membutuhkan database, seperti memastikan provider masih aktif, berada di service backend. Shared schema hanya memvalidasi bentuk, nilai, dan batas input.

## 5. Pemetaan Halaman dan API

### 5.1 Halaman frontend

| URL | Fungsi |
| --- | --- |
| `/` | Landing page, direktori, filter, dan dialog konter. |
| `/privasi` | Penjelasan informasi usaha dan pencatatan analitik. |
| `/admin/login` | Login admin. |
| `/admin` | Navigasi ringkas ke pengelolaan katalog. |
| `/admin/konter` | Daftar konter termasuk draft dan nonaktif. |
| `/admin/konter/baru` | Formulir pembuatan konter. |
| `/admin/konter/[id]/edit` | Formulir pembaruan konter. |
| `/admin/paket` | Daftar paket dengan filter konter/provider/status. |
| `/admin/paket/baru` | Formulir pembuatan paket. |
| `/admin/paket/[id]/edit` | Formulir pembaruan paket. |
| `/admin/provider` | Daftar, tambah, edit, dan nonaktifkan provider dalam satu halaman. |
| `/admin/wilayah` | Pengelolaan nama wilayah untuk direktori. |
| `/admin/pengaturan` | Identitas platform, FAQ, dan kontak pengelola. |

### 5.2 Endpoint publik

Seluruh path pada tabel menggunakan prefix `/api/v1`.

| Metode | Path | Fungsi |
| --- | --- | --- |
| GET | `/health` | Status layanan minimal tanpa membocorkan konfigurasi. |
| GET | `/public/settings` | Pengaturan yang memang ditujukan untuk pengunjung. |
| GET | `/public/providers` | Provider aktif yang memiliki paket publik. |
| GET | `/public/regions` | Wilayah yang memiliki konter diterbitkan. |
| GET | `/public/counters` | Direktori: menerima `q`, `providerId`, `regionId`, `page`, `limit`. |
| GET | `/public/counters/:id` | Detail konter dan paket publiknya; mendukung `providerId` opsional. |
| GET | `/public/contact` | Menerima `counterId` dan `packageId` opsional; mengembalikan URL WhatsApp dari data terbaru. |
| POST | `/events` | Menyimpan event yang lolos validasi; tidak memerlukan sesi admin. |

Backend menormalisasi kata kunci dan menerapkan filter AND. Urutan awal berdasarkan nama konter A–Z, dengan ID sebagai pembeda urutan jika nama sama. Daftar menggunakan pagination, misalnya 12 konter per halaman dan batas maksimal 50. `total` menghitung seluruh hasil filter, bukan hanya halaman aktif. Provider, harga minimum, dan pencocokan nama paket menggunakan paket publik yang sama.

Endpoint kontak memastikan paket memang milik konter terpilih dan masih layak ditampilkan. Jika paket sudah tidak tersedia, kembalikan error `PACKAGE_UNAVAILABLE`; UI memperbarui detail dan menawarkan kontak umum konter melalui tindakan baru. URL dibentuk backend dengan host WhatsApp yang tetap dan pesan yang di-encode, tanpa menerima URL tujuan bebas dari browser.

### 5.3 Autentikasi dan admin

| Metode | Path | Fungsi |
| --- | --- | --- |
| GET | `/auth/csrf` | Mendapatkan token CSRF untuk sesi aktif atau sesi awal login. |
| POST | `/auth/login` | Memeriksa email/password dan membuat sesi admin. |
| GET | `/auth/me` | Identitas admin aktif; 401 jika tidak login. |
| POST | `/auth/logout` | Menghapus sesi dan cookie. |
| GET, POST | `/admin/counters` | Daftar seluruh status dan membuat konter. |
| GET, PATCH | `/admin/counters/:id` | Detail dan pembaruan konter, termasuk perubahan status. |
| GET, POST | `/admin/packages` | Daftar seluruh status dan membuat paket. |
| GET, PATCH | `/admin/packages/:id` | Detail dan pembaruan paket. |
| GET, POST | `/admin/providers` | Daftar provider dan pembuatan provider. |
| PATCH | `/admin/providers/:id` | Memperbarui nama/logo/status provider. |
| GET | `/admin/providers/:id/impact` | Menghitung paket terdampak sebelum penonaktifan provider. |
| GET, POST | `/admin/regions` | Daftar dan pembuatan wilayah. |
| PATCH | `/admin/regions/:id` | Memperbarui nama wilayah. |
| GET, PATCH | `/admin/settings` | Membaca dan memperbarui pengaturan platform. |

Mutasi katalog menggunakan status untuk menonaktifkan data. Semua route `/admin/*` menggunakan sesi dan pemeriksaan admin; mutasi ditambah pemeriksaan Origin serta CSRF. Login/logout juga memerlukan CSRF. Endpoint event publik memakai validasi payload dan pembatasan request sendiri.

### 5.4 Format respons

Respons daftar:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
}
```

Respons detail menggunakan `{ "data": { ... } }`. Kegagalan menggunakan bentuk berikut:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang diisi.",
    "fields": { "price": "Harga harus lebih besar dari nol." }
  }
}
```

Status HTTP: 200 untuk baca/update/login, 201 untuk pembuatan data, 204 untuk logout/event berhasil tanpa body, 400 untuk input tidak valid, 401 untuk sesi tidak valid, 403 untuk akses/CSRF ditolak, 404 untuk data tidak ditemukan atau tidak boleh tampil, 409 untuk konflik perubahan/ketersediaan, 429 untuk pembatasan request, dan 500 untuk kegagalan internal. Pesan 500 tidak membocorkan query atau stack trace.

`docs/api.md` saat implementasi harus melengkapi setiap endpoint dengan field request/response, batas input, dan contoh error. Daftar ini merupakan kontrak awal.

## 6. Contoh Alur Antarbagian

### Pengunjung membuka direktori

1. `app/(public)/page.jsx` memanggil `lib/api-server.js` untuk mendapatkan pengaturan, opsi filter, dan daftar awal.
2. Express mengarahkan request ke `catalog.routes.js`, controller, service, lalu repository.
3. Repository menerapkan aturan paket publik dan mengambil data PostgreSQL.
4. Next.js merender daftar awal ke HTML dan memberikan data awal kepada `CounterDirectory`.
5. Perubahan filter memanggil `features/directory/api.js` melalui TanStack Query; respons terbaru memperbarui kartu dan jumlah hasil.

### Admin mengubah harga paket

1. `PackageForm.jsx` memvalidasi input dengan schema shared.
2. `api-client.js` mengirim `PATCH /api/v1/admin/packages/:id` dengan cookie sesi dan token CSRF.
3. Backend memeriksa sesi, peran, Origin, CSRF, dan input; service memeriksa relasi serta aturan bisnis.
4. Repository menyimpan harga dan `updatedAt`, lalu mengembalikan data tersimpan.
5. UI menampilkan keberhasilan hanya setelah respons berhasil dan menginvalidasi query terkait. Pengunjung lain menerima perubahan melalui refetch berkala.

### Pengunjung menekan tombol WhatsApp

1. `ContactButton.jsx` meminta `/public/contact` dengan ID konter dan paket jika ada.
2. Backend memeriksa data terkini dan membentuk URL tujuan yang benar.
3. UI mengirim event analitik tanpa menunggu hasilnya, lalu melakukan navigasi ke URL WhatsApp pada tab yang sama agar tidak tergantung izin pop-up setelah request async.
4. Jika validasi kontak gagal, tampilkan pesan dan perbarui informasi; jangan menggunakan URL paket lama secara diam-diam.

## 7. Perintah Pengembangan yang Direncanakan

Perintah berikut adalah target script pada `package.json` ketika scaffold dibuat. Saat ini dokumen tidak membuat script yang dapat dieksekusi.

| Perintah dari root | Perilaku |
| --- | --- |
| `npm install` | Instalasi awal seluruh workspace dan menghasilkan lockfile. |
| `npm ci` | Instalasi terulang dari lockfile yang sudah tersedia. |
| `docker compose up -d db` | Menjalankan PostgreSQL lokal dari `compose.yaml`. |
| `npm run dev` | Menjalankan Next.js pada port 3000 dan Express pada port 4000 bersamaan melalui `concurrently`. |
| `npm run dev:frontend` | Menjalankan `next dev` pada workspace frontend. |
| `npm run dev:backend` | Menjalankan backend melalui `node --watch src/server.js`. |
| `npm run db:migrate` | Menjalankan migrasi Knex pada database yang dikonfigurasi. |
| `npm run db:seed` | Memasukkan fixture development; script menolak database produksi. |
| `npm run admin:create` | Membuat akun admin melalui input interaktif; password tidak ditulis di argumen command. |
| `npm run admin:reset-password` | Memperbarui hash password dan mencabut sesi admin terkait. |
| `npm run analytics:report` | Menghasilkan ringkasan pilot dari event tersimpan. |
| `npm run analytics:cleanup` | Menghapus event yang melewati retensi operasional, awalnya 90 hari. |
| `npm run lint` | Pemeriksaan ESLint seluruh workspace. |
| `npm run test` | Unit dan integration test; integrasi memerlukan `TEST_DATABASE_URL`. |
| `npm run test:e2e` | Menjalankan Playwright terhadap lingkungan uji terisolasi. |
| `npm run build` | Build frontend dan validasi konfigurasi backend; JavaScript backend berjalan tanpa transpile. |

Sebelum menjalankan aplikasi: siapkan environment dari masing-masing `.env.example`, jalankan database, migrasi, seed development bila perlu, dan buat admin. Rincian input env serta dependency mengikuti `TECH_STACK.md`.

## 8. Aturan Batas Modul dan Deployment

- Frontend hanya mengimpor kode miliknya dan `@konter/shared`; tidak mengimpor modul backend.
- Backend menjadi satu-satunya pemilik koneksi dan migrasi database bisnis.
- `shared` tidak boleh bergantung pada `frontend` atau `backend`.
- Next.js tidak menduplikasi controller CRUD bisnis sebagai Route Handlers. Rewrite lokal hanya meneruskan request ke Express.
- Pada produksi Nginx meneruskan `/api/v1/*` ke backend tanpa menghapus prefix; path lain menuju Next.js.
- Docker build memakai root repositori sebagai build context agar lockfile dan workspace shared tersedia. Image frontend/backend harus membawa dependency runtime serta workspace shared yang diperlukan.
- `.env`, `.env.local`, `node_modules`, `.next`, log, backup, dan output pengujian dikecualikan dari Git; `.env.example` tetap dilacak.
- Pengujian integrasi harus memverifikasi bahwa `TEST_DATABASE_URL` berbeda dari database aplikasi sebelum melakukan reset fixture.
- Tambahkan berkas sesuai kebutuhan fitur yang sedang dibangun; struktur ini menjadi panduan pembagian tanggung jawab dan dapat diringkas bila suatu modul masih kecil.
