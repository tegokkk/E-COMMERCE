import { db } from '../../database/connection.js';

export class RegionRepository {
  async findAll() {
    const rows = await db('regions')
      .select('id', 'name', 'created_at as createdAt', 'updated_at as updatedAt')
      .orderBy('name', 'asc');

    const counts = await db('counters')
      .select('region_id')
      .count('id as counterCount')
      .groupBy('region_id');

    const countMap = new Map(counts.map((c) => [c.region_id, parseInt(c.counterCount, 10)]));
    return rows.map((r) => ({
      ...r,
      counterCount: countMap.get(r.id) || 0,
    }));
  }

  async findById(id) {
    return db('regions').where({ id }).first();
  }

  async findByName(name) {
    return db('regions').whereRaw('LOWER(name) = ?', [name.toLowerCase().trim()]).first();
  }

  async create(name) {
    const [created] = await db('regions').insert({ name }).returning('*');
    return created;
  }

  async update(id, name) {
    const [updated] = await db('regions')
      .where({ id })
      .update({ name, updated_at: db.fn.now() })
      .returning('*');
    return updated;
  }

  async countCounters(id) {
    const row = await db('counters').where({ region_id: id }).count('id as total').first();
    return Number(row?.total || 0);
  }

  async remove(id) {
    return db('regions').where({ id }).del();
  }
}

