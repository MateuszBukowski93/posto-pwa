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
import type { Fast, Settings, WaterEntry, WeightEntry } from '@/lib/domain/types';
import { lastWaterEntryForDay, localDayBounds, WATER_STEP_ML } from '@/lib/domain/water';
import { getDb, newId, notify } from './index';
import { settingsStore } from './settingsStore';
import type { SqlExecutor } from './sql';

/**
 * Jedyna warstwa zapisu danych. Reguły biznesowe sprawdzane są tu drugi raz
 * (pierwszy raz w UI), żeby baza nie mogła trafić w niespójny stan.
 * Po każdym zapisie `notify` odświeża widoki (zob. lib/hooks/useData.ts).
 */

export class DomainError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

// ---------- mapowanie wierszy ----------

type FastRow = {
  id: string;
  started_at: number;
  ended_at: number | null;
  goal_hours: number;
  protocol_id: ProtocolId;
};

function toFast(row: FastRow): Fast {
  const fast: Fast = {
    id: row.id,
    startedAt: row.started_at,
    goalHours: row.goal_hours,
    protocolId: row.protocol_id,
  };
  if (row.ended_at !== null) fast.endedAt = row.ended_at;
  return fast;
}

async function insertFast(tx: SqlExecutor, fast: Fast): Promise<void> {
  await tx.run('INSERT INTO fasts (id, started_at, ended_at, goal_hours, protocol_id) VALUES (?, ?, ?, ?, ?)', [
    fast.id,
    fast.startedAt,
    fast.endedAt ?? null,
    fast.goalHours,
    fast.protocolId,
  ]);
}

async function allFasts(tx: SqlExecutor): Promise<Fast[]> {
  return (await tx.all<FastRow>('SELECT * FROM fasts')).map(toFast);
}

// ---------- odczyty (dla widoków) ----------

export async function readFasts(): Promise<Fast[]> {
  return allFasts(await getDb());
}

export async function readWeights(): Promise<WeightEntry[]> {
  return (await getDb()).all<WeightEntry>('SELECT id, at, kg FROM weights ORDER BY at');
}

/** Wpisy wody od podanego momentu (np. początek wczoraj). */
export async function readWaterSince(from: number): Promise<WaterEntry[]> {
  return (await getDb()).all<WaterEntry>('SELECT id, at, ml FROM water WHERE at >= ? ORDER BY at', [from]);
}

// ---------- Ustawienia ----------

async function settingsRecord(tx: SqlExecutor): Promise<Partial<Settings> | null> {
  const row = await tx.first<{ data: string }>('SELECT data FROM settings WHERE id = ?', [SETTINGS_ID]);
  if (!row) return null;
  try {
    return JSON.parse(row.data) as Partial<Settings>;
  } catch {
    return null;
  }
}

async function writeSettings(tx: SqlExecutor, settings: Settings): Promise<void> {
  await tx.run('INSERT OR REPLACE INTO settings (id, data) VALUES (?, ?)', [SETTINGS_ID, JSON.stringify(settings)]);
}

/** null = brak zapisanych ustawień (pierwsze uruchomienie). */
export async function readSettingsRecord(): Promise<Partial<Settings> | null> {
  return settingsRecord(await getDb());
}

export async function readSettings(): Promise<Settings> {
  return normalizeSettings(await readSettingsRecord());
}

/** Wczytuje ustawienia do settingsStore (start aplikacji). */
export async function loadSettings(): Promise<Settings> {
  const settings = await readSettings();
  settingsStore.set(settings);
  return settings;
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
  const db = await getDb();
  const next = await db.transaction(async (tx) => {
    const current = normalizeSettings(await settingsRecord(tx));
    const merged = normalizeSettings({ ...current, ...patch, id: SETTINGS_ID });
    await writeSettings(tx, merged);
    return merged;
  });
  settingsStore.set(next);
  notify('settings');
}

// ---------- Posty ----------

export async function startFast(startedAt: number, protocolId: ProtocolId): Promise<string> {
  const db = await getDb();
  const protocol = getProtocol(protocolId);
  const id = newId();
  await db.transaction(async (tx) => {
    const all = await allFasts(tx);
    if (getActiveFast(all)) throw new DomainError('active-fast-exists');
    const validation = validateFastStart(startedAt, {
      now: Date.now(),
      previousEndedAt: getLastEndedFast(all)?.endedAt,
    });
    if (!validation.ok) throw new DomainError(validation.reason);
    await insertFast(tx, { id, startedAt, goalHours: protocol.fastHours, protocolId: protocol.id });
  });
  notify('fasts');
  return id;
}

export async function updateFastStart(id: string, startedAt: number): Promise<void> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const all = await allFasts(tx);
    const fast = all.find((f) => f.id === id);
    if (!fast) throw new DomainError('not-found');
    const validation = validateFastStart(startedAt, {
      now: Date.now(),
      previousEndedAt: getLastEndedFast(all, id)?.endedAt,
    });
    if (!validation.ok) throw new DomainError(validation.reason);
    if (fast.endedAt !== undefined && startedAt >= fast.endedAt) throw new DomainError('beforeStart');
    await tx.run('UPDATE fasts SET started_at = ? WHERE id = ?', [startedAt, id]);
  });
  notify('fasts');
}

export async function endFast(id: string, endedAt: number): Promise<void> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const row = await tx.first<FastRow>('SELECT * FROM fasts WHERE id = ?', [id]);
    if (!row || row.ended_at !== null) throw new DomainError('not-active');
    const validation = validateFastEnd(endedAt, { now: Date.now(), startedAt: row.started_at });
    if (!validation.ok) throw new DomainError(validation.reason);
    await tx.run('UPDATE fasts SET ended_at = ? WHERE id = ?', [endedAt, id]);
  });
  notify('fasts');
}

/** Edycja zakończonego postu z historii. */
export async function updateFastRange(id: string, startedAt: number, endedAt: number): Promise<void> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const all = await allFasts(tx);
    const validation = validateFastRange({ id, startedAt, endedAt }, { now: Date.now(), fasts: all });
    if (!validation.ok) throw new DomainError(validation.reason);
    await tx.run('UPDATE fasts SET started_at = ?, ended_at = ? WHERE id = ?', [startedAt, endedAt, id]);
  });
  notify('fasts');
}

export async function deleteFast(id: string): Promise<void> {
  await (await getDb()).run('DELETE FROM fasts WHERE id = ?', [id]);
  notify('fasts');
}

/** Zmiana celu trwającego postu po zmianie protokołu. */
export async function setActiveFastProtocol(protocolId: ProtocolId): Promise<void> {
  const db = await getDb();
  const protocol = getProtocol(protocolId);
  await db.transaction(async (tx) => {
    const active = getActiveFast(await allFasts(tx));
    if (active) {
      await tx.run('UPDATE fasts SET goal_hours = ?, protocol_id = ? WHERE id = ?', [
        protocol.fastHours,
        protocol.id,
        active.id,
      ]);
    }
  });
  notify('fasts');
}

// ---------- Woda ----------

export async function addWater(at: number, ml = WATER_STEP_ML): Promise<void> {
  await (await getDb()).run('INSERT INTO water (id, at, ml) VALUES (?, ?, ?)', [newId(), at, ml]);
  notify('water');
}

/** „−” usuwa ostatni wpis z bieżącego dnia. */
export async function removeLastWater(now: number): Promise<void> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const [start, end] = localDayBounds(now);
    const today = await tx.all<WaterEntry>('SELECT id, at, ml FROM water WHERE at >= ? AND at < ?', [start, end]);
    const last = lastWaterEntryForDay(today, now);
    if (last) await tx.run('DELETE FROM water WHERE id = ?', [last.id]);
  });
  notify('water');
}

// ---------- Waga ----------

export async function addWeight(kg: number, at: number): Promise<void> {
  await (await getDb()).run('INSERT INTO weights (id, at, kg) VALUES (?, ?, ?)', [newId(), at, kg]);
  notify('weights');
}

export async function updateWeight(id: string, kg: number, at: number): Promise<void> {
  await (await getDb()).run('UPDATE weights SET kg = ?, at = ? WHERE id = ?', [kg, at, id]);
  notify('weights');
}

export async function deleteWeight(id: string): Promise<void> {
  await (await getDb()).run('DELETE FROM weights WHERE id = ?', [id]);
  notify('weights');
}

// ---------- Dane ----------

export async function exportBackup(now: number): Promise<BackupFile> {
  const db = await getDb();
  const [fasts, weights, water, settings] = await Promise.all([
    allFasts(db),
    db.all<WeightEntry>('SELECT id, at, kg FROM weights ORDER BY at'),
    db.all<WaterEntry>('SELECT id, at, ml FROM water ORDER BY at'),
    settingsRecord(db),
  ]);
  return createBackup({ fasts, weights, water, settings: settings ? normalizeSettings(settings) : null }, now);
}

async function clearTables(tx: SqlExecutor): Promise<void> {
  await tx.exec('DELETE FROM fasts; DELETE FROM weights; DELETE FROM water; DELETE FROM settings;');
}

/** Zastępuje wszystkie dane zawartością kopii (atomowo). Format zgodny z wersją PWA. */
export async function importBackup(backup: BackupFile): Promise<void> {
  const db = await getDb();
  const settings = normalizeSettings(backup.data.settings ?? { ...DEFAULT_SETTINGS, onboardingDone: true });
  await db.transaction(async (tx) => {
    await clearTables(tx);
    for (const fast of backup.data.fasts) await insertFast(tx, fast);
    for (const w of backup.data.weights) {
      await tx.run('INSERT INTO weights (id, at, kg) VALUES (?, ?, ?)', [w.id, w.at, w.kg]);
    }
    for (const w of backup.data.water) {
      await tx.run('INSERT INTO water (id, at, ml) VALUES (?, ?, ?)', [w.id, w.at, w.ml]);
    }
    await writeSettings(tx, settings);
  });
  settingsStore.set(settings);
  notify('fasts', 'weights', 'water', 'settings');
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.transaction(clearTables);
  settingsStore.set(DEFAULT_SETTINGS);
  notify('fasts', 'weights', 'water', 'settings');
}
