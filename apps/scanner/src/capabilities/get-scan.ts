import { implement } from "@eaa-check/capability/implement";
import {
  ScanUnavailable,
  UnknownScan,
  getScanContract,
  readAt,
  slugKey,
} from "@eaa-check/core";
import { ScanStore } from "@eaa-check/scan-store";
import { Clock, Effect, Option } from "effect";

export const getScan = implement(getScanContract, ({ scanId, slug }) =>
  Effect.gen(function* getScanOfSite() {
    const store = yield* ScanStore;

    const read =
      scanId === undefined
        ? store.latest(slugKey(slug))
        : store.one(slugKey(slug), scanId);

    const latest = yield* read.pipe(
      Effect.tapError((error) =>
        Effect.logError("getScan store failed", error)
      ),
      Effect.mapError(() => new ScanUnavailable({ operation: "getScan" }))
    );

    if (Option.isNone(latest)) {
      return yield* new UnknownScan({ slug });
    }

    return readAt(latest.value, yield* Clock.currentTimeMillis);
  })
);
