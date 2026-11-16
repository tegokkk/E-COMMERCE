import argon2 from 'argon2';

/**
 * Seed data untuk pengembangan dan pengujian
 * Menolak database produksi!
 * @param {import('knex').Knex} knex
 */
export async function seed(knex) {
  const databaseUrl = process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;
  const databaseName = databaseUrl ? new URL(databaseUrl).pathname.slice(1) : '';
  const explicitDevelopmentSeed = process.env.NODE_ENV === 'development'
    && process.env.ALLOW_DEVELOPMENT_SEED === 'true';
  if (process.env.NODE_ENV === 'production' || /prod/i.test(databaseName)
    || (process.env.NODE_ENV !== 'test' && !explicitDevelopmentSeed)) {
    throw new Error('Seed contoh hanya boleh dijalankan pada database test atau development dengan ALLOW_DEVELOPMENT_SEED=true.');
  }
  if (!process.env.DEVELOPMENT_ADMIN_PASSWORD || process.env.DEVELOPMENT_ADMIN_PASSWORD.length < 12) {
    throw new Error('DEVELOPMENT_ADMIN_PASSWORD minimal 12 karakter wajib diisi untuk seed contoh.');
  }

  // 1. Bersihkan tabel
  await knex('analytics_events').del();
  await knex('packages').del();
  await knex('counters').del();
  await knex('providers').del();
  await knex('regions').del();
  await knex('admin_sessions').del();
  await knex('admins').del();

  // 2. Admin default
  const passwordHash = await argon2.hash(process.env.DEVELOPMENT_ADMIN_PASSWORD, { type: argon2.argon2id });
  await knex('admins').insert({
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@konterkuota.id',
    password_hash: passwordHash,
    name: 'Admin Utama KonterKuota',
    role: 'admin',
    is_active: true,
  });

  // 3. Wilayah (Regions)
  const regions = [
    { id: 'b0000000-0000-0000-0000-000000000001', name: 'Bandung Wetan' },
    { id: 'b0000000-0000-0000-0000-000000000002', name: 'Tamansari' },
    { id: 'b0000000-0000-0000-0000-000000000003', name: 'Coblong' },
    { id: 'b0000000-0000-0000-0000-000000000004', name: 'Sukajadi' },
    { id: 'b0000000-0000-0000-0000-000000000005', name: 'Bojongsoang' }, // Wilayah tanpa konter
  ];
  await knex('regions').insert(regions);

  // 4. Provider
  const providers = [
    { id: 'c0000000-0000-0000-0000-000000000001', name: 'Telkomsel', logo_url: null, is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000002', name: 'Indosat', logo_url: null, is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000003', name: 'XL Axiata', logo_url: null, is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000004', name: 'Tri', logo_url: null, is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000005', name: 'Smartfren', logo_url: null, is_active: false }, // Provider Nonaktif
  ];
  await knex('providers').insert(providers);

  // 5. Konter (Counters)
  const counters = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      name: 'Berkah Cell',
      description: 'Konter pulsa dan paket data internet terlengkap di kawasan Tamansari dan Bandung Wetan. Melayani pembelian kartu perdana dan voucher kuota all operator.',
      photo_url: '/images/counters/berkah-cell.jpg',
      region_id: 'b0000000-0000-0000-0000-000000000001',
      address: 'Jl. Tamansari No. 42, RT 02 / RW 05, Bandung Wetan',
      map_url: 'https://maps.google.com/?q=-6.8998,107.6098',
      whatsapp: '081234567890',
      operating_hours: '08:00 - 22:00 WIB',
      publication_status: 'published',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      name: 'Duta Pulsa',
      description: 'Menyediakan aneka voucher kuota murah harian, mingguan, dan bulanan. Fast response via WhatsApp.',
      photo_url: '/images/counters/duta-pulsa.jpg',
      region_id: 'b0000000-0000-0000-0000-000000000002',
      address: 'Jl. Sawunggaling No. 15, Tamansari',
      map_url: 'https://maps.google.com/?q=-6.9032,107.6087',
      whatsapp: '081298765432',
      operating_hours: '09:00 - 21:00 WIB',
      publication_status: 'published',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      name: 'Kawan Kuota',
      description: 'Spesialis kuota besar untuk mahasiswa dan pekerja. Tersedia XL Xtra Combo dan Telkomsel OMG.',
      photo_url: '/images/counters/kawan-kuota.jpg',
      region_id: 'b0000000-0000-0000-0000-000000000003',
      address: 'Jl. Dipatiukur No. 88, Coblong',
      map_url: 'https://maps.google.com/?q=-6.8931,107.6163',
      whatsapp: '081311223344',
      operating_hours: '08:30 - 23:00 WIB',
      publication_status: 'published',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000004',
      name: 'Mitra Cell',
      description: 'Layanan isi ulang pulsa dan paket kuota 24 jam via chat. Lokasi strategis dekat kampus.',
      photo_url: '/images/counters/mitra-cell.jpg',
      region_id: 'b0000000-0000-0000-0000-000000000004',
      address: 'Jl. Sukajadi No. 102, Sukajadi',
      map_url: 'https://maps.google.com/?q=-6.8856,107.5942',
      whatsapp: '081555667788',
      operating_hours: '10:00 - 22:00 WIB',
      publication_status: 'published',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000005',
      name: 'Sinar Pulsa',
      description: 'Paket internet hemat harga UMKM bersahabat. Promo paket mingguan dan bulanan setiap hari.',
      photo_url: '/images/counters/sinar-pulsa.jpg',
      region_id: 'b0000000-0000-0000-0000-000000000001',
      address: 'Jl. LLRE Martadinata (Riau) No. 55, Bandung Wetan',
      map_url: 'https://maps.google.com/?q=-6.9088,107.6190',
      whatsapp: '081777889900',
      operating_hours: '08:00 - 20:00 WIB',
      publication_status: 'published',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000006',
      name: 'Zona Cell',
      description: 'Konter kuota baru dibuka di Dago Asri. Paket kuota segera hadir dalam beberapa hari.',
      photo_url: '/images/counters/zona-cell.jpg',
      region_id: 'b0000000-0000-0000-0000-000000000003',
      address: 'Jl. Dago Asri No. 12, Coblong',
      map_url: null,
      whatsapp: '081900112233',
      operating_hours: null, // Jam kosong untuk menguji fallback
      publication_status: 'published', // Published tapi tidak punya paket aktif
    },
    {
      id: 'd0000000-0000-0000-0000-000000000007',
      name: 'Pojok Kuota (Draft)',
      description: 'Konter tahap persiapan katalog.',
      photo_url: null,
      region_id: 'b0000000-0000-0000-0000-000000000002',
      address: 'Jl. Ganesa No. 3, Tamansari',
      map_url: null,
      whatsapp: '081233344455',
      operating_hours: null,
      publication_status: 'draft',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000008',
      name: 'Sentra Cell (Nonaktif)',
      description: 'Konter sedang libur panjang.',
      photo_url: null,
      region_id: 'b0000000-0000-0000-0000-000000000004',
      address: 'Jl. Surya Sumantri No. 20, Sukajadi',
      map_url: null,
      whatsapp: '081888999111',
      operating_hours: 'Tutup sementara',
      publication_status: 'inactive',
    },
  ];
  await knex('counters').insert(counters.map((counter) => ({
    province: 'Jawa Barat',
    city: 'Kota Bandung',
    ...counter,
    is_demo: true,
  })));

  // 6. Paket (Packages)
  const packages = [
    // Berkah Cell (ID d...01)
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      counter_id: 'd0000000-0000-0000-0000-000000000001',
      provider_id: 'c0000000-0000-0000-0000-000000000001', // Telkomsel
      name: 'Telkomsel InternetMAX 14 GB',
      quota_summary: '14 GB',
      quota_details: '10 GB Kuota Utama + 4 GB Kuota Lokal 24 Jam',
      active_period: '30 Hari',
      price: 35000,
      terms: 'Berlaku untuk nomor Telkomsel prabayar. Masa aktif kuota 30 hari sejak injeksi voucher.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      counter_id: 'd0000000-0000-0000-0000-000000000001',
      provider_id: 'c0000000-0000-0000-0000-000000000001', // Telkomsel
      name: 'Telkomsel GigaMAX 28 GB',
      quota_summary: '28 GB',
      quota_details: '20 GB Kuota Utama + 8 GB Kuota Nonton & Chat',
      active_period: '30 Hari',
      price: 65000,
      terms: 'Termasuk langganan MAXstream 30 hari.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000003',
      counter_id: 'd0000000-0000-0000-0000-000000000001',
      provider_id: 'c0000000-0000-0000-0000-000000000002', // Indosat
      name: 'Freedom Internet 20 GB',
      quota_summary: '20 GB',
      quota_details: '20 GB Kuota Utama Full 24 Jam tanpa pembagian zona',
      active_period: '30 Hari',
      price: 45000,
      terms: 'Stok terbatas, mohon konfirmasi sebelum order.',
      availability_status: 'needs_confirmation',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000004',
      counter_id: 'd0000000-0000-0000-0000-000000000001',
      provider_id: 'c0000000-0000-0000-0000-000000000003', // XL
      name: 'XL Xtra Combo Flex 30 GB',
      quota_summary: '30 GB',
      quota_details: '18 GB Kuota Utama + 12 GB Kuota Lokal Jabar',
      active_period: '30 Hari',
      price: 55000,
      terms: 'Bonus nelpon 20 menit ke semua operator.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    // Duta Pulsa (ID d...02)
    {
      id: 'e0000000-0000-0000-0000-000000000005',
      counter_id: 'd0000000-0000-0000-0000-000000000002',
      provider_id: 'c0000000-0000-0000-0000-000000000002', // Indosat
      name: 'Indosat Freedom 10 GB',
      quota_summary: '10 GB',
      quota_details: '10 GB Kuota Utama 24 Jam',
      active_period: '30 Hari',
      price: 25000,
      terms: 'Langsung masuk via injeksi nomor.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000006',
      counter_id: 'd0000000-0000-0000-0000-000000000002',
      provider_id: 'c0000000-0000-0000-0000-000000000002', // Indosat
      name: 'Indosat Freedom 25 GB',
      quota_summary: '25 GB',
      quota_details: '20 GB Utama + 5 GB Aplikasi Medsos',
      active_period: '30 Hari',
      price: 50000,
      terms: 'Syarat: kartu Indosat aktif.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000007',
      counter_id: 'd0000000-0000-0000-0000-000000000002',
      provider_id: 'c0000000-0000-0000-0000-000000000004', // Tri
      name: 'Tri AlwaysOn 15 GB',
      quota_summary: '15 GB',
      quota_details: '15 GB Kuota Reguler mengikuti masa aktif kartu',
      active_period: 'Mengikuti Masa Aktif SIM',
      price: 30000,
      terms: 'Kuota tidak pernah hangus selama kartu aktif.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    // Kawan Kuota (ID d...03)
    {
      id: 'e0000000-0000-0000-0000-000000000008',
      counter_id: 'd0000000-0000-0000-0000-000000000003',
      provider_id: 'c0000000-0000-0000-0000-000000000003', // XL
      name: 'XL Flex Basic 18 GB',
      quota_summary: '18 GB',
      quota_details: '12 GB Utama + 6 GB Lokal Bandung',
      active_period: '30 Hari',
      price: 40000,
      terms: 'Klaim bonus di MyXL.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000009',
      counter_id: 'd0000000-0000-0000-0000-000000000003',
      provider_id: 'c0000000-0000-0000-0000-000000000003', // XL
      name: 'XL Flex Jumbo 45 GB',
      quota_summary: '45 GB',
      quota_details: '30 GB Utama + 15 GB Unlimited YouTube & TikTok',
      active_period: '30 Hari',
      price: 80000,
      terms: 'FUP berlaku untuk kuota unlimited.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000010',
      counter_id: 'd0000000-0000-0000-0000-000000000003',
      provider_id: 'c0000000-0000-0000-0000-000000000001', // Telkomsel
      name: 'Telkomsel Lite 10 GB',
      quota_summary: '10 GB',
      quota_details: '8 GB Utama + 2 GB Kuota Malam',
      active_period: '14 Hari',
      price: 28000,
      terms: 'Masa aktif 14 hari.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    // Mitra Cell (ID d...04)
    {
      id: 'e0000000-0000-0000-0000-000000000011',
      counter_id: 'd0000000-0000-0000-0000-000000000004',
      provider_id: 'c0000000-0000-0000-0000-000000000004', // Tri
      name: 'Tri Happy 30 GB',
      quota_summary: '30 GB',
      quota_details: '30 GB Full Kuota Utama 24 Jam',
      active_period: '30 Hari',
      price: 48000,
      terms: 'Tanpa pembagian waktu.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000012',
      counter_id: 'd0000000-0000-0000-0000-000000000004',
      provider_id: 'c0000000-0000-0000-0000-000000000001', // Telkomsel
      name: 'Telkomsel Super Seru 50 GB',
      quota_summary: '50 GB',
      quota_details: '50 GB Kuota Utama Nasional 24 Jam',
      active_period: '30 Hari',
      price: 100000,
      terms: 'Paket premium Telkomsel prabayar.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    // Sinar Pulsa (ID d...05)
    {
      id: 'e0000000-0000-0000-0000-000000000013',
      counter_id: 'd0000000-0000-0000-0000-000000000005',
      provider_id: 'c0000000-0000-0000-0000-000000000002', // Indosat
      name: 'Indosat Hemat 5 GB',
      quota_summary: '5 GB',
      quota_details: '5 GB Kuota Utama 24 Jam',
      active_period: '7 Hari',
      price: 15000, // Paket termurah untuk uji harga minimum
      terms: 'Masa aktif 7 hari sejak aktivasi.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000014',
      counter_id: 'd0000000-0000-0000-0000-000000000005',
      provider_id: 'c0000000-0000-0000-0000-000000000002', // Indosat
      name: 'Indosat Freedom Jumbo 50 GB',
      quota_summary: '50 GB',
      quota_details: '40 GB Utama + 10 GB Rollover',
      active_period: '30 Hari',
      price: 90000,
      terms: 'Sisa kuota dapat di-rollover.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    // Uji Paket Kedaluwarsa (display_until di masa lalu -> tidak boleh tampil)
    {
      id: 'e0000000-0000-0000-0000-000000000015',
      counter_id: 'd0000000-0000-0000-0000-000000000001',
      provider_id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Paket Flash Promo Telkomsel (Kedaluwarsa)',
      quota_summary: '100 GB',
      quota_details: 'Promo flash sale kemarin',
      active_period: '30 Hari',
      price: 20000,
      terms: 'Hanya tayang hingga kemarin.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    // Uji Paket Tidak Tersedia / Habis (unavailable -> tidak boleh tampil publik)
    {
      id: 'e0000000-0000-0000-0000-000000000016',
      counter_id: 'd0000000-0000-0000-0000-000000000002',
      provider_id: 'c0000000-0000-0000-0000-000000000004',
      name: 'Tri Voucher Fisik 100 GB (Habis)',
      quota_summary: '100 GB',
      quota_details: 'Voucher fisik stok habis',
      active_period: '30 Hari',
      price: 50000,
      terms: 'Stok kosong sementara.',
      availability_status: 'unavailable',
      publication_status: 'published',
      display_until: null,
    },
    // Uji Paket Provider Nonaktif (Smartfren -> tidak boleh tampil publik)
    {
      id: 'e0000000-0000-0000-0000-000000000017',
      counter_id: 'd0000000-0000-0000-0000-000000000004',
      provider_id: 'c0000000-0000-0000-0000-000000000005', // Smartfren (nonaktif)
      name: 'Smartfren Kuota Unlimited Harian',
      quota_summary: 'Unlimited',
      quota_details: 'FUP 1.5 GB per hari',
      active_period: '28 Hari',
      price: 60000,
      terms: 'Smartfren prabayar.',
      availability_status: 'available',
      publication_status: 'published',
      display_until: null,
    },
    // Uji Paket Konter Draft (Pojok Kuota -> tidak boleh tampil publik)
    {
      id: 'e0000000-0000-0000-0000-000000000018',
      counter_id: 'd0000000-0000-0000-0000-000000000007', // Pojok Kuota (Draft)
      provider_id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Telkomsel Draft Test 10 GB',
      quota_summary: '10 GB',
      quota_details: 'Paket dalam konter draft',
      active_period: '30 Hari',
      price: 30000,
      terms: 'Draft konter.',
      availability_status: 'available',
      publication_status: 'draft',
      display_until: null,
    },
  ];
  await knex('packages').insert(packages);
}

