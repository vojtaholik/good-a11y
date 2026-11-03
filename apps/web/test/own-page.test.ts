import { reportOf, runChecks } from "@eaa-check/core";
import type { ScanView } from "@eaa-check/core";
import { readPage } from "@eaa-check/html-reader";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";

import SHELL from "../index.html?raw";
import {
  ContactState,
  CopyState,
  ScanState,
  StartState,
} from "../src/client/model.js";
import type { AppModel } from "../src/client/model.js";
import { AppRoute } from "../src/features/route.js";
import { view } from "../src/features/view.js";

const SCANNED = `<!doctype html><html><head><title></title></head><body>
<img src="a.png"><a href="/x"></a><button></button><input type="text">
</body></html>`;

const failing = (html: string) =>
  runChecks(readPage(html)).filter((finding) => finding.status === "fail");

const pageOf = (model: AppModel) =>
  renderToString(
    { init: () => ({ model }), view },
    { isHydratable: false }
  ).pipe(
    Effect.map((rendered) =>
      SHELL.replace(
        '<div id="root"></div>',
        `<div id="root">${rendered.html}</div>`
      ).replace("<title>eaa-check</title>", `<title>${rendered.title}</title>`)
    )
  );

const home: AppModel = {
  contact: { email: "", message: "", name: "", state: ContactState.Editing() },
  copy: CopyState.Idle(),
  generation: 0,
  route: AppRoute.Home(),
  scan: ScanState.Idle(),
  start: StartState.Idle(),
  url: "",
};

const publishedScan = (): ScanView => ({
  failure: null,
  report: reportOf(
    {
      finalUrl: "https://example.com/",
      httpStatus: 200,
      outcome: "checked",
      outcomeDetail: "The page was read.",
      requestedUrl: "https://example.com/",
      scannedAt: "2026-11-03T00:00:00.000Z",
      truncated: false,
    },
    runChecks(readPage(SCANNED))
  ),
  requestedAt: 0,
  scanId: "scan-1",
  slug: "example.com",
  stage: "published",
  url: "https://example.com/",
});

describe("our own page", () => {
  it("is a fixture with failures, so the checks below can see one", () => {
    expect(failing(SCANNED).length).toBeGreaterThan(0);
  });

  it.effect("passes our own checks on the start page", () =>
    Effect.gen(function* startPage() {
      const html = yield* pageOf(home);

      expect(failing(html)).toEqual([]);
      expect(html).toContain('href="/checks"');
    })
  );

  it.effect("passes our own checks on the page that lists what we check", () =>
    Effect.gen(function* checksPage() {
      const html = yield* pageOf({ ...home, route: AppRoute.Checks() });

      expect(failing(html)).toEqual([]);
      expect(html).toContain("<title>What we check | eaa-check</title>");
      expect(html).toContain("1.1.1 Non-text Content (Level A)");
      expect(html).toContain("2.5.8 Target Size (Minimum) (Level AA)");
      expect(html).toContain("Not automated.");
      expect(html.toLowerCase()).not.toContain("compliant");
    })
  );

  it.effect("passes our own checks on a report full of findings", () =>
    Effect.gen(function* reportPage() {
      const html = yield* pageOf({
        ...home,
        route: AppRoute.Report({ slug: "example.com" }),
        scan: ScanState.Settled({ view: publishedScan() }),
      });

      const order = [
        "issues found by",
        "Issues (",
        "Where the EAA applies",
        "had nothing to check",
        "About the rules",
        "Send message",
      ].map((marker) => html.indexOf(marker));

      expect(order.map((index) => index >= 0)).toEqual(order.map(() => true));
      expect(order).toEqual(order.toSorted((left, right) => left - right));
      expect(html).toContain("Send message");
      expect(html).toContain('href="/checks"');
      expect(html).toContain(
        "studio9 keeps your e-mail, name, message and the scanned address only to answer you."
      );
      expect(html.toLowerCase()).not.toContain("compliant");
      expect(failing(html)).toEqual([]);
    })
  );
});
