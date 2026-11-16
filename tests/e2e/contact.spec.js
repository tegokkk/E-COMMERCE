import { test, expect } from '@playwright/test';

test.describe('WhatsApp Contact Flow', () => {
  test('does not offer contact for development fixtures', async ({ page }) => {
    await page.goto('/');
    const demoCard = page.getByTestId('counter-card').first();
    await expect(demoCard.getByText('Data contoh')).toBeVisible();
    await expect(demoCard.getByRole('button', { name: /kontak contoh/i })).toBeDisabled();
  });
});

