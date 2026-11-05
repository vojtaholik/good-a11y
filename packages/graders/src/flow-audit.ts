// @effect-diagnostics asyncFunction:off nodeBuiltinImport:off -- Playwright drives the browser through Promise-based callbacks; Effect wraps the run once, in playwrightFlowAuditLayer.
import { stripVTControlCharacters } from "node:util";

import { FlowAudit, FlowAuditFailed } from "@good-a11y/core";
import type { ClaimResult, Flow, FlowResult, LocalUrl } from "@good-a11y/core";
import { GUIDES } from "@good-a11y/guides";
import { Cause, Effect, Layer, Schema } from "effect";
import { chromium } from "playwright";
import type { Browser, BrowserContext } from "playwright";

import { openFlow } from "./flow.js";
import type { ContextOptions, Graded, Grader } from "./grader.js";
import { graderFor } from "./graders.js";

export interface FlowChrome {
  readonly executablePath: string | null;
}

const CLAIM_TIMEOUT_MS = 15_000;

const DETAIL_CHARACTERS = 1500;

const BLOCKED_CHARACTERS = 200;

const CALL_LOG = /\n\s*Call log:/u;

const IN_PAGE = new Set(["about:", "blob:", "data:"]);

const detailOf = (raw: string): string => {
  const [message = raw] = stripVTControlCharacters(raw).split(CALL_LOG);

  return message.trim().slice(0, DETAIL_CHARACTERS);
};

class BrowserStepFailed extends Schema.TaggedError<BrowserStepFailed>()(
  "BrowserStepFailed",
  { detail: Schema.String }
) {}

const attempt = <A>(run: () => Promise<A>) =>
  Effect.tryPromise({
    catch: (thrown) =>
      new BrowserStepFailed({
        detail: detailOf(
          thrown instanceof Error ? thrown.message : String(thrown)
        ),
      }),
    try: run,
  });

const TIMED_OUT = (ms: number) =>
  `The claim did not finish within ${ms / 1000} seconds. Check that the flow's targets name what the page shows.`;

const contextFor = async (
  browser: Browser,
  origin: string,
  blocked: Set<string>,
  options: ContextOptions
): Promise<BrowserContext> => {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { height: 800, width: 1280 },
    ...options,
  });

  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (IN_PAGE.has(url.protocol) || url.origin === origin) {
      await route.continue();

      return;
    }

    blocked.add(url.href.slice(0, BLOCKED_CHARACTERS));
    await route.abort("blockedbyclient");
  });

  return context;
};

const inContext = (
  browser: Browser,
  flow: Flow,
  url: string,
  blocked: Set<string>,
  options: ContextOptions,
  run: (graded: Graded) => Promise<void>,
  ms: number
) =>
  Effect.acquireUseRelease(
    attempt(
      async () =>
        await contextFor(browser, new URL(url).origin, blocked, options)
    ),
    (context) =>
      attempt(async () => {
        const page = await context.newPage();

        await run({
          flow,
          open: async () => {
            await openFlow(page, flow, url);
          },
          page,
        });
      }).pipe(Effect.timeout(ms)),
    (context) =>
      attempt(async () => {
        await context.close();
      }).pipe(Effect.ignore)
  ).pipe(
    Effect.match({
      onFailure: (failed) =>
        Cause.isTimeoutError(failed) ? TIMED_OUT(ms) : failed.detail,
      onSuccess: () => null,
    })
  );

const claimsOf = (
  browser: Browser,
  grader: Grader,
  flow: Flow,
  url: string,
  blocked: Set<string>
) =>
  Effect.gen(function* gradeClaims() {
    const ms = grader.timeout ?? CLAIM_TIMEOUT_MS;

    const precheck =
      grader.precheck === undefined
        ? null
        : yield* inContext(
            browser,
            flow,
            url,
            blocked,
            { ...grader.context, ...grader.precheck.context },
            grader.precheck.run,
            ms
          );

    const claims: ClaimResult[] = [];

    for (const claim of grader.claims) {
      const failed =
        precheck ??
        (yield* inContext(
          browser,
          flow,
          url,
          blocked,
          { ...grader.context, ...claim.context },
          async (graded) => {
            await (grader.start === undefined
              ? graded.open()
              : grader.start(graded));
            await claim.run(graded);
          },
          ms
        ));

      claims.push({
        detail: failed,
        n: claim.n,
        status: failed === null ? "pass" : "fail",
        title: claim.title,
      });
    }

    return {
      claims: claims.toSorted((a, b) => a.n - b.n),
      problem:
        precheck === null
          ? null
          : `Before its claims, the grader checks that the feature is there, and that check failed: ${precheck}`,
    };
  });

const gradeFlow = (browser: Browser, base: LocalUrl, flow: Flow) =>
  Effect.gen(function* gradeOne() {
    const url = new URL(flow.path ?? base, base).href;
    const guide = GUIDES.find((candidate) => candidate.id === flow.guide);
    const grader = graderFor(flow.guide);
    const blocked = new Set<string>();

    if (guide === undefined || grader === undefined) {
      const unknown: FlowResult = {
        blocked: [],
        claims: [],
        criteria: [],
        guide: flow.guide,
        name: flow.guide,
        problem: `No guide has the id "${flow.guide}". Run \`list\` for the ids.`,
        url,
      };

      return unknown;
    }

    const { claims, problem } = yield* claimsOf(
      browser,
      grader,
      flow,
      url,
      blocked
    );

    const graded: FlowResult = {
      blocked: [...blocked],
      claims,
      criteria: guide.criteria,
      guide: guide.id,
      name: guide.name,
      problem,
      url,
    };

    return graded;
  });

const runFlows = (chrome: FlowChrome, base: LocalUrl, flows: readonly Flow[]) =>
  Effect.acquireUseRelease(
    attempt(
      async () =>
        await chromium.launch({
          headless: true,
          ...(chrome.executablePath === null
            ? { channel: "chrome" }
            : { executablePath: chrome.executablePath }),
        })
    ),
    (browser) =>
      Effect.all(flows.map((flow) => gradeFlow(browser, base, flow))),
    (browser) =>
      attempt(async () => {
        await browser.close();
      }).pipe(Effect.ignore)
  );

export const playwrightFlowAuditLayer = (chrome: FlowChrome) =>
  Layer.succeed(
    FlowAudit,
    FlowAudit.of({
      run: (base, flows) =>
        runFlows(chrome, base, flows).pipe(
          Effect.mapError(
            (failed) => new FlowAuditFailed({ detail: failed.detail })
          )
        ),
    })
  );
