import { db } from '../../database/connection.js';

export class ProviderRepository {
  async findAll() {
    const rows = await db('providers')
      .select('id', 'name', 'logo_url as logoUrl', 'is_active as isActive', 'created_at as createdAt', 'updated_at as updatedAt')
      .orderBy('name', 'asc');

    // Tambahkan jumlah paket aktif
    const counts = await db('packages')
      .select('provider_id')
      .count('id as packageCount')
      .groupBy('provider_id');

    const countMap = new Map(counts.map((c) => [c.provider_id, parseInt(c.packageCount, 10)]));
    return rows.map((r) => ({
      ...r,
      packageCount: countMap.get(r.id) || 0,
    }));
  }

  async findById(id) {
    const row = await db('providers')
      .select('id', 'name', 'logo_url as logoUrl', 'is_active as isActive', 'created_at as createdAt', 'updated_at as updatedAt')
      .where({ id })
      .first();

    return row || null;
  }

  async findByName(name) {
    return db('providers').whereRaw('LOWER(name) = ?', [name.toLowerCase().trim()]).first();
  }

  async create(data) {
    const [created] = await db('providers')
      .insert({
        name: data.name,
        logo_url: data.logoUrl || null,
        is_active: data.isActive !== undefined ? data.isActive : true,
      })
      .returning('*');

    return this.findById(created.id);
  }

  async update(id, data) {
    const updatePayload = {
      updated_at: db.fn.now(),
    };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.logoUrl !== undefined) updatePayload.logo_url = data.logoUrl || null;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

    const rows = await db('providers').where({ id }).update(updatePayload);
    if (!rows) return null;

    return this.findById(id);
  }

  async countImpact(id) {
    // Hitung berapa paket yang diterbitkan dan sedang aktif yang akan terdampak
    const countRes = await db('packages')
      .count('id as affectedPackages')
      .where({ provider_id: id, publication_status: 'published' })
      .first();

    // Hitung berapa konter berbeda yang memiliki paket dari provider ini
    const counterCountRes = await db('packages')
      .countDistinct('counter_id as affectedCounters')
      .where({ provider_id: id, publication_status: 'published' })
      .first();

    return {
      affectedPackages: parseInt(countRes?.affectedPackages || 0, 10),
      affectedCounters: parseInt(counterCountRes?.affectedCounters || 0, 10),
    };
  }

  async countPackages(id) {
    const row = await db('packages').where({ provider_id: id }).count('id as total').first();
    return Number(row?.total || 0);
  }

  async remove(id) {
    return db('providers').where({ id }).del();
  }
}

