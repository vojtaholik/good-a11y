import type { D1Database } from "@cloudflare/workers-types";
import { NodeServices } from "@effect/platform-node";
import * as D1Client from "@effect/sql-d1/D1Client";
import * as SQLiteD1Drizzle from "drizzle-orm/effect-d1";
import { Effect, FileSystem, Layer, Path } from "effect";
import initSqlJs from "sql.js";
import type { Database, SqlValue } from "sql.js";

import { BrowserBudget } from "../src/browser-budget.js";
import { JudgeBudget } from "../src/judge-budget.js";
import { MessageStore } from "../src/message-store.js";
import { scanStoreMigrationDirectory } from "../src/migrations.js";
import { ScanStore } from "../src/scan-store.js";
import { StoreDatabase } from "../src/store-database.js";

const rowsOf = (
  database: Database,
  query: string,
  parameters: readonly SqlValue[]
) => {
  const statement = database.prepare(query);

  try {
    statement.bind([...parameters]);

    const rows: Record<string, SqlValue>[] = [];

    while (statement.step()) {
      rows.push(statement.getAsObject());
    }

    return rows;
  } finally {
    statement.free();
  }
};

const statementOver = (
  database: Database,
  query: string,
  parameters: readonly SqlValue[]
) => {
  const answer = () => ({
    meta: {},
    results: rowsOf(database, query, parameters),
    success: true,
  });

  return {
    // oxlint-disable-next-line typescript/promise-function-async -- D1 statements return Promises; this double answers at once.
    all: () => Promise.resolve(answer()),
    answer,
    bind: (...next: SqlValue[]) => statementOver(database, query, next),
    // oxlint-disable-next-line typescript/promise-function-async -- D1 statements return Promises; this double answers at once.
    raw: () =>
      Promise.resolve(
        rowsOf(database, query, parameters).map((row) => Object.values(row))
      ),
    // oxlint-disable-next-line typescript/promise-function-async -- D1 statements return Promises; this double answers at once.
    run: () => Promise.resolve(answer()),
  };
};

const d1Over = (database: Database) => {
  const double = {
    // oxlint-disable-next-line typescript/promise-function-async -- D1 batches return a Promise; this double answers at once.
    batch: (statements: readonly ReturnType<typeof statementOver>[]) =>
      Promise.resolve(statements.map((statement) => statement.answer())),
    prepare: (query: string) => statementOver(database, query, []),
  };

  // SAFETY: the Effect D1 client calls only prepare, bind, all, raw, run and batch, and this double implements each of them over SQLite.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- A test double of a platform binding implements the part of D1Database the client uses.
  return double as unknown as D1Database;
};

const localDatabase = Layer.effect(
  StoreDatabase,
  Effect.gen(function* openLocalDatabase() {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // @effect-diagnostics-next-line asyncFunction:off -- SQL.js initializes its local SQLite engine through a Promise API.
    const SQL = yield* Effect.promise(async () => await initSqlJs());

    const database = yield* Effect.acquireRelease(
      Effect.sync(() => new SQL.Database()),
      (connection) =>
        Effect.sync(() => {
          connection.close();
        })
    );

    const migrations = (yield* fileSystem.readDirectory(
      scanStoreMigrationDirectory
    )).toSorted();

    for (const directory of migrations) {
      const migration = yield* fileSystem.readFileString(
        path.resolve(scanStoreMigrationDirectory, directory, "migration.sql")
      );

      yield* Effect.sync(() => database.exec(migration));
    }

    const client = yield* Layer.build(D1Client.layer({ db: d1Over(database) }));

    return yield* SQLiteD1Drizzle.makeWithDefaults({}).pipe(
      Effect.provideContext(client)
    );
  })
).pipe(Layer.provide(NodeServices.layer));

export const localStores = Layer.mergeAll(
  ScanStore.layer,
  BrowserBudget.layer,
  JudgeBudget.layer,
  MessageStore.layer
).pipe(Layer.provideMerge(localDatabase));
