import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseBackup } from '@/lib/domain/backup';
import { HOUR } from '@/lib/domain/time';
import { waterTotalForDay } from '@/lib/domain/water';
import { getDb, setDbForTests, subscribe } from './index';
import { openNodeDatabase } from './node';
import {
  addWater,
  addWeight,
  clearAllData,
  endFast,
  exportBackup,
  importBackup,
  readFasts,
  readSettings,
  readWaterSince,
  readWeights,
  removeLastWater,
  setActiveFastProtocol,
  startFast,
  updateFastStart,
  updateSettings,
} from './repo';
import { migrate, SCHEMA_VERSION } from './schema';

beforeEach(async () => {
  const db = openNodeDatabase();
  await migrate(db);
  setDbForTests(db);
});
afterEach(() => setDbForTests(null));

const count = async (table: string) =>
  (await (await getDb()).first<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`))?.n;

describe('schemat', () => {
  it('migracje ustawiają wersję i są idempotentne', async () => {
    const db = await getDb();
    await migrate(db);
    expect(await db.first('PRAGMA user_version')).toEqual({ user_version: SCHEMA_VERSION });
  });
});

describe('repo', () => {
  it('pełny cykl postu: start, edycja startu, zakończenie', async () => {
    const now = Date.now();
    const id = await startFast(now - 2 * HOUR, '16:8');
    await expect(startFast(now - HOUR, '16:8')).rejects.toThrow('active-fast-exists');
    await expect(updateFastStart(id, now + HOUR)).rejects.toThrow('future');
    await updateFastStart(id, now - 17 * HOUR);
    await setActiveFastProtocol('18:6');
    await endFast(id, now);
    const [fast] = await readFasts();
    expect(fast).toEqual({ id, startedAt: now - 17 * HOUR, endedAt: now, goalHours: 18, protocolId: '18:6' });
    // nowy post nie może zacząć się przed końcem poprzedniego
    await expect(startFast(now - HOUR, '16:8')).rejects.toThrow('beforePreviousEnd');
  });

  it('nieudana transakcja niczego nie zapisuje', async () => {
    await expect(startFast(Date.now() + HOUR, '16:8')).rejects.toThrow('future');
    expect(await count('fasts')).toBe(0);
  });

  it('woda: dodawanie i cofanie ostatniego wpisu z dnia', async () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) await addWater(now - i * 1000);
    await removeLastWater(now);
    const all = await readWaterSince(0);
    expect(waterTotalForDay(all, now)).toBe(1000);
    // usunięty został najnowszy wpis
    expect(all.some((e) => e.at === now)).toBe(false);
  });

  it('waga: odczyt posortowany po czasie', async () => {
    const now = Date.now();
    await addWeight(82.4, now);
    await addWeight(83.1, now - HOUR);
    expect((await readWeights()).map((w) => w.kg)).toEqual([83.1, 82.4]);
  });

  it('ustawienia: domyślne i scalanie', async () => {
    expect((await readSettings()).onboardingDone).toBe(false);
    await updateSettings({ onboardingDone: true, protocolId: '18:6' });
    await updateSettings({ theme: 'dark' });
    expect(await readSettings()).toMatchObject({ onboardingDone: true, protocolId: '18:6', theme: 'dark' });
  });

  it('powiadamia widoki o zmianach w tabelach', async () => {
    const onFasts = vi.fn();
    const onWater = vi.fn();
    const off = subscribe(['fasts'], onFasts);
    subscribe(['water'], onWater);
    await startFast(Date.now() - HOUR, '16:8');
    expect(onFasts).toHaveBeenCalledTimes(1);
    expect(onWater).not.toHaveBeenCalled();
    off();
    await clearAllData();
    expect(onFasts).toHaveBeenCalledTimes(1);
    expect(onWater).toHaveBeenCalledTimes(1);
  });

  it('eksport → usunięcie → import przywraca dane', async () => {
    const now = Date.now();
    await updateSettings({ onboardingDone: true, locale: 'en' });
    const id = await startFast(now - 3 * HOUR, '16:8');
    await addWater(now);
    await addWeight(82.4, now);
    const backup = await exportBackup(now);
    const text = JSON.stringify(backup);

    await clearAllData();
    expect(await count('fasts')).toBe(0);
    expect((await readSettings()).onboardingDone).toBe(false);

    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error('backup should parse');
    await importBackup(parsed.backup);
    expect(await readFasts()).toEqual([{ id, startedAt: now - 3 * HOUR, goalHours: 16, protocolId: '16:8' }]);
    expect(await count('weights')).toBe(1);
    expect(await count('water')).toBe(1);
    expect(await readSettings()).toMatchObject({ onboardingDone: true, locale: 'en' });
  });
});
