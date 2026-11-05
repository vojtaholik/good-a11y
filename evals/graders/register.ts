// @effect-diagnostics nodeBuiltinImport:off asyncFunction:off -- The graders read the task file with Node built-ins and drive Playwright's Promise API; no Effect runs here.
import { readFileSync } from "node:fs";

import { FlowSchema } from "@good-a11y/core";
import type { Flow } from "@good-a11y/core";
import { graderFor, openFlow } from "@good-a11y/graders";
import type { Graded, Grader } from "@good-a11y/graders";
import { test } from "@playwright/test";
import { Schema } from "effect";

import { targetUrl } from "./demo.ts";

const decode = Schema.decodeUnknownSync(Schema.fromJsonString(FlowSchema));

const flowOf = (guide: string): Flow => {
  const file = process.env.EVAL_TASK;

  if (file === undefined || file === "") {
    return { guide };
  }

  try {
    return decode(readFileSync(file, "utf-8"));
  } catch (error) {
    throw new Error(
      `EVAL_TASK ${file} is not a readable task with valid targets and setup: ${String(error)}. Fix the task json or unset EVAL_TASK to grade the demo.`,
      { cause: error }
    );
  }
};

const graderOf = (guide: string): Grader => {
  const grader = graderFor(guide);

  if (grader === undefined) {
    throw new Error(
      `No grader for guide "${guide}" in packages/graders. Add packages/graders/src/guides/${guide}.ts and list it in GRADERS.`
    );
  }

  return grader;
};

export const register = (guide: string): void => {
  const grader = graderOf(guide);
  const flow = flowOf(grader.guide);
  const url = targetUrl(grader.guide);

  if (grader.timeout !== undefined) {
    test.describe.configure({ timeout: grader.timeout });
  }

  if (grader.context !== undefined) {
    test.use(grader.context);
  }

  const { precheck, start } = grader;

  const gradedOn = (page: Graded["page"]): Graded => ({
    flow,
    open: async () => {
      await openFlow(page, flow, url);
    },
    page,
  });

  if (precheck !== undefined) {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext({
        ...grader.context,
        ...precheck.context,
      });

      try {
        const page = await context.newPage();

        await precheck.run(gradedOn(page));
      } finally {
        await context.close();
      }
    });
  }

  test.beforeEach(async ({ page }) => {
    const graded = gradedOn(page);

    await (start === undefined ? graded.open() : start(graded));
  });

  for (const claim of grader.claims) {
    const title = `E${claim.n} ${claim.title}`;

    const body = async ({ page }: { page: Graded["page"] }) => {
      await claim.run(gradedOn(page));
    };

    if (claim.context === undefined) {
      test(title, body);
    } else {
      const { context } = claim;

      test.describe(title, () => {
        test.use(context);
        test(title, body);
      });
    }
  }
};
