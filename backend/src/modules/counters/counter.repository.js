import { db } from '../../database/connection.js';
import { applyPublicPackageConditions } from '../catalog/public-package-query.js';

export class CounterRepository {
  async countImpact(id) {
    const query = db('packages')
      .join('counters', 'counters.id', 'packages.counter_id')
      .join('providers', 'providers.id', 'packages.provider_id')
      .where('packages.counter_id', id);
    applyPublicPackageConditions(query, db);
    const result = await query.count('packages.id as affectedPackages').first();
    return { affectedPackages: Number(result?.affectedPackages || 0) };
  }

  async findAll({ q, publicationStatus, regionId, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const query = db('counters')
      .select(
        'counters.id',
        'counters.name',
        'counters.description',
        'counters.photo_url as photoUrl',
        'counters.province as province',
        'counters.city as city',
        'counters.region_id as regionId',
        'regions.name as regionName',
        'counters.address',
        'counters.map_url as mapUrl',
        'counters.whatsapp',
        'counters.is_demo as isDemo',
        'counters.operating_hours as operatingHours',
        'counters.publication_status as publicationStatus',
        'counters.created_at as createdAt',
        'counters.updated_at as updatedAt'
      )
      .leftJoin('regions', 'regions.id', 'counters.region_id');

    if (publicationStatus) {
      query.where('counters.publication_status', publicationStatus);
    }
    if (regionId) {
      query.where('counters.region_id', regionId);
    }
    if (q && q.trim()) {
      const term = `%${q.trim().toLowerCase()}%`;
      query.where((builder) => {
        builder
          .whereRaw('LOWER(counters.name) LIKE ?', [term])
          .orWhereRaw('LOWER(counters.address) LIKE ?', [term])
          .orWhereRaw('LOWER(COALESCE(counters.city, \'\')) LIKE ?', [term])
          .orWhereRaw('LOWER(COALESCE(counters.province, \'\')) LIKE ?', [term])
          .orWhereRaw('LOWER(COALESCE(regions.name, \'\')) LIKE ?', [term]);
      });
    }

    const countRes = await query.clone().clearSelect().count('counters.id as total').first();
    const total = parseInt(countRes?.total || 0, 10);

    const items = await query.orderBy('counters.updated_at', 'desc').offset(offset).limit(limit);

    // Hitung jumlah paket per konter
    const counterIds = items.map((c) => c.id);
    if (counterIds.length > 0) {
      const packageCounts = await db('packages')
        .select('counter_id')
        .count('id as packageCount')
        .whereIn('counter_id', counterIds)
        .groupBy('counter_id');

      const countMap = new Map(packageCounts.map((p) => [p.counter_id, parseInt(p.packageCount, 10)]));
      for (const item of items) {
        item.packageCount = countMap.get(item.id) || 0;
      }
    }

    return { items, total };
  }

  async findById(id) {
    const counter = await db('counters')
      .select(
        'counters.id',
        'counters.name',
        'counters.description',
        'counters.photo_url as photoUrl',
        'counters.province as province',
        'counters.city as city',
        'counters.region_id as regionId',
        'regions.name as regionName',
        'counters.address',
        'counters.map_url as mapUrl',
        'counters.whatsapp',
        'counters.is_demo as isDemo',
        'counters.operating_hours as operatingHours',
        'counters.publication_status as publicationStatus',
        'counters.created_at as createdAt',
        'counters.updated_at as updatedAt'
      )
      .leftJoin('regions', 'regions.id', 'counters.region_id')
      .where('counters.id', id)
      .first();

    return counter || null;
  }

  async create(data) {
    const [created] = await db('counters')
      .insert({
        name: data.name,
        description: data.description || null,
        photo_url: data.photoUrl || null,
        province: data.province || null,
        city: data.city || null,
        region_id: data.regionId || null,
        address: data.address,
        map_url: data.mapUrl || null,
        whatsapp: data.whatsapp,
        operating_hours: data.operatingHours || null,
        publication_status: data.publicationStatus || 'draft',
      })
      .returning('*');

    return this.findById(created.id);
  }

  async update(id, data) {
    const updatePayload = {
      updated_at: db.fn.now(),
    };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description || null;
    if (data.photoUrl !== undefined) updatePayload.photo_url = data.photoUrl || null;
    if (data.province !== undefined) updatePayload.province = data.province || null;
    if (data.city !== undefined) updatePayload.city = data.city || null;
    if (data.regionId !== undefined) updatePayload.region_id = data.regionId || null;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.mapUrl !== undefined) updatePayload.map_url = data.mapUrl || null;
    if (data.whatsapp !== undefined) updatePayload.whatsapp = data.whatsapp;
    if (data.operatingHours !== undefined) updatePayload.operating_hours = data.operatingHours || null;
    if (data.publicationStatus !== undefined) updatePayload.publication_status = data.publicationStatus;

    const rows = await db('counters').where({ id }).update(updatePayload);
    if (!rows) return null;

    return this.findById(id);
  }

  async remove(id) {
    return db('counters').where({ id }).del();
  }

  async countPhotoReferences(photoUrl) {
    const row = await db('counters').where({ photo_url: photoUrl }).count('id as total').first();
    return Number(row?.total || 0);
  }
}

