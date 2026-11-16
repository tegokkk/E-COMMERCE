import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import configModule from 'next/dist/server/config.js';
import { PHASE_PRODUCTION_SERVER } from 'next/constants.js';
import { ImageOptimizerCache } from 'next/dist/server/image-optimizer.js';

const frontendDir = path.resolve('frontend');
assert.ok(fs.existsSync(path.join(frontendDir, '.next/BUILD_ID')), 'Production build is missing');
assert.ok(fs.existsSync(path.join(frontendDir, 'next.config.mjs')), 'Runtime Next.js configuration is missing');
const config = await configModule.default(PHASE_PRODUCTION_SERVER, frontendDir);
const hosts = (process.env.IMAGE_ALLOWED_HOSTS || 'lh3.googleusercontent.com,images.unsplash.com').split(',').map((host) => host.trim()).filter(Boolean);
const validate = (url) => ImageOptimizerCache.validateParams({ headers: { accept: 'image/webp' } }, { url, w: '640', q: '75' }, config, false);
for (const host of hosts) assert.equal(validate(`https://${host}/runtime-check.jpg`).errorMessage, undefined, `Image host ${host} must remain allowed at runtime`);
assert.equal(validate('/api/v1/uploads/counters/00000000-0000-0000-0000-000000000001.webp').errorMessage, undefined);
assert.ok(validate('https://not-allowed.example.invalid/photo.jpg').errorMessage, 'Unapproved image hosts must remain blocked');
const rewrites = await config.rewrites();
assert.ok(rewrites.some((rule) => rule.source === '/api/v1/:path*'), 'API rewrite is missing at runtime');
console.info('Frontend production build, runtime configuration, image allowlist, and API rewrite verified.');
