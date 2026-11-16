import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { assertAndResetTestDatabase } from '../helpers/test-database.js';

describe('Admin Authentication & Access Control Tests', () => {
  beforeAll(async () => {
    await assertAndResetTestDatabase();
  });

  it('rejects access to /admin/counters without session with 401', async () => {
    const res = await request(app).get('/api/v1/admin/counters');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('provides CSRF token on GET /auth/csrf', async () => {
    const res = await request(app).get('/api/v1/auth/csrf');
    expect(res.status).toBe(200);
    expect(res.body.data.csrfToken).toBeDefined();
    expect(typeof res.body.data.csrfToken).toBe('string');
  });

  it('rejects login without CSRF token with 403', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({
        email: 'admin@konterkuota.id',
        password: 'AdminPassword123!',
      });

    expect(res.status).toBe(403);
  });

  it('rejects a different Origin scheme even when the hostname matches', async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get('/api/v1/auth/csrf');
    const res = await agent.post('/api/v1/auth/login')
      .set('Origin', 'https://localhost:3000')
      .set('X-CSRF-Token', csrfRes.body.data.csrfToken)
      .send({ email: 'admin@konterkuota.id', password: 'WrongPassword123!' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN_ORIGIN');
  });

  it('rejects invalid password without leaking email presence', async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get('/api/v1/auth/csrf');
    const csrfToken = csrfRes.body.data.csrfToken;

    const res = await agent
      .post('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: 'admin@konterkuota.id',
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('logs in successfully with valid credentials and sets session cookie', async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get('/api/v1/auth/csrf');
    const csrfToken = csrfRes.body.data.csrfToken;

    const loginRes = await agent
      .post('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: 'admin@konterkuota.id',
        password: 'AdminPassword123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.admin.email).toBe('admin@konterkuota.id');
    expect(loginRes.body.data.csrfToken).toBeDefined();

    // Now check /auth/me
    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('admin@konterkuota.id');

    // And verify admin can access /admin/overview
    const overviewRes = await agent.get('/api/v1/admin/overview');
    expect(overviewRes.status).toBe(200);
    expect(overviewRes.body.data.summary.counters.total).toBeGreaterThan(0);

    // Logout
    const newCsrf = loginRes.body.data.csrfToken;
    const logoutRes = await agent
      .post('/api/v1/auth/logout')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Token', newCsrf);
    expect(logoutRes.status).toBe(204);

    // After logout, /auth/me must return 401
    const meAfterLogout = await agent.get('/api/v1/auth/me');
    expect(meAfterLogout.status).toBe(401);
  });
});
