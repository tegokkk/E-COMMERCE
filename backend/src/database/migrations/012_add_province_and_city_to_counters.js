/**
 * Migration 012: Tambah kolom province dan city ke tabel counters,
 * serta buat region_id menjadi opsional (nullable).
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.alterTable('counters', (table) => {
    table.string('province', 100).nullable();
    table.string('city', 100).nullable();
    table.uuid('region_id').nullable().alter();

    table.index(['province'], 'idx_counters_province');
    table.index(['city'], 'idx_counters_city');
  });

  // Isi data default untuk data demo/lama (Bandung, Jawa Barat)
  await knex('counters')
    .whereNull('province')
    .update({
      province: 'Jawa Barat',
      city: 'Kota Bandung',
    });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.alterTable('counters', (table) => {
    table.dropIndex(['province'], 'idx_counters_province');
    table.dropIndex(['city'], 'idx_counters_city');
    table.dropColumn('province');
    table.dropColumn('city');
  });
}

