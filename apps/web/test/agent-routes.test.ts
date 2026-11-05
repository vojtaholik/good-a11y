import { describe, expect, it } from "@effect/vitest";
import { implement } from "@good-a11y/capability/implement";
import { toRpc } from "@good-a11y/capability/rpc";
import { reportOf, runChecks } from "@good-a11y/core";
import {
  DailyCapReached,
  UnknownScan,
  getScanContract,
  sendMessageContract,
  startScanContract,
} from "@good-a11y/core/contracts";
import type { ScanView } from "@good-a11y/core/contracts";
import { GUIDES } from "@good-a11y/guides/data";
import { readPage } from "@good-a11y/html-reader";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/http";
import { RpcSerialization, RpcServer } from "effect/rpc";

import {
  POLL_SECONDS,
  RATE_LIMIT_SECONDS,
} from "../src/server/check-markdown.js";
import { CALLER_HEADER, callerKey } from "../src/server/handler.js";
import type { BackendFetch } from "../src/server/rpc.js";
import { siteHandler } from "../src/server/site.js";

const ORIGIN = "https://good-a11y.example";

const IP = "203.0.113.7";

const REPORT = reportOf(
  {
    finalUrl: "https://example.com/",
    httpStatus: 200,
    outcome: "checked",
    outcomeDetail: "The page was read.",
    requestedUrl: "https://example.com/",
    scannedAt: "2026-11-03T00:00:00.000Z",
    truncated: false,
  },
  runChecks(
    readPage("<!doctype html><html><body><img src=a.png></body></html>")
  )
);

interface Scanner {
  capped: boolean;
  readonly scans: ScanView[];
  readonly started: string[];
}

const scannerCapabilities = (scanner: Scanner) => [
  implement(startScanContract, ({ url }) => {
    if (scanner.capped) {
      return Effect.fail(new DailyCapReached({ limit: 200, what: "scans" }));
    }

    scanner.started.push(url);

    const target = new URL(`https://${url.replace(/^https?:\/\//u, "")}`).href;

    const reusable = scanner.scans.find(
      (scan) => scan.url === target && scan.stage !== "failed"
    );

    if (reusable !== undefined) {
      return Effect.succeed({ scanId: reusable.scanId, slug: reusable.slug });
    }

    const scan: ScanView = {
      failure: null,
      report: null,
      requestedAt: 0,
      scanId: `scan-${scanner.scans.length + 1}`,
      slug: new URL(target).hostname,
      stage: "queued",
      url: target,
    };

    scanner.scans.unshift(scan);

    return Effect.succeed({ scanId: scan.scanId, slug: scan.slug });
  }),
  implement(getScanContract, ({ scanId, slug }) => {
    const scan = scanner.scans.find((candidate) =>
      scanId === undefined
        ? candidate.slug === slug
        : candidate.scanId === scanId
    );

    return scan === undefined
      ? Effect.fail(new UnknownScan({ slug }))
      : Effect.succeed(scan);
  }),
  implement(sendMessageContract, () => Effect.succeed({ received: true })),
];

const backendFor = (scanner: Scanner, callers: (string | null)[]) =>
  Effect.gen(function* startBackend() {
    const projection = toRpc(scannerCapabilities(scanner));

    const { dispose, handler } = HttpRouter.toWebHandler(
      RpcServer.layerHttp({
        group: projection.group,
        path: "/rpc",
        protocol: "http",
      }).pipe(
        Layer.provideMerge(projection.layer),
        Layer.provide(RpcSerialization.layerJson)
      ),
      { disableLogger: true }
    );

    yield* Effect.addFinalizer(() => Effect.promise(dispose));

    const backend: BackendFetch =
      // @effect-diagnostics-next-line asyncFunction:off -- Stands in for the scanner's Promise-returning service binding.
      async (request) => {
        callers.push(request.headers.get(CALLER_HEADER));

        return await handler(request);
      };

    return backend;
  });

const siteWith = (scanner: Scanner, budget = 5) =>
  Effect.gen(function* makeSite() {
    const callers: (string | null)[] = [];
    const limited: string[] = [];
    const backend = yield* backendFor(scanner, callers);

    const site = siteHandler(
      backend,
      // @effect-diagnostics-next-line asyncFunction:off -- Stands in for the Promise-returning ASSETS binding.
      async () => await Promise.resolve(new Response(null, { status: 404 })),
      ORIGIN,
      // @effect-diagnostics-next-line asyncFunction:off -- Stands in for the Promise-returning rate limit binding.
      async (procedure, caller) => {
        limited.push(`${procedure}:${caller}`);

        return await Promise.resolve(limited.length <= budget);
      },
      ""
    );

    const get = (path: string) =>
      // @effect-diagnostics-next-line asyncFunction:off -- The handler under test is a Promise boundary.
      Effect.promise(async () => {
        const response = await site(
          new Request(`${ORIGIN}${path}`, {
            headers: { "cf-connecting-ip": IP },
          })
        );

        return { body: await response.text(), response };
      });

    return { callers, get, limited };
  });

const freshScanner = (): Scanner => ({ capped: false, scans: [], started: [] });

const [firstGuide] = GUIDES;

describe("/search.md", () => {
  it.effect("lists the guides that match, each linked as Markdown", () =>
    Effect.gen(function* search() {
      const { get } = yield* siteWith(freshScanner());
      const { body, response } = yield* get("/search.md?q=modal+dialog+focus");

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/markdown");
      expect(response.headers.get("cache-control")).toContain("max-age");
      expect(body).toContain('# Guides for "modal dialog focus"');
      expect(body).toMatch(
        /^- \[[^\]]+\]\(https:\/\/good-a11y\.example\/dialog-modal\.md\) `dialog-modal`: /mu
      );
    })
  );

  it.effect("says so when nothing matches, and asks for words when empty", () =>
    Effect.gen(function* emptySearch() {
      const { get } = yield* siteWith(freshScanner());
      const none = yield* get("/search.md?q=zzzzqqqq");
      const empty = yield* get("/search.md");

      expect(none.body).toContain("No guide matches.");
      expect(empty.response.status).toBe(400);
      expect(empty.body).toContain("/search.md?q=");
    })
  );
});

describe("/<id>.md", () => {
  it.effect("serves the guide as Markdown without an Accept header", () =>
    Effect.gen(function* guideFile() {
      const { get } = yield* siteWith(freshScanner());
      const guide = yield* get(`/${firstGuide?.id ?? ""}.md`);
      const missing = yield* get("/no-such-guide.md");

      expect(guide.response.status).toBe(200);
      expect(guide.response.headers.get("content-type")).toContain(
        "text/markdown"
      );
      expect(guide.body).toContain(`# ${firstGuide?.name ?? ""}`);
      expect(guide.body).toContain("## WCAG success criteria");
      expect(missing.response.status).toBe(404);
    })
  );
});

describe("/check.md", () => {
  it.effect(
    "starts a scan as the caller, then answers running until the report is there",
    () =>
      Effect.gen(function* checkFlow() {
        const scanner = freshScanner();
        const { callers, get, limited } = yield* siteWith(scanner);

        const first = yield* get("/check.md?url=example.com");

        expect(first.response.status).toBe(200);
        expect(first.response.headers.get("retry-after")).toBe(
          String(POLL_SECONDS)
        );
        expect(first.response.headers.get("cache-control")).toBe("no-store");
        expect(first.body).toContain(
          `Fetch this same URL again in ${POLL_SECONDS} seconds: ${ORIGIN}/check.md?url=example.com`
        );
        expect(scanner.started).toEqual(["example.com"]);
        expect(callers.every((caller) => caller === callerKey(IP))).toBe(true);

        const polled = yield* get("/check.md?url=example.com");

        expect(polled.response.headers.get("retry-after")).toBe(
          String(POLL_SECONDS)
        );
        expect(scanner.started).toEqual(["example.com"]);
        expect(limited).toEqual([`startScan:${callerKey(IP)}`]);

        const [scan] = scanner.scans;

        if (scan !== undefined) {
          scanner.scans[0] = { ...scan, report: REPORT, stage: "published" };
        }

        const done = yield* get("/check.md?url=example.com");

        expect(done.response.status).toBe(200);
        expect(done.response.headers.get("retry-after")).toBeNull();
        expect(done.body).toContain("does not meet WCAG 2.1 Level AA");
        expect(done.body).toContain(`${ORIGIN}/check/example.com`);
        expect(scanner.scans).toHaveLength(1);
      })
  );

  it.effect("refuses what the form refuses, before any scan starts", () =>
    Effect.gen(function* refusals() {
      const scanner = freshScanner();
      const { callers, get } = yield* siteWith(scanner);

      const local = yield* get("/check.md?url=http://localhost:3000");
      const empty = yield* get("/check.md");

      expect(local.response.status).toBe(400);
      expect(local.body).toContain("# Cannot check this address");
      expect(empty.response.status).toBe(400);
      expect(empty.body).toContain(`${ORIGIN}/check.md?url=example.com`);
      expect(callers).toEqual([]);
    })
  );

  it.effect("answers 429 at the caller's rate limit and the daily cap", () =>
    Effect.gen(function* limits() {
      const scanner = freshScanner();
      const { get } = yield* siteWith(scanner, 0);

      const limitedOut = yield* get("/check.md?url=example.com");

      expect(limitedOut.response.status).toBe(429);
      expect(limitedOut.response.headers.get("retry-after")).toBe(
        String(RATE_LIMIT_SECONDS)
      );
      expect(scanner.started).toEqual([]);

      const capped = { ...freshScanner(), capped: true };
      const site = yield* siteWith(capped);
      const capReached = yield* site.get("/check.md?url=example.com");

      expect(capReached.response.status).toBe(429);
      expect(capReached.body).toContain("Today's cap of 200 new scans");
    })
  );
});
