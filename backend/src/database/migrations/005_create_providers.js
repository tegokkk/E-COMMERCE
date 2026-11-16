/**
 * Migration 005: Buat tabel providers
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('providers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).notNullable().unique();
    table.text('logo_url').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['is_active'], 'idx_providers_is_active');
    table.index(['name'], 'idx_providers_name');
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('providers');
}

