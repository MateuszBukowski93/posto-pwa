import { createBackup, type BackupFile } from '@/lib/domain/backup';
import {
  getActiveFast,
  getLastEndedFast,
  validateFastEnd,
  validateFastRange,
  validateFastStart,
} from '@/lib/domain/fasting';
import { getProtocol, type ProtocolId } from '@/lib/domain/protocols';
import { DEFAULT_SETTINGS, normalizeSettings, SETTINGS_ID } from '@/lib/domain/settings';
import type { Settings } from '@/lib/domain/types';
import { lastWaterEntryForDay, localDayBounds, WATER_STEP_ML } from '@/lib/domain/water';
import { getDb, newId } from './index';

/**
 * Jedyna warstwa zapisu danych. Reguły biznesowe sprawdzane są tu drugi raz
 * (pierwszy raz w UI), żeby baza nie mogła trafić w niespójny stan.
 */

export class DomainError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

// ---------- Ustawienia ----------

export async function readSettings(): Promise<Settings> {
  return normalizeSettings(await getDb().settings.get(SETTINGS_ID));
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
  const db = getDb();
  await db.transaction('rw', db.settings, async () => {
    const current = normalizeSettings(await db.settings.get(SETTINGS_ID));
    await db.settings.put(normalizeSettings({ ...current, ...patch, id: SETTINGS_ID }));
  });
}

// ---------- Posty ----------

export async function startFast(startedAt: number, protocolId: ProtocolId): Promise<string> {
  const db = getDb();
  const protocol = getProtocol(protocolId);
  const id = newId();
  await db.transaction('rw', db.fasts, async () => {
    const all = await db.fasts.toArray();
    if (getActiveFast(all)) throw new DomainError('active-fast-exists');
    const validation = validateFastStart(startedAt, {
      now: Date.now(),
      previousEndedAt: getLastEndedFast(all)?.endedAt,
    });
    if (!validation.ok) throw new DomainError(validation.reason);
    await db.fasts.add({ id, startedAt, goalHours: protocol.fastHours, protocolId: protocol.id });
  });
  return id;
}

export async function updateFastStart(id: string, startedAt: number): Promise<void> {
  const db = getDb();
  await db.transaction('rw', db.fasts, async () => {
    const all = await db.fasts.toArray();
    const fast = all.find((f) => f.id === id);
    if (!fast) throw new DomainError('not-found');
    const validation = validateFastStart(startedAt, {
      now: Date.now(),
      previousEndedAt: getLastEndedFast(all, id)?.endedAt,
    });
    if (!validation.ok) throw new DomainError(validation.reason);
    if (fast.endedAt !== undefined && startedAt >= fast.endedAt) throw new DomainError('beforeStart');
    await db.fasts.update(id, { startedAt });
  });
}

export async function endFast(id: string, endedAt: number): Promise<void> {
  const db = getDb();
  await db.transaction('rw', db.fasts, async () => {
    const fast = await db.fasts.get(id);
    if (!fast || fast.endedAt !== undefined) throw new DomainError('not-active');
    const validation = validateFastEnd(endedAt, { now: Date.now(), startedAt: fast.startedAt });
    if (!validation.ok) throw new DomainError(validation.reason);
    await db.fasts.update(id, { endedAt });
  });
}

/** Edycja zakończonego postu z historii. */
export async function updateFastRange(id: string, startedAt: number, endedAt: number): Promise<void> {
  const db = getDb();
  await db.transaction('rw', db.fasts, async () => {
    const all = await db.fasts.toArray();
    const validation = validateFastRange({ id, startedAt, endedAt }, { now: Date.now(), fasts: all });
    if (!validation.ok) throw new DomainError(validation.reason);
    await db.fasts.update(id, { startedAt, endedAt });
  });
}

export async function deleteFast(id: string): Promise<void> {
  await getDb().fasts.delete(id);
}

/** Zmiana celu trwającego postu po zmianie protokołu. */
export async function setActiveFastProtocol(protocolId: ProtocolId): Promise<void> {
  const db = getDb();
  const protocol = getProtocol(protocolId);
  await db.transaction('rw', db.fasts, async () => {
    const active = getActiveFast(await db.fasts.toArray());
    if (active) await db.fasts.update(active.id, { goalHours: protocol.fastHours, protocolId: protocol.id });
  });
}

// ---------- Woda ----------

export async function addWater(at: number, ml = WATER_STEP_ML): Promise<void> {
  await getDb().water.add({ id: newId(), at, ml });
}

/** „−” usuwa ostatni wpis z bieżącego dnia. */
export async function removeLastWater(now: number): Promise<void> {
  const db = getDb();
  await db.transaction('rw', db.water, async () => {
    const [start, end] = localDayBounds(now);
    const today = await db.water.where('at').between(start, end, true, false).toArray();
    const last = lastWaterEntryForDay(today, now);
    if (last) await db.water.delete(last.id);
  });
}

// ---------- Waga ----------

export async function addWeight(kg: number, at: number): Promise<void> {
  await getDb().weights.add({ id: newId(), at, kg });
}

export async function updateWeight(id: string, kg: number, at: number): Promise<void> {
  await getDb().weights.update(id, { kg, at });
}

export async function deleteWeight(id: string): Promise<void> {
  await getDb().weights.delete(id);
}

// ---------- Dane ----------

export async function exportBackup(now: number): Promise<BackupFile> {
  const db = getDb();
  const [fasts, weights, water, settings] = await Promise.all([
    db.fasts.toArray(),
    db.weights.toArray(),
    db.water.toArray(),
    db.settings.get(SETTINGS_ID),
  ]);
  return createBackup({ fasts, weights, water, settings: settings ?? null }, now);
}

/** Zastępuje wszystkie dane zawartością kopii (atomowo). */
export async function importBackup(backup: BackupFile): Promise<void> {
  const db = getDb();
  await db.transaction('rw', [db.fasts, db.weights, db.water, db.settings], async () => {
    await Promise.all([db.fasts.clear(), db.weights.clear(), db.water.clear(), db.settings.clear()]);
    await db.fasts.bulkAdd(backup.data.fasts);
    await db.weights.bulkAdd(backup.data.weights);
    await db.water.bulkAdd(backup.data.water);
    await db.settings.put(normalizeSettings(backup.data.settings ?? { ...DEFAULT_SETTINGS, onboardingDone: true }));
  });
}

export async function clearAllData(): Promise<void> {
  const db = getDb();
  await db.transaction('rw', [db.fasts, db.weights, db.water, db.settings], async () => {
    await Promise.all([db.fasts.clear(), db.weights.clear(), db.water.clear(), db.settings.clear()]);
  });
}
