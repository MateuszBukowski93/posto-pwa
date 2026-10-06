import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseBackup } from '@/lib/domain/backup';
import { HOUR } from '@/lib/domain/time';
import { waterTotalForDay } from '@/lib/domain/water';
import { getDb, PostoDB, setDbForTests } from './index';
import {
  addWater,
  addWeight,
  clearAllData,
  endFast,
  exportBackup,
  importBackup,
  readSettings,
  removeLastWater,
  setActiveFastProtocol,
  startFast,
  updateFastStart,
  updateSettings,
} from './repo';

let n = 0;
beforeEach(() => setDbForTests(new PostoDB(`posto-test-${n++}`)));
afterEach(async () => {
  await getDb().delete();
  setDbForTests(null);
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
    const fast = await getDb().fasts.get(id);
    expect(fast).toMatchObject({ startedAt: now - 17 * HOUR, endedAt: now, goalHours: 18, protocolId: '18:6' });
    // nowy post nie może zacząć się przed końcem poprzedniego
    await expect(startFast(now - HOUR, '16:8')).rejects.toThrow('beforePreviousEnd');
  });

  it('woda: dodawanie i cofanie ostatniego wpisu z dnia', async () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) await addWater(now - i * 1000);
    await removeLastWater(now);
    const all = await getDb().water.toArray();
    expect(waterTotalForDay(all, now)).toBe(1000);
  });

  it('ustawienia: domyślne i scalanie', async () => {
    expect((await readSettings()).onboardingDone).toBe(false);
    await updateSettings({ onboardingDone: true, protocolId: '18:6' });
    await updateSettings({ theme: 'dark' });
    expect(await readSettings()).toMatchObject({ onboardingDone: true, protocolId: '18:6', theme: 'dark' });
  });

  it('eksport → usunięcie → import przywraca dane', async () => {
    const now = Date.now();
    await updateSettings({ onboardingDone: true, locale: 'en' });
    await startFast(now - 3 * HOUR, '16:8');
    await addWater(now);
    await addWeight(82.4, now);
    const text = JSON.stringify(await exportBackup(now));

    await clearAllData();
    expect(await getDb().fasts.count()).toBe(0);
    expect((await readSettings()).onboardingDone).toBe(false);

    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error('backup should parse');
    await importBackup(parsed.backup);
    expect(await getDb().fasts.count()).toBe(1);
    expect(await getDb().weights.count()).toBe(1);
    expect(await getDb().water.count()).toBe(1);
    expect(await readSettings()).toMatchObject({ onboardingDone: true, locale: 'en' });
  });
});
