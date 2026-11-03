import { implement } from "@eaa-check/capability/implement";
import {
  DailyCapReached,
  ScanUnavailable,
  sendMessageContract,
} from "@eaa-check/core";
import { MessageStore } from "@eaa-check/scan-store";
import { Clock, Effect } from "effect";

import { DAILY_MESSAGE_CAP } from "../site-limits.js";
import { newId } from "./new-id.js";

export const sendMessage = implement(sendMessageContract, (message) =>
  Effect.gen(function* keepMessageForStudio() {
    const store = yield* MessageStore;
    const receivedAt = yield* Clock.currentTimeMillis;
    const id = yield* newId("message");

    const outcome = yield* store
      .keep({ dailyCap: DAILY_MESSAGE_CAP, id, message, receivedAt })
      .pipe(
        Effect.tapError((error) =>
          Effect.logError("sendMessage store failed", error)
        ),
        Effect.mapError(() => new ScanUnavailable({ operation: "sendMessage" }))
      );

    if (outcome === "cap_reached") {
      return yield* new DailyCapReached({
        limit: DAILY_MESSAGE_CAP,
        what: "messages",
      });
    }

    return { received: true };
  })
);
