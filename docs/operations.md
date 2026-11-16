# Operasional dan rilis KonterKuota

Panduan ini untuk server Linux yang memiliki Docker Compose, DNS domain aktif, dan sertifikat TLS yang sudah diterbitkan. Jangan buka port 80/443 ke publik sebelum semua pemeriksaan pascarilis lulus.

## Prasyarat rahasia dan image

1. Salin `infra/production.env.example` ke `/etc/konterkuota/production.env` di server, lalu isi nilai sebenarnya. Batasi izin file ke pemilik (`chmod 600`). Jangan taruh file itu di repo atau direktori build. Gunakan `DB_PASSWORD` acak yang URL-safe karena nilai tersebut juga menjadi bagian dari `DATABASE_URL`.
2. Isi `PUBLIC_ORIGIN` dengan URL HTTPS domain yang sebenarnya. `TLS_CERT_DIR` harus berisi `fullchain.pem` dan `privkey.pem` yang valid untuk domain tersebut. Setelah sertifikat diperbarui, buat ulang container Nginx agar file bind mount menunjuk sertifikat terbaru.
3. Tetapkan `RELEASE_TAG` yang unik dan tidak berubah untuk setiap rilis. Pastikan image lama tetap tersedia untuk rollback. Rotasi secret yang pernah terlanjur masuk ke image lama.
4. Pastikan backup sebelumnya telah berhasil di-restore pada database terisolasi sebelum memperbarui rilis yang sudah memiliki data.

## Rilis pertama atau pembaruan

Jalankan dari root repo di server. Compose menjalankan migrasi sebelum backend dinyalakan; migrasi gagal akan menghentikan proses rilis.

```bash
cd /srv/konterkuota
docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml config --quiet
docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml build --pull backend frontend
docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml up -d db migrate backend frontend nginx
docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml ps
curl -fsS https://DOMAIN_ANDA/api/v1/health
```

Pada rilis pertama, buat admin secara interaktif setelah migrasi selesai:

```bash
docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml run --rm -it --no-deps backend npm run admin:create
```

Jangan jalankan `db:seed` di produksi. Seed contoh memerlukan `ALLOW_DEVELOPMENT_SEED=true` pada mode development dan tetap menolak mode produksi atau nama database yang memuat `prod`.

## Gate sebelum membuka domain

- Pastikan HTTP beralih ke HTTPS, sertifikat valid, `/api/v1/health` mengembalikan 200, serta halaman `/`, `/robots.txt`, dan `/sitemap.xml` terbuka melalui HTTPS.
- Login admin; periksa cookie `konter_sid` memiliki `HttpOnly`, `Secure`, `SameSite=Lax`, dan `Path=/`. Uji logout dan pastikan sesi lama tidak dapat digunakan lagi.
- Isi setidaknya satu kontak pengelola yang benar (WhatsApp atau email) pada Pengaturan agar pemilik konter dapat meminta perubahan data. Masukkan minimal satu konter **nyata** dengan alamat dan WhatsApp valid serta satu paket aktif. Konter contoh disembunyikan di produksi. Uji filter gabungan, detail paket, tautan WhatsApp, dan paket yang tidak tersedia.
- Periksa status `healthy` untuk database, backend, frontend, dan Nginx. Pasang pemantauan eksternal ke `/api/v1/health`; Docker Compose memberi status health tetapi tidak otomatis mengganti container yang hanya berstatus unhealthy.
- Periksa log tanpa mencetak secret atau URL pencarian lengkap. Buka port publik hanya setelah seluruh gate lulus.

## Backup harian dan verifikasi restore

Simpan backup di direktori host dengan akses terbatas serta salin ke lokasi terpisah dari server. Script berikut menghasilkan arsip `pg_dump -Fc` dan arsip foto `*.uploads.tar` dengan timestamp yang sama. Keduanya diperiksa sebelum file sementara diganti nama. Simpan dan pulihkan kedua arsip sebagai satu pasangan; backup database saja tidak memuat foto konter yang diunggah.

```bash
bash infra/backup.sh /etc/konterkuota/production.env /srv/backups/konterkuota
bash infra/verify-restore.sh /etc/konterkuota/production.env /srv/backups/konterkuota/NAMA_BACKUP.dump
```

`verify-restore.sh` membuat database uji sementara, menjalankan `pg_restore --exit-on-error`, memeriksa adanya foreign key, lalu menghapus **hanya** database uji tersebut. Jalankan verifikasi minimal sebelum tiap rilis dan secara berkala setelah backup harian. Jangan menjalankan `pg_restore --clean` langsung pada database produksi tanpa rencana pemulihan yang disetujui.

Arsip foto dapat diperiksa dengan `tar -tf NAMA_BACKUP.uploads.tar`. Untuk pemulihan, ekstrak arsip foto ke volume `/app/uploads` milik backend bersamaan dengan pemulihan database dari timestamp yang sama. Uji pemulihan ini pada lingkungan terisolasi sebelum menggunakannya di produksi.

Pasang cron pada akun operasional yang dapat membaca file environment, menulis direktori backup/log, dan mengakses Docker. Sesuaikan path repo dan direktori backup:

```cron
0 2 * * * /bin/bash /srv/konterkuota/infra/backup.sh /etc/konterkuota/production.env /srv/backups/konterkuota >> /var/log/konterkuota-backup.log 2>&1
0 3 * * 0 cd /srv/konterkuota && docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml exec -T backend npm run analytics:cleanup >> /var/log/konterkuota-analytics.log 2>&1
0 4 * * 0 cd /srv/konterkuota && docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml exec -T backend npm run uploads:cleanup >> /var/log/konterkuota-uploads.log 2>&1
```

Pastikan cron benar-benar terpasang dan pantau kegagalannya. `analytics:cleanup` menghapus event lebih tua dari 90 hari; `uploads:cleanup` menghapus foto unggahan yang tidak dipakai dan sudah berumur tujuh hari. `analytics:report` dapat dijalankan manual melalui `docker compose ... exec -T backend npm run analytics:report`.

## Rollback dan pemulihan

1. Hentikan pembukaan trafik baru jika health check atau alur utama gagal.
2. Bila skema database masih kompatibel, kembalikan `RELEASE_TAG` ke image sebelumnya dan jalankan `docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml up -d --no-deps backend frontend nginx`. Opsi `--no-deps` menghindari menjalankan migrator lama terhadap skema baru. Uji ulang health dan login.
3. Bila migrasi tidak kompatibel, jangan menjalankan rollback migrasi secara otomatis. Simpan backup keadaan saat ini, verifikasi arsip sebelum rilis pada database terisolasi, lalu lakukan pemulihan terencana dengan jendela pemeliharaan. Catat data yang masuk setelah backup karena pemulihan snapshot dapat menghilangkannya.
4. Reset password admin melalui `docker compose --env-file /etc/konterkuota/production.env -f infra/compose.production.yaml exec backend npm run admin:reset-password`. Script mencabut sesi admin terkait.

Tidak ada prosedur pemulihan yang dinyatakan berhasil sampai uji restore pada server target lulus.
