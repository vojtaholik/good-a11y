// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import type { BrowserContextOptions, Page } from "playwright/test";

export interface Graded {
  readonly flow: Flow;
  readonly open: () => Promise<void>;
  readonly page: Page;
}

export type ContextOptions = Pick<
  BrowserContextOptions,
  "hasTouch" | "isMobile" | "permissions" | "reducedMotion" | "viewport"
>;

export interface Claim {
  readonly context?: ContextOptions;
  readonly n: number;
  readonly run: (graded: Graded) => Promise<void>;
  readonly title: string;
}

export interface Grader {
  readonly claims: readonly Claim[];
  readonly context?: ContextOptions;
  readonly guide: string;
  readonly precheck?: {
    readonly context?: ContextOptions;
    readonly run: (graded: Graded) => Promise<void>;
  };
  readonly start?: (graded: Graded) => Promise<void>;
  readonly timeout?: number;
}

export const claim = (
  n: number,
  title: string,
  run: Claim["run"],
  context?: ContextOptions
): Claim =>
  context === undefined ? { n, run, title } : { context, n, run, title };
