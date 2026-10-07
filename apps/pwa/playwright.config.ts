import { defineConfig, devices } from '@playwright/test';

/** E2E na statycznym eksporcie (out/) – zbuduj najpierw: npm run build. */
const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
const ORIGIN = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `${ORIGIN}${BASE}/`,
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
    // SW tylko w teście offline – w pozostałych nie chcemy precache w tle.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'node scripts/serve-out.mjs',
    url: `${ORIGIN}${BASE}/`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORT), NEXT_PUBLIC_BASE_PATH: BASE },
  },
});
