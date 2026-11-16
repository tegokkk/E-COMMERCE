/**
 * Migration 004: Buat tabel counters
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('counters', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.text('photo_url').nullable();
    table
      .uuid('region_id')
      .notNullable()
      .references('id')
      .inTable('regions')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    table.string('address', 255).notNullable();
    table.text('map_url').nullable();
    table.string('whatsapp', 20).notNullable();
    table.string('operating_hours', 100).nullable();
    table.string('publication_status', 20).notNullable().defaultTo('draft');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Constraints & Indexes
    table.check("publication_status IN ('draft', 'published', 'inactive')", [], 'chk_counter_publication_status');
    table.index(['publication_status'], 'idx_counters_publication_status');
    table.index(['region_id'], 'idx_counters_region_id');
    table.index(['name'], 'idx_counters_name');
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('counters');
}

