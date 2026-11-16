import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { db, closeDatabaseConnection } from '../../src/database/connection.js';
import { createCounterPackageFixtures } from '../helpers/counter-package-fixtures.js';

describe('Packages scoped to their counter (no seed or database reset)', () => {
  let fixture;
  let agent;
  let headers;
  const path = (counterId) => `/api/v1/admin/counters/${counterId}/packages`;

  beforeAll(async () => {
    fixture = await createCounterPackageFixtures();
    agent = request.agent(app);
    const csrf = await agent.get('/api/v1/auth/csrf');
    const login = await agent.post('/api/v1/auth/login')
      .set({ Origin: 'http://localhost:3000', 'X-CSRF-Token': csrf.body.data.csrfToken })
      .send({ email: fixture.email, password: fixture.password });
    expect(login.status).toBe(200);
    headers = { Origin: 'http://localhost:3000', 'X-CSRF-Token': login.body.data.csrfToken };
  });

  afterAll(async () => {
    if (agent && headers) await agent.post('/api/v1/auth/logout').set(headers);
    if (fixture) await fixture.cleanup();
    await closeDatabaseConnection();
  });

  it('keeps nested endpoints authenticated and CSRF protected', async () => {
    for (const method of ['get', 'post', 'patch', 'delete']) {
      const url = `${path(fixture.counterA)}${['patch', 'delete'].includes(method) ? `/${fixture.packageA}` : ''}`;
      expect((await request(app)[method](url)).status).toBe(401);
    }
    expect((await agent.post(path(fixture.counterA)).set('Origin', headers.Origin).send(fixture.basePackage)).status).toBe(403);
    expect((await agent.patch(`${path(fixture.counterA)}/${fixture.packageA}`).set('Origin', headers.Origin).send({ price: 26000 })).status).toBe(403);
    expect((await agent.delete(`${path(fixture.counterA)}/${fixture.packageA}`).set('Origin', headers.Origin)).status).toBe(403);
  });

  it('scopes both pages and counts even if a different counter is supplied in query', async () => {
    const first = await agent.get(path(fixture.counterA)).query({ limit: 10, counterId: fixture.counterB });
    expect(first.status).toBe(200);
    expect(first.body.meta).toMatchObject({ total: 11, totalPages: 2 });
    expect(first.body.data).toHaveLength(10);
    expect(first.body.data.every((p) => p.counterId === fixture.counterA)).toBe(true);
    const second = await agent.get(path(fixture.counterA)).query({ page: 2 });
    expect(second.body.data).toHaveLength(1);
    const other = await agent.get(path(fixture.counterB));
    expect(other.body.meta.total).toBe(1);
    expect(other.body.data[0].id).toBe(fixture.packageB);
  });

  it('scopes search, provider, publication, availability, and empty results', async () => {
    const search = await agent.get(path(fixture.counterA)).query({ q: 'Bersama B' });
    expect(search.body.meta.total).toBe(0);
    const provider = await agent.get(path(fixture.counterA)).query({ providerId: fixture.otherProviderId });
    expect(provider.body.meta.total).toBe(0);
    const published = await agent.get(path(fixture.counterA)).query({ publicationStatus: 'published', availabilityStatus: 'available' });
    expect(published.body.meta.total).toBe(1);
    expect(published.body.data[0].id).toBe(fixture.packageA);
    expect((await agent.get(path(fixture.emptyCounter))).body.meta.total).toBe(0);
  });

  it('rejects cross-counter reads, edits, status changes, and deletes without touching data', async () => {
    const before = await db('packages').where({ id: fixture.packageB }).first();
    const wrongPath = `${path(fixture.counterA)}/${fixture.packageB}`;
    expect((await agent.get(wrongPath)).status).toBe(404);
    expect((await agent.patch(wrongPath).set(headers).send({ price: 1 })).status).toBe(404);
    expect((await agent.patch(wrongPath).set(headers).send({ publicationStatus: 'inactive' })).status).toBe(404);
    expect((await agent.delete(wrongPath).set(headers)).status).toBe(404);
    expect(await db('packages').where({ id: fixture.packageB }).first()).toEqual(before);
  });

  it('creates in the URL owner and keeps the public counter relationship', async () => {
    const created = await agent.post(path(fixture.counterA)).set(headers).send({ ...fixture.basePackage, publicationStatus: 'published' });
    expect(created.status).toBe(201);
    expect(created.body.data.counterId).toBe(fixture.counterA);
    const publicA = await request(app).get(`/api/v1/public/counters/${fixture.counterA}`);
    const publicB = await request(app).get(`/api/v1/public/counters/${fixture.counterB}`);
    expect(publicA.body.data.packages.some((p) => p.id === created.body.data.id)).toBe(true);
    expect(publicB.body.data.packages.some((p) => p.id === created.body.data.id)).toBe(false);
    const id = created.body.data.id;
    expect((await agent.patch(`${path(fixture.counterA)}/${id}`).set(headers).send({ name: 'Paket Diperbarui', price: 30000, availabilityStatus: 'needs_confirmation' })).body.data).toMatchObject({ name: 'Paket Diperbarui', price: 30000, availabilityStatus: 'needs_confirmation' });
    expect((await agent.patch(`${path(fixture.counterA)}/${id}`).set(headers).send({ publicationStatus: 'inactive' })).body.data.publicationStatus).toBe('inactive');
    expect((await agent.patch(`${path(fixture.counterA)}/${id}`).set(headers).send({ publicationStatus: 'published' })).body.data.publicationStatus).toBe('published');
    expect((await agent.delete(`${path(fixture.counterA)}/${id}`).set(headers)).status).toBe(204);
    expect((await agent.get(`${path(fixture.counterA)}/${id}`)).status).toBe(404);
  });

  it('rejects a body owner that differs and prevents moving existing packages through legacy APIs', async () => {
    const mismatch = await agent.post(path(fixture.counterA)).set(headers).send({ ...fixture.basePackage, counterId: fixture.counterB });
    expect(mismatch.status).toBe(400);
    const move = await agent.patch(`${path(fixture.counterA)}/${fixture.packageA}`).set(headers).send({ counterId: fixture.counterB });
    expect(move.status).toBe(400);
    expect((await agent.patch(`/api/v1/admin/packages/${fixture.packageA}`).set(headers).send({ counterId: fixture.counterB })).status).toBe(400);
    expect((await db('packages').where({ id: fixture.packageA }).first()).counter_id).toBe(fixture.counterA);
  });

  it('rejects new packages in unpublished counters including through the legacy API', async () => {
    const nested = await agent.post(path(fixture.draftCounter)).set(headers).send(fixture.basePackage);
    expect(nested.status).toBe(409);
    expect(nested.body.error.code).toBe('COUNTER_NOT_PUBLISHED');
    const legacy = await agent.post('/api/v1/admin/packages').set(headers).send({ ...fixture.basePackage, counterId: fixture.draftCounter });
    expect(legacy.status).toBe(409);
  });

  it('allows managing existing packages after a counter is deactivated, but blocks adding', async () => {
    await db('counters').where({ id: fixture.counterB }).update({ publication_status: 'inactive' });
    try {
      expect((await agent.get(path(fixture.counterB))).status).toBe(200);
      expect((await agent.patch(`${path(fixture.counterB)}/${fixture.packageB}`).set(headers).send({ price: 51000 })).status).toBe(200);
      expect((await agent.post(path(fixture.counterB)).set(headers).send(fixture.basePackage)).status).toBe(409);
    } finally {
      await db('counters').where({ id: fixture.counterB }).update({ publication_status: 'published' });
    }
  });

  it('validates route IDs, filters and pagination', async () => {
    expect((await agent.get(path('invalid'))).status).toBe(400);
    expect((await agent.get(`${path(fixture.counterA)}/invalid`)).status).toBe(400);
    expect((await agent.get(path(fixture.counterA)).query({ page: -1 })).status).toBe(400);
    expect((await agent.get(path(fixture.counterA)).query({ limit: 101 })).status).toBe(400);
    expect((await agent.get(path(fixture.counterA)).query({ providerId: 'invalid' })).status).toBe(400);
  });

  it('returns dashboard attention grouped by counter', async () => {
    const second = await db('packages').where({ counter_id: fixture.counterA }).whereNot('id', fixture.packageA).first();
    await db('packages').whereIn('id', [fixture.packageA, second.id]).update({ publication_status: 'published', display_until: '2000-01-01T00:00:00Z' });
    await db('packages').where({ id: fixture.packageB }).update({ display_until: '2000-01-02T00:00:00Z' });
    const dashboard = await agent.get('/api/v1/admin/overview');
    expect(dashboard.status).toBe(200);
    expect(Array.isArray(dashboard.body.data.attention.expiringCounters)).toBe(true);
    expect(dashboard.body.data.attention.expiringCounters.find((counter) => counter.id === fixture.counterA)).toMatchObject({ packageCount: 2 });
    expect(dashboard.body.data.attention.expiringCounters.find((counter) => counter.id === fixture.counterB)).toMatchObject({ packageCount: 1 });
    expect(dashboard.body.data.attention).not.toHaveProperty('expiringPackages');
  });
});
