import { migrate } from './schema';
import type { SqlDatabase } from './sql';

let ready: Promise<SqlDatabase> | null = null;

/** Otwiera bazę i wykonuje migracje (raz na uruchomienie aplikacji). */
export function initDatabase(open: () => Promise<SqlDatabase>): Promise<SqlDatabase> {
  ready ??= open().then(async (db) => {
    await migrate(db);
    return db;
  });
  return ready;
}

export function getDb(): Promise<SqlDatabase> {
  if (!ready) throw new Error('Database is not initialized');
  return ready;
}

/** Tylko do testów. */
export function setDbForTests(db: SqlDatabase | null): void {
  ready = db ? Promise.resolve(db) : null;
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- powiadamianie widoków o zmianach ----------

export type Table = 'fasts' | 'weights' | 'water' | 'settings';

const listeners = new Map<Table, Set<() => void>>();

export function subscribe(tables: readonly Table[], listener: () => void): () => void {
  for (const table of tables) {
    let set = listeners.get(table);
    if (!set) {
      set = new Set();
      listeners.set(table, set);
    }
    set.add(listener);
  }
  return () => tables.forEach((table) => listeners.get(table)?.delete(listener));
}

export function notify(...tables: Table[]): void {
  const called = new Set<() => void>();
  for (const table of tables) {
    listeners.get(table)?.forEach((listener) => {
      if (called.has(listener)) return;
      called.add(listener);
      listener();
    });
  }
}
