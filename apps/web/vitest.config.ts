import stylex from "@stylexjs/unplugin/vite";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

// oxlint-disable-next-line typescript/no-unsafe-assignment -- @stylexjs/unplugin 0.19.1 types its Vite plugin factory as returning any; it returns one Vite plugin.
const stylexPlugin: Plugin = stylex();

export default defineConfig({
  plugins: [{ ...stylexPlugin, configureServer: undefined }],
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
