// Replace only unchanged starter FAQs; keep custom questions and answers intact.
const revisions = [
  {
    before: {
      question: 'Bagaimana cara cek paket dan menghubungi konter?',
      answer: 'Pilih konter, lihat rincian paket yang ditampilkan, lalu tekan "Tanya Paket". Konfirmasi stok, harga, dan cara bayar langsung kepada penjual di WhatsApp.',
    },
    after: {
      question: 'Bagaimana cara beli paket?',
      answer: 'Cari konter dan pilih paket, lalu tekan "Tanya Paket". Pastikan stok, harga, dan cara bayarnya lewat WhatsApp penjual.',
    },
  },
  {
    before: {
      question: 'Apakah pembayaran dilakukan di dalam website?',
      answer: 'Tidak. Pembayaran, kesepakatan harga, dan pengisian kuota dilakukan secara langsung antara Anda dan pihak konter melalui WhatsApp.',
    },
    after: {
      question: 'Bisa bayar di website ini?',
      answer: 'Belum ada pembayaran di sini. Kamu bayar langsung ke penjual setelah sepakat lewat WhatsApp.',
    },
  },
  {
    before: {
      question: 'Bagaimana cara mendaftarkan konter saya ke platform ini?',
      answer: 'Buka bagian "Gabung Mitra" dan hubungi pengelola melalui WhatsApp jika kontak tersedia. Pengelola akan menjelaskan data konter yang perlu disiapkan.',
    },
    after: {
      question: 'Bagaimana cara daftar konter?',
      answer: 'Buka bagian "Daftar Konter", lalu chat kami lewat WhatsApp. Kalau tombolnya belum aktif, coba lagi nanti.',
    },
  },
  {
    before: {
      question: 'Seberapa sering informasi harga dan paket diperbarui?',
      answer: 'Data diperbarui secara berkala oleh pengelola bersama pemilik konter. Kami menyarankan untuk selalu mengonfirmasi ketersediaan paket ke penjual sebelum bertransaksi.',
    },
    after: {
      question: 'Harga dan stoknya sudah pasti?',
      answer: 'Harga dan stok bisa berubah. Tanyakan ke penjual sebelum membeli.',
    },
  },
];

export async function up(knex) {
  const row = await knex('platform_settings').where({ id: 1 }).first();
  if (!row) return;
  const faqs = typeof row.faqs === 'string' ? JSON.parse(row.faqs) : row.faqs;
  if (!Array.isArray(faqs)) return;
  const updated = faqs.map((faq) => {
    const match = revisions.find(({ before }) => before.question === faq.question && before.answer === faq.answer);
    return match ? { ...faq, ...match.after } : faq;
  });
  if (JSON.stringify(updated) !== JSON.stringify(faqs)) {
    await knex('platform_settings').where({ id: 1 }).update({
      faqs: JSON.stringify(updated), updated_at: knex.fn.now(),
    });
  }
}

export async function down() {
  // Preserve subsequent admin edits rather than restoring old copy.
}
