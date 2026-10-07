/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { serialized, type SqlDatabase, type SqlValue } from './sql';

/** Baza w pamięci na wbudowanym `node:sqlite` – tylko do testów. */
export function openNodeDatabase(): SqlDatabase {
  const db = new DatabaseSync(':memory:');
  // node:sqlite zwraca obiekty bez prototypu – kopiujemy, żeby porównania w testach były zwykłe
  const plain = <T>(row: unknown) => ({ ...(row as object) }) as T;
  return serialized({
    exec: async (sql) => {
      db.exec(sql);
    },
    run: async (sql, params = []) => {
      db.prepare(sql).run(...params);
    },
    all: async <T>(sql: string, params: SqlValue[] = []) =>
      db
        .prepare(sql)
        .all(...params)
        .map((row) => plain<T>(row)),
    first: async <T>(sql: string, params: SqlValue[] = []) => {
      const row = db.prepare(sql).get(...params);
      return row === undefined ? null : plain<T>(row);
    },
    transaction: async (fn) => {
      db.exec('BEGIN');
      try {
        const result = await fn();
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  });
}
