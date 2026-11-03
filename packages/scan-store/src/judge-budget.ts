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

export interface TokenSettlement {
  readonly day: string;
  readonly reserved: number;
  readonly used: number;
}

export class JudgeBudget extends Context.Service<
  JudgeBudget,
  {
    readonly reserve: (
      reservation: TokenReservation
    ) => Effect.Effect<boolean, ScanStoreError>;
    readonly settle: (
      settlement: TokenSettlement
    ) => Effect.Effect<void, ScanStoreError>;
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
      settle: Effect.fn("JudgeBudget.settle")(
        function* settle({ day, reserved, used }: TokenSettlement) {
          yield* db.all<{ readonly day: string }>(
            sql`UPDATE judge_budget SET reserved_tokens = MAX(0, reserved_tokens + ${Math.max(0, used)} - ${Math.max(0, reserved)}) WHERE day = ${day} RETURNING day`
          );
        },
        Effect.mapError(failedDuring("settle"))
      ),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
