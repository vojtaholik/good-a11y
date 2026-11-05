// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; Effect wraps the run once, in playwrightFlowAuditLayer.
import { FlowAudit, FlowAuditFailed } from "@good-a11y/core";
import type { ClaimResult, Flow, FlowResult, LocalUrl } from "@good-a11y/core";
import { GUIDES } from "@good-a11y/guides";
import { Cause, Effect, Layer } from "effect";
import type { Browser } from "playwright";

import { attempt, contextFor, withBrowser } from "./browser.js";
import type { FlowChrome } from "./browser.js";
import { openFlow } from "./flow.js";
import type { ContextOptions, Graded, Grader } from "./grader.js";
import { graderFor } from "./graders.js";

export type { FlowChrome } from "./browser.js";

const CLAIM_TIMEOUT_MS = 15_000;

const TIMED_OUT = (ms: number) =>
  `The claim did not finish within ${ms / 1000} seconds. Check that the flow's targets name what the page shows.`;

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
  withBrowser(chrome, (browser) =>
    Effect.all(flows.map((flow) => gradeFlow(browser, base, flow)))
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
