import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { assertAndResetTestDatabase } from '../helpers/test-database.js';
import { db } from '../../src/database/connection.js';

describe('Analytics Events Integration Tests', () => {
  beforeAll(async () => {
    await assertAndResetTestDatabase();
  });

  it('records valid event and strips forbidden properties', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({
        eventName: 'whatsapp_clicked',
        sessionId: 'sid_11111111-1111-4111-8111-111111111111',
        properties: {
          counterId: 'd0000000-0000-0000-0000-000000000001',
          packageId: 'e0000000-0000-0000-0000-000000000001',
          buttonPosition: 'counter_card',
          // Sensitive data that must be stripped:
          phone: '08123456789',
          message: 'Halo saya mau beli',
          rawSearch: 'nomor pribadi',
        },
      });

    expect(res.status).toBe(204);

    // Verify in database
    const saved = await db('analytics_events')
      .where({ session_id: 'sid_11111111-1111-4111-8111-111111111111', event_name: 'whatsapp_clicked' })
      .first();

    expect(saved).toBeDefined();
    const props = typeof saved.properties === 'string' ? JSON.parse(saved.properties) : saved.properties;
    expect(props.counterId).toBe('d0000000-0000-0000-0000-000000000001');
    expect(props.buttonPosition).toBe('counter_card');
    // Forbidden properties must NOT be saved!
    expect(props.phone).toBeUndefined();
    expect(props.message).toBeUndefined();
    expect(props.rawSearch).toBeUndefined();
  });

  it('rejects invalid event name with 400', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({
        eventName: 'illegal_untracked_event',
        sessionId: 'sid_11111111-1111-4111-8111-111111111111',
      });

    expect(res.status).toBe(400);
  });

  it('does not persist a phone number disguised as an operational ID', async () => {
    const sessionId = 'sid_22222222-2222-4222-8222-222222222222';
    const res = await request(app).post('/api/v1/events').send({
      eventName: 'counter_detail_opened',
      sessionId,
      properties: { counterId: '081234567890', source: 'directory_card' },
    });
    expect(res.status).toBe(204);
    const saved = await db('analytics_events').where({ session_id: sessionId }).first();
    const properties = typeof saved.properties === 'string' ? JSON.parse(saved.properties) : saved.properties;
    expect(properties).toEqual({ source: 'directory_card' });
  });
});
