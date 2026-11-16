# DESIGN — KonterKuota

| Informasi | Keterangan |
| --- | --- |
| Versi | 1.0 — 6 November 2026 |
| Tujuan | Panduan penerapan hasil desain Google Stitch ke sistem KonterKuota |
| Status | Spesifikasi implementasi; aplikasi belum dibangun atau diuji melalui dokumen ini |
| Acuan produk | [PRD.md](./PRD.md) |
| Acuan teknologi | [TECH_STACK.md](./TECH_STACK.md) |
| Acuan struktur | [STRUCTURE_PROJECT.md](./STRUCTURE_PROJECT.md) |
| Sumber desain | `stitch_konterkuota_directory_platform.zip` dari pengguna |
| Implementasi | Next.js App Router, React JavaScript, Tailwind CSS 4, Radix Dialog, API Express |

## 1. Dasar dan Keputusan Penerapan

Desain menggunakan identitas **KonterKuota**: navigasi kuning di kiri, latar terang, panel putih, kartu konter dengan foto, aksen hijau untuk WhatsApp, serta tipografi Plus Jakarta Sans. Komposisi hasil Stitch menjadi acuan visual utama untuk implementasi.

Dokumen ini disusun setelah membaca HTML, stylesheet/config, script prototipe, dan dokumen desain dalam arsip serta memeriksa ketiga screenshot hasil ekspor. Aturan bisnis mengikuti PRD; pilihan teknologi mengikuti TECH_STACK. Ketika isi ekspor berbeda dari kebutuhan tersebut, keputusan penerapannya tercatat pada bagian 3.

Nilai visual pada dokumen ini menormalkan beberapa perbedaan antarlayar ekspor. Bagian yang belum memiliki hasil desain, termasuk formulir admin dan layout mobile final, ditandai sebagai spesifikasi turunan untuk implementasi. Dokumen desain bawaan Stitch adalah bahan referensi, bukan perubahan otomatis terhadap persyaratan produk.

## 2. Inventaris Referensi

Salinan hasil ekspor tersedia di `docs/design/stitch/`. HTML dan PNG dipertahankan sebagaimana di dalam arsip; folder diberi nama pendek agar mudah dirujuk.

| Referensi | Screenshot | HTML / dokumen | Pemakaian |
| --- | --- | --- | --- |
| Landing page | [Lihat gambar](./docs/design/stitch/landing/screen.png), 801 × 1600 px | [HTML](./docs/design/stitch/landing/code.html) | Shell publik, hero, direktori, kartu, cara beli, CTA mitra, FAQ, footer, dan modal contoh. |
| Detail Berkah Cell | [Lihat gambar](./docs/design/stitch/counter-detail/screen.png), 1094 × 1600 px | [HTML](./docs/design/stitch/counter-detail/code.html) | Identitas konter, rincian kuota, kartu paket, filter provider, serta informasi lokasi. |
| Ringkasan admin | [Lihat gambar](./docs/design/stitch/admin/screen.png), 1230 × 1600 px | [HTML](./docs/design/stitch/admin/code.html) | Sidebar, ringkasan katalog, tabel konter, dan panel perhatian. |
| Panduan bawaan Stitch | — | [source-design.md](./docs/design/stitch/source-design.md) | Palet, tipografi, dan gaya pendukung; konflik diselesaikan di dokumen ini. |
| Gambar inspirasi awal | [Lihat gambar](./docs/design/stitch/reference.png) | — | Referensi komposisi sebelum hasil Stitch. |
| Daftar gambar eksternal | — | [assets-manifest.json](./docs/design/stitch/assets-manifest.json) | Sembilan referensi gambar dalam HTML beserta URL dan deskripsinya. |

Ukuran PNG adalah ukuran bitmap ekspor, bukan bukti ukuran viewport saat halaman dirender. Implementasi menggunakan ukuran CSS dan breakpoint pada dokumen ini; jangan mengecilkan font agar sama dengan bitmap yang sudah diskalakan.

Belum ada screenshot mobile, login, formulir tambah/edit, halaman privasi, atau hasil validasi interaksi nyata dalam arsip. Keberadaan HTML prototipe tidak berarti API, penyimpanan, dan autentikasi sudah tersedia.

## 3. Penyesuaian Ekspor terhadap Produk

| Temuan pada ekspor | Keputusan implementasi MVP |
| --- | --- |
| Rail kuning, hero ringkas, panel putih, grid kartu, CTA WhatsApp | Dipertahankan sebagai identitas visual. |
| Warna `primary` pada config adalah cokelat `#725C00`, sedangkan aksen kuning bernama `primary-container` | Gunakan nama token semantik `brand` untuk kuning dan `brand-ink` untuk teks cokelat agar pemakaian konsisten. |
| Landing memakai latar `#F4F5F7`; halaman lain memakai `#F9F9FF` | Gunakan canvas `#F4F5F7` untuk shell; `#F9F9FF` menjadi variasi permukaan halus. |
| Detail konter tersedia sebagai halaman penuh dan sebagai modal pada HTML landing | MVP menggunakan `CounterDetailDialog` sesuai PRD. Ambil isi dan tampilan paket dari layar detail; URL profil mandiri tetap pengembangan P1. |
| Navigasi bawah mobile tersedia dalam HTML; prompt sebelumnya meminta menu atas | Adopsi navigasi bawah publik dari ekspor, dengan safe area dan padding konten. Admin menggunakan drawer menu. |
| Rating 4,9, jumlah ulasan, respons kurang dari 3 menit, ikon favorit/notifikasi | Tidak ditampilkan pada MVP karena belum ada fitur/data pendukung. |
| Label “Mitra Terverifikasi”, tanda centang verifikasi, “Katalog Terverifikasi” | Diganti keterangan netral seperti “Konter UMKM” atau dihilangkan. Pemeriksaan admin tidak otomatis menjadi klaim verifikasi publik. |
| Semua konter memiliki badge “Buka”; detail menggunakan “Buka Hari Ini” | Tampilkan jam operasional sebagai informasi teks. Label waktu nyata tidak digunakan sebelum tersedia aturan jadwal dan zona waktu yang memadai. |
| Jarak “Radius 1.2 Km”, klaim “terdekat”, peta bergambar ilustrasi | Gunakan wilayah/alamat dan tautan peta konter. Perhitungan jarak serta peta ilustrasi sebagai lokasi faktual tidak diterapkan. |
| “Tanpa biaya”, “100% langsung”, “Pendaftaran gratis” | Gunakan copy “Hubungi penjual langsung melalui WhatsApp”. Kebijakan biaya belum ditetapkan dalam PRD. |
| Pulsa, token PLN, e-wallet, kartu perdana, serta layanan tambahan | Katalog MVP fokus pada paket kuota internet; blok penawaran tambahan tersebut tidak dimasukkan. |
| Panel “Pendaftaran Mitra Baru” mengasumsikan formulir masuk | Ganti dengan panel panduan “Tambah Konter” dan tombol menuju formulir admin; pendaftaran mitra tetap melalui WhatsApp pengelola. |
| Petunjuk “maksimal 6 paket” di dashboard | Tidak menjadi batas data. Angka enam hanya jumlah kartu contoh; katalog menggunakan seluruh paket yang layak tampil. |
| Angka konter/paket dan status berbeda antar-screenshot | Semua ringkasan dan daftar menggunakan satu sumber data. Angka ekspor bukan nilai tetap. |
| Tahun copyright 2025, timestamp “hari ini”, nomor WhatsApp contoh | Gunakan tahun berjalan, timestamp data, dan kontak dari API. |
| Link placeholder `#`, tautan privasi menuju FAQ, navigasi “Tentang Kami” tanpa halaman | Hubungkan ke route/anchor yang tersedia; privasi menuju `/privasi`. Menu tanpa tujuan yang ditetapkan tidak ditampilkan. |

Koreksi ini mempertahankan karakter desain sambil menyelaraskan isi dan perilakunya dengan sistem yang direncanakan.

## 4. Design Tokens

### 4.1 Warna

Palet berikut adalah keputusan final untuk implementasi tema **Pink Soft**. Warna merek diselaraskan ke soft rose pink, permukaan hangat, dan teks berbobot kontras tinggi untuk memastikan aksesibilitas (WCAG AA/AAA).

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `canvas` | `#FAF5F7` | Latar seluruh halaman (soft blush canvas). |
| `surface` | `#FFFFFF` | Panel, kartu, dialog, dan formulir. |
| `surface-soft` | `#FFF8FA` | Variasi latar sangat ringan. |
| `surface-muted` | `#F5E8EE` | FAQ, area rincian kuota, dan kotak informasi. |
| `brand` | `#F4A6C4` | Rail, CTA utama, chip aktif, monogram (soft pink). |
| `brand-hover` | `#EE8FA8` | Hover tombol pink. |
| `brand-soft` | `#FDF2F6` | Panel pendaftaran mitra dan panduan admin. |
| `brand-ink` | `#831843` | Aksen teks, ikon sekunder, focus ring (deep berry). |
| `content` | `#1E151A` | Judul, isi utama, teks pada tombol pink. |
| `content-muted` | `#68555F` | Alamat, metadata, dan deskripsi sekunder. |
| `line` | `#EEDBE3` | Border kartu, input, dan pemisah. |
| `line-warm` | `#E2C6D3` | Aksen border hangat opsional pada informasi konter. |
| `whatsapp` | `#15803D` | Tombol kontak utama. |
| `whatsapp-hover` | `#166534` | Hover tombol kontak. |
| `success-soft` / `success-ink` | `#DCFCE7` / `#166534` | Tersedia dan Diterbitkan. |
| `warning-soft` / `warning-ink` | `#FFF4E5` / `#8A4500` | Perlu konfirmasi dan Draft. |
| `danger-soft` / `danger-ink` | `#FFE4E8` / `#9F1239` | Kesalahan dan aksi nonaktifkan. |
| `overlay` | `rgba(30, 21, 26, 0.40)` | Backdrop dialog. |

Perhitungan kontras warna solid: `content` di atas putih > 16:1; `brand-ink` di atas putih 8,7:1 (AAA); `brand-ink` di atas `brand-soft` 8,2:1 (AAA); `content` di atas `brand` > 10:1; putih di atas `whatsapp` 5,02:1. Hasil ini memenuhi standar WCAG AA dan AAA.

### 4.2 Tipografi

Gunakan **Plus Jakarta Sans**, dengan fallback `sans-serif`, bobot 400, 500, 600, 700, dan 800. Tipografi mengikuti ukuran nyata pada config ekspor, bukan ukuran hero 40–48 px yang ada dalam prompt awal.

| Peran | Ukuran / line-height | Bobot | Pemakaian |
| --- | --- | --- | --- |
| Hero desktop | 32 / 40 px | 800 | Judul utama landing. |
| Hero mobile | 26 / 34 px | 700–800 | Judul utama pada layar kecil. |
| Heading besar | 24 / 32 px | 700 | Judul section dan header admin. |
| Heading sedang | 20 / 28 px | 600–700 | Nama paket dan subpanel. |
| Heading kecil | 16 / 24 px | 600–700 | Nama konter dan judul kartu. |
| Body utama | 16 / 26 px | 400 | Deskripsi hero dan bacaan panjang. |
| Body standar | 14 / 22 px | 400 | Deskripsi, isi formulir, dan FAQ. |
| Metadata | 12 / 18 px | 400–500 | Wilayah, timestamp, badge tambahan. |
| Label tombol | 14 / 20 px | 600–700 | CTA dan field label. |
| Harga kartu / harga paket | 16 / 24 px; 24 / 32 px | 700 | Harga minimum dan harga paket. |

Ukuran 11 px hanya untuk dekorasi/label tambahan yang tidak menentukan keputusan pengguna. Input pada mobile menggunakan teks 16 px. Harga memakai angka tabular agar sejajar pada tabel; label status tetap terbaca tanpa bergantung pada warna.

Muat font melalui `next/font` dan gunakan satu CSS variable pada root layout. Font dekoratif tidak diperlukan. Pola pemuatan mengikuti [dokumentasi font Next.js](https://nextjs.org/docs/app/getting-started/fonts).

### 4.3 Spacing, radius, elevation

- Skala spacing: **4, 8, 12, 16, 20, 24, 32, 48 px**.
- Padding halaman: 16 px mobile, 24 px tablet, 32 px desktop.
- Padding panel: 16 px mobile, 24–32 px desktop; gap antarseksi 32 px.
- Radius: rail 24 px pada sisi kanan; panel 24 px; kartu 16 px; gambar/input/tombol 12 px; chip 9999 px; sudut atas bottom navigation 24 px.
- Kartu: `0 4px 20px -2px rgba(32,36,44,.04)`.
- Panel direktori: `0 12px 32px -4px rgba(32,36,44,.06)`.
- Dialog: `0 24px 48px -12px rgba(32,36,44,.16)`.
- Panel/kartu putih memiliki border 1 px `line`. Shadow memberi kedalaman, bukan menjadi satu-satunya batas kontrol.

Config Tailwind ekspor mengubah arti kelas radius, misalnya `rounded-2xl` menjadi 16 px dan `rounded-3xl` menjadi 24 px. Saat migrasi, petakan ke token semantik `rounded-card` / `rounded-panel`; jangan mengasumsikan nama kelas lama mempunyai nilai yang sama pada setup baru.

### 4.4 Ikon dan animasi

Ikon ekspor menggunakan **Material Symbols Outlined**. Pertahankan bentuk outline dan ukuran 20–24 px melalui satu komponen `Icon`; ikon dekoratif menggunakan `aria-hidden`. Tombol ikon memiliki nama aksesibel dan area tekan minimal 44 × 44 px. Ikon chat boleh digunakan pada CTA dengan teks WhatsApp yang jelas; jangan menganggap glyph chat sebagai logo resmi WhatsApp.

Gunakan transisi warna/opacity 150–200 ms. Dialog dapat memakai fade dan pergeseran ringan. Hormati `prefers-reduced-motion`; tidak ada carousel otomatis atau animasi panjang. State focus memakai outline 2 px `brand-ink` dengan offset 2 px, sehingga terlihat di atas putih maupun kuning.

## 5. Layout Responsif

Layout berikut adalah spesifikasi final yang diturunkan dari ekspor dan kebutuhan PRD. Screenshot yang tersedia menjadi acuan desktop; mobile perlu diverifikasi saat implementasi.

| Lebar viewport | Navigasi | Direktori | Panel pendamping | Admin |
| --- | --- | --- | --- | --- |
| 360–767 px | Header ringkas + bottom navigation publik | Satu kolom | Petunjuk ringkas di atas daftar; panel panjang dipindah ke Cara Beli | Header + drawer, ringkasan satu kolom, daftar konter berupa kartu. |
| 768–1023 px | Header + bottom navigation publik | Dua kolom | Diletakkan setelah daftar bila diperlukan | Drawer menu, ringkasan dua kolom, daftar responsif. |
| 1024–1279 px | Rail kiri 88 px, header sticky | Dua kolom | Kolom kanan sekitar 280 px | Rail 88 px; tabel di dalam scroll container jika sempit. |
| ≥1280 px | Rail kiri 88 px, header sticky | Tiga kolom | Kolom kanan sekitar 280 px | Empat kartu ringkasan; tabel dan panel kanan dengan perbandingan sekitar 2:1. |

- Ruang konten desktop berada setelah rail; inner container memiliki `max-width: 1440px` dan berada di tengah ruang tersebut.
- Lebar kartu direktori diusahakan minimal 240 px. Kurangi jumlah kolom bila ruang aktual tidak cukup; jangan mengecilkan teks atau CTA untuk memaksa tiga kolom.
- Header sekitar 72–80 px; tinggi boleh bertambah sesuai konten. Anchor section menggunakan scroll offset agar judul tidak tertutup header.
- Bottom navigation publik memiliki tinggi dasar 64 px ditambah `env(safe-area-inset-bottom)`. Konten mendapat padding bawah yang setara ditambah 16 px.
- Navigasi bawah: Beranda, Konter, Cara Beli, Mitra. Status aktif ditentukan section yang terlihat dan memiliki label teks.
- Header mobile memuat merek serta aksi sederhana; tidak menduplikasi empat menu bawah.
- Untuk admin, drawer berisi Ringkasan, Konter, Paket, Provider, Wilayah, Pengaturan, Lihat Website, dan Keluar.
- Layer: konten normal 0, header 30, rail/bottom nav 40, backdrop dialog 50, dialog 60, notifikasi 70.
- Dialog berada di atas bottom navigation; navigasi latar tidak dapat ditekan saat dialog terbuka.

## 6. Spesifikasi Landing Page

### 6.1 Shell, header, dan hero

Rail mempertahankan monogram **KK**, latar kuning, item outline, dan latar aktif kuning lebih gelap. Menu pengaturan pada rail publik di ekspor dihilangkan; akses pengelolaan berada pada route admin. Menu desktop yang diperlukan mengarah ke section yang sama dengan rail.

Header berisi wordmark KonterKuota, keterangan “Dukung konter lokal”, navigasi section bila ruang cukup, dan CTA “Gabung Mitra”. Search ringkas pada header boleh tampil pada desktop lebar dan harus berbagi state dengan pencarian direktori. Pada layar kecil cukup satu input pencarian di direktori.

Hero berupa panel putih radius 24 px dengan tint kuning sangat halus di kanan. Gunakan teks:

- Eyebrow: **Wadah pemasaran konter UMKM**.
- Judul: **Cari kuota internet, dukung konter lokal.**
- Deskripsi: **Temukan konter di wilayah pilihanmu, lihat paket dari berbagai provider, lalu hubungi penjual melalui WhatsApp.**
- CTA utama: **Cari Konter**, menuju `#direktori`.
- CTA sekunder: **Daftarkan Konter**, menuju kontak pengelola.

Pertahankan hero yang ringkas: pada desktop 1440 × 900 px, filter dan awal daftar konter harus terlihat tanpa menutupinya dengan dekorasi hero yang besar.

### 6.2 Direktori dan filter

Panel utama menggunakan heading “Temukan Konter”, deskripsi netral, dropdown wilayah, serta input “Cari nama konter, paket, atau provider…”. Di bawahnya terdapat chip provider, jumlah hasil, dan reset filter.

- Provider bersifat pilihan tunggal; opsi awal “Semua provider”. Gunakan semantik tombol dengan `aria-pressed` atau radio group yang konsisten.
- Pencarian, provider, dan wilayah diterapkan bersama dengan logika AND sesuai PRD.
- Header search, directory search, serta reset membaca dan memperbarui state yang sama.
- Chip dapat bergulir horizontal pada container-nya; seluruh halaman tidak boleh overflow horizontal.
- Jumlah hasil berasal dari `meta.total`. Pagination tetap tersedia jika hasil melebihi batas halaman; reset ke halaman pertama ketika filter berubah.
- Perubahan query memiliki debounce sekitar 300 ms. Hasil request lama tidak boleh menimpa filter terbaru.
- Pembaruan jumlah hasil diumumkan dengan live region yang sopan tanpa memindahkan fokus dari input.

### 6.3 CounterCard

Urutan isi: foto, nama konter, wilayah/alamat singkat, badge provider, divider, harga minimum, lalu dua CTA. Gunakan gambar rasio 16:10 dan `object-fit: cover`; posisi crop boleh disesuaikan per foto. Kartu menggunakan layout vertikal agar area tombol sejajar walaupun nama/alamat berbeda panjang.

| Elemen | Aturan |
| --- | --- |
| Nama | Heading 16 px, boleh membungkus dua baris. Detail menampilkan nama penuh. |
| Lokasi | Ikon pin + wilayah/alamat ringkas; tidak memuat jarak fiktif. |
| Provider | Badge teks dari paket publik; warna merek provider bersifat aksen kecil. |
| Harga | “Mulai dari” dan harga minimum yang sesuai filter provider; format `Rp25.000`. |
| Lihat Paket | Tombol kuning; membuka konter pemilik kartu. |
| Hubungi Konter | Tombol hijau; label dapat disingkat menjadi “Hubungi” jika nama aksesibelnya tetap menyebut konter dan WhatsApp. |
| Tanpa paket | Tampilkan “Informasi paket sedang diperbarui”, tanpa harga; kontak umum tetap tersedia. |

Pada ruang sempit, dua CTA boleh ditumpuk. Seluruh kartu tidak dijadikan satu tautan yang membungkus tombol interaktif lain.

### 6.4 Panel pendamping dan section bawah

Panel kanan menggunakan ilustrasi kios dari referensi, judul “Temukan konter pilihanmu”, dan petunjuk memilih “Lihat Paket”. Informasi tambahan cukup menjelaskan bahwa komunikasi dilanjutkan langsung dengan penjual. Panel boleh sticky jika tinggi layar cukup; panel panjang mengikuti scroll normal.

Section berikut dipertahankan dalam urutan ini:

1. **Cara Beli Kuota dari Konter Lokal**: tiga kartu Pilih Konter → Lihat Paket → Hubungi lewat WhatsApp.
2. **Gabung Mitra**: panel kuning muda dengan judul “Punya konter? Kenalkan usahamu di sini.” dan CTA kontak pengelola.
3. **FAQ**: empat accordion mengenai pembelian, harga, ketersediaan, dan pendaftaran mitra.
4. **Footer**: merek, deskripsi, link `/privasi`, anchor mitra, kontak pengelola, dan tahun berjalan.

Isi FAQ dan kontak bersumber dari pengaturan platform. Accordion memiliki tombol judul, `aria-expanded`, dan hubungan yang jelas dengan panel jawabannya.

## 7. Detail Konter dan Katalog Paket

### 7.1 Bentuk MVP

Gunakan **dialog besar di tengah desktop**, mengikuti modal pada HTML landing dan mengambil isi visual dari halaman detail. Lebar maksimal 1040 px atau viewport dikurangi 48 px; tinggi maksimal viewport dinamis dikurangi 48 px. Pada mobile tampil penuh menggunakan `100dvh`, safe area, dan area isi yang dapat bergulir.

Header serta footer tindakan tetap terlihat; hanya isi yang scroll. Tombol tutup minimal 44 px, judul dialog menyebut nama konter, fokus masuk ke dialog, Tab tetap di dalam, Escape menutup, dan fokus kembali ke kartu pemicu. Scroll halaman latar dikunci dan dikembalikan saat dialog tutup. Gunakan pembungkus [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) yang sudah dipilih dalam tech stack.

Tampilan halaman detail mandiri pada ekspor menjadi acuan P1 apabila URL profil konter dibangun kelak. Pada MVP tidak perlu membuat route profil atau tombol berbagi profil yang belum mempunyai tujuan.

### 7.2 Susunan isi

1. Foto dan identitas konter, deskripsi, alamat, jam operasional, serta “Lihat Lokasi” jika URL peta tersedia.
2. Daftar provider berdasarkan paket publik konter.
3. Heading “Pilihan Paket” dengan jumlah paket dan filter provider; filter aktif dari direktori dibawa ke dialog serta dapat direset.
4. Informasi waktu pembaruan dan catatan konfirmasi ketersediaan.
5. Daftar `PackageCard`, dua kolom bila lebar konten memadai, satu kolom pada panel sempit/mobile.
6. Petunjuk singkat transaksi dan kontak umum konter pada footer.

Kolom panduan panjang pada layar detail ekspor diringkas agar dialog fokus pada pemilihan paket. Peta ilustrasi diganti alamat dan tautan “Lihat Lokasi”; jam kosong menjadi “Hubungi konter untuk jam operasional”.

### 7.3 PackageCard

Kartu mempertahankan provider di kiri atas, status di kanan atas, nama paket, kotak rincian kuota berwarna `surface-muted`, syarat penting, divider, harga, dan CTA.

- Rincian membedakan kuota utama, lokal, aplikasi, atau pembatasan waktu sesuai data; nilai tidak dihitung ulang dengan menghilangkan syarat.
- Masa aktif ditulis lengkap, misalnya “7 hari sejak aktivasi”.
- `available`: badge **Tersedia**, CTA hijau **Tanya Paket**.
- `needs_confirmation`: badge **Perlu konfirmasi**, CTA outline **Tanya Ketersediaan** yang tetap aktif.
- `unavailable`, draft, nonaktif, atau melewati batas tayang tidak muncul pada katalog publik.
- Timestamp berasal dari `updatedAt` data. Teks “Hari ini” hanya digunakan bila tanggalnya memang sesuai zona waktu tampilan.
- Footer dialog **Hubungi Konter** berlaku untuk kontak umum, terpisah dari kontak paket tertentu.

Tombol kontak meminta tujuan terbaru dari backend dengan ID konter dan ID paket. Selama request tampil “Menyiapkan WhatsApp…”. Bila paket berubah, tampilkan pesan dan pilihan kontak umum melalui tindakan baru. Event analitik tidak boleh menahan navigasi.

## 8. Panel Admin

### 8.1 Ringkasan yang sudah memiliki referensi

Pertahankan header, dua CTA “Tambah Paket”/“Tambah Konter”, kartu ringkasan, tabel lebar, dan panel kanan. Header menggunakan identitas admin dari sesi; informasi sesi tidak ditulis sebagai email contoh tetap.

| Bagian | Data/perilaku final |
| --- | --- |
| Ringkasan konter | Total konter serta jumlah Draft, Diterbitkan, dan Nonaktif. |
| Ringkasan paket | Total paket; rincian ketersediaan diberi label jelas agar tidak tertukar dengan status publikasi. |
| Provider | Jumlah provider aktif dalam katalog. |
| Wilayah | Jumlah wilayah yang memiliki konter diterbitkan, sesuai definisi filter publik. |
| Tabel konter | Nama/wilayah, provider terkait, jumlah paket, status publikasi, waktu diperbarui, Edit, dan menu tindakan. |
| Perlu perhatian | Paket yang memerlukan konfirmasi, tidak tersedia, atau melewati batas penayangan; setiap item menuju formulir paketnya. |
| Panel mitra | Panduan menambahkan konter dari percakapan WhatsApp, dengan tombol “Tambah Konter”. |
| Panduan pengelola | Pemeriksaan informasi sebelum publikasi dan jadwal pembaruan mingguan. |

Jumlah global harus berasal dari agregasi backend, bukan jumlah baris pada satu halaman tabel. Kartu ringkasan dapat berfungsi sebagai filter atau tautan daftar terkait. Sediakan state loading/error per bagian; jangan mengganti kegagalan API dengan angka nol yang terkesan valid.

Badge Draft berwarna kuning muda, Diterbitkan hijau muda, Nonaktif netral. Label “Perlu konfirmasi” tidak otomatis memakai warna merah; merah digunakan untuk error atau tindakan yang perlu perhatian segera.

Tabel memiliki header yang jelas, row action dengan label aksesibel, dan pagination. Pada mobile daftar berubah menjadi kartu data; alternatif scroll tabel harus terkurung pada container tabel, bukan seluruh halaman. Aksi publikasi/nonaktif menampilkan hasil atau error nyata dari API.

### 8.2 Layar turunan yang belum ada di ekspor

Layar berikut diperlukan oleh PRD dan menggunakan token serta komponen yang sama. Ini merupakan spesifikasi tambahan, bukan layar yang sudah dihasilkan Stitch.

| Route | Rancangan |
| --- | --- |
| `/admin/login` | Panel putih maksimal 440 px, monogram, email, password, tampilkan password, tombol Masuk, error dan loading. |
| `/admin/konter` | Tabel konter lengkap dengan pencarian, status, dan Tambah Konter. |
| `/admin/konter/baru`, `/admin/konter/[id]/edit` | Form nama, deskripsi, URL foto dan preview, wilayah, alamat, WhatsApp, URL peta, jam operasional, dan status publikasi. |
| `/admin/paket` | Daftar paket dengan filter konter/provider/publikasi/ketersediaan. |
| `/admin/paket/baru`, `/admin/paket/[id]/edit` | Form pemilik konter, provider, nama, rincian kuota, masa aktif, harga, syarat, ketersediaan, publikasi, dan batas tayang. |
| `/admin/provider` | Daftar, tambah/edit provider, URL logo, status aktif, dan dialog dampak penonaktifan. |
| `/admin/wilayah` | Pengelolaan nama wilayah. |
| `/admin/pengaturan` | Identitas merek, logo, kontak publik, WhatsApp pengelola, wilayah pilot, dan editor FAQ. |
| `/privasi` | Layout publik dengan lebar bacaan sekitar 720 px dan isi yang sesuai pengelolaan data nyata. |

Form utama maksimal 880 px; dua kolom hanya untuk field pendek, textarea/alamat tetap lebar. Label permanen dan error berada dekat field. Harga menggunakan format Rupiah; input tetap menyimpan nilai numerik. Bedakan “Masa aktif kuota” dari “Batas penayangan penawaran” dan tampilkan zona waktu untuk field tanggal.

Simpan Draft dan Terbitkan memeriksa persyaratan yang sesuai. Penonaktifan konter menjelaskan bahwa paketnya ikut disembunyikan. Gagal menyimpan mempertahankan input; perubahan belum tersimpan memerlukan dialog ketika pengguna meninggalkan form. Pada sesi berakhir, tampilkan instruksi masuk kembali dan jangan membocorkan data admin ke layar publik.

## 9. State dan Komponen Bersama

| State | Tampilan dan perilaku |
| --- | --- |
| Loading pertama | Skeleton mengikuti ukuran kartu/form final. |
| Refresh di latar | Konten tetap terlihat; indikator kecil menyatakan pembaruan tanpa mengunci filter. |
| Direktori belum berisi data | “Konter belum tersedia. Silakan kembali lagi.”; CTA mitra boleh tampil. |
| Hasil pencarian kosong | “Belum ada konter yang sesuai. Coba provider atau wilayah lain.” + Reset filter. |
| API gagal | Pesan ringkas + Coba lagi; jangan tampilkan daftar seolah kosong. |
| Data lama/offline | Banner “Informasi belum dapat diperbarui.”; status tidak mengklaim ketersediaan terkini. |
| Gambar gagal | Placeholder toko dengan rasio yang sama. |
| Kontak sedang diproses | Loading pada tombol yang ditekan, cegah klik ganda. |
| Paket berubah | Pesan bahwa paket tidak lagi tersedia, refresh detail, dan tawarkan kontak umum. |
| Simpan berhasil | Notifikasi singkat, data tampilan memakai respons tersimpan. |
| Simpan gagal | Error dekat formulir, nilai input dipertahankan. |
| Aksi nonaktif | Dialog dampak, Batal sebagai pilihan aman, konfirmasi dengan nama entitas. |
| Sesi admin habis | Arahkan ke login setelah pemberitahuan; kosongkan cache data admin. |

Komponen minimum: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `FilterChip`, `Badge`, `Dialog`, `ConfirmDialog`, `Toast`, `EmptyState`, `ErrorState`, `Skeleton`, `Pagination`, dan `DataTable`. State disabled memiliki alasan yang terlihat bila alasan tidak jelas dari konteks.

## 10. Pemetaan ke Struktur Frontend

Struktur utama pada STRUCTURE_PROJECT tetap berlaku. Nama bertanda **tambahan** melengkapi kebutuhan visual ekspor.

| Komponen / file tujuan | Tanggung jawab |
| --- | --- |
| `src/app/globals.css` | Token, base styles, focus, safe area, dan reduced motion. |
| `src/app/layout.jsx` | Font, bahasa `id`, provider global. |
| `src/components/layout/SiteHeader.jsx` | Merek, navigasi atas, dan CTA mitra. |
| `src/components/layout/PublicNavigation.jsx` — tambahan | Rail desktop dan bottom navigation publik memakai satu konfigurasi menu. |
| `src/components/layout/AdminSidebar.jsx` | Rail admin dan drawer mobile. |
| `src/features/landing/components/HeroSection.jsx` | Hero hasil ekspor. |
| `src/features/directory/components/CounterDirectory.jsx` | State filter, hasil, pagination, dan konter aktif. |
| `src/features/directory/components/CounterFilters.jsx` | Search, provider, wilayah, jumlah hasil. |
| `src/features/directory/components/CounterCard.jsx` | Kartu dengan data satu konter. |
| `src/features/directory/components/DirectoryGuide.jsx` — tambahan | Panel pendamping dan versi ringkas mobile. |
| `src/features/directory/components/CounterDetailDialog.jsx` | Dialog detail, pemuatan data konter, dan filter paket. |
| `src/features/directory/components/CounterProfile.jsx` — tambahan | Identitas dan informasi konter yang bisa dipakai kembali pada P1. |
| `src/features/directory/components/PackageCard.jsx` | Rincian, status, harga, dan CTA paket. |
| `src/features/directory/components/ContactButton.jsx` | Validasi tujuan kontak, loading/error, dan navigasi WhatsApp. |
| `src/features/admin/overview/` — tambahan | `CatalogSummary.jsx`, `AttentionList.jsx`, dan `api.js`. |
| `src/features/admin/counters/CounterTable.jsx` | Tabel/kartu konter admin. |
| `src/components/ui/` | Primitive bersama; warna dan ukuran berasal dari token. |

Komponen menerima data melalui props/query dan tidak mengimpor fixture langsung pada produksi. Validasi form memakai schema dari `shared`. Semua kode aplikasi menggunakan `.js`/`.jsx` sesuai pilihan JavaScript.

### 10.1 Panduan migrasi Tailwind

HTML ekspor menggunakan script CDN Tailwind 3 dan config inline. Pada proyek, ubah menjadi stylesheet Tailwind 4 lokal sesuai TECH_STACK. `@theme` menyediakan token yang dapat digunakan sebagai utility; referensi sintaks: [Tailwind theme variables](https://tailwindcss.com/docs/theme).

Contoh awal di `src/app/globals.css` saat implementasi:

```css
@import "tailwindcss";

@theme {
  --color-canvas: #f4f5f7;
  --color-surface: #ffffff;
  --color-surface-soft: #f9f9ff;
  --color-surface-muted: #f1f3fe;
  --color-brand: #ffd84d;
  --color-brand-hover: #f4c62f;
  --color-brand-soft: #fff7d6;
  --color-brand-ink: #725c00;
  --color-content: #181c23;
  --color-content-muted: #596273;
  --color-line: #e2e5ea;
  --color-whatsapp: #15803d;
  --color-whatsapp-hover: #166534;
  --radius-card: 1rem;
  --radius-panel: 1.5rem;
  --radius-control: 0.75rem;
  --shadow-card: 0 4px 20px -2px rgb(32 36 44 / 0.04);
  --shadow-panel: 0 12px 32px -4px rgb(32 36 44 / 0.06);
}

@theme inline {
  --font-sans: var(--font-jakarta), sans-serif;
}
```

`--font-jakarta` diisi oleh font pada root layout. Lengkapi token status dan typography sesuai tabel sebelum membuat komponen. Gunakan varian kelas statis pada props seperti `variant="whatsapp"`; jangan membangun nama kelas Tailwind dari warna API yang tidak diketahui saat build.

## 11. Hubungan UI dan Data API

Seluruh endpoint memakai prefix `/api/v1`.

| UI | Sumber data / tindakan |
| --- | --- |
| Merek, FAQ, kontak mitra | `GET /public/settings`. |
| Filter provider/wilayah | `GET /public/providers`, `GET /public/regions`. |
| Direktori, harga minimum, total | `GET /public/counters` dengan `q`, `providerId`, `regionId`, `page`, `limit`. |
| Detail konter dan paket | `GET /public/counters/:id` dengan `providerId` bila diperlukan. |
| Kontak konter/paket | `GET /public/contact` dengan `counterId` dan `packageId` opsional. |
| Identitas admin | `GET /auth/me`; mutasi mengikuti sesi dan CSRF dalam TECH_STACK. |
| Daftar dan formulir admin | Endpoint `/admin/counters`, `/admin/packages`, `/admin/providers`, `/admin/regions`, `/admin/settings`. |
| Dampak nonaktif provider | `GET /admin/providers/:id/impact`. |
| Event interaksi | `POST /events`, tidak memblokir tindakan utama. |

**Tambahan kontrak untuk ringkasan admin:** siapkan `GET /admin/overview` dengan proteksi admin. Endpoint agregat ini melengkapi kontrak STRUCTURE_PROJECT untuk mendukung layar ringkasan, dengan data `counters.total/byStatus`, `packages.total/byAvailability`, `providers.active`, `regions.withPublishedCounters`, serta `attention.items/total`. Tiap item perhatian berisi ID paket/konter, nama, alasan yang berasal dari data, dan timestamp. Implementasikan pada `backend/src/modules/overview/` dengan pola route/controller/service/repository yang sama dan dokumentasikan di `docs/api.md` saat API dibuat.

Jangan menghitung total katalog dengan mengambil panjang array halaman pertama. Jika alasan perhatian berupa kedaluwarsa, gunakan `displayUntil`; klaim stok menipis tidak boleh dihasilkan tanpa data jumlah stok.

Aturan publik dan penyegaran tetap mengikuti PRD/TECH_STACK: query paket publik konsisten, initial HTML tersedia dari server, refetch saat aktif sekitar 30 detik, pembaruan maksimal 60 detik dalam koneksi normal, serta validasi terakhir saat membuka WhatsApp.

## 12. Aset, Konten, dan Temuan Prototipe

### 12.1 Aset

Arsip memuat screenshot komposisi, sedangkan sembilan gambar di dalam HTML dirujuk dari `lh3.googleusercontent.com`: enam gambar konter, satu ilustrasi kios, satu foto detail Berkah Cell, dan satu ilustrasi peta. Gambar individual tersebut tidak berada dalam ZIP dan belum diunduh. Font serta ikon juga dirujuk dari sumber eksternal.

Gunakan [manifest aset](./docs/design/stitch/assets-manifest.json) untuk melacak asal setiap gambar. Pada implementasi, foto konter berasal dari data usaha yang disetujui pemilik. Ilustrasi dapat menjadi aset statis; foto contoh tidak dipresentasikan sebagai foto usaha nyata. Jangan memotong screenshot halaman untuk dijadikan foto konter.

Foto yang sama dipakai konsisten pada kartu dan detail konter. Berkas statis dapat ditempatkan di `frontend/public/images/`; gambar dinamis menggunakan URL host yang diizinkan. Setiap gambar memiliki ukuran/rasio eksplisit, fallback, dan teks alternatif sesuai perannya. `data-alt` dalam HTML ekspor tidak menggantikan atribut `alt` yang aksesibel.

### 12.2 Perilaku prototipe yang perlu diganti

- Script landing menyaring kartu statis melalui atribut HTML; implementasi harus memenuhi pencarian nama paket, alamat, provider, dan wilayah dari API.
- Modal prototipe mengganti nama/alamat konter tetapi isi paket contoh tetap; implementasi memuat paket berdasarkan ID konter, sehingga memilih toko lain tidak menampilkan paket Berkah Cell.
- Nomor WhatsApp contoh berulang pada banyak tautan; tujuan harus berasal dari data konter yang benar dan divalidasi backend.
- JavaScript DOM langsung, handler `onclick`, dan script inline dipetakan menjadi state/event React.
- Admin hasil ekspor merupakan tampilan statis. Login, form, validasi, simpan, publikasi, dan logout harus dihubungkan ke backend.
- Sidebar admin pada HTML tetap menggunakan margin 88 px pada layar kecil; implementasi menggantinya dengan drawer dan menghapus margin saat rail tidak tampil.
- Modal ekspor memiliki batas tinggi tetap 921 px; implementasi memakai batas berdasarkan viewport dinamis.
- Konten nomor telepon, jam buka, harga, alamat, tanggal, hitungan, dan status tidak disalin sebagai data produksi tetap.

### 12.3 Konsistensi fixture

Data development/test dapat memakai nama konter dari screenshot, tetapi harus konsisten antarhalaman. Bila landing menampilkan enam konter diterbitkan dan admin memperlihatkan satu konter draft tambahan, total admin adalah tujuh. Jumlah paket, provider, wilayah, serta nilai harga minimum dihitung dari fixture yang sama.

Contoh penawaran provider pada desain bukan katalog resmi. Label “Data contoh” cukup pada lingkungan demo atau catatan desain; konten produksi menggunakan informasi konter yang sudah dikonfirmasi.

## 13. Urutan Implementasi

1. Siapkan token, font, primitive UI, shell publik/admin, dan breakpoint.
2. Bangun landing page dari fixture yang konsisten dengan section serta kartu pada ekspor.
3. Bangun dialog detail memakai komponen profil dan paket yang dapat digunakan kembali.
4. Hubungkan pencarian, filter, detail, pagination, dan kontak ke API; lengkapi semua state.
5. Bangun login, ringkasan admin, daftar, serta formulir pengelolaan dengan otorisasi server.
6. Ganti aset/data contoh yang akan dipublikasikan dan periksa aksesibilitas serta tampilan responsif.

Pengembangan tiap bagian dinilai dari kesesuaian visual dan fungsi dalam PRD, bukan hanya kemiripan screenshot statis.

## 14. Kriteria Penerimaan Desain

- [ ] Warna kuning rail, panel putih, font, grid, radius, dan hirarki harga sesuai token serta referensi Stitch.
- [ ] Semua section landing dan seluruh route P0 pada STRUCTURE_PROJECT mempunyai tampilan yang jelas.
- [ ] Tidak ada teks/icon yang terpotong pada lebar 360, 390, 768, 1024, dan 1440 px; uji juga pembesaran teks 200%.
- [ ] Pada mobile, bottom navigation dan safe area tidak menutup kartu, footer, atau tombol terakhir.
- [ ] Modal detail tidak melebihi viewport; fokus, Escape, scroll lock, dan pengembalian fokus berfungsi.
- [ ] Provider, harga, paket, foto, dan nomor kontak konsisten untuk konter yang sama.
- [ ] Jumlah hasil dan ringkasan admin berasal dari data, termasuk saat pagination aktif.
- [ ] Rating, verifikasi, jarak, respons cepat, dan pengajuan mitra otomatis dari ekspor tidak muncul tanpa fitur pendukung.
- [ ] Loading, kosong, tanpa hasil, gagal, offline, gambar gagal, dan simpan gagal dapat dibedakan.
- [ ] Perubahan filter menggunakan logika AND; reset mengembalikan input/search header dan direktori secara konsisten.
- [ ] Tombol tersedia/perlu konfirmasi menggunakan label serta tindakan yang sesuai; paket nonpublik tidak muncul.
- [ ] Mutasi admin dan kontak WhatsApp diuji dengan hasil API berhasil maupun gagal.
- [ ] Teks normal memenuhi kontras minimal 4,5:1; kontrol memiliki fokus dan nama aksesibel.
- [ ] UI publik tidak menampilkan credential, ID internal operasional, atau rincian teknis implementasi.
- [ ] Gambar individual, font, dan ikon yang dibutuhkan tersedia pada lingkungan deployment; screenshot referensi tidak menjadi dependency aplikasi.

Validasi yang sudah dilakukan untuk penyusunan dokumen: inventaris arsip, pembacaan tiga HTML dan panduan desain, pemeriksaan tiga screenshot, pencocokan dengan markdown proyek, serta perhitungan kontras token utama. Pengujian browser, API, responsivitas nyata, dan performa menunggu aplikasi tersedia.
