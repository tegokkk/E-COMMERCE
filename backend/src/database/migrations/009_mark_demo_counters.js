/** Mark development fixtures explicitly, including databases seeded before this migration. */
export async function up(knex) {
  await knex.schema.alterTable('counters', (table) => {
    table.boolean('is_demo').notNullable().defaultTo(false);
  });

  await knex('counters')
    .whereIn('id', Array.from({ length: 8 }, (_, index) =>
      `d0000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`
    ))
    .update({ is_demo: true });
}

export async function down(knex) {
  await knex.schema.alterTable('counters', (table) => {
    table.dropColumn('is_demo');
  });
}
