import type { SqlDatabase } from './sql';

/**
 * Wersjonowany schemat (PRAGMA user_version). Kolejną zmianę dopisz jako MIGRATIONS[2]
 * i podnieś SCHEMA_VERSION – starsze bazy przejdą przez wszystkie brakujące kroki.
 */
export const SCHEMA_VERSION = 1;

const MIGRATIONS: Record<number, string> = {
  1: `
    CREATE TABLE fasts (
      id TEXT PRIMARY KEY NOT NULL,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      goal_hours REAL NOT NULL,
      protocol_id TEXT NOT NULL
    );
    CREATE INDEX fasts_started_at ON fasts (started_at);
    CREATE INDEX fasts_ended_at ON fasts (ended_at);
    CREATE TABLE weights (id TEXT PRIMARY KEY NOT NULL, at INTEGER NOT NULL, kg REAL NOT NULL);
    CREATE INDEX weights_at ON weights (at);
    CREATE TABLE water (id TEXT PRIMARY KEY NOT NULL, at INTEGER NOT NULL, ml INTEGER NOT NULL);
    CREATE INDEX water_at ON water (at);
    CREATE TABLE settings (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);
  `,
};

export async function migrate(db: SqlDatabase): Promise<void> {
  const row = await db.first<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version > SCHEMA_VERSION) throw new Error(`Database version ${version} is newer than app (${SCHEMA_VERSION})`);
  while (version < SCHEMA_VERSION) {
    const next = version + 1;
    await db.transaction(async (tx) => {
      await tx.exec(MIGRATIONS[next]);
      await tx.exec(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}
