import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';

test.describe('Public location flow on a production frontend and isolated API', () => {
  test.skip(process.env.COUNTER_PACKAGE_E2E !== 'true', 'Requires an explicit opt-in and a separate test database.');
  test.describe.configure({ mode: 'serial', timeout: 120000 });
  let fixture;
  let backend;
  let frontend;
  let closeDatabaseConnection;
  let origin;
  let city;
  let provinceA;
  let provinceB;

  test.beforeAll(async () => {
    const { createCounterPackageFixtures } = await import('../../backend/tests/helpers/counter-package-fixtures.js');
    const { default: app } = await import('../../backend/src/app.js');
    const connection = await import('../../backend/src/database/connection.js');
    closeDatabaseConnection = connection.closeDatabaseConnection;
    fixture = await createCounterPackageFixtures();
    city = `Kota Uji ${fixture.runId.slice(0, 8)}`;
    provinceA = `Provinsi Alpha ${fixture.runId.slice(0, 8)}`;
    provinceB = `Provinsi Beta ${fixture.runId.slice(0, 8)}`;
    await connection.db('counters').where({ id: fixture.counterA }).update({ city, province: provinceA, region_id: null });
    await connection.db('counters').where({ id: fixture.counterB }).update({ city, province: provinceB });
    await new Promise((resolve) => { backend = app.listen(0, resolve); });
    const port = await new Promise((resolve) => {
      const probe = createServer();
      probe.listen(0, '127.0.0.1', () => { const available = probe.address().port; probe.close(() => resolve(available)); });
    });
    origin = `http://127.0.0.1:${port}`;
    let logs = '';
    frontend = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'start', path.resolve('frontend'), '--port', String(port), '--hostname', '127.0.0.1'], {
      env: { ...process.env, NODE_ENV: 'production', API_INTERNAL_URL: `http://127.0.0.1:${backend.address().port}/api/v1` },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    frontend.stdout.on('data', (chunk) => { logs = (logs + chunk).slice(-3000); });
    frontend.stderr.on('data', (chunk) => { logs = (logs + chunk).slice(-3000); });
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(`${origin}/admin/login`, { signal: AbortSignal.timeout(1000) })).ok) return;
      } catch { /* Wait for the production server to start. */ }
      if (frontend.exitCode !== null) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Production frontend failed to start: ${logs}`);
  });

  test.afterAll(async () => {
    if (frontend) frontend.kill();
    if (backend) await new Promise((resolve) => backend.close(resolve));
    if (fixture) await fixture.cleanup();
    if (closeDatabaseConnection) await closeDatabaseConnection();
  });

  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'wait' });
  });

  test('keeps prices when searching cities and filters by city, province and legacy region', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // SSR uses the isolated API through API_INTERNAL_URL. Relay browser requests
    // there too: the shared production artifact has a build-time API rewrite.
    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const response = await route.fetch({ url: `http://127.0.0.1:${backend.address().port}${url.pathname}${url.search}` });
      await route.fulfill({ response });
    });
    await page.route('**/api/v1/events', (route) => route.fulfill({ status: 204 }));
    await page.goto(origin);
    const searchResponse = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/v1/public/counters' && new URL(response.url()).searchParams.get('q') === city);
    await page.getByLabel('Cari konter atau paket').fill(city);
    expect((await searchResponse).status()).toBe(200);
    const cardA = page.getByTestId('counter-card').filter({ hasText: `Konter Uji A ${fixture.runId.slice(0, 8)}` });
    const cardB = page.getByTestId('counter-card').filter({ hasText: `Konter Uji B ${fixture.runId.slice(0, 8)}` });
    await expect(cardA).toContainText('Rp25.000');
    await expect(cardB).toContainText('Rp50.000');
    const location = page.getByLabel('Lokasi');
    await location.selectOption({ label: `${city} · ${provinceA}` });
    await expect(cardA).toContainText('Rp25.000');
    await expect(cardB).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset Filter' }).click();
    await location.selectOption({ label: `${provinceB} (Provinsi)` });
    await expect(cardB).toContainText('Rp50.000');
    await expect(cardA).toHaveCount(0);
    await location.selectOption(fixture.regionId);
    await expect(cardB).toContainText('Rp50.000');
    await expect(cardA).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
});
