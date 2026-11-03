import { implement } from "@eaa-check/capability/implement";
import { UnknownScan, getScanContract, readAt, slugKey } from "@eaa-check/core";
import { ScanStore } from "@eaa-check/scan-store";
import { Clock, Effect, Option } from "effect";

export const getScan = implement(getScanContract, ({ slug }) =>
  Effect.gen(function* getScanOfSite() {
    const store = yield* ScanStore;
    const latest = yield* store.latest(slugKey(slug)).pipe(Effect.orDie);

    if (Option.isNone(latest)) {
      return yield* new UnknownScan({ slug });
    }

    return readAt(latest.value, yield* Clock.currentTimeMillis);
  })
);
