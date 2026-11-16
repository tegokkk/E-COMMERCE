/** Refresh only unchanged starter copy. Existing custom text is preserved. */
export async function up(knex) {
  await knex.raw("ALTER TABLE platform_settings ALTER COLUMN manager_whatsapp SET DEFAULT ''");
  const row = await knex('platform_settings').where({ id: 1 }).first();
  if (!row) return;

  const update = {};
  if (row.hero_title === 'Temukan Kuota Internet dari Konter UMKM di Sekitarmu') {
    update.hero_title = 'Cari Paket Data dari Konter di Wilayah Pilihanmu';
  }
  if (row.hero_subtitle === 'Lihat pilihan konter, cek paket dari provider pilihanmu, lalu hubungi penjual langsung lewat WhatsApp.') {
    update.hero_subtitle = 'Lihat rincian paket dan harga yang dicantumkan konter, lalu tanyakan ketersediaannya lewat WhatsApp.';
  }
  if (row.description === 'Direktori pemasaran bersama konter kuota UMKM terpercaya.') {
    update.description = 'Direktori konter dan paket data yang ditampilkan pemilik usaha.';
  }
  if (['6281200000001', '6281234567890'].includes(row.manager_whatsapp)) {
    update.manager_whatsapp = '';
  }

  const faqs = typeof row.faqs === 'string' ? JSON.parse(row.faqs) : row.faqs || [];
  const revisedFaqs = faqs.map((faq) => {
    if (faq.question === 'Bagaimana cara membeli paket kuota di KonterKuota?' &&
      faq.answer === 'Pilih konter yang Anda inginkan, lihat daftar paket kuota yang tersedia, lalu tekan tombol "Tanya Paket" atau "Tanya Ketersediaan". Anda akan diarahkan langsung ke WhatsApp penjual untuk konfirmasi dan transaksi.') {
      return {
        question: 'Bagaimana cara cek paket dan menghubungi konter?',
        answer: 'Pilih konter, lihat rincian paket yang ditampilkan, lalu tekan "Tanya Paket". Konfirmasi stok, harga, dan cara bayar langsung kepada penjual di WhatsApp.',
      };
    }
    if (faq.question === 'Bagaimana cara mendaftarkan konter saya ke platform ini?' &&
      faq.answer === 'Silakan kunjungi bagian "Gabung Mitra" dan klik tombol "Daftarkan Konter Sekarang". Anda akan terhubung dengan pengelola platform kami melalui WhatsApp untuk proses verifikasi dan publikasi katalog.') {
      return {
        ...faq,
        answer: 'Buka bagian "Gabung Mitra" dan hubungi pengelola melalui WhatsApp jika kontak tersedia. Pengelola akan menjelaskan data konter yang perlu disiapkan.',
      };
    }
    return faq;
  });
  if (JSON.stringify(revisedFaqs) !== JSON.stringify(faqs)) {
    update.faqs = JSON.stringify(revisedFaqs);
  }

  if (Object.keys(update).length > 0) {
    update.updated_at = knex.fn.now();
    await knex('platform_settings').where({ id: 1 }).update(update);
  }
}

export async function down() {
  // Teks yang telah diedit admin tidak dapat dipulihkan dengan aman.
}
