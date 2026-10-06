import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('„+ 250 ml” ×5 = 1,25 l, a następnego dnia licznik od zera', async ({ page }) => {
  // Stała data, timery działają normalnie.
  await page.clock.setFixedTime(new Date('2026-10-05T10:00:00+02:00'));
  await onboard(page);
  const add = page.getByRole('button', { name: 'Dodaj 250 ml wody' });
  for (let i = 0; i < 5; i++) await add.click();
  await expect(page.getByTestId('water-today')).toHaveText('1,25 l');

  await page.clock.setFixedTime(new Date('2026-10-06T10:00:00+02:00'));
  await expect(page.getByTestId('water-today')).toHaveText('0 l');
  await page.reload();
  await expect(page.getByTestId('water-today')).toHaveText('0 l');
});

test('dodanie i usunięcie pomiaru wagi', async ({ page }) => {
  await onboard(page);
  await page.getByRole('link', { name: 'Pomiary', exact: true }).click();
  await page.getByRole('button', { name: 'Dodaj wagę' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Waga').fill('82,4');
  await dialog.getByRole('button', { name: 'Zapisz' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: /82,4 kg/ })).toBeVisible();

  await page.getByRole('button', { name: /82,4 kg/ }).click();
  await dialog.getByRole('button', { name: 'Usuń pomiar' }).click();
  await dialog.getByRole('button', { name: 'Usuń', exact: true }).click();
  await expect(page.getByText('Dodaj pierwszy pomiar, a pokażemy zmianę wagi i linię trendu z 30 dni.')).toBeVisible();
});
