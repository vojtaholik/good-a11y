import { foldkit } from "@foldkit/vite-plugin";
import stylex from "@stylexjs/unplugin/vite";
import { defineConfig } from "vite";
import type { PluginOption } from "vite";

import { guidePages } from "./scripts/guide-pages.ts";

// oxlint-disable-next-line typescript/no-unsafe-assignment -- @stylexjs/unplugin 0.19.1 types its Vite plugin factory as returning any; it returns a Vite plugin.
const stylexPlugin: PluginOption = stylex();

export default defineConfig({
  build: {
    outDir: "dist/client",
    rolldownOptions: { external: [/^cloudflare:/u] },
  },
  // @effect-diagnostics-next-line cryptoRandomUUID:off -- One build id per Vite run, compiled into the client and the Worker alike; config runs outside Effect.
  define: { __BUILD_ID__: JSON.stringify(crypto.randomUUID()) },
  plugins: [stylexPlugin, guidePages(), foldkit({ devToolsMcpPort: false })],
});
