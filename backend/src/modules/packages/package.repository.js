import { db } from '../../database/connection.js';

export class PackageRepository {
  async findAll({ counterId, q, providerId, publicationStatus, availabilityStatus, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const query = db('packages')
      .select(
        'packages.id',
        'packages.counter_id as counterId',
        'counters.name as counterName',
        'packages.provider_id as providerId',
        'providers.name as providerName',
        'packages.name',
        'packages.quota_summary as quotaSummary',
        'packages.quota_details as quotaDetails',
        'packages.active_period as activePeriod',
        'packages.price',
        'packages.terms',
        'packages.availability_status as availabilityStatus',
        'packages.publication_status as publicationStatus',
        'packages.display_until as displayUntil',
        'packages.created_at as createdAt',
        'packages.updated_at as updatedAt'
      )
      .join('counters', 'counters.id', 'packages.counter_id')
      .join('providers', 'providers.id', 'packages.provider_id');

    if (counterId) query.where('packages.counter_id', counterId);
    if (q) {
      query.where((builder) => builder
        .whereILike('packages.name', `%${q}%`)
        .orWhereILike('packages.quota_summary', `%${q}%`));
    }
    if (providerId) query.where('packages.provider_id', providerId);
    if (publicationStatus) query.where('packages.publication_status', publicationStatus);
    if (availabilityStatus) query.where('packages.availability_status', availabilityStatus);

    const countRes = await query.clone().clearSelect().count('packages.id as total').first();
    const total = parseInt(countRes?.total || 0, 10);

    const items = await query.orderBy('packages.updated_at', 'desc').offset(offset).limit(limit);

    return { items, total };
  }

  async findById(id, counterId) {
    const query = db('packages')
      .select(
        'packages.id',
        'packages.counter_id as counterId',
        'counters.name as counterName',
        'packages.provider_id as providerId',
        'providers.name as providerName',
        'packages.name',
        'packages.quota_summary as quotaSummary',
        'packages.quota_details as quotaDetails',
        'packages.active_period as activePeriod',
        'packages.price',
        'packages.terms',
        'packages.availability_status as availabilityStatus',
        'packages.publication_status as publicationStatus',
        'packages.display_until as displayUntil',
        'packages.created_at as createdAt',
        'packages.updated_at as updatedAt'
      )
      .join('counters', 'counters.id', 'packages.counter_id')
      .join('providers', 'providers.id', 'packages.provider_id')
      .where('packages.id', id);
    if (counterId) query.where('packages.counter_id', counterId);
    const pkg = await query.first();

    return pkg || null;
  }

  async create(data) {
    const [created] = await db('packages')
      .insert({
        counter_id: data.counterId,
        provider_id: data.providerId,
        name: data.name,
        quota_summary: data.quotaSummary,
        quota_details: data.quotaDetails || null,
        active_period: data.activePeriod,
        price: data.price,
        terms: data.terms || null,
        availability_status: data.availabilityStatus || 'available',
        publication_status: data.publicationStatus || 'draft',
        display_until: data.displayUntil ? new Date(data.displayUntil) : null,
      })
      .returning('*');

    return this.findById(created.id);
  }

  async update(id, data, counterId) {
    const updatePayload = {
      updated_at: db.fn.now(),
    };

    if (data.providerId !== undefined) updatePayload.provider_id = data.providerId;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.quotaSummary !== undefined) updatePayload.quota_summary = data.quotaSummary;
    if (data.quotaDetails !== undefined) updatePayload.quota_details = data.quotaDetails || null;
    if (data.activePeriod !== undefined) updatePayload.active_period = data.activePeriod;
    if (data.price !== undefined) updatePayload.price = data.price;
    if (data.terms !== undefined) updatePayload.terms = data.terms || null;
    if (data.availabilityStatus !== undefined) updatePayload.availability_status = data.availabilityStatus;
    if (data.publicationStatus !== undefined) updatePayload.publication_status = data.publicationStatus;
    if (data.displayUntil !== undefined) {
      updatePayload.display_until = data.displayUntil ? new Date(data.displayUntil) : null;
    }

    const query = db('packages').where({ id });
    if (counterId) query.where('counter_id', counterId);
    const rows = await query.update(updatePayload);
    if (!rows) return null;

    return this.findById(id, counterId);
  }

  async remove(id, counterId) {
    const query = db('packages').where({ id });
    if (counterId) query.where('counter_id', counterId);
    return query.del();
  }
}

