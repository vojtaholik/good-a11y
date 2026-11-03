import type { ScanJob } from "@eaa-check/core";
import { localStores } from "@eaa-check/scan-store/testing";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Ref } from "effect";

import { getScan, sendMessage, startScan } from "../src/capabilities/index.js";
import { ScanLauncher } from "../src/scan-launcher.js";

const launched = Ref.makeUnsafe<readonly ScanJob[]>([]);

const site = Layer.mergeAll(
  localStores,
  Layer.succeed(
    ScanLauncher,
    ScanLauncher.of({
      launch: (job) => Ref.update(launched, (jobs) => [...jobs, job]),
    })
  )
);

describe("site capabilities", () => {
  it.layer(site)((scoped) => {
    scoped.effect("starts one Workflow per new address and reuses it", () =>
      Effect.gen(function* startsAndReuses() {
        const first = yield* startScan.handler({ url: "Example.com" });

        const again = yield* startScan.handler({
          url: "https://example.com/",
        });

        expect(first.slug).toBe("example.com");
        expect(again.scanId).toBe(first.scanId);
        expect((yield* Ref.get(launched)).map((job) => job.scanId)).toEqual([
          first.scanId,
        ]);

        const view = yield* getScan.handler({ slug: "example.com" });

        expect(view.stage).toBe("queued");
        expect(view.report).toBeNull();
      })
    );

    scoped.effect("reads the visitor's own scan while a newer one runs", () =>
      Effect.gen(function* followsOwnScan() {
        const mine = yield* startScan.handler({
          url: "https://own.example.com/",
        });

        const theirs = yield* startScan.handler({
          url: "https://own.example.com/other",
        });

        const followed = yield* getScan.handler({
          scanId: mine.scanId,
          slug: "own.example.com",
        });

        const newest = yield* getScan.handler({ slug: "own.example.com" });

        expect(followed.scanId).toBe(mine.scanId);
        expect(newest.scanId).toBe(theirs.scanId);
      })
    );

    scoped.effect("does not read a scan ID under another site", () =>
      Effect.gen(function* otherSite() {
        const mine = yield* startScan.handler({
          url: "https://own.example.com/",
        });

        const error = yield* Effect.flip(
          getScan.handler({ scanId: mine.scanId, slug: "never.example" })
        );

        expect(error._tag).toBe("UnknownScan");
      })
    );

    scoped.effect("refuses an address that is not public", () =>
      Effect.gen(function* refuses() {
        const error = yield* Effect.flip(
          startScan.handler({ url: "http://10.0.0.1/" })
        );

        expect(error._tag).toBe("ScanTargetRejected");
      })
    );

    scoped.effect("names an address it never scanned", () =>
      Effect.gen(function* unknown() {
        const error = yield* Effect.flip(
          getScan.handler({ slug: "never.example" })
        );

        expect(error._tag).toBe("UnknownScan");
      })
    );
    scoped.effect("keeps a visitor's message with the scanned page", () =>
      Effect.gen(function* keepsMessage() {
        expect(
          yield* sendMessage.handler({
            email: "owner@example.com",
            message: "Please review this page.",
            url: "https://example.com/",
          })
        ).toEqual({ received: true });
      })
    );
  });
});
