/**
 * Migration 002: Buat tabel admin_sessions yang kompatibel dengan connect-pg-simple
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('admin_sessions', (table) => {
    table.string('sid').primary();
    table.json('sess').notNullable();
    table.timestamp('expire', { useTz: true }).notNullable();
    table.index('expire', 'IDX_session_expire');
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('admin_sessions');
}

