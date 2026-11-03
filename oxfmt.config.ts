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
  ],
});
