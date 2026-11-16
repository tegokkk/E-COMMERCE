# Dokumentasi Kontrak REST API — KonterKuota

Prefix: `/api/v1`

## 1. Standar Format Respons

### Berhasil dengan Data Tunggal
```json
{
  "data": { ... }
}
```

### Berhasil dengan Daftar & Pagination
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 35,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Kesalahan (Error)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang diisi.",
    "fields": {
      "price": "Harga harus lebih besar dari nol."
    }
  }
}
```

---

## 2. Endpoint Publik

### `GET /health`
Status kesehatan sistem dan koneksi database.
- **Respons:** 200 OK `{ "status": "ok", "service": "konterkuota-backend", "timestamp": "..." }`

### `GET /public/settings`
Informasi merek, FAQ, dan kontak pengelola untuk pengunjung.
- **Respons:** 200 OK `{ "data": { "platformName": "KonterKuota", ... } }`

### `GET /public/providers`
Daftar provider aktif yang memiliki minimal satu paket publik.
- **Respons:** 200 OK `{ "data": [ { "id": "...", "name": "Telkomsel", "logoUrl": null } ] }`

### `GET /public/regions`
Daftar wilayah yang memiliki minimal satu konter diterbitkan.
- **Respons:** 200 OK `{ "data": [ { "id": "...", "name": "Bandung Wetan" } ] }`

### `GET /public/locations`
Pilihan lokasi dari konter yang diterbitkan: provinsi, kota/kabupaten, dan wilayah lama. Kota tetap tersedia meskipun konter tidak memiliki `regionId`. Data contoh disembunyikan di produksi.
- **Respons:** 200 OK `{ "data": [ ... ] }`, setiap opsi memiliki `id`, `name`, dan `type`.
- `type: "province"` menyertakan `province`; `type: "city"` menyertakan `city` dan `province`; `type: "region"` menyertakan `regionId` UUID.
- Gunakan field lokasi pada opsi untuk query daftar konter. `id` opsi provinsi/kota adalah pengenal UI, bukan UUID untuk parameter `regionId`.
- Kota dengan nama sama pada provinsi berbeda memiliki opsi berbeda. Endpoint `/public/regions` tetap kompatibel dengan klien lama.

### `GET /public/counters`
Direktori konter kuota.
- **Query:**
  - `q` (string, opsional): pencarian nama konter, alamat, wilayah, provider, atau paket
  - `providerId` (UUID, opsional): filter provider
  - `regionId` (UUID, opsional): filter wilayah
  - `province` (string, opsional, maks 100 karakter): filter nama provinsi secara persis, tidak peka huruf besar/kecil
  - `city` (string, opsional, maks 100 karakter): filter kota/kabupaten; kombinasikan dengan `province` untuk membedakan kota bernama sama
  - `page` (integer, default 1)
  - `limit` (integer, default 12, maks 50)
- **Respons:** 200 OK `{ "data": [...], "meta": { ... } }`
  - Setiap konter memuat `isDemo`, `minPrice`, `priceLabel`, dan `matchedPackageName`.
    Jika `q` cocok dengan paket/provider, `minPrice` berasal dari paket yang cocok.
    Jika `q` cocok dengan nama/alamat/wilayah/kota/provinsi konter, harga minimum tetap berasal dari paket publik konter yang memenuhi filter provider.
    Nomor WhatsApp usaha tidak dikirim di respons direktori.
  - Konter contoh hanya tampil di lingkungan non-produksi.

### `GET /public/counters/:id`
Detail profil konter beserta paket kuota publik miliknya.
- **Query:** `providerId` (opsional)
- **Respons:** 200 OK atau 404 NOT_FOUND.
  Respons tidak memuat nomor WhatsApp usaha; gunakan endpoint kontak untuk konter asli.

### `GET /public/contact`
Menghasilkan URL WhatsApp konter setelah status konter dan paket diperiksa.
- **Query:**
  - `counterId` (UUID, wajib)
  - `packageId` (UUID, opsional)
- **Respons:** 200 OK `{ "data": { "whatsappUrl": "https://wa.me/628123...?text=...", "counterName": "Berkah Cell" } }`
- **Error:** 409 `PACKAGE_UNAVAILABLE` jika paket telah habis/kedaluwarsa,
  atau 409 `DEMO_COUNTER` untuk data contoh.

### `GET /uploads/counters/:filename`
Menampilkan foto konter WebP yang diunggah admin. Nama file harus UUID dengan akhiran `.webp`; selain itu mengembalikan 404.

### `POST /events`
Pencatatan interaksi analitik ringan (page_view, directory_view, search_used, filter_applied, counter_detail_opened, whatsapp_clicked, partner_signup_clicked).
- **Body:** `{ "eventName": "...", "sessionId": "...", "properties": { ... } }`
- **Respons:** 204 No Content.

---

## 3. Endpoint Autentikasi & Admin

### `GET /auth/csrf`
Mendapatkan token CSRF untuk sesi aktif.
- **Respons:** 200 OK `{ "data": { "csrfToken": "..." } }`

### `POST /auth/login`
Autentikasi admin.
- **Headers:** `X-CSRF-Token`
- **Body:** `{ "email": "admin@konterkuota.id", "password": "..." }`
- **Respons:** 200 OK `{ "data": { "admin": { ... }, "csrfToken": "..." } }`

### `GET /auth/me`
Pengecekan sesi admin aktif.
- **Respons:** 200 OK atau 401 UNAUTHORIZED.

### `POST /auth/logout`
Menghapus sesi admin dan membersihkan cookie.
- **Respons:** 204 No Content.

### `GET /admin/overview`
Ringkasan metrik katalog untuk dashboard admin:
- Total dan status konter
- Total dan status paket
- Total provider aktif dan wilayah
- Daftar perhatian: konter tanpa paket, paket segera kedaluwarsa, provider nonaktif.

### CRUD Admin:
- `GET, POST /admin/counters`
- `GET, PATCH, DELETE /admin/counters/:id` — hapus permanen juga menghapus seluruh paket milik konter.
- `GET, POST /admin/counters/:counterId/packages`
- `GET, PATCH, DELETE /admin/counters/:counterId/packages/:id`
- `GET, POST /admin/packages` — kompatibilitas klien lama.
- `GET, PATCH, DELETE /admin/packages/:id` — kompatibilitas tautan/klien lama.
- `GET, POST /admin/providers`
- `PATCH, DELETE /admin/providers/:id` — DELETE menghasilkan 409 bila masih ada paket terkait.
- `GET /admin/providers/:id/impact`
- `GET, POST /admin/regions`
- `PATCH, DELETE /admin/regions/:id` — DELETE menghasilkan 409 bila masih ada konter terkait.
- `GET, PATCH /admin/settings`

Semua mutasi admin memerlukan sesi admin, header `Origin` yang sesuai, dan `X-CSRF-Token`. DELETE berhasil menghasilkan 204 dan ID yang tidak ditemukan menghasilkan 404.

### Paket milik konter

Kelola paket melalui `/admin/counters/:counterId/packages`. Parameter path
menentukan konter pemilik untuk daftar, jumlah, pagination, detail, dan mutasi.
Paket milik konter lain menghasilkan 404 saat dibaca, diedit, diubah statusnya,
atau dihapus melalui path konter yang berbeda.

- **Query GET daftar:** `q` (nama/kuota, maks 100 karakter), `providerId` (UUID),
  `publicationStatus`, `availabilityStatus`, `page` (default 1), `limit` (default 10,
  maks 100). Semua filter dan metadata tetap terbatas pada konter di path.
- **POST:** body paket biasa tanpa `counterId`; konter diambil dari path.
  `counterId` di body, jika diberikan, wajib sama dengan path.
- **PATCH:** hanya mengubah field paket. Konter pemilik tidak dapat dipindahkan,
  termasuk melalui endpoint kompatibilitas lama.
- **Error:** 400 `VALIDATION_ERROR` untuk parameter tidak valid; 400
  `COUNTER_MISMATCH` untuk upaya mengganti konter; 409 `COUNTER_NOT_PUBLISHED`
  untuk menambah paket pada konter draft/nonaktif.
- Paket lama tetap dapat dikelola setelah konter dinonaktifkan. Aturan visibilitas
  publik tetap memerlukan konter terbit dan paket memenuhi syarat publik.

Dashboard `GET /admin/overview` mengembalikan perhatian kedaluwarsa sebagai
`attention.expiringCounters`: ringkasan `{ id, name, packageCount,
nextDisplayUntil }` per konter, menggantikan daftar paket campuran.

### `POST /admin/uploads/counter-photo`
Unggah foto konter sebagai body biner dengan `Content-Type: image/jpeg`, `image/png`, atau `image/webp`. Batas 5 MB dan 20 megapiksel; gambar harus statis. Server memeriksa isi dan mengubahnya menjadi WebP maksimal 1600 × 1600 piksel, lalu mengembalikan 201 `{ "data": { "photoUrl": "/api/v1/uploads/counters/<uuid>.webp" } }`. Simpan URL tersebut pada `photoUrl` konter. Foto lama yang diunggah akan dihapus setelah tidak direferensikan konter mana pun. Unggahan yang tidak pernah dipakai dibersihkan oleh `uploads:cleanup` setelah tujuh hari.

