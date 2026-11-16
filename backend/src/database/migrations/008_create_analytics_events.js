/**
 * Migration 008: Buat tabel analytics_events
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('analytics_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('event_name', 50).notNullable();
    table.string('session_id', 64).notNullable();
    table.jsonb('properties').notNullable().defaultTo('{}');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['event_name'], 'idx_analytics_event_name');
    table.index(['session_id'], 'idx_analytics_session_id');
    table.index(['created_at'], 'idx_analytics_created_at');
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('analytics_events');
}

