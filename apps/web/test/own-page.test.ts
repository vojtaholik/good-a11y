import { describe, expect, it } from "@effect/vitest";
import { CONTACT_SHOWN, reportOf, runChecks } from "@good-a11y/core";
import type { ScanView } from "@good-a11y/core";
import { readPage } from "@good-a11y/html-reader";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";
import type { HtmlBuilder } from "foldkit/html";

import SHELL from "../index.html?raw";
import type { AppMessage } from "../src/client/message.js";
import {
  ContactState,
  CopyState,
  ScanState,
  StartState,
} from "../src/client/model.js";
import type { AppModel } from "../src/client/model.js";
import { contactPageView } from "../src/features/contact-view.js";
import { GUIDE_PAGES } from "../src/features/guides.js";
import { AppRoute } from "../src/features/route.js";
import { pageShell } from "../src/features/shell.js";
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
      ).replace("<title>good-a11y</title>", `<title>${rendered.title}</title>`)
    )
  );

const home: AppModel = {
  contact: { email: "", message: "", name: "", state: ContactState.Editing() },
  copy: CopyState.Idle(),
  generation: 0,
  origin: "https://good-a11y.example",
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
      expect(html).toContain('href="/check"');
      expect(html).toContain('href="/dialog-modal"');
    })
  );

  it.effect("passes our own checks on every guide page", () =>
    Effect.gen(function* guidePages() {
      for (const page of GUIDE_PAGES) {
        const html = yield* pageOf({
          ...home,
          route: AppRoute.Guide({ guideId: page.id }),
        });

        expect(failing(html)).toEqual([]);
        expect(html).toContain(`src="/${page.id}/demo.html"`);
        expect(html).toContain(`retrieve ${page.id}`);
      }
    })
  );

  it.effect(
    "passes our own checks on the hidden contact page, in every state",
    () =>
      Effect.gen(function* contactPage() {
        const typed = {
          email: "ada@",
          message: "",
          name: "Ada",
        };

        for (const state of [
          ContactState.Editing(),
          ContactState.Invalid({ fields: ["email", "message"] }),
          ContactState.Sending(),
          ContactState.Sent(),
          ContactState.Unavailable(),
        ]) {
          const rendered = yield* renderToString(
            {
              init: () => ({
                model: {
                  ...home,
                  contact: { ...typed, state },
                  route: AppRoute.Contact(),
                },
              }),
              view: (model: AppModel, h: HtmlBuilder<AppMessage>) => ({
                ...view(model, h),
                body: pageShell(model.route, contactPageView(model, h), h),
              }),
            },
            { isHydratable: false }
          );

          const html = SHELL.replace(
            '<div id="root"></div>',
            `<div id="root">${rendered.html}</div>`
          ).replace(
            "<title>good-a11y</title>",
            "<title>Contact | good-a11y</title>"
          );

          expect(failing(html)).toEqual([]);
          expect(html).not.toContain("studio9");
        }
      })
  );

  it.effect("passes our own checks on the page that lists what we check", () =>
    Effect.gen(function* checksPage() {
      const html = yield* pageOf({ ...home, route: AppRoute.Check({}) });

      expect(failing(html)).toEqual([]);
      expect(html).toContain("<title>Check a page | good-a11y</title>");
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
      ].map((marker) => html.lastIndexOf(marker));

      expect(order.map((index) => index >= 0)).toEqual(order.map(() => true));
      expect(order).toEqual(order.toSorted((left, right) => left - right));
      expect(html).toContain('href="/check#what-we-check"');
      expect(html).toContain('href="/image-alt"');
      expect(html).toContain('href="/icon-buttons"');
      expect(html.includes("Send message")).toBe(CONTACT_SHOWN);
      expect(html.includes("studio9")).toBe(CONTACT_SHOWN);
      expect(html.toLowerCase()).not.toContain("compliant");
      expect(failing(html)).toEqual([]);
    })
  );

  it.effect(
    "leaves the judged section out when the model was asked nothing",
    () =>
      Effect.gen(function* reportPage() {
        const scan = publishedScan();

        const html = yield* pageOf({
          ...home,
          route: AppRoute.Report({ slug: "example.com" }),
          scan: ScanState.Settled({
            view: {
              ...scan,
              report:
                scan.report === null
                  ? null
                  : {
                      ...scan.report,
                      judged: {
                        inputTokens: 0,
                        label: "Judged by a model",
                        model: "@cf/cloudflare/clef",
                        observations: [],
                        status: "ran",
                      },
                    },
            },
          }),
        });

        expect(html).toContain("Where the EAA applies");
        expect(html).not.toContain('id="judged"');
        expect(html).not.toContain("it was asked about");
      })
  );

  it.effect(
    "links a failed report to a start page that already holds its address",
    () =>
      Effect.gen(function* failedReport() {
        const failed = yield* pageOf({
          ...home,
          route: AppRoute.Report({ slug: "example.com" }),
          scan: ScanState.Settled({
            view: {
              ...publishedScan(),
              failure: "The server refused the request (HTTP 403).",
              report: null,
              stage: "failed",
            },
          }),
        });

        expect(failed).toContain(
          `href="/check?url=${encodeURIComponent("https://example.com/")}"`
        );
        expect(failed.toLowerCase()).not.toContain("compliant");
        expect(failing(failed)).toEqual([]);

        const start = yield* pageOf({
          ...home,
          route: AppRoute.Check({}),
          url: "https://example.com/",
        });

        expect(start).toContain('value="https://example.com/"');
      })
  );
});
