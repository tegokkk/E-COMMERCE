import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { db, closeDatabaseConnection } from '../../src/database/connection.js';
import { createCounterPackageFixtures } from '../helpers/counter-package-fixtures.js';

describe('Public location filters and search prices (isolated fixtures, no seed)', () => {
  let fixture;
  let provinceA;
  let provinceB;
  let city;
  let address;
  let hiddenProvince;

  beforeAll(async () => {
    fixture = await createCounterPackageFixtures();
    provinceA = `Provinsi Alpha ${fixture.runId.slice(0, 8)}`;
    provinceB = `Provinsi Beta ${fixture.runId.slice(0, 8)}`;
    city = `Kota Kembar ${fixture.runId.slice(0, 8)}`;
    address = `Jalan Audit ${fixture.runId.slice(0, 8)}`;
    hiddenProvince = `Provinsi Tersembunyi ${fixture.runId.slice(0, 8)}`;
    await db('counters').where({ id: fixture.counterA }).update({ province: provinceA, city, region_id: null, address });
    await db('counters').where({ id: fixture.emptyCounter }).update({ province: provinceA, city });
    await db('counters').where({ id: fixture.counterB }).update({ province: provinceB, city });
    await db('counters').where({ id: fixture.draftCounter }).update({ province: hiddenProvince, city: 'Kota Draft' });
    await db('packages').insert({ counter_id: fixture.counterA, provider_id: fixture.providerId, name: 'Paket Premium Audit', quota_summary: '100 GB', active_period: '30 Hari', price: 100000, publication_status: 'published' });
  });

  afterAll(async () => {
    if (fixture) await fixture.cleanup();
    await closeDatabaseConnection();
  });

  it('offers published provinces, cities without regionId, and legacy regions without duplicate options', async () => {
    const res = await request(app).get('/api/v1/public/locations');
    expect(res.status).toBe(200);
    const options = res.body.data;
    expect(options.filter((item) => item.type === 'province' && item.province === provinceA)).toHaveLength(1);
    expect(options.filter((item) => item.type === 'city' && item.city === city && item.province === provinceA)).toHaveLength(1);
    const otherCity = options.find((item) => item.type === 'city' && item.city === city && item.province === provinceB);
    expect(otherCity).toBeDefined();
    expect(otherCity.id).not.toBe(options.find((item) => item.type === 'city' && item.city === city && item.province === provinceA).id);
    expect(options.some((item) => item.regionId === fixture.regionId)).toBe(true);
    expect(options.some((item) => item.province === hiddenProvince)).toBe(false);
    expect(new Set(options.map((item) => item.id)).size).toBe(options.length);
  });

  it('applies city/province to counts and pagination and preserves the cheapest package', async () => {
    const res = await request(app).get('/api/v1/public/counters').query({ city, province: provinceA.toUpperCase(), limit: 1 });
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ total: 2, totalPages: 2 });
    expect(res.body.data).toHaveLength(1);
    const all = await request(app).get('/api/v1/public/counters').query({ city, province: provinceA });
    expect(all.body.data.map((item) => item.id).sort()).toEqual([fixture.counterA, fixture.emptyCounter].sort());
    expect(all.body.data.find((item) => item.id === fixture.counterA)).toMatchObject({ minPrice: 25000, hasPublicPackages: true });
    const second = await request(app).get('/api/v1/public/counters').query({ city, province: provinceA, page: 2, limit: 1 });
    expect(second.body.data[0].id).not.toBe(res.body.data[0].id);
  });

  it('combines location with provider filters without leaking a same-named city in another province', async () => {
    const matching = await request(app).get('/api/v1/public/counters').query({ city, province: provinceA, providerId: fixture.providerId });
    expect(matching.body.meta.total).toBe(1);
    expect(matching.body.data[0].id).toBe(fixture.counterA);
    const wrongProvince = await request(app).get('/api/v1/public/counters').query({ city, province: provinceB, providerId: fixture.providerId });
    expect(wrongProvince.body.meta.total).toBe(0);
    const byProvince = await request(app).get('/api/v1/public/counters').query({ province: provinceB });
    expect(byProvince.body.data.map((item) => item.id)).toEqual([fixture.counterB]);
  });

  it('keeps valid prices for name, address, city, province, and provider searches', async () => {
    for (const q of [`Konter Uji A ${fixture.runId.slice(0, 8)}`, address, city, provinceA, `Provider A ${fixture.runId}`]) {
      const res = await request(app).get('/api/v1/public/counters').query({ q, providerId: fixture.providerId });
      expect(res.status).toBe(200);
      expect(res.body.data.find((item) => item.id === fixture.counterA), q).toMatchObject({ minPrice: 25000, hasPublicPackages: true });
    }
    const packageSearch = await request(app).get('/api/v1/public/counters').query({ q: 'Paket Premium Audit', province: provinceA });
    expect(packageSearch.body.data.find((item) => item.id === fixture.counterA)).toMatchObject({ minPrice: 100000, matchedPackageName: 'Paket Premium Audit', priceLabel: 'Harga paket cocok' });
  });

  it('keeps the existing region API and region search/filter working', async () => {
    const regions = await request(app).get('/api/v1/public/regions');
    expect(regions.status).toBe(200);
    expect(regions.body.data.find((item) => item.id === fixture.regionId)).toMatchObject({ name: `Test ${fixture.runId}` });
    const counters = await request(app).get('/api/v1/public/counters').query({ regionId: fixture.regionId });
    expect(counters.body.data.some((item) => item.id === fixture.counterB)).toBe(true);
    expect(counters.body.data.some((item) => item.id === fixture.counterA)).toBe(false);
    const search = await request(app).get('/api/v1/public/counters').query({ q: `Test ${fixture.runId}` });
    expect(search.body.data.find((item) => item.id === fixture.counterB).minPrice).toBe(50000);
  });

  it('validates location lengths and safely handles unknown locations', async () => {
    expect((await request(app).get('/api/v1/public/counters').query({ city: 'a'.repeat(101) })).status).toBe(400);
    expect((await request(app).get('/api/v1/public/counters').query({ province: 'a'.repeat(101) })).status).toBe(400);
    const missing = await request(app).get('/api/v1/public/counters').query({ province: "Unknown ' OR 1=1 --" });
    expect(missing.status).toBe(200);
    expect(missing.body.meta.total).toBe(0);
  });
});
