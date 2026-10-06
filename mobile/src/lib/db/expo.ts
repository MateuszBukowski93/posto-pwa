import * as SQLite from 'expo-sqlite';
import { serialized, type SqlDatabase } from './sql';

export async function openExpoDatabase(name: string): Promise<SqlDatabase> {
  const db = await SQLite.openDatabaseAsync(name);
  return serialized({
    exec: (sql) => db.execAsync(sql),
    run: async (sql, params = []) => {
      await db.runAsync(sql, params);
    },
    all: (sql, params = []) => db.getAllAsync(sql, params),
    first: (sql, params = []) => db.getFirstAsync(sql, params),
    transaction: async (fn) => {
      let result: Awaited<ReturnType<typeof fn>> | undefined;
      await db.withTransactionAsync(async () => {
        result = await fn();
      });
      return result as Awaited<ReturnType<typeof fn>>;
    },
  });
}
