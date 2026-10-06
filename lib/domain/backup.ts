import { isProtocolId } from './protocols';
import { normalizeSettings } from './settings';
import type { Fast, Settings, WaterEntry, WeightEntry } from './types';
import { KG_MAX, KG_MIN } from './weight';

/** Wersja formatu pliku eksportu – zwiększ razem z migracją schematu Dexie. */
export const BACKUP_SCHEMA_VERSION = 1;

export type BackupData = {
  fasts: Fast[];
  weights: WeightEntry[];
  water: WaterEntry[];
  settings: Settings | null;
};

export type BackupFile = {
  app: 'posto';
  schemaVersion: number;
  exportedAt: string;
  data: BackupData;
};

export type BackupCounts = { fasts: number; weights: number; water: number };

export type ParseBackupResult =
  { ok: true; backup: BackupFile; counts: BackupCounts } | { ok: false; error: 'json' | 'format' | 'version' };

export function createBackup(data: BackupData, now: number): BackupFile {
  return {
    app: 'posto',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date(now).toISOString(),
    data,
  };
}

export function backupFileName(now: number): string {
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `posto-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 100;

function parseFast(v: unknown): Fast | null {
  if (!isObject(v) || !isId(v.id) || !isFiniteNumber(v.startedAt)) return null;
  if (!isFiniteNumber(v.goalHours) || v.goalHours <= 0 || v.goalHours > 72) return null;
  if (!isProtocolId(v.protocolId)) return null;
  if (v.endedAt !== undefined && v.endedAt !== null) {
    if (!isFiniteNumber(v.endedAt) || v.endedAt < v.startedAt) return null;
  }
  const fast: Fast = { id: v.id, startedAt: v.startedAt, goalHours: v.goalHours, protocolId: v.protocolId };
  if (isFiniteNumber(v.endedAt)) fast.endedAt = v.endedAt;
  return fast;
}

function parseWeight(v: unknown): WeightEntry | null {
  if (!isObject(v) || !isId(v.id) || !isFiniteNumber(v.at) || !isFiniteNumber(v.kg)) return null;
  if (v.kg < KG_MIN || v.kg > KG_MAX) return null;
  return { id: v.id, at: v.at, kg: v.kg };
}

function parseWater(v: unknown): WaterEntry | null {
  if (!isObject(v) || !isId(v.id) || !isFiniteNumber(v.at) || !isFiniteNumber(v.ml)) return null;
  if (v.ml <= 0 || v.ml > 5000) return null;
  return { id: v.id, at: v.at, ml: v.ml };
}

function parseList<T>(value: unknown, parse: (v: unknown) => T | null): T[] | null {
  if (!Array.isArray(value)) return null;
  const out: T[] = [];
  for (const item of value) {
    const parsed = parse(item);
    if (!parsed) return null;
    out.push(parsed);
  }
  return out;
}

/** Waliduje plik importu. Odrzuca całość przy pierwszym błędnym rekordzie. */
export function parseBackup(text: string): ParseBackupResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'json' };
  }
  if (!isObject(json) || json.app !== 'posto' || !isFiniteNumber(json.schemaVersion)) {
    return { ok: false, error: 'format' };
  }
  if (json.schemaVersion > BACKUP_SCHEMA_VERSION || json.schemaVersion < 1) {
    return { ok: false, error: 'version' };
  }
  const data = json.data;
  if (!isObject(data)) return { ok: false, error: 'format' };

  const fasts = parseList(data.fasts, parseFast);
  const weights = parseList(data.weights, parseWeight);
  const water = parseList(data.water, parseWater);
  if (!fasts || !weights || !water) return { ok: false, error: 'format' };
  if (fasts.filter((f) => f.endedAt === undefined).length > 1) return { ok: false, error: 'format' };
  const ids = (list: { id: string }[]) => new Set(list.map((x) => x.id)).size === list.length;
  if (!ids(fasts) || !ids(weights) || !ids(water)) return { ok: false, error: 'format' };

  let settings: Settings | null = null;
  if (data.settings !== undefined && data.settings !== null) {
    if (!isObject(data.settings)) return { ok: false, error: 'format' };
    settings = normalizeSettings(data.settings as Partial<Settings>);
  }

  return {
    ok: true,
    backup: {
      app: 'posto',
      schemaVersion: json.schemaVersion,
      exportedAt: typeof json.exportedAt === 'string' ? json.exportedAt : '',
      data: { fasts, weights, water, settings },
    },
    counts: { fasts: fasts.length, weights: weights.length, water: water.length },
  };
}
