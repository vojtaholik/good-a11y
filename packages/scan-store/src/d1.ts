import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import {
  scanStoreMigrationDirectory,
  scanStoreSchemaFile,
} from "./migrations.js";
import { ScanStore } from "./scan-store.js";
import { StoreDatabase } from "./store-database.js";

export const ScanDatabase = Effect.gen(function* declareScanDatabase() {
  const migrations = yield* Drizzle.Schema("ScanStoreSchema", {
    dialect: "sqlite",
    out: scanStoreMigrationDirectory,
    schema: scanStoreSchemaFile,
  });

  return yield* Cloudflare.D1.Database("ScanDatabase", { migrations });
});

const storeDatabaseD1 = Layer.effect(
  StoreDatabase,
  Effect.gen(function* bindStoreDatabase() {
    const database = yield* ScanDatabase;
    const client = yield* Cloudflare.D1.QueryDatabase(database);

    return yield* Drizzle.D1(client);
  })
).pipe(Layer.provide(Cloudflare.D1.QueryDatabaseBinding));

export const scanStoreD1 = ScanStore.layer.pipe(Layer.provide(storeDatabaseD1));
