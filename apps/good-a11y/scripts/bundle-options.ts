import type { BuildOptions } from "esbuild";

const appDirectory = `${import.meta.dirname}/..`;

export const BUNDLE_PATH = `${appDirectory}/bundle/good-a11y.mjs`;

export const LICENSES_PATH = `${appDirectory}/bundle/THIRD-PARTY-LICENSES.md`;

export const bundleOptions: BuildOptions = {
  absWorkingDir: appDirectory,
  banner: {
    js: [
      'import { createRequire as __goodA11yCreateRequire } from "node:module";',
      "const require = __goodA11yCreateRequire(import.meta.url);",
    ].join("\n"),
  },
  bundle: true,
  entryPoints: ["dist/cli.js"],
  external: ["playwright", "puppeteer-core"],
  format: "esm",
  legalComments: "eof",
  minify: true,
  outfile: "bundle/good-a11y.mjs",
  platform: "node",
  target: "node24",
};
