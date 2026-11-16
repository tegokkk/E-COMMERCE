import { describe, expect, it } from 'vitest';
import { seed } from '../../src/database/seeds/development.js';

describe('development seed guard', () => {
  it('rejects production before touching a database', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDatabaseUrl = process.env.DATABASE_URL;
    const originalSeedFlag = process.env.ALLOW_DEVELOPMENT_SEED;
    try {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://user:placeholder@localhost/konterkuota_production';
      process.env.ALLOW_DEVELOPMENT_SEED = 'true';
      await expect(seed(() => { throw new Error('Database touched'); })).rejects.toThrow(/Seed contoh/);
    } finally {
      for (const [name, value] of Object.entries({
        NODE_ENV: originalNodeEnv,
        DATABASE_URL: originalDatabaseUrl,
        ALLOW_DEVELOPMENT_SEED: originalSeedFlag,
      })) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });
});
