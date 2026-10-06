import { expect, type Page } from '@playwright/test';

/** Pierwsze uruchomienie: Powitanie → Protokół → Timer. */
export async function onboard(page: Page, protocol = '16:8') {
  await page.goto('./');
  await expect(page).toHaveURL(/\/welcome\/$/);
  await page.getByRole('link', { name: 'Zaczynamy' }).click();
  await page.getByRole('radio', { name: new RegExp(protocol) }).click();
  await page.getByRole('button', { name: `Zapisz protokół ${protocol}` }).click();
  const hours = protocol.split(':')[0];
  await expect(page.getByText(`cel ${hours} h`, { exact: true })).toBeVisible();
}

export function parseClock(text: string | null): number {
  const [h, m, s] = (text ?? '').split(':').map(Number);
  return h * 3600 + m * 60 + s;
}
