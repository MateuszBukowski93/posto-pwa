import { expect, test } from '@playwright/test';
import { onboard, parseClock } from './helpers';

test('pierwsze uruchomienie → Powitanie → 18:6 → Timer z celem 18 h', async ({ page }) => {
  await onboard(page, '18:6');
  await expect(page.getByRole('link', { name: 'Zmień protokół, obecnie 18:6' })).toBeVisible();
  await page.getByRole('button', { name: 'Rozpocznij teraz' }).click();
  await expect(page.getByText(/^cel 18 h · zostało/)).toBeVisible();
});

test('start postu → przeładowanie → czas liczy się dalej', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Rozpocznij teraz' }).click();
  const clock = page.getByTestId('timer-clock');
  await expect(clock).toHaveText(/^00:00:0\d$/);
  await page.waitForTimeout(2_500);
  await page.reload();
  await expect(page.getByText('Poszczę', { exact: true })).toBeVisible();
  await expect.poll(async () => parseClock(await clock.textContent())).toBeGreaterThanOrEqual(2);
});

test('edycja startu na „Wczoraj 19:00” i blokada godziny z przyszłości', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Rozpocznij teraz' }).click();

  await page.getByRole('button', { name: /Edytuj początek postu/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: /Wczoraj/ }).click();
  await dialog.getByLabel('Godzina').fill('19:00');
  const hours = await page.evaluate(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(19, 0, 0, 0);
    return Math.floor((Date.now() - d.getTime()) / 3_600_000);
  });
  await expect(dialog.getByRole('status')).toContainText(`Post trwa już ${hours} h`);
  await dialog.getByRole('button', { name: 'Zapisz start' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('timer-clock')).toHaveText(new RegExp(`^${String(hours).padStart(2, '0')}:`));
  await expect(page.getByRole('button', { name: /Edytuj początek postu, obecnie Wczoraj, 19:00/ })).toBeVisible();

  const late = await page.evaluate(() => new Date().getHours() * 60 + new Date().getMinutes() >= 23 * 60 + 58);
  test.skip(late, 'Tuż przed północą nie da się wybrać godziny z przyszłości na dziś.');
  await page.getByRole('button', { name: /Edytuj początek postu/ }).click();
  await dialog.getByRole('radio', { name: /Dziś/ }).click();
  await dialog.getByLabel('Godzina').fill('23:59');
  await expect(dialog.getByRole('status')).toHaveText('Ta godzina jeszcze nie nadeszła. Wybierz wcześniejszą.');
  const save = dialog.getByRole('button', { name: 'Zapisz start' });
  await expect(save).toHaveAttribute('aria-disabled', 'true');
  await save.click({ force: true });
  await expect(dialog).toBeVisible();
});

test('zakończenie postu ≥ celu → wpis „Cel osiągnięty” i seria 1', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Zacząłem wcześniej' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: /Przedwczoraj/ }).click();
  await dialog.getByLabel('Godzina').fill('08:00');
  await dialog.getByRole('button', { name: 'Zapisz start' }).click();
  await expect(page.getByText('Cel osiągnięty', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Zakończ post · cel osiągnięty' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Zakończ teraz' }).click();
  await expect(page.getByText('Okno jedzenia', { exact: true }).first()).toBeVisible();

  await page.getByRole('link', { name: 'Historia', exact: true }).click();
  const streak = page.getByRole('region', { name: 'Seria' });
  await expect(streak).toContainText('1');
  await expect(streak).toContainText('dzień z rzędu');
  await expect(page.getByRole('button', { name: /Cel osiągnięty/ })).toBeVisible();
});
