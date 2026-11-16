import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { assertAndResetTestDatabase } from '../helpers/test-database.js';
import { FIXTURE_IDS } from '../helpers/fixtures.js';
import { db } from '../../src/database/connection.js';

describe('Public Catalog API Integration Tests', () => {
  beforeAll(async () => {
    await assertAndResetTestDatabase();
    // Satu konter nyata khusus pengujian kontak; fixture lain tetap data contoh.
    await db('counters').where({ id: FIXTURE_IDS.COUNTER_BERKAH_CELL }).update({ is_demo: false });
  });

  it('GET /api/v1/health returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/v1/public/settings returns platform settings', async () => {
    const res = await request(app).get('/api/v1/public/settings');
    expect(res.status).toBe(200);
    expect(res.body.data.platformName).toBe('KonterKuota');
    expect(res.body.data.managerWhatsapp).toBeDefined();
    expect(Array.isArray(res.body.data.faqs)).toBe(true);
  });

  it('GET /api/v1/public/providers only returns active providers with public packages', async () => {
    const res = await request(app).get('/api/v1/public/providers');
    expect(res.status).toBe(200);
    const names = res.body.data.map((p) => p.name);
    expect(names).toContain('Telkomsel');
    expect(names).toContain('Indosat');
    expect(names).toContain('XL Axiata');
    expect(names).toContain('Tri');
    // Smartfren is inactive, so it must NOT be in public providers!
    expect(names).not.toContain('Smartfren');
  });

  it('GET /api/v1/public/regions only returns regions with published counters', async () => {
    const res = await request(app).get('/api/v1/public/regions');
    expect(res.status).toBe(200);
    const names = res.body.data.map((r) => r.name);
    expect(names).toContain('Bandung Wetan');
    expect(names).toContain('Tamansari');
    expect(names).toContain('Coblong');
    expect(names).toContain('Sukajadi');
    // Bojongsoang has no published counters, so it must NOT appear
    expect(names).not.toContain('Bojongsoang');
  });

  it('GET /api/v1/public/counters returns only published counters', async () => {
    const res = await request(app).get('/api/v1/public/counters');
    expect(res.status).toBe(200);
    const names = res.body.data.map((c) => c.name);
    expect(names).toContain('Berkah Cell');
    expect(names).toContain('Duta Pulsa');
    expect(names).toContain('Zona Cell'); // Published without packages
    // Draft & inactive counters must not appear
    expect(names).not.toContain('Pojok Kuota (Draft)');
    expect(names).not.toContain('Sentra Cell (Nonaktif)');
    expect(res.body.data[0]).not.toHaveProperty('whatsapp');
  });

  it('uses the price of a matching package for package-name searches', async () => {
    const res = await request(app).get('/api/v1/public/counters').query({ q: '50 GB' });
    expect(res.status).toBe(200);
    const sinar = res.body.data.find((c) => c.id === FIXTURE_IDS.COUNTER_SINAR_PULSA);
    expect(sinar.minPrice).toBe(90000);
    expect(sinar.matchedPackageName).toBe('Indosat Freedom Jumbo 50 GB');
    expect(sinar.priceLabel).toBe('Harga paket cocok');
  });

  it('applies provider filter and calculates minPrice correctly', async () => {
    const res = await request(app)
      .get('/api/v1/public/counters')
      .query({ providerId: FIXTURE_IDS.PROVIDER_TELKOMSEL });

    expect(res.status).toBe(200);
    // Berkah Cell sells Telkomsel (minPrice 35000), Kawan Kuota (minPrice 28000), Mitra Cell (100000)
    const berkah = res.body.data.find((c) => c.id === FIXTURE_IDS.COUNTER_BERKAH_CELL);
    expect(berkah).toBeDefined();
    expect(berkah.minPrice).toBe(35000);

    // Zona Cell has no Telkomsel packages, so it must not appear with Telkomsel filter
    const zona = res.body.data.find((c) => c.id === FIXTURE_IDS.COUNTER_ZONA_NO_PACKAGES);
    expect(zona).toBeUndefined();
  });

  it('combines keyword search, provider, and region with AND logic', async () => {
    const res = await request(app)
      .get('/api/v1/public/counters')
      .query({
        q: 'Berkah',
        providerId: FIXTURE_IDS.PROVIDER_TELKOMSEL,
        regionId: FIXTURE_IDS.REGION_BANDUNG_WETAN,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(FIXTURE_IDS.COUNTER_BERKAH_CELL);
  });

  it('GET /api/v1/public/counters/:id returns counter detail and excludes expired/unavailable packages', async () => {
    const res = await request(app).get(`/api/v1/public/counters/${FIXTURE_IDS.COUNTER_BERKAH_CELL}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Berkah Cell');
    expect(Array.isArray(res.body.data.packages)).toBe(true);

    const packageNames = res.body.data.packages.map((p) => p.name);
    expect(packageNames).toContain('Telkomsel InternetMAX 14 GB');
    // Expired package must not appear
    expect(packageNames).not.toContain('Paket Flash Promo Telkomsel (Kedaluwarsa)');
  });

  it('GET /api/v1/public/contact returns valid WhatsApp URL', async () => {
    const res = await request(app)
      .get('/api/v1/public/contact')
      .query({
        counterId: FIXTURE_IDS.COUNTER_BERKAH_CELL,
        packageId: 'e0000000-0000-0000-0000-000000000001',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.whatsappUrl).toContain('https://wa.me/6281234567890');
    expect(res.body.data.whatsappUrl).toContain('InternetMAX%2014%20GB');
  });

  it('GET /api/v1/public/contact returns 409 for expired/unavailable package', async () => {
    const res = await request(app)
      .get('/api/v1/public/contact')
      .query({
        counterId: FIXTURE_IDS.COUNTER_BERKAH_CELL,
        packageId: 'e0000000-0000-0000-0000-000000000015', // Expired package
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PACKAGE_UNAVAILABLE');
  });

  it('does not provide contact links for demo counters', async () => {
    const res = await request(app).get('/api/v1/public/contact').query({ counterId: FIXTURE_IDS.COUNTER_DUTA_PULSA });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DEMO_COUNTER');
  });
});
