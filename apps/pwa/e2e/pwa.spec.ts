import { expect, test } from '@playwright/test';

test.describe('PWA', () => {
  test.use({ serviceWorkers: 'allow' });

  test('aplikacja uruchamia się offline po pierwszej wizycie', async ({ page, context }) => {
    await page.goto('./welcome/');
    await expect(page.getByRole('heading', { name: 'Post przerywany, po prostu.' })).toBeVisible();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect
      .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null), { timeout: 15_000 })
      .toBe(true);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Post przerywany, po prostu.' })).toBeVisible();
    await page.goto('./settings/');
    await expect(page.getByRole('heading', { level: 1, name: 'Ustawienia' })).toBeVisible();
    await page.getByRole('link', { name: 'Historia', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Historia' })).toBeVisible();
  });

  test('manifest spełnia wymagania instalowalności', async ({ page, request, baseURL }) => {
    await page.goto('./welcome/');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();
    const origin = new URL(baseURL!).origin;
    const response = await request.get(new URL(href!, origin).toString());
    expect(response.ok()).toBe(true);
    const manifest = await response.json();
    expect(manifest).toMatchObject({
      name: 'Posto',
      short_name: 'Posto',
      display: 'standalone',
      lang: 'pl',
      orientation: 'portrait',
    });
    expect(manifest.start_url).toMatch(/\/$/);
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons) {
      const res = await request.get(new URL(icon.src, origin).toString());
      expect(res.ok(), icon.src).toBe(true);
      expect(res.headers()['content-type']).toContain('image/png');
    }
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  });
});
