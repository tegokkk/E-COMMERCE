import { describe, it, expect, beforeAll } from 'vitest';
import { Buffer } from 'node:buffer';
import request from 'supertest';
import app from '../../src/app.js';
import { assertAndResetTestDatabase } from '../helpers/test-database.js';
import { FIXTURE_IDS } from '../helpers/fixtures.js';
import sharp from 'sharp';

describe('Admin CRUD & Mutation Integration Tests', () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    await assertAndResetTestDatabase();

    agent = request.agent(app);
    const csrfRes = await agent.get('/api/v1/auth/csrf');
    const initialCsrf = csrfRes.body.data.csrfToken;

    const loginRes = await agent
      .post('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', initialCsrf)
      .send({
        email: 'admin@konterkuota.id',
        password: 'AdminPassword123!',
      });

    csrfToken = loginRes.body.data.csrfToken;
  });

  it('calculates provider deactivation impact accurately', async () => {
    const res = await agent.get(`/api/v1/admin/providers/${FIXTURE_IDS.PROVIDER_TELKOMSEL}/impact`);
    expect(res.status).toBe(200);
    expect(res.body.data.affectedPackages).toBeGreaterThan(0);
    expect(res.body.data.affectedCounters).toBeGreaterThan(0);
  });

  it('counts visible packages before disabling a counter', async () => {
    const res = await agent.get(`/api/v1/admin/counters/${FIXTURE_IDS.COUNTER_BERKAH_CELL}/impact`);
    expect(res.status).toBe(200);
    expect(res.body.data.affectedPackages).toBeGreaterThan(0);
  });

  it('persists region, provider, and platform setting changes', async () => {
    const mutationHeaders = { Origin: 'http://localhost:3000', 'X-CSRF-Token': csrfToken };

    const region = await agent.post('/api/v1/admin/regions').set(mutationHeaders).send({ name: 'Wilayah Audit' });
    expect(region.status).toBe(201);
    const updatedRegion = await agent.patch(`/api/v1/admin/regions/${region.body.data.id}`)
      .set(mutationHeaders).send({ name: 'Wilayah Audit Baru' });
    expect(updatedRegion.status).toBe(200);
    const regions = await agent.get('/api/v1/admin/regions');
    expect(regions.body.data.some((item) => item.name === 'Wilayah Audit Baru')).toBe(true);

    const provider = await agent.post('/api/v1/admin/providers').set(mutationHeaders)
      .send({ name: 'Provider Audit', isActive: true });
    expect(provider.status).toBe(201);
    const updatedProvider = await agent.patch(`/api/v1/admin/providers/${provider.body.data.id}`)
      .set(mutationHeaders).send({ name: 'Provider Audit Baru' });
    expect(updatedProvider.status).toBe(200);
    expect(updatedProvider.body.data.isActive).toBe(true);

    const before = await agent.get('/api/v1/admin/settings');
    const settings = await agent.patch('/api/v1/admin/settings').set(mutationHeaders)
      .send({ platformName: 'KonterKuota Audit' });
    expect(settings.status).toBe(200);
    expect(settings.body.data.platformName).toBe('KonterKuota Audit');
    expect(settings.body.data.heroTitle).toBe(before.body.data.heroTitle);
    await agent.patch('/api/v1/admin/settings').set(mutationHeaders)
      .send({ platformName: before.body.data.platformName });
  });

  it('creates new counter as draft and updates to published', async () => {
    // 1. Create draft
    const createRes = await agent
      .post('/api/v1/admin/counters')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: 'Konter Baru Sukajadi',
        regionId: FIXTURE_IDS.REGION_SUKAJADI,
        address: 'Jl. Sukajadi Baru No. 8',
        whatsapp: '081299998888',
        publicationStatus: 'draft',
      });

    expect(createRes.status).toBe(201);
    const counterId = createRes.body.data.id;
    expect(counterId).toBeDefined();

    // 2. Draft counter should NOT appear in public catalog
    const publicRes1 = await request(app).get(`/api/v1/public/counters/${counterId}`);
    expect(publicRes1.status).toBe(404);

    // 3. Publish counter
    const publishRes = await agent
      .patch(`/api/v1/admin/counters/${counterId}`)
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', csrfToken)
      .send({
        publicationStatus: 'published',
      });

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.publicationStatus).toBe('published');

    // 4. Now published counter appears in public catalog
    const publicRes2 = await request(app).get(`/api/v1/public/counters/${counterId}`);
    expect(publicRes2.status).toBe(200);
    expect(publicRes2.body.data.name).toBe('Konter Baru Sukajadi');
  });

  it('rejects publishing counter if address or whatsapp is missing', async () => {
    const res = await agent
      .post('/api/v1/admin/counters')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: 'Konter Tanpa Alamat',
        regionId: FIXTURE_IDS.REGION_SUKAJADI,
        address: '',
        whatsapp: '',
        publicationStatus: 'published',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toHaveProperty('address');
    expect(res.body.error.fields).toHaveProperty('whatsapp');
  });

  it('creates new package and verifies it appears in public counter detail', async () => {
    const createPkgRes = await agent
      .post('/api/v1/admin/packages')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', csrfToken)
      .send({
        counterId: FIXTURE_IDS.COUNTER_BERKAH_CELL,
        providerId: FIXTURE_IDS.PROVIDER_TELKOMSEL,
        name: 'Paket Spesial 100 GB',
        quotaSummary: '100 GB',
        quotaDetails: '100 GB Full 24 Jam',
        activePeriod: '30 Hari',
        price: 120000,
        availabilityStatus: 'available',
        publicationStatus: 'published',
      });

    expect(createPkgRes.status).toBe(201);
    const newPkgId = createPkgRes.body.data.id;

    // Verify it is returned in counter detail
    const detailRes = await request(app).get(`/api/v1/public/counters/${FIXTURE_IDS.COUNTER_BERKAH_CELL}`);
    expect(detailRes.status).toBe(200);
    const found = detailRes.body.data.packages.find((p) => p.id === newPkgId);
    expect(found).toBeDefined();
    expect(found.price).toBe(120000);
  });

  it('uploads a real image, serves it, and removes it when detached from a counter', async () => {
    const headers = { Origin: 'http://localhost:3000', 'X-CSRF-Token': csrfToken };
    const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#d85b85' } }).png().toBuffer();
    const upload = await agent.post('/api/v1/admin/uploads/counter-photo')
      .set(headers).set('Content-Type', 'image/png').send(png);
    expect(upload.status).toBe(201);
    const photoUrl = upload.body.data.photoUrl;
    expect(photoUrl).toMatch(/^\/api\/v1\/uploads\/counters\/[0-9a-f-]+\.webp$/);
    const image = await request(app).get(photoUrl);
    expect(image.status).toBe(200);
    expect(image.headers['content-type']).toMatch(/image\/webp/);

    const create = await agent.post('/api/v1/admin/counters').set(headers).send({
      name: 'Konter Foto Uji', regionId: FIXTURE_IDS.REGION_SUKAJADI,
      address: 'Jalan Foto Nomor 1', whatsapp: '081234567890',
      photoUrl, publicationStatus: 'published',
    });
    expect(create.status).toBe(201);
    const publicCounter = await request(app).get(`/api/v1/public/counters/${create.body.data.id}`);
    expect(publicCounter.status).toBe(200);
    expect(publicCounter.body.data.photoUrl).toBe(photoUrl);
    const removePhoto = await agent.patch(`/api/v1/admin/counters/${create.body.data.id}`)
      .set(headers).send({ photoUrl: '' });
    expect(removePhoto.status).toBe(200);
    expect(removePhoto.body.data.photoUrl).toBeNull();
    expect((await request(app).get(photoUrl)).status).toBe(404);

    const secondUpload = await agent.post('/api/v1/admin/uploads/counter-photo')
      .set(headers).set('Content-Type', 'image/png').send(png);
    expect(secondUpload.status).toBe(201);
    const secondPhotoUrl = secondUpload.body.data.photoUrl;
    expect((await agent.patch(`/api/v1/admin/counters/${create.body.data.id}`)
      .set(headers).send({ photoUrl: secondPhotoUrl })).status).toBe(200);
    expect((await agent.delete(`/api/v1/admin/counters/${create.body.data.id}`).set(headers)).status).toBe(204);
    expect((await request(app).get(secondPhotoUrl)).status).toBe(404);

    const invalid = await agent.post('/api/v1/admin/uploads/counter-photo')
      .set(headers).set('Content-Type', 'image/png').send(Buffer.from('not an image'));
    expect(invalid.status).toBe(400);
    const unauthenticated = await request(app).post('/api/v1/admin/uploads/counter-photo')
      .set('Origin', 'http://localhost:3000').set('Content-Type', 'image/png').send(png);
    expect(unauthenticated.status).toBe(401);
    const withoutCsrf = await agent.post('/api/v1/admin/uploads/counter-photo')
      .set('Origin', 'http://localhost:3000').set('Content-Type', 'image/png').send(png);
    expect(withoutCsrf.status).toBe(403);
    expect((await request(app).get('/api/v1/uploads/counters/not-a-photo.webp')).status).toBe(404);
  });

  it('deletes packages and counters, but protects providers and regions still in use', async () => {
    const headers = { Origin: 'http://localhost:3000', 'X-CSRF-Token': csrfToken };
    const region = await agent.post('/api/v1/admin/regions').set(headers).send({ name: 'Wilayah Hapus Uji' });
    const provider = await agent.post('/api/v1/admin/providers').set(headers).send({ name: 'Provider Hapus Uji' });
    expect(region.status).toBe(201);
    expect(provider.status).toBe(201);
    const counter = await agent.post('/api/v1/admin/counters').set(headers).send({
      name: 'Konter Hapus Uji', regionId: region.body.data.id,
      address: 'Jalan Hapus Nomor 1', whatsapp: '081234567890', publicationStatus: 'published',
    });
    expect(counter.status).toBe(201);
    const pkg = await agent.post('/api/v1/admin/packages').set(headers).send({
      counterId: counter.body.data.id, providerId: provider.body.data.id,
      name: 'Paket Hapus Uji', quotaSummary: '5 GB', activePeriod: '30 hari', price: 25000,
      publicationStatus: 'draft', availabilityStatus: 'available',
    });
    expect(pkg.status).toBe(201);

    const withoutCsrf = await agent.delete(`/api/v1/admin/packages/${pkg.body.data.id}`)
      .set('Origin', 'http://localhost:3000');
    expect(withoutCsrf.status).toBe(403);

    expect((await agent.delete(`/api/v1/admin/providers/${provider.body.data.id}`).set(headers)).status).toBe(409);
    expect((await agent.delete(`/api/v1/admin/regions/${region.body.data.id}`).set(headers)).status).toBe(409);
    expect((await agent.delete(`/api/v1/admin/packages/${pkg.body.data.id}`).set(headers)).status).toBe(204);
    expect((await agent.get(`/api/v1/admin/packages/${pkg.body.data.id}`)).status).toBe(404);
    const cascadingPackage = await agent.post('/api/v1/admin/packages').set(headers).send({
      counterId: counter.body.data.id, providerId: provider.body.data.id,
      name: 'Paket Ikut Hapus', quotaSummary: '3 GB', activePeriod: '7 hari', price: 15000,
      publicationStatus: 'draft', availabilityStatus: 'available',
    });
    expect(cascadingPackage.status).toBe(201);
    expect((await agent.delete(`/api/v1/admin/counters/${counter.body.data.id}`).set(headers)).status).toBe(204);
    expect((await agent.get(`/api/v1/admin/counters/${counter.body.data.id}`)).status).toBe(404);
    expect((await agent.get(`/api/v1/admin/packages/${cascadingPackage.body.data.id}`)).status).toBe(404);
    expect((await agent.delete(`/api/v1/admin/providers/${provider.body.data.id}`).set(headers)).status).toBe(204);
    expect((await agent.delete(`/api/v1/admin/regions/${region.body.data.id}`).set(headers)).status).toBe(204);
  });
});
