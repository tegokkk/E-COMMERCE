export async function up(knex) {
  await knex.schema.createTable('rate_limit_counters', (table) => {
    table.string('key', 160).primary();
    table.integer('total_hits').notNullable();
    table.timestamp('reset_at', { useTz: true }).notNullable().index();
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('rate_limit_counters');
}
