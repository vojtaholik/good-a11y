import { foldkit } from "@foldkit/vite-plugin";
import stylex from "@stylexjs/unplugin/vite";
import { defineConfig } from "vite";
import type { PluginOption } from "vite";

import { recordBuildId, sourceBuildId } from "./scripts/build-id.ts";
import { guidePages } from "./scripts/guide-pages.ts";

// oxlint-disable-next-line typescript/no-unsafe-assignment -- @stylexjs/unplugin 0.19.1 types its Vite plugin factory as returning any; it returns a Vite plugin.
const stylexPlugin: PluginOption = stylex();

const BUILD_ID = sourceBuildId();

export default defineConfig({
  build: {
    outDir: "dist/client",
    rolldownOptions: { external: [/^cloudflare:/u] },
  },
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  plugins: [
    stylexPlugin,
    guidePages(),
    foldkit({ devToolsMcpPort: false }),
    recordBuildId(BUILD_ID),
  ],
});
