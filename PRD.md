# PRD — Landing Page Konter Kuota UMKM

| Informasi             | Keterangan                                                   |
| --------------------- | ------------------------------------------------------------ |
| Nama produk sementara | Direktori Konter Kuota UMKM                                  |
| Versi dokumen         | 1.0                                                          |
| Tanggal               | 5 November 2026                                              |
| Status                | Draft awal untuk acuan desain dan pengembangan               |
| Platform              | Website responsif dengan prioritas penggunaan melalui ponsel |
| Bahasa utama          | Bahasa Indonesia                                             |

## 1. Ringkasan Produk

Website ini menjadi wadah pemasaran bersama bagi beberapa konter UMKM yang menjual paket kuota internet dari berbagai provider. Pengunjung dapat menemukan konter, melihat paket yang ditawarkan, mengetahui harga dan lokasi toko, lalu menghubungi penjual secara langsung melalui WhatsApp.

Landing page menjadi pintu masuk utama sekaligus direktori konter. Setiap konter memiliki identitas dan katalog paketnya sendiri, sehingga pengunjung selalu mengetahui toko yang menjual paket tersebut.

**Nilai utama:** mempermudah masyarakat menemukan penjual kuota internet sekaligus memberi ruang promosi digital bagi konter UMKM.

## 2. Dasar Kebutuhan dan Asumsi

### 2.1 Kebutuhan yang sudah ditetapkan

- Produk berbentuk landing page yang menampilkan beberapa konter.
- Konter yang ditampilkan merupakan UMKM penjual kuota internet dari berbagai provider.
- Website berfungsi sebagai wadah pemasaran UMKM tersebut.

### 2.2 Asumsi kerja untuk versi pertama

| Aspek               | Asumsi                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Proses pembelian    | Pengunjung menghubungi WhatsApp konter; kesepakatan, pembayaran, dan pengiriman kuota berlangsung langsung dengan penjual. |
| Akun pengunjung     | Pengunjung dapat menggunakan seluruh fitur publik tanpa login.                                                             |
| Pengelolaan konten  | Satu pengelola platform memperbarui data konter dan paket melalui halaman admin sederhana.                                 |
| Cakupan awal        | Peluncuran dimulai dari satu wilayah pilihan pengelola; kota atau kecamatan belum ditentukan.                              |
| Ketersediaan paket  | Diperbarui manual oleh admin berdasarkan informasi konter; konfirmasi terakhir dilakukan melalui WhatsApp.                 |
| Pendapatan platform | Belum menjadi persyaratan MVP. Pengujian awal berfokus pada manfaat bagi konter dan pengunjung.                            |
| Identitas merek     | Nama, logo, warna akhir, dan domain ditentukan sebelum peluncuran publik.                                                  |

Asumsi tersebut menjadi dasar pengerjaan draft ini dan dapat disesuaikan tanpa mengubah tujuan utama produk.

## 3. Masalah dan Pengguna Sasaran

### 3.1 Masalah yang ingin diselesaikan

Hipotesis masalah yang perlu divalidasi saat uji coba:

- Informasi konter, provider, paket, dan harga tersebar sehingga pengunjung perlu menghubungi beberapa toko secara terpisah.
- Konter UMKM membutuhkan tempat untuk menampilkan usaha dan penawarannya secara daring.
- Informasi paket dapat berubah, sehingga pengunjung membutuhkan keterangan yang jelas dan akses langsung ke penjual.

### 3.2 Pengguna sasaran

| Pengguna       | Kebutuhan utama                                                             | Hasil yang diharapkan                                      |
| -------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Calon pembeli  | Menemukan konter dan paket sesuai provider, wilayah, serta kebutuhan kuota. | Dapat memilih penjual dan membuka percakapan dengan cepat. |
| Pemilik konter | Mempromosikan toko, paket, dan kontak usahanya.                             | Mendapat calon pembeli dari website.                       |
| Admin platform | Menjaga data konter dan paket tetap rapi serta relevan.                     | Dapat menerbitkan, memperbarui, dan menonaktifkan konten.  |

## 4. Tujuan dan Ukuran Keberhasilan

### 4.1 Tujuan produk

1. Menyediakan satu halaman yang memudahkan penemuan beberapa konter UMKM.
2. Menampilkan informasi paket yang cukup jelas sebelum pengunjung menghubungi penjual.
3. Mengarahkan minat pengunjung ke WhatsApp konter yang tepat.
4. Membuat pembaruan informasi dapat dilakukan oleh admin tanpa mengubah kode aplikasi.

### 4.2 Target awal

Angka berikut merupakan target usulan untuk pilot, bukan hasil riset atau jaminan kinerja.

| Indikator                 | Target atau metode pengukuran                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Kesiapan konten           | Minimal 5 konter aktif, masing-masing memiliki minimal 2 paket yang layak ditampilkan saat peluncuran.                                |
| Keberhasilan penggunaan   | Minimal 4 dari 5 peserta uji dapat menemukan konter sesuai provider dan membuka WhatsApp dalam waktu maksimal 60 detik tanpa panduan. |
| Kelengkapan informasi     | Seluruh konter yang diterbitkan memiliki nama, wilayah, alamat, dan nomor WhatsApp valid.                                             |
| Minat menghubungi penjual | Ukur persentase sesi yang menghasilkan setidaknya satu klik WhatsApp konter; target awal 10%.                                         |
| Evaluasi pilot            | Tinjau setelah 30 hari. Jika trafik belum mencapai 200 sesi, gunakan hasil sebagai indikasi awal dan lanjutkan pengumpulan data.      |

Klik WhatsApp menunjukkan niat menghubungi penjual. Website tidak dapat menyimpulkan bahwa pesan terkirim atau pembelian berhasil hanya dari klik tersebut. Klik WhatsApp untuk pendaftaran mitra tidak dihitung sebagai minat membeli.

## 5. Ruang Lingkup

### 5.1 MVP — wajib tersedia

- Landing page berisi pengenalan layanan, direktori konter, cara penggunaan, ajakan bergabung, FAQ, dan footer.
- Pencarian konter atau paket melalui kata kunci.
- Filter provider dan wilayah berdasarkan data yang tersedia.
- Kartu konter berisi identitas, lokasi singkat, provider, dan ringkasan harga bila tersedia.
- Detail konter beserta katalog paketnya.
- Tombol WhatsApp per konter dan per paket.
- Tautan lokasi toko bila data peta tersedia.
- Halaman admin sederhana untuk mengelola konter, provider, dan paket.
- Tampilan responsif, aksesibilitas dasar, metadata halaman, dan pencatatan interaksi utama.

### 5.2 Di luar MVP

- Keranjang, checkout, pembayaran daring, dan pengiriman kuota otomatis.
- Integrasi saldo atau transaksi dengan distributor pulsa dan kuota.
- Akun pembeli, riwayat pesanan, serta pelacakan transaksi.
- Dashboard mandiri untuk setiap pemilik konter.
- Chat di dalam website, ulasan, rating, serta program loyalitas.
- Pencarian berdasarkan jarak atau lokasi GPS otomatis.
- Penempatan berbayar dan iklan sponsor.

## 6. Struktur Landing Page

| Urutan | Bagian           | Isi dan perilaku                                                                                            |
| ------ | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| 1      | Header           | Logo/nama platform, navigasi ke Daftar Konter, Cara Beli, dan Gabung Mitra. Menu menyesuaikan layar ponsel. |
| 2      | Hero             | Judul yang menjelaskan manfaat, deskripsi singkat, dan tombol utama “Cari Konter” menuju direktori.         |
| 3      | Direktori konter | Kolom pencarian, filter provider, filter wilayah, jumlah hasil, dan kartu konter.                           |
| 4      | Cara beli        | Tiga langkah: pilih konter, lihat paket, hubungi penjual melalui WhatsApp.                                  |
| 5      | Gabung mitra     | Manfaat bagi pemilik konter dan tombol “Daftarkan Konter” menuju WhatsApp pengelola platform.               |
| 6      | FAQ              | Penjelasan proses pembelian, pembaruan harga, ketersediaan paket, dan cara mendaftar sebagai mitra.         |
| 7      | Footer           | Kontak pengelola, tautan informasi privasi, dan identitas platform.                                         |

Contoh teks hero:

> Temukan Kuota Internet dari Konter UMKM di Sekitarmu
>
> Lihat pilihan konter, cek paket dari provider pilihanmu, lalu hubungi penjual langsung lewat WhatsApp.

Kata “di sekitarmu” merujuk pada wilayah yang dipilih pengunjung. Website tidak menyatakan konter sebagai yang terdekat tanpa perhitungan jarak.

### 6.1 Kartu konter

Kartu menampilkan nama konter, foto atau placeholder, wilayah, alamat singkat, daftar provider dari paket yang sedang ditampilkan, harga “Mulai dari” jika dapat dihitung, serta tombol “Lihat Paket” dan “Hubungi Konter”.

Harga “Mulai dari” dihitung dari paket publik milik konter yang sesuai filter provider aktif. Jika tidak ada paket yang layak ditampilkan, harga tersebut tidak muncul.

### 6.2 Detail konter

Untuk MVP, detail dibuka sebagai dialog atau panel di atas landing page. Tombol kembali/tutup mengembalikan pengunjung ke posisi daftar sebelumnya.

Detail memuat nama dan foto konter, deskripsi, alamat lengkap, jam operasional bila tersedia, tautan peta bila tersedia, daftar paket, waktu pembaruan informasi paket, dan tombol WhatsApp konter. Filter provider yang sedang aktif ikut diterapkan pada daftar paket dan dapat direset dari panel detail.

Setiap paket menampilkan provider, nama paket, rincian kuota, masa aktif, harga, status ketersediaan, serta syarat penting. Kuota utama, kuota lokal, kuota aplikasi, atau pembagian waktu harus dijelaskan jika berlaku agar jumlah kuota tidak menyesatkan.

## 7. Alur Pengguna

### 7.1 Pengunjung mencari paket

1. Pengunjung membuka landing page dan memilih “Cari Konter”.
2. Pengunjung mencari nama konter/paket atau memilih filter provider dan wilayah.
3. Website menampilkan konter yang sesuai beserta jumlah hasil.
4. Pengunjung membuka “Lihat Paket” pada salah satu konter.
5. Pengunjung membaca rincian paket lalu menekan “Tanya Paket” atau “Tanya Ketersediaan”.
6. Website membuka WhatsApp penjual dengan pesan awal yang menyebutkan konter dan paket.
7. Pengunjung meninjau dan mengirim pesan sendiri melalui WhatsApp.

### 7.2 Pemilik konter ingin bergabung

1. Pemilik konter membuka bagian Gabung Mitra.
2. Tombol “Daftarkan Konter” membuka WhatsApp pengelola dengan pesan minat bergabung.
3. Pengelola meminta informasi usaha dan paket serta memastikan informasi yang boleh dipublikasikan.
4. Admin memasukkan data, memeriksa pratinjau, lalu menerbitkan konter.

### 7.3 Admin memperbarui penawaran

1. Admin masuk ke halaman pengelolaan.
2. Admin memilih konter atau paket dan memperbarui informasi.
3. Sistem memvalidasi data, menyimpan perubahan, dan memperbarui waktu perubahan.
4. Data terbaru muncul pada halaman publik paling lambat 60 detik setelah penyimpanan berhasil, termasuk setelah halaman dimuat ulang.

## 8. Kebutuhan Fungsional dan Kriteria Penerimaan

| ID    | Kebutuhan                      | Kriteria penerimaan                                                                                                                                                                                                              |
| ----- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Menampilkan direktori konter   | Hanya konter berstatus diterbitkan yang tampil. Setiap kartu memperlihatkan identitas dan tombol yang sesuai dengan konternya.                                                                                                   |
| FR-02 | Pencarian kata kunci           | Pencarian mengabaikan perbedaan huruf besar/kecil dan spasi di awal/akhir; mencocokkan nama konter, alamat/wilayah, provider, atau nama paket publik. Mengosongkan pencarian mengembalikan hasil sesuai filter yang masih aktif. |
| FR-03 | Filter provider                | Satu provider dapat dipilih pada satu waktu. Hasil hanya memuat konter dengan minimal satu paket publik dari provider tersebut. Opsi “Semua provider” menghapus filter provider.                                                 |
| FR-04 | Filter wilayah                 | Satu wilayah dapat dipilih dari data konter aktif. Kata kunci, provider, dan wilayah diterapkan bersama dengan logika AND. Tersedia tombol “Reset filter”.                                                                       |
| FR-05 | Detail konter dan paket        | “Lihat Paket” membuka data milik konter yang dipilih. Setiap paket memiliki nama, provider, rincian kuota, masa aktif, harga, dan tombol kontak yang tepat.                                                                      |
| FR-06 | Hubungi konter                 | Tombol umum membuka nomor WhatsApp konter terpilih. Tombol paket menggunakan nomor konter pemilik paket dan pesan berisi paket yang dipilih. Pesan tidak dikirim otomatis.                                                       |
| FR-07 | Format informasi               | Harga ditampilkan dalam Rupiah, misalnya Rp25.000. Kuota menggunakan satuan yang jelas dan masa aktif ditampilkan sesuai aturan paket, misalnya “7 hari sejak aktivasi”.                                                         |
| FR-08 | Lokasi dan jam operasional     | Tautan peta tampil hanya bila tersedia dan mengarah ke lokasi konter yang benar. Jam operasional kosong ditulis “Hubungi konter untuk jam operasional”; tidak menghasilkan label “Buka sekarang”.                                |
| FR-09 | Pendaftaran mitra              | Tombol pendaftaran mengarah ke WhatsApp pengelola platform, dengan pesan yang berbeda dari pesan calon pembeli. Nomor pengelola wajib dikonfigurasi sebelum peluncuran.                                                          |
| FR-10 | Pengelolaan konter             | Admin dapat membuat, mengedit, menerbitkan, dan menonaktifkan konter. Nama, wilayah, alamat, dan WhatsApp wajib valid sebelum diterbitkan.                                                                                       |
| FR-11 | Pengelolaan paket dan provider | Admin dapat membuat/mengedit provider serta membuat, mengedit, menerbitkan, dan menonaktifkan paket untuk konter tertentu. Paket tidak dapat diterbitkan tanpa konter dan provider valid.                                        |
| FR-12 | Penyimpanan dan akses admin    | Perubahan tersimpan secara persisten. Pengguna tanpa sesi admin tidak dapat membaca data privat atau mengubah data melalui URL maupun permintaan langsung ke server. Admin dapat keluar dari akun.                               |
| FR-13 | Status halaman                 | Website memiliki keadaan memuat, tanpa data, tanpa hasil pencarian, gagal mengambil data, dan gambar gagal dimuat, masing-masing dengan pesan atau tindakan yang sesuai.                                                         |
| FR-14 | Pengukuran interaksi           | Pembukaan detail, penggunaan filter, dan klik WhatsApp dapat dicatat tanpa menghalangi navigasi apabila layanan analitik gagal.                                                                                                  |

### 8.1 Aturan katalog

- Paket publik adalah paket berstatus diterbitkan, milik konter diterbitkan, menggunakan provider aktif, belum melewati batas penayangan jika diisi, dan berstatus `tersedia` atau `perlu_konfirmasi`.
- Paket berstatus `tidak_tersedia`, draft, nonaktif, atau kedaluwarsa tidak tampil pada katalog publik, hasil pencarian paket, maupun perhitungan harga minimum.
- Status `tersedia` menggunakan tombol “Tanya Paket”; status `perlu_konfirmasi` menggunakan tombol “Tanya Ketersediaan”. Detail menjelaskan bahwa ketersediaan terakhir perlu dikonfirmasi kepada konter.
- Konter tanpa paket publik tetap boleh tampil pada direktori tanpa filter provider, dengan keterangan “Informasi paket sedang diperbarui” dan tombol kontak umum.
- Setiap paket dimiliki satu konter. Paket serupa di dua konter disimpan sebagai dua penawaran sehingga harga dan nomor tujuan tetap tepat.
- Urutan awal konter berdasarkan nama A–Z. Website tidak menampilkan rating, jumlah pelanggan, atau label rekomendasi yang tidak didukung data.
- Menonaktifkan konter menyembunyikan seluruh paketnya dari tampilan publik. Menonaktifkan provider menyembunyikan paket terkait setelah admin menerima penjelasan dampaknya.
- Nama provider berasal dari data yang dikelola admin. Logo ditampilkan jika aset tersedia; nama teks menjadi pengganti jika logo tidak tersedia.
- Tanggal pembaruan paket berasal dari perubahan nyata terhadap data paket, bukan waktu halaman dibuka.
- “Masa aktif kuota” dan “batas penayangan penawaran” merupakan dua informasi berbeda. Masa aktif menjelaskan penggunaan kuota; batas penayangan menentukan kapan penawaran berhenti tampil.

### 8.2 Pesan awal WhatsApp

Contoh untuk paket:

> Halo {nama_konter}, saya menemukan konter Anda melalui {nama_platform}. Saya ingin menanyakan paket {nama_paket}, provider {nama_provider}, rincian kuota {ringkasan_kuota}, masa aktif {masa_aktif}, dengan harga tercantum {harga}. Apakah paketnya masih tersedia?

Nomor disimpan dalam format internasional. Masukan Indonesia berawalan `08` dinormalisasi menjadi `628` sebelum dipakai untuk tautan. Teks pesan harus di-encode agar spasi dan karakter khusus terbaca dengan benar. Nomor tujuan dan identitas paket diperiksa kembali saat klik, terutama jika data telah berubah.

## 9. Kebutuhan Data

| Entitas             | Data utama                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Konter              | ID, nama, deskripsi, foto/logo opsional, wilayah, alamat lengkap, URL peta opsional, WhatsApp usaha, jam operasional opsional, status publikasi, waktu dibuat, waktu diperbarui.                                    |
| Provider            | ID, nama, logo opsional, status aktif.                                                                                                                                                                              |
| Paket               | ID, ID konter, ID provider, nama paket, ringkasan dan rincian kuota, masa aktif, harga dalam Rupiah, syarat/ketentuan opsional, status ketersediaan, status publikasi, batas penayangan opsional, waktu diperbarui. |
| Admin               | ID, identitas login, peran admin, dan data autentikasi yang dikelola oleh sistem autentikasi.                                                                                                                       |
| Pengaturan platform | Nama platform, logo opsional, deskripsi, nomor WhatsApp pengelola, kontak publik, wilayah pilot, dan isi FAQ.                                                                                                       |

Relasi utama: satu konter memiliki banyak paket; satu provider dapat digunakan oleh banyak paket dari berbagai konter. Daftar provider pada kartu konter diturunkan dari paket publiknya agar selalu konsisten.

Validasi minimum: harga berupa bilangan bulat positif; kolom wajib tidak boleh kosong; URL peta dan gambar menerima format yang diizinkan; batas penayangan yang sudah lewat tidak boleh digunakan untuk menerbitkan penawaran baru. Jika tersedia unggahan gambar, batasi ke JPEG, PNG, atau WebP dengan ukuran maksimal 2 MB per berkas.

## 10. Kebutuhan Desain dan Pengalaman Pengguna

- Utamakan keterbacaan nama konter, rincian kuota, harga, dan tombol WhatsApp pada layar ponsel.
- Gunakan grid satu kolom pada layar kecil, dua kolom pada tablet, dan tiga atau empat kolom pada desktop sesuai lebar konten.
- Gunakan warna dasar terang dengan satu warna utama merek. Hijau dapat digunakan pada tombol WhatsApp agar fungsi kontak mudah dikenali.
- Bedakan identitas provider dan identitas konter secara jelas. Pengunjung harus mengetahui toko yang akan dihubungi.
- Hindari carousel otomatis dan animasi berat pada konten utama.
- Gunakan foto konter asli jika tersedia; gunakan placeholder yang rapi jika belum ada.
- Tombol utama menggunakan teks tindakan yang spesifik: “Cari Konter”, “Lihat Paket”, “Hubungi Konter”, dan “Daftarkan Konter”.
- Tidak ada pop-up yang menghalangi pengunjung sebelum mereka melihat daftar konter.

Contoh keadaan kosong: “Belum ada konter yang sesuai. Coba provider atau wilayah lain.” Tampilkan tombol untuk mereset filter.

## 11. Kebutuhan Nonfungsional

| Aspek          | Persyaratan                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsif      | Konten dapat digunakan pada lebar 360 px, 768 px, dan 1440 px tanpa gulir horizontal yang tidak diperlukan.                                                                  |
| Performa       | Target Lighthouse Performance mobile minimal 85 pada build produksi dengan konten pilot. Gambar dioptimalkan dan gambar di luar layar dimuat saat dibutuhkan.                |
| Aksesibilitas  | Navigasi dapat digunakan melalui keyboard, fokus terlihat, input berlabel, gambar informatif memiliki teks alternatif, dan teks normal memiliki rasio kontras minimal 4,5:1. |
| Dialog detail  | Fokus berpindah ke panel saat dibuka, tetap berada di dalamnya selama terbuka, dapat ditutup dengan Escape, lalu kembali ke tombol pemicu.                                   |
| SEO dasar      | Judul halaman, deskripsi, satu H1 yang jelas, dan metadata berbagi tersedia. Informasi utama dan daftar awal konter dapat dirayapi; halaman admin tidak diindeks.            |
| Keamanan       | Akses tulis diperiksa di server, input divalidasi, konten teks tidak dieksekusi sebagai HTML bebas, dan rahasia autentikasi tidak dikirim ke browser publik.                 |
| Privasi        | Hanya informasi usaha yang disetujui pemilik yang dipublikasikan. Analitik tidak menyimpan nomor WhatsApp, isi pesan, atau nomor telepon calon pembeli.                      |
| Keandalan      | Data gagal dimuat menampilkan tindakan “Coba lagi”. Kegagalan analitik tidak boleh menggagalkan tombol kontak.                                                               |
| Kompatibilitas | Alur utama diuji pada browser desktop dan ponsel yang tersedia saat rilis, termasuk Chrome Android dan Safari iOS.                                                           |
| Pemeliharaan   | Data katalog disimpan terpisah dari komponen tampilan, sehingga pembaruan konter tidak memerlukan perubahan kode.                                                            |

Pilihan framework, database, hosting, dan layanan autentikasi ditentukan pada tahap implementasi sesuai kebutuhan tim. PRD ini menetapkan perilaku produk dan hasil yang harus dipenuhi.

## 12. Analitik

| Event                    | Kapan dicatat                                                                             | Properti minimum                                     |
| ------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `directory_view`         | Bagian direktori terlihat pertama kali dalam satu kunjungan.                              | Jumlah konter publik.                                |
| `search_used`            | Pengunjung menyelesaikan input pencarian setelah jeda input yang ditentukan implementasi. | Jumlah hasil; tidak menyimpan teks pencarian mentah. |
| `filter_applied`         | Filter provider atau wilayah berubah.                                                     | ID provider, ID wilayah, jumlah hasil.               |
| `counter_detail_opened`  | Detail konter dibuka.                                                                     | ID konter, sumber klik.                              |
| `whatsapp_clicked`       | Tombol WhatsApp calon pembeli ditekan.                                                    | ID konter, ID paket jika ada, posisi tombol.         |
| `partner_signup_clicked` | Tombol pendaftaran konter ditekan.                                                        | Posisi tombol.                                       |

Rasio minat menghubungi penjual dihitung sebagai jumlah sesi yang memicu `whatsapp_clicked` dibagi jumlah sesi pengunjung publik. Kunjungan admin dan pengujian internal dikeluarkan dari evaluasi. Data sesi cukup menggunakan pengenal anonim; laporan metrik boleh diakses melalui layanan analitik tanpa membuat dashboard khusus pada MVP.

## 13. Prioritas Pengembangan

| Prioritas                          | Cakupan                                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 — MVP                           | Seluruh fitur pada bagian 5.1, aturan katalog, admin pusat, keadaan kosong/gagal, dan pengukuran klik WhatsApp.                                 |
| P1 — sesudah pilot                 | Halaman konter dengan URL yang dapat dibagikan, penyortiran harga, penandaan paket promo dengan periode tayang, serta laporan minat per konter. |
| P2 — setelah kebutuhan tervalidasi | Akun pemilik konter, pembaruan katalog mandiri, pencarian jarak, serta pilihan monetisasi platform.                                             |

Urutan pengerjaan: siapkan contoh konten dan desain tampilan ponsel; bangun landing page serta direktori; hubungkan detail dan WhatsApp; siapkan pengelolaan data; lalu lakukan uji alur dan pilot. Estimasi waktu ditetapkan setelah kapasitas tim dan pilihan implementasi diketahui.

## 14. Skenario Uji Penerimaan

Gunakan data fiktif yang jelas diberi label pada lingkungan pengujian. Sebagai contoh, Konter A menjual Provider X di Wilayah Utara, Konter B menjual Provider Y di wilayah yang sama, dan Konter C menjual Provider X di Wilayah Selatan.

| Skenario                                                | Hasil yang diharapkan                                                                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Pilih Provider X dan Wilayah Utara                      | Hanya Konter A tampil.                                                                                                      |
| Cari nama Konter B ketika filter Provider X masih aktif | Hasil kosong dengan pilihan reset filter.                                                                                   |
| Buka paket pada Konter A lalu klik WhatsApp             | Nomor tujuan milik Konter A dan pesan menyebut paket yang dipilih.                                                          |
| Nonaktifkan paket termurah sebuah konter                | Paket hilang dari publik dan harga “Mulai dari” dihitung ulang dari paket yang tersisa.                                     |
| Lewati batas penayangan sebuah paket                    | Paket tidak lagi tampil setelah pemuatan data berikutnya; batas kesegaran data maksimal 60 detik.                           |
| Konter tidak memiliki paket publik                      | Tanpa filter provider, konter menampilkan informasi pembaruan dan kontak umum; dengan filter provider, konter tidak tampil. |
| Nonaktifkan sebuah konter                               | Kartu dan seluruh paketnya hilang dari hasil publik.                                                                        |
| Buka admin tanpa login lalu coba mengubah data          | Akses pengelolaan dan permintaan perubahan ditolak; data tetap sama.                                                        |
| Penyimpanan admin gagal                                 | Pesan kesalahan tampil, input tetap tersedia, dan sistem tidak mengklaim penyimpanan berhasil.                              |
| Layanan analitik gagal                                  | Pengunjung tetap dapat membuka detail dan WhatsApp.                                                                         |
| Gunakan keyboard untuk membuka dan menutup detail       | Fokus bergerak sesuai aturan dialog dan kembali ke tombol pembuka.                                                          |

## 15. Syarat Selesai dan Kesiapan Peluncuran

- [ ] Seluruh kebutuhan P0 dan skenario penerimaan telah diperiksa.
- [ ] Nama merek, wilayah pilot, dan kontak pengelola sudah ditetapkan.
- [ ] Data konter dan paket untuk pilot sudah diisi serta diperiksa oleh pengelola.
- [ ] Nomor WhatsApp setiap konter dan tombol pendaftaran mitra mengarah ke tujuan yang benar.
- [ ] Foto, alamat, jam operasional, harga, rincian kuota, serta syarat paket tidak memuat data contoh pada lingkungan publik.
- [ ] Alur mencari konter, melihat paket, dan membuka WhatsApp berhasil di ponsel maupun desktop.
- [ ] Admin dapat menyimpan perubahan secara persisten dan pengunjung melihat pembaruan dalam batas waktu yang ditetapkan.
- [ ] Hak akses admin, tampilan kosong/gagal, akses keyboard, dan target performa telah diperiksa.
- [ ] Event analitik dapat dipakai untuk menghitung metrik pilot tanpa merekam informasi kontak pribadi.
- [ ] Pengelola menetapkan jadwal pemeriksaan katalog minimal mingguan dan jalur pemberitahuan perubahan dari konter.

## 16. Keputusan Lanjutan

Hal berikut perlu ditetapkan menjelang implementasi atau peluncuran; draft tetap dapat digunakan untuk memulai desain:

1. Nama final platform dan arah identitas visual.
2. Wilayah serta daftar konter yang mengikuti pilot.
3. Daftar provider, paket, dan materi foto yang akan ditampilkan.
4. Orang yang bertanggung jawab memperbarui katalog dan menerima pendaftaran mitra.
5. Teknologi, hosting, domain, dan anggaran operasional.
6. Hasil evaluasi pilot untuk menentukan fitur tahap berikutnya dan kemungkinan model pendapatan.
