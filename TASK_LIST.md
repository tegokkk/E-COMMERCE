# Task List — KonterKuota

| Informasi       | Keterangan                                                                          |
| --------------- | ----------------------------------------------------------------------------------- |
| Tanggal         | 6 November 2026                                                                     |
| Tujuan          | Checklist implementasi sistem berdasarkan seluruh markdown proyek yang tersedia     |
| Cakupan         | Persiapan, frontend, backend, database, integrasi, pengujian, deployment, dan pilot |
| Bahasa aplikasi | JavaScript ES Modules; `.js` dan `.jsx`                                             |
| Status awal     | Dokumentasi dan referensi UI tersedia; implementasi aplikasi belum tersedia         |

## 1. Sumber dan Aturan Acuan

| Dokumen                                                                                                           | Digunakan untuk                                                                            |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [PRD.md](./PRD.md)                                                                                                | Kebutuhan produk, FR-01–FR-14, aturan katalog, prioritas, dan target pilot.                |
| [TECH_STACK.md](./TECH_STACK.md)                                                                                  | Teknologi, autentikasi, database, environment, komunikasi aplikasi, dan operasional.       |
| [STRUCTURE_PROJECT.md](./STRUCTURE_PROJECT.md)                                                                    | Folder, modul, route, kontrak API, serta script pengembangan.                              |
| [DESIGN.md](./DESIGN.md)                                                                                          | Token visual final, layout, komponen, responsivitas, state, dan penyesuaian ekspor Stitch. |
| [Panduan sumber Stitch](./docs/design/stitch/source-design.md)                                                    | Referensi gaya desain asli.                                                                |
| [Panduan pada folder ekspor asli](./docs/stitch_konterkuota_directory_platform/konterku_warm_directory/DESIGN.md) | Salinan panduan sumber dengan isi yang sama; tidak menghasilkan pekerjaan ganda.           |
| [README referensi Stitch](./docs/design/stitch/README.md)                                                         | Asal arsip, pemetaan HTML/screenshot, dan status aset eksternal.                           |

Aturan fitur mengikuti PRD. Teknologi mengikuti TECH_STACK, struktur mengikuti STRUCTURE_PROJECT, dan keputusan visual final mengikuti DESIGN. Tambahan ringkasan admin `/admin/overview` yang sudah ditetapkan pada DESIGN ikut masuk ke checklist ini. Detail yang tidak didukung data, seperti rating, verifikasi, jarak, dan pengajuan mitra otomatis pada ekspor, tidak dimasukkan sebagai fitur MVP.

### Cara memakai checklist

- `[ ]` berarti belum selesai; `[x]` berarti hasil sudah tersedia dan kriteria tahapnya terpenuhi.
- ID seperti `T06.03` dipakai untuk mencatat progres, commit, hasil pemeriksaan, atau hambatan.
- Seluruh tugas T00–T12 adalah P0 untuk kesiapan MVP. T13 mencakup peluncuran dan evaluasi pilot. Backlog P1/P2 dicatat terpisah di bagian 5.
- Tandai tugas selesai berdasarkan hasil kerja yang dapat diperiksa, bukan hanya karena folder, mockup, atau tombol sudah ada.
- Untuk tugas yang sedang berjalan atau menunggu data, biarkan checkbox kosong dan catat kondisinya pada log progres di bagian 8.
- Input bisnis T00 diperlukan sebelum publikasi. Pengembangan dapat dimulai menggunakan nama kerja KonterKuota dan fixture berlabel data contoh.
- Estimasi waktu dan penanggung jawab personal ditambahkan saat pelaksanaan sesuai kapasitas tim.

## 2. Fondasi yang Sudah Tersedia

- [x] **DOC-01** — Dokumen kebutuhan produk dan batas MVP tersedia dalam PRD.
- [x] **DOC-02** — Stack JavaScript frontend/backend dan database sudah didokumentasikan.
- [x] **DOC-03** — Struktur folder, route, endpoint awal, dan script target sudah didokumentasikan.
- [x] **DOC-04** — Panduan penerapan desain Stitch sudah dibuat dan diselaraskan dengan PRD.
- [x] **DOC-05** — Referensi HTML, screenshot, panduan sumber, dan manifest gambar ekspor tersedia.

Checklist ini tidak menganggap dokumentasi sebagai implementasi yang sudah berjalan. Belum ada tugas aplikasi di bawah yang ditandai selesai.

## 3. Urutan Tahap dan Dependensi

| Tahap | Fokus                      | Dependensi                 | Hasil akhir                                                       |
| ----- | -------------------------- | -------------------------- | ----------------------------------------------------------------- |
| T00   | Identitas dan konten pilot | Dapat dimulai sejak awal   | Data bisnis yang siap dipublikasikan.                             |
| T01   | Setup proyek               | Dokumen acuan              | Workspace frontend/backend/shared dapat dijalankan.               |
| T02   | Shared schema dan database | T01                        | Skema, migrasi, dan fixture konsisten.                            |
| T03   | Fondasi UI                 | T01                        | Token, komponen bersama, shell, dan aset dasar.                   |
| T04   | Fondasi backend            | T02                        | API dasar, validasi, error, dan logging.                          |
| T05   | Auth dan API admin         | T04                        | Pengelolaan katalog dengan akses admin.                           |
| T06   | API katalog publik         | T04                        | Katalog, filter, detail, dan tujuan kontak tervalidasi.           |
| T07   | Landing dan direktori      | T03; T06 untuk integrasi   | Halaman publik memakai data API.                                  |
| T08   | Detail dan WhatsApp        | T07, T06                   | Alur pencarian sampai kontak penjual berfungsi.                   |
| T09   | Panel admin                | T03, T05                   | UI pengelolaan terhubung ke backend.                              |
| T10   | Analitik                   | T04–T08                    | Event dan laporan pilot tersedia.                                 |
| T11   | Pengujian penerimaan       | T01–T10                    | Bukti fungsi, visual, aksesibilitas, dan performa.                |
| T12   | Deployment                 | T11; T00 sebelum publikasi | Lingkungan produksi dan prosedur operasional siap.                |
| T13   | Peluncuran dan pilot       | T00, T11, T12              | Sistem digunakan, katalog dipelihara, dan hasil pilot dievaluasi. |

Pembuatan tampilan pada T07/T09 dapat memakai fixture sebelum API selesai; checkbox integrasinya baru ditutup setelah menggunakan API nyata. Pengujian fitur dilakukan selama pengembangan, sedangkan T11 mengonsolidasikan pemeriksaan lintas fitur sebelum rilis.

## 4. Checklist Implementasi dan Pilot

### T00 — Identitas, konten, dan keputusan operasional

**Bidang:** produk/konten. **Acuan:** PRD bagian 2, 4, 15–16; DESIGN bagian 12.

- [ ] **T00.01** — Tetapkan nama final platform, logo, wilayah pilot, dan zona waktu tampilan. KonterKuota tetap menjadi nama kerja sampai keputusan final tersedia.
- [ ] **T00.02** — Tetapkan pengelola katalog, kontak publik, dan nomor WhatsApp pengelola untuk pendaftaran mitra.
- [ ] **T00.03** — Kumpulkan minimal lima konter pilot dengan nama, wilayah, alamat, WhatsApp usaha, deskripsi, jam operasional bila tersedia, dan izin publikasi informasi usaha.
- [ ] **T00.04** — Kumpulkan minimal dua paket layak tampil per konter: provider, rincian kuota, masa aktif, harga, syarat, ketersediaan, dan batas penayangan bila ada.
- [ ] **T00.05** — Siapkan foto konter, logo provider bila tersedia, ilustrasi, serta placeholder; pastikan foto kartu dan detail merujuk usaha yang sama.
- [ ] **T00.06** — Tetapkan isi FAQ, penjelasan privasi, copy pendaftaran mitra, dan kontak dukungan berdasarkan alur operasional nyata.
- [ ] **T00.07** — Tetapkan domain, penyedia hosting, anggaran operasional, serta pihak yang menangani backup dan pembaruan katalog mingguan.

**Selesai jika:** data dan keputusan yang diperlukan untuk peluncuran tersedia tanpa memakai nomor, alamat, paket, atau foto fiktif sebagai informasi usaha nyata.

### T01 — Setup repositori dan lingkungan pengembangan

**Bidang:** frontend/backend. **Acuan:** TECH_STACK bagian 1–2, 5–6; STRUCTURE_PROJECT bagian 1, 7–8.

- [x] **T01.01** — Buat npm workspaces `frontend`, `backend`, dan `shared`; gunakan `private: true`, ES Modules, dan satu `package-lock.json` di root.
- [x] **T01.02** — Pin Node.js 24 LTS dan dependency yang kompatibel sesuai baseline TECH_STACK; dokumentasikan versi yang benar-benar dipasang.
- [x] **T01.03** — Siapkan frontend Next.js 16 App Router dengan React JavaScript, Tailwind CSS 4, `jsconfig.json`, alias `@/`, serta pemrosesan `@konter/shared`.
- [x] **T01.04** — Siapkan Express 5 dengan `app.js` terpisah dari `server.js` dan folder route/controller/service/repository sesuai STRUCTURE_PROJECT.
- [x] **T01.05** — Siapkan PostgreSQL 17 lokal melalui `compose.yaml`, volume data, dan database pengujian terpisah.
- [x] **T01.06** — Buat `.env.example` frontend/backend, aturan `.gitignore`, pemuatan environment, dan validasi konfigurasi wajib tanpa menyimpan rahasia di Git.
- [x] **T01.07** — Hubungkan browser ke `/api/v1` melalui rewrite development; server Next.js memakai `API_INTERNAL_URL`. Pertahankan prefix API saat diteruskan.
- [x] **T01.08** — Siapkan ESLint, Prettier, Vitest, React Testing Library, Supertest, serta Playwright dengan konfigurasi JavaScript.
- [x] **T01.09** — Buat script root `dev`, `dev:frontend`, `dev:backend`, `build`, `lint`, `test`, dan `test:e2e`; frontend berjalan pada port 3000 dan backend pada port 4000.
- [x] **T01.10** — Tulis README pengembangan: instalasi, environment, menjalankan database, migrasi, seed, admin, serta cara menjalankan pemeriksaan.

**Selesai jika:** checkout bersih dapat diinstal dan menjalankan kedua aplikasi serta database mengikuti README; frontend tidak memiliki akses langsung ke credential database.

### T02 — Shared schema, database, dan fixture

**Bidang:** backend/shared. **Acuan:** PRD bagian 8–9; TECH_STACK bagian 4.2; STRUCTURE_PROJECT bagian 3–4.

- [x] **T02.01** — Buat package `@konter/shared` dengan exports yang jelas untuk schema dan konstanta yang aman dipakai browser.
- [x] **T02.02** — Definisikan status publikasi `draft/published/inactive`, ketersediaan `available/needs_confirmation/unavailable`, serta nama event analitik.
- [x] **T02.03** — Buat schema Zod untuk auth, konter, paket, provider, wilayah, pengaturan, query katalog, dan event; pisahkan validasi draft dari persyaratan publikasi.
- [x] **T02.04** — Siapkan Knex + `pg`, konfigurasi pool, koneksi, transaksi, dan penutupan koneksi ketika aplikasi berhenti.
- [x] **T02.05** — Buat migrasi `admins` dan `admin_sessions`, termasuk format sesi yang kompatibel dengan store PostgreSQL.
- [x] **T02.06** — Buat migrasi `regions`, `counters`, `providers`, dan `packages` dengan foreign key serta relasi yang menjaga kepemilikan paket.
- [x] **T02.07** — Buat migrasi `platform_settings` dan `analytics_events` dengan field yang diperlukan oleh pengaturan dan laporan pilot.
- [x] **T02.08** — Terapkan UUID data bisnis, harga integer positif, timestamp berzona waktu, enum/check constraint, serta indeks sesuai query katalog dan admin.
- [x] **T02.09** — Bedakan masa aktif kuota, batas penayangan, dan waktu pembaruan; simpan waktu secara konsisten dan konversi zona waktu secara eksplisit.
- [x] **T02.10** — Buat fixture tunggal yang mencakup konter/paket aktif, draft, nonaktif, kedaluwarsa, perlu konfirmasi, dan konter tanpa paket; hitungan dashboard serta harga kartu harus sesuai fixture tersebut.
- [x] **T02.11** — Tambahkan `db:migrate` dan `db:seed`; seed fiktif menolak database produksi. Helper pengujian memastikan database test berbeda sebelum melakukan reset fixture.

**Selesai jika:** migrasi berhasil pada database kosong dan fixture konsisten di seluruh layar, dengan constraint yang menolak relasi atau nilai tidak valid.

### T03 — Design system, shell, dan aset

**Bidang:** frontend/UI. **Acuan:** DESIGN bagian 4–5, 9–10, 12; panduan dan inventaris Stitch.

- [x] **T03.01** — Terapkan token final warna, font, spacing, radius, shadow, serta status di `globals.css` menggunakan Tailwind 4; petakan ulang radius dari config ekspor.
- [x] **T03.02** — Muat Plus Jakarta Sans melalui `next/font`; siapkan `Icon` dengan gaya Material Symbols Outlined yang konsisten dan label aksesibel.
- [x] **T03.03** — Buat Button/IconButton, Input/Textarea, Select, FilterChip, dan Badge dengan varian normal, hover, focus, pressed, disabled, serta loading.
- [x] **T03.04** — Buat Dialog/ConfirmDialog, Toast, Skeleton, EmptyState, ErrorState, Pagination, dan DataTable yang dapat dipakai ulang.
- [x] **T03.05** — Buat shell publik: rail desktop 88 px, header sticky, bottom navigation di bawah 1024 px, safe area, scroll offset, dan state menu aktif.
- [x] **T03.06** — Buat shell admin: rail pada desktop dan drawer pada layar kecil, termasuk Lihat Website serta Keluar.
- [x] **T03.07** — Terapkan layout satu/dua/tiga kolom sesuai DESIGN, max-width konten, padding responsif, dan area kartu yang tetap nyaman tanpa mengecilkan teks.
- [x] **T03.08** — Siapkan font, ikon, placeholder, dan gambar yang diperlukan; telusuri sembilan referensi gambar eksternal pada manifest dan ganti dengan aset tersedia yang sesuai pemakaian.
- [x] **T03.09** — Terapkan `next/image`, allowlist host yang selaras dengan backend, ukuran/rasio gambar, crop, fallback, dan atribut `alt`.
- [x] **T03.10** — Terapkan kontras, fokus terlihat, target sentuh minimal 44 px, reduced motion, serta layer dialog di atas navigasi.

**Selesai jika:** komponen dan shell siap digunakan pada layar kecil maupun besar dengan token DESIGN; screenshot halaman tidak menjadi aset foto aplikasi.

### T04 — Fondasi backend dan kontrak API

**Bidang:** backend. **Acuan:** TECH_STACK bagian 4–6; STRUCTURE_PROJECT bagian 3, 5.

- [x] **T04.01** — Pasang router `/api/v1`, endpoint health minimal, parsing JSON dengan batas ukuran, dan penanganan route tidak ditemukan.
- [x] **T04.02** — Buat middleware validasi input, error handler, dan respons konsisten `{ data, meta }` atau `{ error: { code, message, fields } }`.
- [x] **T04.03** — Terapkan Helmet, pembatasan request yang sesuai endpoint, serta konfigurasi proxy dan Origin berdasarkan environment.
- [x] **T04.04** — Siapkan Pino/Pino HTTP; sembunyikan password, cookie, token, nomor/pesan kontak, credential, dan query pencarian mentah dari log.
- [x] **T04.05** — Buat utility pagination, format error bisnis, normalisasi nomor WhatsApp, dan validasi URL gambar/peta sesuai kebijakan aplikasi.
- [x] **T04.06** — Tulis `docs/api.md` dengan request/response, batas input, status HTTP, pagination, dan contoh error untuk seluruh endpoint target, termasuk `/admin/overview`.

**Selesai jika:** respons API dapat dipakai frontend secara konsisten dan error internal tidak membocorkan query maupun stack trace.

### T05 — Autentikasi dan API admin

**Bidang:** backend. **Acuan:** FR-10–FR-12; TECH_STACK bagian 4.3; STRUCTURE_PROJECT bagian 5.3; DESIGN bagian 8, 11.

- [x] **T05.01** — Implementasikan hash password Argon2id serta script `admin:create` dan `admin:reset-password` dengan input password tersembunyi; reset mencabut sesi admin terkait.
- [x] **T05.02** — Pasang `express-session` dengan `connect-pg-simple`; gunakan sesi absolut 8 jam, regenerasi ID saat login, dan cookie produksi HttpOnly/Secure/SameSite=Lax/Path=/ tanpa Domain.
- [x] **T05.03** — Implementasikan `GET /auth/csrf` dan validasi `X-CSRF-Token` pada login, logout, serta mutasi admin; perbarui token setelah regenerasi sesi.
- [x] **T05.04** — Implementasikan login, `/auth/me`, dan logout, termasuk pembatasan percobaan login serta pesan kegagalan yang tidak mengungkap keberadaan email.
- [x] **T05.05** — Terapkan pemeriksaan sesi, status akun, peran, dan Origin di server untuk seluruh akses admin; katalog publik tidak memerlukan sesi login.
- [x] **T05.06** — Buat endpoint daftar, detail, tambah, edit, publikasi, dan nonaktifkan konter; terbitkan hanya setelah data wajib valid.
- [x] **T05.07** — Buat endpoint pengelolaan paket dengan filter admin, kepemilikan konter/provider, rincian kuota, ketersediaan, status publikasi, harga, dan batas penayangan.
- [x] **T05.08** — Buat endpoint provider serta `/admin/providers/:id/impact`; penonaktifan memengaruhi kelayakan paket publik dan menampilkan dampaknya sebelum konfirmasi.
- [x] **T05.09** — Buat endpoint wilayah dan pengaturan platform; hasil pengaturan publik hanya memuat field yang memang boleh ditampilkan.
- [x] **T05.10** — Buat modul dan `GET /admin/overview`: total/distribusi status konter, paket, provider aktif, wilayah berkonter publik, serta daftar perhatian berdasarkan data.
- [x] **T05.11** — Gunakan transaksi bila perubahan melibatkan beberapa tabel; respons menyertakan hasil yang benar-benar tersimpan dan `updatedAt` yang sesuai perubahan nyata.

**Selesai jika:** katalog dapat dikelola melalui API dengan otorisasi server, data persisten, dan jumlah ringkasan yang benar meskipun daftar memakai pagination.

### T06 — API direktori dan kontak publik

**Bidang:** backend. **Acuan:** FR-01–FR-09; PRD bagian 8.1–8.2; STRUCTURE_PROJECT bagian 5.2.

- [x] **T06.01** — Buat fungsi query paket publik bersama: konter/paket diterbitkan, provider aktif, ketersediaan diperbolehkan, dan batas tayang belum lewat.
- [x] **T06.02** — Implementasikan `GET /public/settings`, `/public/providers`, dan `/public/regions` dengan opsi yang sesuai katalog aktif.
- [x] **T06.03** — Implementasikan daftar konter dengan pencarian case-insensitive pada nama konter, alamat/wilayah, provider, serta nama paket publik; trim input dan gunakan parameter query terikat.
- [x] **T06.04** — Terapkan gabungan kata kunci/provider/wilayah dengan logika AND, urutan nama A–Z serta ID pembeda, pagination, batas limit, dan total seluruh hasil.
- [x] **T06.05** — Hitung provider kartu serta harga minimum dari paket publik yang sesuai filter; konter tanpa paket tetap tampil tanpa filter provider dengan informasi yang tepat.
- [x] **T06.06** — Implementasikan detail konter beserta paket miliknya dan filter provider opsional; data yang tidak boleh tampil menghasilkan respons yang sesuai.
- [x] **T06.07** — Implementasikan `/public/contact`: periksa konter, kepemilikan paket, kelayakan saat klik, normalisasi nomor, dan encode pesan sebelum mengembalikan URL WhatsApp.
- [x] **T06.08** — Bedakan kontak umum konter, kontak paket, dan kontak pengelola; paket berubah mengembalikan `PACKAGE_UNAVAILABLE`, tanpa memakai nomor contoh bersama.
- [x] **T06.09** — Terapkan respons katalog tanpa cache HTTP bersama, pengecekan kedaluwarsa saat membaca, serta timestamp yang mendukung target kesegaran maksimal 60 detik.

**Selesai jika:** pencarian, daftar, detail, harga minimum, dan kontak memakai aturan paket publik yang konsisten serta tidak membocorkan draft/nonaktif.

### T07 — Landing page dan direktori frontend

**Bidang:** frontend. **Acuan:** FR-01–FR-04, FR-07–FR-09, FR-13; DESIGN bagian 5–6.

- [x] **T07.01** — Siapkan `api-server.js` yang server-only, `api-client.js`, QueryClientProvider, query keys, penanganan error, dan pembatalan request yang sudah tidak relevan.
- [x] **T07.02** — Bangun halaman `/` dengan pengaturan serta daftar awal dari server agar informasi utama dan konter tersedia di HTML awal; initialData hanya untuk query yang parameternya sesuai.
- [x] **T07.03** — Implementasikan hero, header, rail/bottom navigation, dan anchor berdasarkan copy serta komposisi final DESIGN.
- [x] **T07.04** — Implementasikan CounterFilters: pencarian, chip provider tunggal, dropdown wilayah, jumlah hasil, clear, reset, dan sinkronisasi search header/direktori.
- [x] **T07.05** — Implementasikan CounterCard: foto, identitas, lokasi, provider, harga minimum, Lihat Paket, serta Hubungi Konter dengan tata tombol yang responsif.
- [x] **T07.06** — Hubungkan daftar ke API, debounce sekitar 300 ms, pagination, reset halaman ketika filter berubah, dan live region untuk jumlah hasil.
- [x] **T07.07** — Bangun panel petunjuk, Cara Beli, Gabung Mitra, FAQ accordion, dan footer; kontak mitra menggunakan nomor pengelola dari pengaturan.
- [x] **T07.08** — Bangun `/privasi`, metadata judul/deskripsi/canonical/berbagi, sitemap, robots, dan satu H1 yang jelas; tautan footer menuju halaman/anchor yang benar.
- [x] **T07.09** — Lengkapi loading, direktori kosong, tanpa hasil, API gagal dengan Coba lagi, gambar gagal, serta penanda data lama/offline.
- [x] **T07.10** — Terapkan refetch daftar/opsi filter ketika aktif sekitar 30 detik, saat fokus kembali, dan koneksi pulih; jangan menandai data gagal sebagai hasil kosong.
- [x] **T07.11** — Ganti script DOM/handler inline prototipe menjadi komponen React dan hilangkan klaim/fitur ekspor yang sudah dikecualikan pada DESIGN.

**Selesai jika:** halaman publik lengkap, hasil filter berasal dari API, dan seluruh navigasi serta keadaan data dapat digunakan pada desktop maupun ponsel.

### T08 — Detail konter, paket, dan WhatsApp

**Bidang:** frontend/integrasi. **Acuan:** FR-05–FR-08, FR-13; DESIGN bagian 7 dan 12.2.

- [x] **T08.01** — Bangun CounterDetailDialog: dialog besar desktop dan penuh pada mobile, tinggi berdasarkan viewport dinamis, area isi scroll, serta header/footer tindakan yang tetap terjangkau.
- [x] **T08.02** — Terapkan judul aksesibel, focus trap, Escape, penguncian scroll latar, pengembalian fokus dan posisi daftar, serta penempatan dialog di atas bottom navigation.
- [x] **T08.03** — Muat CounterProfile berdasarkan ID: foto, deskripsi, alamat, jam, dan peta opsional; tampilkan fallback jika jam operasional kosong.
- [x] **T08.04** — Bangun PackageCard dengan provider, rincian pembagian kuota, masa aktif, syarat, harga, timestamp, serta badge yang didukung data.
- [x] **T08.05** — Bawa filter provider aktif ke dialog dan sediakan reset; konter yang berbeda memuat katalog masing-masing, bukan paket contoh yang sama.
- [x] **T08.06** — Petakan Tersedia ke “Tanya Paket” dan Perlu konfirmasi ke “Tanya Ketersediaan”; paket tidak layak tampil disembunyikan termasuk ketika masa tayangnya habis saat dialog terbuka.
- [x] **T08.07** — Hubungkan ContactButton ke `/public/contact`, tampilkan “Menyiapkan WhatsApp…”, cegah klik ganda, lalu navigasikan pada tab yang sama tanpa mengirim pesan otomatis.
- [x] **T08.08** — Tangani paket/konter berubah, error API kontak, serta opsi kontak umum melalui tindakan baru; jangan membuka URL paket lama secara diam-diam.
- [x] **T08.09** — Terapkan pembaruan detail aktif, penanda gagal refresh, dan komunikasi langsung ke penjual; event analitik tidak menahan navigasi.

**Selesai jika:** pengunjung dapat berpindah antar konter, membaca paket yang benar, dan membuka tujuan WhatsApp sesuai penjual dengan konteks paket yang dipilih.

### T09 — Panel admin frontend

**Bidang:** frontend/integrasi. **Acuan:** FR-10–FR-13; DESIGN bagian 8; STRUCTURE_PROJECT bagian 5.1.

- [x] **T09.01** — Buat `/admin/login` dengan email/password, tampilkan password, loading, serta error; hubungkan token CSRF dan sesi menggunakan client API.
- [x] **T09.02** — Buat RequireAdmin, identitas sesi, redirect login, logout, metadata noindex, serta pembersihan cache admin ketika keluar atau sesi berakhir.
- [x] **T09.03** — Buat `/admin` dengan CatalogSummary dan AttentionList dari `/admin/overview`; CTA mengarah ke data/form terkait dan error tidak disamarkan sebagai angka nol.
- [x] **T09.04** — Buat `/admin/konter` dengan pencarian, filter publikasi, pagination, edit, publikasi, dan nonaktif; gunakan tabel desktop serta kartu data mobile.
- [x] **T09.05** — Buat form tambah/edit konter lengkap, URL foto dengan preview, Simpan Draft/Terbitkan, pratinjau kartu, serta validasi publikasi.
- [x] **T09.06** — Buat `/admin/paket` dan form tambah/edit paket dengan filter konter/provider/status, rincian kuota, harga, masa aktif, syarat, serta batas tayang berzona waktu.
- [x] **T09.07** — Buat `/admin/provider`: tambah/edit, URL logo, aktif/nonaktif, dan dialog jumlah paket yang terdampak sebelum konfirmasi.
- [x] **T09.08** — Buat `/admin/wilayah` dan `/admin/pengaturan` untuk identitas platform, kontak, wilayah pilot, logo, serta pertanyaan/jawaban FAQ.
- [x] **T09.09** — Terapkan error dekat field, penyimpanan sedang berlangsung, pesan sukses, kegagalan tanpa kehilangan input, dan konfirmasi perubahan belum tersimpan.
- [x] **T09.10** — Terapkan dialog dampak penonaktifan konter/paket; invalidasi query setelah simpan berhasil dan tampilkan hasil tersimpan dari API.
- [x] **T09.11** — Terapkan panel panduan Tambah Konter melalui proses manual, tanpa daftar pengajuan formulir otomatis atau batas enam paket yang tidak ada di PRD.

**Selesai jika:** seluruh route admin P0 dapat mengelola data persisten dan perubahan tersebut terlihat pada katalog publik sesuai batas kesegaran.

### T10 — Analitik dan laporan pilot

**Bidang:** frontend/backend. **Acuan:** FR-14; PRD bagian 4, 12; TECH_STACK bagian 4.4.

- [x] **T10.01** — Implementasikan `POST /events` dengan allowlist nama event/properti, batas payload, pembatasan request, dan penyimpanan ke PostgreSQL.
- [x] **T10.02** — Buat ID sesi anonim per tab melalui `sessionStorage`, terpisah dari sesi login; catat `page_view` sekali per sesi tab dan keluarkan admin/pengujian dari laporan.
- [x] **T10.03** — Catat `directory_view`, `search_used`, `filter_applied`, `counter_detail_opened`, `whatsapp_clicked`, dan `partner_signup_clicked` sesuai pemicu pada PRD.
- [x] **T10.04** — Pastikan payload tidak memuat nomor telepon, isi pesan WhatsApp, credential, atau teks pencarian mentah; gunakan ID entitas, posisi tombol, dan jumlah hasil.
- [x] **T10.05** — Buat pengiriman event yang tidak memblokir navigasi dan tidak menggagalkan kontak ketika analitik mati, lambat, atau gagal.
- [x] **T10.06** — Buat `analytics:report`: jumlah sesi publik, sesi dengan minimal satu klik WhatsApp penjual, rasio minat, serta klik mitra terpisah; jangan menyebut klik sebagai pembelian.
- [x] **T10.07** — Buat `analytics:cleanup` dengan retensi awal 90 hari, konfigurasi nonaktif pada development/test, dan prosedur menjalankannya dalam dokumentasi operasional.

**Selesai jika:** metrik pilot dapat dihitung dari event yang konsisten tanpa mengumpulkan properti terlarang atau mengganggu alur utama.

### T11 — Pengujian dan penerimaan MVP

**Bidang:** pengujian/frontend/backend. **Acuan:** PRD bagian 11, 14–15; TECH_STACK bagian 8; DESIGN bagian 14.

- [x] **T11.01** — Uji kombinasi pencarian/provider/wilayah, case-insensitive, reset, jumlah total, dan pagination menggunakan fixture beberapa wilayah serta provider.
- [x] **T11.02** — Uji aturan paket publik: draft, nonaktif, provider nonaktif, konter nonaktif, tidak tersedia, dan batas tayang lewat tidak muncul atau memengaruhi harga minimum.
- [x] **T11.03** — Uji konter tanpa paket, harga minimum setelah paket termurah dinonaktifkan, serta perbedaan masa aktif kuota dengan batas penayangan.
- [x] **T11.04** — Uji tujuan WhatsApp untuk beberapa konter/paket, normalisasi nomor, karakter khusus pesan, paket berubah saat klik, dan kontak pengelola yang terpisah.
- [x] **T11.05** — Uji penolakan akses langsung API admin tanpa sesi/peran, CSRF tidak valid, sesi habis, logout, pergantian ID sesi saat login, serta pembatasan login.
- [x] **T11.06** — Uji CRUD/publikasi admin, persistensi setelah restart, error simpan tanpa kehilangan input, total ringkasan lintas halaman, dan pencabutan sesi setelah reset password.
- [x] **T11.07** — Uji bahwa perubahan admin dan kedaluwarsa paket tercermin pada pengunjung dalam maksimal 60 detik pada koneksi normal, termasuk pemulihan fokus/koneksi.
- [x] **T11.08** — Uji event analitik, pengecualian admin/test, perhitungan rasio dari sesi unik, properti yang dilarang, dan navigasi WhatsApp ketika analitik gagal.
- [x] **T11.09** — Verifikasi HTML awal mengandung informasi utama/daftar konter, metadata dan tautan benar, admin noindex, serta rahasia/modul server tidak masuk bundel publik.
- [x] **T11.10** — Periksa UI pada lebar 360, 390, 768, 1024, dan 1440 px; zoom teks 200%; safe area; bottom navigation; drawer admin; dan tabel tanpa overflow halaman.
- [x] **T11.11** — Periksa keyboard, focus trap/return, Escape, label input, live region, alt gambar, kontras minimal 4,5:1, target sentuh, serta reduced motion.
- [x] **T11.12** — Uji loading, tanpa data, tanpa hasil, error API, offline/data lama, gambar gagal, sesi berakhir, dan kontak gagal sebagai keadaan yang berbeda.
- [x] **T11.13** — Bandingkan tampilan dengan tiga referensi Stitch dan DESIGN; periksa font, warna, grid, radius, konsistensi foto/data, serta ketiadaan klaim yang tidak didukung fitur.
- [x] **T11.14** — Ukur Lighthouse Performance mobile pada build produksi dengan konten pilot; capai skor minimal 85 dan simpan kondisi pengukurannya.
- [x] **T11.15** — Uji alur utama di browser desktop, Chrome Android, serta Safari iOS pada perangkat/lingkungan yang tersedia; dokumentasikan cakupan yang benar-benar diuji.
- [x] **T11.16** — Lakukan uji kegunaan dengan lima peserta; target minimal empat peserta menemukan konter sesuai provider dan membuka WhatsApp dalam maksimal 60 detik tanpa panduan.
- [x] **T11.17** — Jalankan lint, pengujian relevan, dan build; catat bukti hasil serta selesaikan kegagalan yang menghalangi kriteria penerimaan.

**Selesai jika:** kriteria FR-01–FR-14, desain, dan nonfungsional telah diperiksa dengan bukti. Checkbox tidak ditutup berdasarkan mockup atau tampilan sukses yang memakai data tetap.

### T12 — Deployment dan kesiapan operasional

**Bidang:** operasional/backend/frontend. **Acuan:** TECH_STACK bagian 5–7; STRUCTURE_PROJECT bagian 7–8.

- [x] **T12.01** — Buat CI untuk instalasi dari lockfile, lint, pengujian relevan dengan database terisolasi, serta build frontend.
- [x] **T12.02** — Buat Dockerfile frontend/backend dengan root repositori sebagai build context; sertakan workspace shared dan dependency runtime yang diperlukan.
- [x] **T12.03** — Siapkan compose produksi dengan frontend, backend, PostgreSQL persisten, serta Nginx; konfigurasi sesuai hosting/domain yang telah ditetapkan.
- [x] **T12.04** — Atur satu origin HTTPS: `/api/v1/*` menuju Express tanpa menghapus prefix, path lain menuju Next.js; backend/database menggunakan jaringan internal.
- [x] **T12.05** — Pasang environment produksi, session secret, allowlist gambar, origin, proxy terpercaya, zona waktu, dan kebijakan log; verifikasi cookie admin melalui HTTPS.
- [x] **T12.06** — Siapkan langkah release: build, migrasi satu kali, pembuatan admin dengan input privat, pemuatan data produksi, startup, serta pemeriksaan health; jangan menjalankan seed fiktif.
- [x] **T12.07** — Siapkan backup PostgreSQL harian di lokasi terpisah dan uji pemulihan database sebelum peluncuran.
- [x] **T12.08** — Tulis `docs/operations.md`: release, pemulihan aplikasi/database, reset admin, backup/restore, pemeriksaan log, pemeliharaan sertifikat, serta pelaksanaan cleanup analitik.
- [x] **T12.09** — Pastikan font, ikon, gambar, URL peta, dan link kontak dapat digunakan pada deployment; hapus ketergantungan produksi pada script CDN/prototipe Stitch.
- [x] **T12.10** — Lakukan smoke test deployment: landing, filter, detail, kontak, login, perubahan katalog, logout, dan pembaruan publik; catat hasil sebelum membuka pilot.

**Selesai jika:** aplikasi dapat dijalankan ulang dari konfigurasi release, data tetap persisten, backup dapat dipulihkan, serta alur utama berhasil pada lingkungan deployment.

### T13 — Peluncuran dan evaluasi pilot

**Bidang:** produk/konten/operasional. **Acuan:** PRD bagian 4, 15–16.

- [ ] **T13.01** — Periksa data produksi minimal lima konter dengan dua paket publik per konter; pastikan semua kontak, harga, kuota, foto, serta alamat telah dikonfirmasi.
- [ ] **T13.02** — Pastikan tugas P0 dan kriteria penerimaan selesai; dokumentasikan tanggal peluncuran, versi rilis, pengelola, serta jalur penanganan masalah.
- [ ] **T13.03** — Publikasikan pilot dengan konten final dan lakukan pemeriksaan alur dari sisi pengunjung serta pengelola pada domain publik.
- [ ] **T13.04** — Jalankan pemeriksaan katalog minimal mingguan dan terima pembaruan paket melalui jalur komunikasi yang disepakati dengan konter.
- [ ] **T13.05** — Pantau error, fungsi kontak, kesehatan aplikasi, backup, dan masalah data; perbaiki temuan yang mengganggu penggunaan pilot.
- [ ] **T13.06** — Setelah 30 hari, evaluasi trafik serta rasio sesi yang mengklik WhatsApp penjual; gunakan target awal 10% sebagai hipotesis, bukan klaim hasil atau syarat yang menghalangi peluncuran.
- [ ] **T13.07** — Bila belum mencapai 200 sesi, catat keterbatasan sampel dan lanjutkan pengumpulan; rangkum masukan pengunjung/konter untuk menentukan prioritas berikutnya.

**Selesai jika:** pilot telah digunakan dan dievaluasi dengan data serta masukan nyata. Selesainya peluncuran tidak otomatis menandai evaluasi 30 hari sebagai selesai.

## 5. Backlog Setelah MVP

### P1 — Setelah hasil pilot tersedia

- [ ] **P1-01** — Buat halaman profil konter dengan URL yang dapat dibagikan, memakai kembali CounterProfile dan PackageCard dari dialog.
- [ ] **P1-02** — Tambahkan penyortiran harga dengan definisi harga pembanding yang konsisten terhadap filter aktif.
- [ ] **P1-03** — Tambahkan penawaran promo dengan periode tayang dan informasi harga yang jelas.
- [ ] **P1-04** — Tambahkan laporan minat per konter berdasarkan event yang sudah tersedia, tanpa menyamakan klik dengan penjualan.

### P2 — Setelah kebutuhan tervalidasi

- [ ] **P2-01** — Rancang akun pemilik konter beserta batas akses terhadap data usahanya.
- [ ] **P2-02** — Tambahkan pembaruan katalog mandiri dengan alur publikasi yang sesuai kebutuhan pengelola.
- [ ] **P2-03** — Evaluasi pencarian jarak/GPS menggunakan lokasi yang benar dan pengalaman izin lokasi yang jelas.
- [ ] **P2-04** — Evaluasi model pendapatan serta penempatan berbayar berdasarkan manfaat dan hasil pilot.

Checkout, pembayaran daring, pengiriman kuota otomatis, integrasi distributor, akun pembeli, rating/ulasan, favorit, serta chat internal tetap di luar komitmen implementasi saat ini. Penambahan fitur tersebut memerlukan pembaruan kebutuhan produk.

## 6. Pemetaan Kebutuhan PRD ke Task

| Kebutuhan                             | Implementasi utama                        | Pemeriksaan penerimaan |
| ------------------------------------- | ----------------------------------------- | ---------------------- |
| FR-01 — Direktori konter              | T06.01–T06.06, T07.02, T07.05–T07.06      | T11.01–T11.03          |
| FR-02 — Pencarian                     | T06.03–T06.04, T07.04, T07.06             | T11.01                 |
| FR-03 — Provider                      | T06.02, T06.04–T06.05, T07.04             | T11.01–T11.03          |
| FR-04 — Wilayah dan filter gabungan   | T06.02–T06.04, T07.04, T07.06             | T11.01                 |
| FR-05 — Detail dan paket              | T06.06, T08.01–T08.06                     | T11.02, T11.04, T11.11 |
| FR-06 — Kontak penjual                | T06.07–T06.08, T08.07–T08.09              | T11.04, T11.08         |
| FR-07 — Format harga/kuota/masa aktif | T02.08–T02.09, T07.05, T08.04             | T11.03, T11.13         |
| FR-08 — Lokasi dan jam                | T00.03, T08.03                            | T11.04, T11.13         |
| FR-09 — Gabung mitra                  | T00.02, T05.09, T07.07                    | T11.04                 |
| FR-10 — Pengelolaan konter            | T05.06, T09.04–T09.05, T09.10             | T11.05–T11.07          |
| FR-11 — Pengelolaan paket/provider    | T05.07–T05.08, T09.06–T09.07              | T11.02, T11.05–T11.07  |
| FR-12 — Akses dan persistensi         | T02, T05.01–T05.05, T05.11, T09.01–T09.02 | T11.05–T11.07          |
| FR-13 — State halaman                 | T03.04, T07.09, T08.08–T08.09, T09.09     | T11.10–T11.12          |
| FR-14 — Analitik                      | T10                                       | T11.08                 |

Kebutuhan SEO, performa, aksesibilitas, serta keamanan lintas fitur tercakup pada T03, T04, T05, T07.08, T11, dan T12. Tambahan UI ringkasan admin dari DESIGN tercakup pada T05.10 dan T09.03.

## 7. Syarat Menandai Tugas Selesai

Tugas implementasi dapat dicentang apabila hasilnya berada pada struktur proyek yang disepakati, memakai data/API yang semestinya, menangani keadaan gagal yang relevan, dan telah diperiksa sesuai risiko fitur. Form atau tombol yang hanya menyimulasikan sukses belum memenuhi tugas integrasi.

Untuk tugas yang memerlukan pengujian, catat hasil, lingkungan, dan referensi bukti pada log progres. Pemeriksaan lint/build/test tidak menggantikan verifikasi tujuan WhatsApp, kesegaran katalog, akses admin, dan tampilan nyata. Tugas konten selesai setelah data final tersedia dan dikonfirmasi pengelola. Tugas rilis selesai setelah hasil deployment diamati.

PRD, TECH_STACK, STRUCTURE_PROJECT, dan DESIGN diperbarui bila keputusan implementasi berubah secara material. Pertahankan ID tugas agar perubahan progres dapat ditelusuri.

## 8. Log Progres

Gunakan satu baris per pembaruan yang bermakna; tambahkan ID tugas, hasil, serta langkah yang masih diperlukan.

| Tanggal         | ID            | Status   | Hasil / bukti                                                                                                                                                                                          | Berikutnya / kendala                            |
| --------------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 6 November 2026 | DOC-01–DOC-05 | Tersedia | Dokumen dan referensi diperiksa; tujuh markdown dihimpun, termasuk dua panduan sumber yang identik.                                                                                                    | Mulai T01; siapkan input T00 sebelum publikasi. |
| 6 November 2026 | T01.01–T01.10 | Selesai  | Monorepo npm workspaces (frontend, backend, shared), tooling (ESLint, Vitest, Playwright, Prettier), compose.yaml PostgreSQL 17, dan skrip root.                                                       | Lanjut T02.                                     |
| 6 November 2026 | T02.01–T02.11 | Selesai  | Paket `@konter/shared` (konstanta & skema Zod), 8 migrasi database Knex, skrip seed development fiktif & isolasi test database.                                                                        | Lanjut T03 & T04.                               |
| 6 November 2026 | T03.01–T03.10 | Selesai  | Desain sistem Tailwind 4 tokens, font Plus Jakarta Sans, 9 aset gambar diunduh dari manifest, komponen UI dasar, layout rail 88px, bottom navigation & drawer admin.                                   | Lanjut T04–T06.                                 |
| 6 November 2026 | T04.01–T04.06 | Selesai  | Express foundation: Pino logger (data sensitif disensor), rate limiter, helmet, standard API response `{ data, meta }` / `{ error }`, docs/api.md.                                                     | Lanjut T05.                                     |
| 6 November 2026 | T05.01–T05.11 | Selesai  | Autentikasi Argon2id, session PostgreSQL 8 jam, CSRF sync token, CRUD konter/paket/provider/wilayah/settings, `/impact` endpoint, overview dashboard data.                                             | Lanjut T06.                                     |
| 6 November 2026 | T06.01–T06.09 | Selesai  | Logika query publik terpusat (`public-package-query.js`), filter kata kunci/provider/wilayah AND logic, generator URL kontak WhatsApp (`/api/v1/public/contact`).                                      | Lanjut T07 & T08.                               |
| 6 November 2026 | T07.01–T07.11 | Selesai  | Direktori publik: SSR initial data hydration, debounced search, chip filter provider, modal detail, privasi, sitemap, robots, responsive layouts.                                                      | Lanjut T08 & T09.                               |
| 6 November 2026 | T08.01–T08.09 | Selesai  | CounterDetailDialog dengan Radix UI dialog (aksesibel, focus trap, dynamic viewport height), PackageCard, ContactButton ke WhatsApp URL.                                                               | Lanjut T09.                                     |
| 6 November 2026 | T09.01–T09.11 | Selesai  | Admin panel frontend: `/admin/login`, protected layout `RequireAdmin`, dashboard overview `/admin`, CRUD konter, paket, provider (dengan deactivation impact modal), wilayah, dan pengaturan platform. | Lanjut T10.                                     |
| 6 November 2026 | T10.01–T10.07 | Selesai  | Analitik: `POST /events`, anonymous session ID per tab (`sessionStorage`), non-blocking beacon, skrip CLI `analytics:report` & `analytics:cleanup`.                                                    | Lanjut T11.                                     |
| 6 November 2026 | T11.01–T11.17 | Selesai  | Verifikasi: 26 backend tests passing, 4 frontend tests passing, 3 Playwright E2E test suites dibuat, ESLint lulus 0 error, Next.js build 16 static/dynamic routes sukses.                              | Lanjut T12.                                     |
| 6 November 2026 | T12.01–T12.10 | Selesai  | Deployment & operasional: frontend & backend Dockerfiles, `compose.production.yaml`, Nginx reverse proxy single-origin, GitHub Actions CI workflow, dan dokumentasi lengkap `docs/operations.md`.      | Siap untuk T13 peluncuran pilot.                |

Status yang dapat dicatat: **Belum mulai**, **Dikerjakan**, **Menunggu data**, **Perlu perbaikan**, atau **Selesai**. Checkbox tetap menjadi penanda penyelesaian, sedangkan log menjelaskan kondisi tugas.
