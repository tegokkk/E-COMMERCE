import { db } from '../../database/connection.js';
import { applyPublicCounterConditions, applyPublicPackageConditions } from './public-package-query.js';
import { isAllowedPhotoUrl } from '@konter/shared';

export class CatalogRepository {
  async getPublicSettings() {
    const row = await db('platform_settings').where({ id: 1 }).first();
    if (!row) return null;
    return {
      platformName: row.platform_name,
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      logoUrl: row.logo_url,
      description: row.description,
      managerWhatsapp: ['6281200000001', '6281234567890'].includes(row.manager_whatsapp)
        ? null
        : row.manager_whatsapp,
      publicContactEmail: row.public_contact_email,
      pilotRegion: row.pilot_region,
      faqs: typeof row.faqs === 'string' ? JSON.parse(row.faqs) : row.faqs || [],
      updatedAt: row.updated_at,
    };
  }

  async getPublicProviders() {
    // Hanya provider aktif yang memiliki minimal 1 paket publik
    const query = db('providers')
      .distinct('providers.id', 'providers.name', 'providers.logo_url')
      .join('packages', 'packages.provider_id', 'providers.id')
      .join('counters', 'counters.id', 'packages.counter_id')
      .where('providers.is_active', true)
      .orderBy('providers.name', 'asc');

    applyPublicPackageConditions(query, db);
    const rows = await query;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      logoUrl: r.logo_url,
    }));
  }

  async getPublicRegions() {
    // Hanya wilayah yang memiliki minimal 1 konter published
    const query = db('regions')
      .distinct('regions.id', 'regions.name')
      .join('counters', 'counters.region_id', 'regions.id')
      .orderBy('regions.name', 'asc');
    const rows = await applyPublicCounterConditions(query);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
    }));
  }

  async getPublicLocations() {
    const rows = await applyPublicCounterConditions(db('counters')
      .leftJoin('regions', 'regions.id', 'counters.region_id')
      .distinct('counters.province', 'counters.city', 'counters.region_id', 'regions.name as regionName'));
    const locations = new Map();
    for (const row of rows) {
      const province = row.province?.trim() || '';
      const city = row.city?.trim() || '';
      if (province) {
        const id = `province:${encodeURIComponent(province.toLowerCase())}`;
        locations.set(id, { id, name: `${province} (Provinsi)`, type: 'province', province });
      }
      if (city) {
        const id = `city:${encodeURIComponent(province.toLowerCase())}:${encodeURIComponent(city.toLowerCase())}`;
        locations.set(id, { id, name: province ? `${city} · ${province}` : city, type: 'city', city, province });
      }
      if (row.region_id && row.regionName) {
        locations.set(row.region_id, { id: row.region_id, name: row.regionName, type: 'region', regionId: row.region_id });
      }
    }
    return [...locations.values()].sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }

  async findPublicCounters({ q, providerId, regionId, province, city, page = 1, limit = 12 }) {
    const offset = (page - 1) * limit;

    // Base query konter yang diterbitkan
    const baseQuery = applyPublicCounterConditions(db('counters'));

    if (regionId) {
      baseQuery.where('counters.region_id', regionId);
    }
    if (province) baseQuery.whereRaw("LOWER(TRIM(COALESCE(counters.province, ''))) = ?", [province.trim().toLowerCase()]);
    if (city) baseQuery.whereRaw("LOWER(TRIM(COALESCE(counters.city, ''))) = ?", [city.trim().toLowerCase()]);

    if (providerId) {
      // Hanya konter yang memiliki paket publik dengan providerId ini
      baseQuery.whereExists(function () {
        const sub = this.select('packages.id')
          .from('packages')
          .join('providers', 'providers.id', 'packages.provider_id')
          .whereRaw('packages.counter_id = counters.id')
          .where('packages.provider_id', providerId);

        applyPublicPackageConditions(sub, db);
      });
    }

    if (q && q.trim()) {
      const term = `%${q.trim().toLowerCase()}%`;
      baseQuery.where((builder) => {
        builder
          .whereRaw('LOWER(counters.name) LIKE ?', [term])
          .orWhereRaw('LOWER(counters.address) LIKE ?', [term])
          .orWhereRaw('LOWER(COALESCE(counters.city, \'\')) LIKE ?', [term])
          .orWhereRaw('LOWER(COALESCE(counters.province, \'\')) LIKE ?', [term])
          .orWhereExists(function () {
            // Pencarian nama wilayah
            this.select('regions.id')
              .from('regions')
              .whereRaw('regions.id = counters.region_id')
              .whereRaw('LOWER(regions.name) LIKE ?', [term]);
          })
          .orWhereExists(function () {
            // Pencarian nama provider atau paket publik
            const sub = this.select('packages.id')
              .from('packages')
              .join('providers', 'providers.id', 'packages.provider_id')
              .whereRaw('packages.counter_id = counters.id')
              .where((subBuilder) => {
                subBuilder
                  .whereRaw('LOWER(packages.name) LIKE ?', [term])
                  .orWhereRaw('LOWER(providers.name) LIKE ?', [term]);
              });

            applyPublicPackageConditions(sub, db);
          });
      });
    }

    // Hitung total hasil
    const countResult = await baseQuery.clone().count('counters.id as total').first();
    const total = parseInt(countResult?.total || 0, 10);

    // Ambil daftar konter dengan urutan nama A-Z dan ID
    const counters = await baseQuery
      .clone()
      .select(
        'counters.id',
        'counters.name',
        'counters.description',
        'counters.photo_url as photoUrl',
        'counters.province as province',
        'counters.city as city',
        'counters.region_id as regionId',
        'counters.address',
        'counters.map_url as mapUrl',
        'counters.is_demo as isDemo',
        'counters.operating_hours as operatingHours',
        'counters.updated_at as updatedAt'
      )
      .orderBy('counters.name', 'asc')
      .orderBy('counters.id', 'asc')
      .offset(offset)
      .limit(limit);

    if (counters.length === 0) {
      return { counters: [], total };
    }

    // Ambil info nama wilayah, provider publik, dan harga minimum untuk setiap konter
    const counterIds = counters.map((c) => c.id);

    // Nama wilayah
    const regions = await db('regions')
      .whereIn('id', counters.map((c) => c.regionId))
      .select('id', 'name');
    const regionMap = new Map(regions.map((r) => [r.id, r.name]));

    // Paket publik untuk konter-konter ini (dengan filter providerId jika ada)
    const packageQuery = db('packages')
      .select(
        'packages.counter_id',
        'packages.price',
        'packages.name as package_name',
        'providers.id as provider_id',
        'providers.name as provider_name'
      )
      .join('counters', 'counters.id', 'packages.counter_id')
      .join('providers', 'providers.id', 'packages.provider_id')
      .whereIn('packages.counter_id', counterIds);

    if (providerId) {
      packageQuery.where('packages.provider_id', providerId);
    }

    applyPublicPackageConditions(packageQuery, db);
    const packageRows = await packageQuery;

    // Untuk pencarian paket, harga harus berasal dari paket yang cocok.
    const counterPackageMap = new Map();
    for (const row of packageRows) {
      if (!counterPackageMap.has(row.counter_id)) {
        counterPackageMap.set(row.counter_id, {
          rows: [],
          providers: new Map(),
        });
      }
      const data = counterPackageMap.get(row.counter_id);
      data.rows.push(row);
      data.providers.set(row.provider_id, {
        id: row.provider_id,
        name: row.provider_name,
      });
    }

    const enrichedCounters = counters.map((counter) => {
      const pkgData = counterPackageMap.get(counter.id);
      const searchTerm = q?.trim().toLowerCase();
      const counterMatches = searchTerm && [counter.name, counter.address, counter.city, counter.province, regionMap.get(counter.regionId)]
        .some((value) => value?.toLowerCase().includes(searchTerm));
      const relevantRows = searchTerm && !counterMatches
        ? pkgData?.rows.filter((row) =>
            row.package_name.toLowerCase().includes(searchTerm) ||
            row.provider_name.toLowerCase().includes(searchTerm)
          ) || []
        : pkgData?.rows || [];
      const lowestPackage = relevantRows.reduce(
        (lowest, row) => (!lowest || row.price < lowest.price ? row : lowest),
        null
      );
      return {
        ...counter,
        photoUrl: isAllowedPhotoUrl(counter.photoUrl) ? counter.photoUrl : null,
        regionName: regionMap.get(counter.regionId) || '',
        minPrice: lowestPackage?.price ?? null,
        priceLabel: searchTerm && !counterMatches ? 'Harga paket cocok' : 'Mulai dari',
        matchedPackageName: searchTerm && !counterMatches ? lowestPackage?.package_name || null : null,
        providers: pkgData ? Array.from(pkgData.providers.values()) : [],
        hasPublicPackages: !!pkgData,
      };
    });

    return { counters: enrichedCounters, total };
  }

  async getPublicCounterDetail(id, { providerId } = {}) {
    const counterQuery = db('counters')
      .select(
        'counters.id',
        'counters.name',
        'counters.description',
        'counters.photo_url as photoUrl',
        'counters.province as province',
        'counters.city as city',
        'counters.region_id as regionId',
        'counters.address',
        'counters.map_url as mapUrl',
        'counters.is_demo as isDemo',
        'counters.operating_hours as operatingHours',
        'counters.updated_at as updatedAt'
      )
      .where('counters.id', id);
    const counter = await applyPublicCounterConditions(counterQuery).first();

    if (!counter) return null;

    const region = await db('regions').where({ id: counter.regionId }).first();
    counter.regionName = region?.name || '';

    // Ambil paket publik milik konter
    const query = db('packages')
      .select(
        'packages.id',
        'packages.counter_id as counterId',
        'packages.provider_id as providerId',
        'providers.name as providerName',
        'providers.logo_url as providerLogoUrl',
        'packages.name',
        'packages.quota_summary as quotaSummary',
        'packages.quota_details as quotaDetails',
        'packages.active_period as activePeriod',
        'packages.price',
        'packages.terms',
        'packages.availability_status as availabilityStatus',
        'packages.display_until as displayUntil',
        'packages.updated_at as updatedAt'
      )
      .join('counters', 'counters.id', 'packages.counter_id')
      .join('providers', 'providers.id', 'packages.provider_id')
      .where('packages.counter_id', id)
      .orderBy('packages.price', 'asc');

    if (providerId) {
      query.where('packages.provider_id', providerId);
    }

    applyPublicPackageConditions(query, db);
    const packages = await query;

    return {
      ...counter,
      photoUrl: isAllowedPhotoUrl(counter.photoUrl) ? counter.photoUrl : null,
      packages,
    };
  }

  async validateContact({ counterId, packageId }) {
    const counterQuery = db('counters')
      .select('counters.id', 'counters.name', 'counters.whatsapp', 'counters.is_demo as isDemo')
      .where('counters.id', counterId);
    const counter = await applyPublicCounterConditions(counterQuery).first();

    if (!counter) return { valid: false, reason: 'COUNTER_NOT_FOUND' };
    if (counter.isDemo) return { valid: false, reason: 'DEMO_COUNTER' };

    if (!packageId) {
      return { valid: true, counter };
    }

    // Periksa paket
    const query = db('packages')
      .select(
        'packages.id',
        'packages.name',
        'packages.quota_summary as quotaSummary',
        'packages.active_period as activePeriod',
        'packages.price',
        'providers.name as providerName'
      )
      .join('counters', 'counters.id', 'packages.counter_id')
      .join('providers', 'providers.id', 'packages.provider_id')
      .where('packages.id', packageId)
      .andWhere('packages.counter_id', counterId);

    applyPublicPackageConditions(query, db);
    const pkg = await query.first();

    if (!pkg) {
      return { valid: false, reason: 'PACKAGE_UNAVAILABLE', counter };
    }

    return { valid: true, counter, package: pkg };
  }
}

