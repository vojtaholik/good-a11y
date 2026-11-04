import type { ContactMessage } from "@good-a11y/core";
import { eq, sql } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import { DAY_MILLIS } from "./daily-window.js";
import { failedDuring } from "./scan-store-error.js";
import type { ScanStoreError } from "./scan-store-error.js";
import { Messages } from "./schema/d1.js";
import { StoreDatabase } from "./store-database.js";

export interface NewMessage {
  readonly dailyCap: number;
  readonly id: string;
  readonly message: ContactMessage;
  readonly receivedAt: number;
}

export type KeepOutcome = "kept" | "cap_reached";

export class MessageStore extends Context.Service<
  MessageStore,
  {
    readonly keep: (
      message: NewMessage
    ) => Effect.Effect<KeepOutcome, ScanStoreError>;
  }
>()("@good-a11y/scan-store/MessageStore", {
  make: Effect.gen(function* makeMessageStore() {
    const db = yield* StoreDatabase;

    return {
      keep: Effect.fn("MessageStore.keep")(
        function* keep(entry: NewMessage) {
          const inserted = yield* db.all<{ readonly id: string }>(
            sql`INSERT OR IGNORE INTO messages (id, name, email, message, url, received_at) SELECT ${entry.id}, ${entry.message.name ?? null}, ${entry.message.email}, ${entry.message.message}, ${entry.message.url ?? null}, ${entry.receivedAt} WHERE (SELECT COUNT(*) FROM messages WHERE received_at > ${entry.receivedAt - DAY_MILLIS}) < ${entry.dailyCap} RETURNING id`
          );

          if (inserted.length > 0) {
            return "kept" as const;
          }

          const existing = yield* db
            .select({ id: Messages.id })
            .from(Messages)
            .where(eq(Messages.id, entry.id))
            .limit(1);

          return existing.length > 0
            ? ("kept" as const)
            : ("cap_reached" as const);
        },
        Effect.mapError(failedDuring("keep"))
      ),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
