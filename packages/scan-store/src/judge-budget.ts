import { sql } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import { failedDuring } from "./scan-store-error.js";
import type { ScanStoreError } from "./scan-store-error.js";
import { StoreDatabase } from "./store-database.js";

export interface TokenReservation {
  readonly dailyTokens: number;
  readonly day: string;
  readonly tokens: number;
}

export class JudgeBudget extends Context.Service<
  JudgeBudget,
  {
    readonly reserve: (
      reservation: TokenReservation
    ) => Effect.Effect<boolean, ScanStoreError>;
  }
>()("@eaa-check/scan-store/JudgeBudget", {
  make: Effect.gen(function* makeJudgeBudget() {
    const db = yield* StoreDatabase;

    return {
      reserve: Effect.fn("JudgeBudget.reserve")(
        function* reserve({ dailyTokens, day, tokens }: TokenReservation) {
          if (tokens > dailyTokens) {
            return false;
          }

          const changed = yield* db.all<{ readonly day: string }>(
            sql`INSERT INTO judge_budget (day, reserved_tokens) VALUES (${day}, ${tokens}) ON CONFLICT (day) DO UPDATE SET reserved_tokens = reserved_tokens + ${tokens} WHERE reserved_tokens + ${tokens} <= ${dailyTokens} RETURNING day`
          );

          return changed.length > 0;
        },
        Effect.mapError(failedDuring("reserve"))
      ),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
