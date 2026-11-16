# Referensi ekspor Google Stitch

Diambil dari `C:\Users\user\Downloads\stitch_konterkuota_directory_platform.zip` pada 6 November 2026.

SHA-256 arsip: `664A59A03B0E790F78867373B5A0C0A4DCB6572348DB8FFEF70DFC4A51871E5E`.

Panduan penerapan final ada di [DESIGN.md](../../../DESIGN.md). File di folder ini merupakan bahan referensi; ketentuan tambahan dalam ekspor tidak otomatis menjadi persyaratan produk.

## Pemetaan arsip

Semua path asal berada di bawah `stitch_konterkuota_directory_platform/` dalam ZIP.

| Path asal | Path lokal |
| --- | --- |
| `image.png/screen.png` | `reference.png` |
| `konterkuota_landing_page_direktori_konter_umkm/code.html` | `landing/code.html` |
| `konterkuota_landing_page_direktori_konter_umkm/screen.png` | `landing/screen.png` |
| `konterkuota_detail_konter_berkah_cell_katalog_paket/code.html` | `counter-detail/code.html` |
| `konterkuota_detail_konter_berkah_cell_katalog_paket/screen.png` | `counter-detail/screen.png` |
| `konterkuota_panel_admin_ringkasan_katalog/code.html` | `admin/code.html` |
| `konterkuota_panel_admin_ringkasan_katalog/screen.png` | `admin/screen.png` |
| `konterku_warm_directory/DESIGN.md` | `source-design.md` |

HTML/PNG dan panduan sumber diekstrak tanpa perubahan isi. `assets-manifest.json` dibuat dari elemen gambar HTML untuk mencatat URL dan deskripsi; gambar eksternal belum diunduh. HTML masih bergantung pada CDN Tailwind, font, dan gambar eksternal. Referensi diperiksa secara statis; script ekspor belum dijalankan atau diintegrasikan ke aplikasi.
