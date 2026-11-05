// @effect-diagnostics nodeBuiltinImport:off -- A build step that reads the page scripts from disk and writes one module.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");

const { resolve } = createRequire(import.meta.url);

const axeSource = readFileSync(resolve("axe-core/axe.min.js"), "utf-8");

const probesSource = readFileSync(
  path.join(root, "dist", "page", "probes.js"),
  "utf-8"
);

const evidenceSource = readFileSync(
  path.join(root, "dist", "page", "evidence.js"),
  "utf-8"
);

const interactionSource = readFileSync(
  path.join(root, "dist", "page", "interaction-probes.js"),
  "utf-8"
);

writeFileSync(
  path.join(root, "dist", "page", "scripts.js"),
  [
    `export const axeSource = ${JSON.stringify(axeSource)};`,
    `export const probesSource = ${JSON.stringify(probesSource)};`,
    `export const evidenceSource = ${JSON.stringify(evidenceSource)};`,
    `export const interactionSource = ${JSON.stringify(interactionSource)};`,
    "",
  ].join("\n")
);
