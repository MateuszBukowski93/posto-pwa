/**
 * Minimalny interfejs bazy SQL. W aplikacji implementuje go expo-sqlite (./expo.ts),
 * w testach wbudowany `node:sqlite` (./node.ts) – repozytorium nie zależy od Expo.
 */

export type SqlValue = string | number | null;

export interface SqlExecutor {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  first<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
}

export interface SqlDatabase extends SqlExecutor {
  /** Atomowo: błąd w `fn` wycofuje wszystkie zmiany. */
  transaction<T>(fn: (tx: SqlExecutor) => Promise<T>): Promise<T>;
}

/** Sterownik bez kolejkowania – `transaction` dostaje zadanie, które wykonuje zapytania na tym samym połączeniu. */
export type RawDriver = SqlExecutor & {
  transaction<T>(fn: () => Promise<T>): Promise<T>;
};

/**
 * Wszystkie operacje idą przez jedną kolejkę, więc odczyt z widoku nie wejdzie w środek
 * transakcji zapisu (expo-sqlite dołączyłby go do niej) i nie ma wyścigów między zapisami.
 */
export function serialized(raw: RawDriver): SqlDatabase {
  let tail: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    const result = tail.then(task, task);
    tail = result.catch(() => undefined);
    return result;
  };
  const direct: SqlExecutor = {
    exec: (sql) => raw.exec(sql),
    run: (sql, params) => raw.run(sql, params),
    all: (sql, params) => raw.all(sql, params),
    first: (sql, params) => raw.first(sql, params),
  };
  return {
    exec: (sql) => enqueue(() => raw.exec(sql)),
    run: (sql, params) => enqueue(() => raw.run(sql, params)),
    all: (sql, params) => enqueue(() => raw.all(sql, params)),
    first: (sql, params) => enqueue(() => raw.first(sql, params)),
    transaction: (fn) => enqueue(() => raw.transaction(() => fn(direct))),
  };
}
