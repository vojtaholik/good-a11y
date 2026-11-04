import stylex from "@stylexjs/unplugin/vite";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

import { guidePages } from "./scripts/guide-pages.ts";

// oxlint-disable-next-line typescript/no-unsafe-assignment -- @stylexjs/unplugin 0.19.1 types its Vite plugin factory as returning any; it returns one Vite plugin.
const stylexPlugin: Plugin = stylex();

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify("test") },
  plugins: [{ ...stylexPlugin, configureServer: undefined }, guidePages()],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/vitest-setup.ts"],
  },
});
