import { test, expect } from '@playwright/test';

// Opt in explicitly: this suite uses its own records in the separate test DB.
test.describe('Counter-owned packages with a real isolated API', () => {
  test.use({ timezoneId: 'Asia/Bangkok' });
  test.skip(process.env.COUNTER_PACKAGE_E2E !== 'true', 'Set COUNTER_PACKAGE_E2E=true and NODE_ENV=test to use the isolated test database.');
  test.describe.configure({ mode: 'serial', timeout: 90000 });
  let fixture;
  let server;
  let backendUrl;
  let closeDatabaseConnection;

  test.beforeAll(async () => {
    const { createCounterPackageFixtures } = await import('../../backend/tests/helpers/counter-package-fixtures.js');
    const { default: app } = await import('../../backend/src/app.js');
    ({ closeDatabaseConnection } = await import('../../backend/src/database/connection.js'));
    fixture = await createCounterPackageFixtures();
    const { db } = await import('../../backend/src/database/connection.js');
    const year = new Date().getUTCFullYear() + 2;
    fixture.cutoff = `${year}-01-02T12:34:56.789Z`;
    fixture.localCutoff = `${year}-01-02T19:34`;
    await db('packages').where({ id: fixture.packageA }).update({ display_until: fixture.cutoff });
    await new Promise((resolve) => { server = app.listen(0, resolve); });
    backendUrl = `http://localhost:${server.address().port}`;
  });

  test.afterAll(async () => {
    if (fixture) await fixture.cleanup();
    if (server) await new Promise((resolve) => server.close(resolve));
    if (closeDatabaseConnection) await closeDatabaseConnection();
  });

  test.beforeEach(async ({ page }) => {
    // Relay real browser API requests to the real API + test DB, not mock responses.
    await page.route('**/api/v1/**', async (route) => {
      const original = new URL(route.request().url());
      const response = await route.fetch({ url: `${backendUrl}${original.pathname}${original.search}` });
      await route.fulfill({ response });
    });
    await page.goto('/admin/login');
    await page.locator('#admin-email').fill(fixture.email);
    await page.locator('#admin-password').fill(fixture.password);
    await page.getByRole('button', { name: /Masuk ke Panel/ }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'wait' });
  });

  async function checkOverflow(page) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  test('opens from a counter and creates, edits, changes status and deletes only its packages', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/admin/konter');
    await page.getByLabel('Cari konter').fill(fixture.runId.slice(0, 8));
    const row = page.locator('tr:visible, article:visible').filter({ hasText: `Konter Uji A ${fixture.runId.slice(0, 8)}` });
    await row.getByRole('link', { name: /Kelola Paket/ }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/konter/${fixture.counterA}/paket$`));
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Konter Uji A');
    await expect(page.getByText('11 paket di konter ini')).toBeVisible();
    await expect(page.getByText('Paket Bersama B', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Selanjutnya' }).click();
    await expect(page.getByText('Halaman 2 dari 2', { exact: false })).toBeVisible();
    await page.getByLabel('Cari paket').fill('Bersama B');
    await expect(page.getByText('Tidak Ada Paket yang Sesuai Filter')).toBeVisible();
    await page.getByRole('button', { name: 'Reset Filter' }).first().click();
    await page.getByRole('link', { name: 'Tambah Paket', exact: true }).first().click();
    const owner = page.getByLabel('Konter Pemilik');
    await expect(owner).toHaveAttribute('readonly', '');
    await expect(owner).toHaveValue(`Konter Uji A ${fixture.runId.slice(0, 8)}`);
    await page.getByLabel('Pilih Provider').selectOption(fixture.providerId);
    await page.getByLabel('Nama Paket').fill('Paket Browser Uji');
    await page.getByLabel('Harga (Rupiah)').fill('35000');
    await page.getByLabel('Ringkasan Kuota').fill('15 GB');
    await checkOverflow(page);
    await page.getByRole('button', { name: 'Terbitkan Sekarang' }).click();
    const listUrl = `/admin/konter/${fixture.counterA}/paket`;
    await expect(page).toHaveURL(new RegExp(`${listUrl}$`));
    await page.getByLabel('Cari paket').fill('Paket Browser Uji');
    let pkgRow = page.locator('tr:visible, article:visible').filter({ hasText: 'Paket Browser Uji' });
    await pkgRow.getByRole('link', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Harga (Rupiah)').fill('36000');
    await page.getByRole('button', { name: 'Simpan & Terbitkan' }).click();
    await expect(page).toHaveURL(new RegExp(`${listUrl}$`));
    await page.getByLabel('Cari paket').fill('Paket Browser Uji');
    pkgRow = page.locator('tr:visible, article:visible').filter({ hasText: 'Paket Browser Uji' });
    await expect(pkgRow).toContainText('36.000');
    await pkgRow.getByRole('button', { name: 'Nonaktifkan', exact: true }).click();
    await expect(pkgRow.getByRole('button', { name: 'Terbitkan', exact: true })).toBeVisible();
    await pkgRow.getByRole('button', { name: 'Terbitkan', exact: true }).click();
    await expect(pkgRow.getByRole('button', { name: 'Nonaktifkan', exact: true })).toBeVisible();
    await checkOverflow(page);
    await page.screenshot({ path: test.info().outputPath('counter-package-list.png'), fullPage: true });
    await pkgRow.getByRole('button', { name: 'Hapus', exact: true }).click();
    await page.getByRole('button', { name: 'Ya, Hapus Paket' }).click();
    await expect(page.getByText('Tidak Ada Paket yang Sesuai Filter')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('keeps owner B isolated, blocks invalid forms, and redirects old package URLs', async ({ page }) => {
    await page.goto(`/admin/konter/${fixture.counterB}/paket`);
    await expect(page.getByText('1 paket di konter ini')).toBeVisible();
    await expect(page.locator('tr:visible, article:visible').getByText('Paket Bersama B', { exact: true })).toBeVisible();
    await expect(page.getByText('Paket Bersama A 01', { exact: true })).toHaveCount(0);
    await page.goto(`/admin/konter/${fixture.counterA}/paket/${fixture.packageB}/edit`);
    await expect(page.getByText('Paket tidak dapat dibuka')).toBeVisible();
    await expect(page.getByLabel('Nama Paket')).toHaveCount(0);
    await page.goto(`/admin/konter/${fixture.draftCounter}/paket/baru`);
    await expect(page.getByText(/Terbitkan konter terlebih dahulu/)).toBeVisible();
    await expect(page.getByLabel('Nama Paket')).toHaveCount(0);
    await page.goto(`/admin/konter/${fixture.emptyCounter}/paket`);
    await expect(page.getByText('Belum ada paket untuk konter ini')).toBeVisible();
    await page.getByRole('link', { name: 'Tambah Paket', exact: true }).first().click();
    await page.getByRole('button', { name: 'Batal' }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/konter/${fixture.emptyCounter}/paket$`));
    await page.goto('/admin/paket');
    await expect(page).toHaveURL(/\/admin\/konter$/);
    await page.goto(`/admin/paket/baru?counterId=${fixture.counterA}`);
    await expect(page).toHaveURL(new RegExp(`/admin/konter/${fixture.counterA}/paket/baru$`));
    await page.goto(`/admin/paket/${fixture.packageB}/edit`);
    await expect(page).toHaveURL(new RegExp(`/admin/konter/${fixture.counterB}/paket/${fixture.packageB}/edit$`));
    await expect(page.getByLabel('Konter Pemilik')).toHaveValue(`Konter Uji B ${fixture.runId.slice(0, 8)}`);
    await checkOverflow(page);
  });

  test('preserves an exact cutoff after editing a different field in UTC+7', async ({ page }) => {
    await page.goto(`/admin/konter/${fixture.counterA}/paket/${fixture.packageA}/edit`);
    await expect(page.getByLabel('Batas Penayangan (Opsional)')).toHaveValue(fixture.localCutoff);
    await page.getByLabel('Harga (Rupiah)').fill('27000');
    await page.getByRole('button', { name: 'Simpan & Terbitkan' }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/konter/${fixture.counterA}/paket$`));
    const saved = await page.evaluate(async (path) => (await (await fetch(path)).json()).data, `/api/v1/admin/counters/${fixture.counterA}/packages/${fixture.packageA}`);
    expect(saved.displayUntil).toBe(fixture.cutoff);
    expect(saved.price).toBe(27000);
  });
});
