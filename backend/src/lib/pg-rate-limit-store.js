import { createHmac } from 'node:crypto';
import { db } from '../database/connection.js';
import { env } from '../config/env.js';

/** Shared atomic counters across Function instances; never persist raw client IPs. */
export class PgRateLimitStore {
  constructor(prefix, database = db) {
    this.prefix = prefix;
    this.database = database;
    this.localKeys = false;
  }

  init({ windowMs }) { this.windowMs = windowMs; }

  storageKey(key) {
    return `${this.prefix}:${createHmac('sha256', env.SESSION_SECRET).update(key).digest('hex')}`;
  }

  async increment(key) {
    const result = await this.database.raw(`
      INSERT INTO rate_limit_counters (key, total_hits, reset_at)
      VALUES (?, 1, NOW() + ? * INTERVAL '1 millisecond')
      ON CONFLICT (key) DO UPDATE SET
        total_hits = CASE WHEN rate_limit_counters.reset_at <= NOW() THEN 1 ELSE rate_limit_counters.total_hits + 1 END,
        reset_at = CASE WHEN rate_limit_counters.reset_at <= NOW() THEN NOW() + ? * INTERVAL '1 millisecond' ELSE rate_limit_counters.reset_at END
      RETURNING total_hits, reset_at
    `, [this.storageKey(key), this.windowMs, this.windowMs]);
    return { totalHits: Number(result.rows[0].total_hits), resetTime: new Date(result.rows[0].reset_at) };
  }

  async decrement(key) {
    await this.database('rate_limit_counters').where({ key: this.storageKey(key) })
      .update({ total_hits: this.database.raw('GREATEST(total_hits - 1, 0)') });
  }

  async resetKey(key) {
    await this.database('rate_limit_counters').where({ key: this.storageKey(key) }).del();
  }
}
