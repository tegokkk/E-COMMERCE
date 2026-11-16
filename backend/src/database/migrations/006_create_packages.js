/**
 * Migration 006: Buat tabel packages
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('packages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('counter_id')
      .notNullable()
      .references('id')
      .inTable('counters')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .uuid('provider_id')
      .notNullable()
      .references('id')
      .inTable('providers')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    table.string('name', 100).notNullable();
    table.string('quota_summary', 100).notNullable();
    table.text('quota_details').nullable();
    table.string('active_period', 50).notNullable();
    table.integer('price').notNullable();
    table.text('terms').nullable();
    table.string('availability_status', 30).notNullable().defaultTo('available');
    table.string('publication_status', 20).notNullable().defaultTo('draft');
    table.timestamp('display_until', { useTz: true }).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Constraints & Indexes
    table.check('price > 0', [], 'chk_package_price_positive');
    table.check("availability_status IN ('available', 'needs_confirmation', 'unavailable')", [], 'chk_package_availability');
    table.check("publication_status IN ('draft', 'published', 'inactive')", [], 'chk_package_publication_status');

    table.index(['counter_id'], 'idx_packages_counter_id');
    table.index(['provider_id'], 'idx_packages_provider_id');
    table.index(['publication_status'], 'idx_packages_publication_status');
    table.index(['availability_status'], 'idx_packages_availability_status');
    table.index(['display_until'], 'idx_packages_display_until');
    table.index(['price'], 'idx_packages_price');
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('packages');
}

