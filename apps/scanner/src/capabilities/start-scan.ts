import { implement } from "@eaa-check/capability/implement";
import {
  DailyCapReached,
  SCAN_FAILED,
  STALE_AFTER_MILLIS,
  ScanUnavailable,
  parseScanTarget,
  slugOf,
  startScanContract,
} from "@eaa-check/core";
import { ScanStore } from "@eaa-check/scan-store";
import { Clock, Effect } from "effect";

import { ScanLauncher } from "../scan-launcher.js";
import {
  DAILY_SCAN_CAP,
  REUSE_WITHIN_MILLIS,
  SITE_DAILY_SCAN_CAP,
} from "../site-limits.js";
import { newId } from "./new-id.js";

export const startScan = implement(startScanContract, ({ url }) =>
  Effect.gen(function* startScanOfSite() {
    const target = yield* Effect.fromResult(parseScanTarget(url));
    const store = yield* ScanStore;
    const launcher = yield* ScanLauncher;
    const requestedAt = yield* Clock.currentTimeMillis;
    const scanId = yield* newId("scan");
    const slug = slugOf(target.url);

    const outcome = yield* store
      .begin({
        dailyCap: DAILY_SCAN_CAP,
        requestedAt,
        reuseWithin: REUSE_WITHIN_MILLIS,
        scanId,
        siteCap: SITE_DAILY_SCAN_CAP,
        slug,
        staleAfter: STALE_AFTER_MILLIS,
        url: target.url,
      })
      .pipe(
        Effect.tapError((error) =>
          Effect.logError("startScan store failed", error)
        ),
        Effect.mapError(() => new ScanUnavailable({ operation: "startScan" }))
      );

    if (outcome.kind === "cap_reached") {
      return yield* new DailyCapReached({
        limit: DAILY_SCAN_CAP,
        what: "scans",
      });
    }

    if (outcome.kind === "site_cap_reached") {
      return yield* new DailyCapReached({
        limit: SITE_DAILY_SCAN_CAP,
        what: "scans of this site",
      });
    }

    if (outcome.kind === "reused") {
      return { scanId: outcome.scanId, slug };
    }

    yield* launcher.launch({ scanId, slug, target }).pipe(
      Effect.catch((error) =>
        Effect.logError("Scan launch failed", error).pipe(
          Effect.andThen(store.fail(scanId, SCAN_FAILED, requestedAt)),
          Effect.mapError(() => new ScanUnavailable({ operation: "startScan" }))
        )
      )
    );

    return { scanId, slug };
  })
);
