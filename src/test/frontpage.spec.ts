import { test, expect } from '@playwright/test';

test('Frontpage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Abavote');
});
