import { test, expect } from '@playwright/test';

test.describe('Public Directory & Search Flow', () => {
  test('should display landing page with brand header and hero', async ({ page }) => {
    await page.goto('/');

    // Check brand header
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Directory section
    const directorySection = page.locator('#direktori');
    await expect(directorySection).toBeVisible();

    // Check search input exists
    const searchInput = page.getByPlaceholder(/cari konter/i);
    await expect(searchInput).toBeVisible();
  });

  test('should allow filtering counters and opening counter detail dialog', async ({ page }) => {
    await page.goto('/');

    // Ensure counter cards are loaded
    const cards = page.locator('[data-testid="counter-card"]');
    await expect(cards.first()).toBeVisible();

    // Click "Lihat Paket" on the first card
    await page.getByRole('button', { name: 'Telkomsel' }).click();
    const detailButton = cards.first().getByRole('button', { name: /lihat paket/i });
    await detailButton.click();

    // Detail dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Dialog title / counter profile
    await expect(dialog.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(dialog.getByText('Telkomsel InternetMAX 14 GB')).toBeVisible();
    await expect(dialog.getByText('Freedom Internet 20 GB')).toHaveCount(0);

    // Dialog keyboard navigation remains available on mobile.
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('shows the matching package price for a package search', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: /cari konter atau paket/i }).fill('50 GB');
    const sinar = page.getByTestId('counter-card').filter({ hasText: 'Sinar Pulsa' });
    await expect(sinar).toContainText('Indosat Freedom Jumbo 50 GB');
    await expect(sinar).toContainText('Rp90.000');
    await expect(sinar).not.toContainText('Rp15.000');
  });
});

