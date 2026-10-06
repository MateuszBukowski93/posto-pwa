import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('motyw Ciemny i język English działają od razu i są zapamiętane', async ({ page }) => {
  await onboard(page);
  await page.getByRole('link', { name: 'Ustawienia', exact: true }).click();

  await page.getByRole('radio', { name: 'Ciemny' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: /Język aplikacji/ }).click();
  await page
    .getByRole('dialog')
    .getByRole('radio', { name: /English/ })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
});

test('eksport → usuń wszystkie dane → import przywraca dane', async ({ page }) => {
  await onboard(page, '18:6');
  await page.getByRole('button', { name: 'Rozpocznij teraz' }).click();
  await page.getByRole('button', { name: 'Dodaj 250 ml wody' }).click();
  await page.getByRole('link', { name: 'Ustawienia', exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Eksportuj dane/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^posto-\d{4}-\d{2}-\d{2}\.json$/);
  const file = test.info().outputPath('backup.json');
  await download.saveAs(file);

  await page.getByRole('button', { name: /Usuń wszystkie dane/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Usuń wszystko' }).click();
  await expect(page).toHaveURL(/\/welcome\/$/);

  await page.goto('./settings/');
  await page.getByTestId('import-file').setInputFiles(file);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('1 post');
  await dialog.getByRole('button', { name: 'Importuj' }).click();
  await expect(page.getByText('Dane zostały zaimportowane.')).toBeVisible();

  await page.getByRole('link', { name: 'Timer', exact: true }).click();
  await expect(page.getByText('Poszczę', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Zmień protokół, obecnie 18:6' })).toBeVisible();
  await expect(page.getByTestId('water-today')).toHaveText('0,25 l');
});
