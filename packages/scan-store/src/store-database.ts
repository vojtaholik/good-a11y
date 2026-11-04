import type { EffectSQLiteD1Database } from "drizzle-orm/effect-d1";
import { Context } from "effect";

export class StoreDatabase extends Context.Service<
  StoreDatabase,
  EffectSQLiteD1Database
>()("@good-a11y/scan-store/StoreDatabase") {}
