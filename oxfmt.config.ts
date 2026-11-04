import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    ".brain/**",
    "research/**",
    "BRIEF.md",
    "REPORT.md",
    "evals/results/**",
    "packages/facts/src/ledger.generated.ts",
    "packages/guides/src/guides.generated.ts",
    "apps/good-a11y/bundle/**",
  ],
});
