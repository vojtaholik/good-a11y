import stylex from "@stylexjs/unplugin/vite";
import type { PluginOption } from "vite";
import { defineConfig } from "vitest/config";

// oxlint-disable-next-line typescript/no-unsafe-assignment -- @stylexjs/unplugin 0.19.1 types its Vite plugin factory as returning any; it returns a Vite plugin.
const stylexPlugin: PluginOption = stylex({ devMode: "off" });

export default defineConfig({
  plugins: [stylexPlugin],
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
