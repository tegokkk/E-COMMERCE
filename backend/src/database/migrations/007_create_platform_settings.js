/**
 * Migration 007: Buat tabel platform_settings
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('platform_settings', (table) => {
    table.integer('id').primary().defaultTo(1);
    table.string('platform_name', 100).notNullable().defaultTo('KonterKuota');
    table.string('hero_title', 150).notNullable().defaultTo('Cari Paket Data dari Konter di Wilayah Pilihanmu');
    table.text('hero_subtitle').notNullable().defaultTo('Lihat rincian paket dan harga yang dicantumkan konter, lalu tanyakan ketersediaannya lewat WhatsApp.');
    table.text('logo_url').nullable();
    table.text('description').nullable();
    table.string('manager_whatsapp', 20).notNullable().defaultTo('');
    table.string('public_contact_email', 100).nullable();
    table.string('pilot_region', 100).notNullable().defaultTo('Bandung');
    table.jsonb('faqs').notNullable().defaultTo('[]');
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Seed baris pertama pengaturan default
  await knex('platform_settings').insert({
    id: 1,
    platform_name: 'KonterKuota',
    hero_title: 'Cari Paket Data dari Konter di Wilayah Pilihanmu',
    hero_subtitle: 'Lihat rincian paket dan harga yang dicantumkan konter, lalu tanyakan ketersediaannya lewat WhatsApp.',
    logo_url: '/images/brand-logo.svg',
    description: 'Direktori konter dan paket data yang ditampilkan pemilik usaha.',
    manager_whatsapp: '',
    public_contact_email: 'halo@konterkuota.id',
    pilot_region: 'Bandung',
    faqs: JSON.stringify([
      {
        question: 'Bagaimana cara cek paket dan menghubungi konter?',
        answer: 'Pilih konter, lihat rincian paket yang ditampilkan, lalu tekan "Tanya Paket". Konfirmasi stok, harga, dan cara bayar langsung kepada penjual di WhatsApp.',
      },
      {
        question: 'Apakah pembayaran dilakukan di dalam website?',
        answer: 'Tidak. Pembayaran, kesepakatan harga, dan pengisian kuota dilakukan secara langsung antara Anda dan pihak konter melalui WhatsApp.',
      },
      {
        question: 'Bagaimana cara mendaftarkan konter saya ke platform ini?',
        answer: 'Buka bagian "Gabung Mitra" dan hubungi pengelola melalui WhatsApp jika kontak tersedia. Pengelola akan menjelaskan data konter yang perlu disiapkan.',
      },
      {
        question: 'Seberapa sering informasi harga dan paket diperbarui?',
        answer: 'Data diperbarui secara berkala oleh pengelola bersama pemilik konter. Kami menyarankan untuk selalu mengonfirmasi ketersediaan paket ke penjual sebelum bertransaksi.',
      },
    ]),
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('platform_settings');
}

