import { test, expect } from '@playwright/test';

test.describe('Admin Authentication & Protection', () => {
  test('should display login page and validate form fields', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.getByRole('heading', { name: /masuk panel admin/i })).toBeVisible();

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.locator('#admin-password');
    const submitBtn = page.getByRole('button', { name: /masuk/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('should redirect unauthenticated users visiting protected admin routes', async ({ page }) => {
    // Attempting to visit /admin directly without session
    await page.goto('/admin');

    // Should redirect to /admin/login
    await expect(page).toHaveURL(/.*admin\/login.*/);
  });

  test('rejects an unauthenticated admin document request before rendering', async ({ request }) => {
    const response = await request.get('/admin/konter', { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe('/admin/login');
  });
});

