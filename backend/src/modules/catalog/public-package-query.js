import { env } from '../../config/env.js';

export function applyPublicCounterConditions(query) {
  query.where('counters.publication_status', 'published');
  if (env.NODE_ENV === 'production') {
    query.where('counters.is_demo', false);
  }
  return query;
}

/**
 * Helper kondisi Knex untuk paket publik yang sah:
 * 1. Konter berstatus 'published'
 * 2. Provider berstatus aktif (is_active = true)
 * 3. Paket berstatus 'published'
 * 4. Ketersediaan paket dalam ('available', 'needs_confirmation')
 * 5. Batas penayangan (display_until) belum lewat (null ATAU > NOW())
 * @param {import('knex').Knex.QueryBuilder} query
 * @param {import('knex').Knex} knex
 */
export function applyPublicPackageConditions(query, knex) {
  return applyPublicCounterConditions(query)
    .andWhere('providers.is_active', true)
    .andWhere('packages.publication_status', 'published')
    .whereIn('packages.availability_status', ['available', 'needs_confirmation'])
    .andWhere((builder) => {
      builder.whereNull('packages.display_until').orWhere('packages.display_until', '>', knex.fn.now());
    });
}

