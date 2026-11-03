import { sql } from "drizzle-orm";
import { Context, DateTime, Effect, Layer } from "effect";

import { failedDuring } from "./scan-store-error.js";
import type { ScanStoreError } from "./scan-store-error.js";
import { StoreDatabase } from "./store-database.js";

export interface Reservation {
  readonly dailySeconds: number;
  readonly day: string;
  readonly seconds: number;
}

export const utcDayOf = (millis: number): string =>
  DateTime.formatIsoDateUtc(DateTime.makeUnsafe(millis));

export class BrowserBudget extends Context.Service<
  BrowserBudget,
  {
    readonly reserve: (
      reservation: Reservation
    ) => Effect.Effect<boolean, ScanStoreError>;
  }
>()("@eaa-check/scan-store/BrowserBudget", {
  make: Effect.gen(function* makeBrowserBudget() {
    const db = yield* StoreDatabase;

    return {
      reserve: Effect.fn("BrowserBudget.reserve")(
        function* reserve({ dailySeconds, day, seconds }: Reservation) {
          if (seconds > dailySeconds) {
            return false;
          }

          const changed = yield* db.all<{ readonly day: string }>(
            sql`INSERT INTO browser_budget (day, reserved_seconds) VALUES (${day}, ${seconds}) ON CONFLICT (day) DO UPDATE SET reserved_seconds = reserved_seconds + ${seconds} WHERE reserved_seconds + ${seconds} <= ${dailySeconds} RETURNING day`
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
