import Dexie, { type EntityTable } from 'dexie';
import type { Fast, Settings, WaterEntry, WeightEntry } from '@/lib/domain/types';

export const DB_NAME = 'posto';

export class PostoDB extends Dexie {
  fasts!: EntityTable<Fast, 'id'>;
  weights!: EntityTable<WeightEntry, 'id'>;
  water!: EntityTable<WaterEntry, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor(name = DB_NAME) {
    super(name);
    // Wersjonowany schemat – kolejne zmiany dodawaj jako this.version(2).stores(...).upgrade(...)
    this.version(1).stores({
      fasts: 'id, startedAt, endedAt',
      weights: 'id, at',
      water: 'id, at',
      settings: 'id',
    });
  }
}

let instance: PostoDB | null = null;

/** Leniwie tworzona instancja – na serwerze (prerender) nie jest używana. */
export function getDb(): PostoDB {
  instance ??= new PostoDB();
  return instance;
}

/** Tylko do testów. */
export function setDbForTests(db: PostoDB | null): void {
  instance = db;
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
