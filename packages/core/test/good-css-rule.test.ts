// @effect-diagnostics nodeBuiltinImport:off -- These tests create temporary source fixtures and run the real oxlint binary against them.
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

const oxlint = path.join(repoRoot, "node_modules/.bin/oxlint");

const plugin = path.join(repoRoot, "scripts/oxlint-plugin-good-css.ts");

const RULE = "good-css/in-all-css";

interface LintResult {
  readonly output: string;
  readonly status: number;
}

const lintFixture = (name: string, source: string): LintResult => {
  const directory = mkdtempSync(path.join(tmpdir(), "good-css-"));
  const fixtureDirectory = path.join(directory, "apps/web/src/features");
  const config = path.join(directory, "oxlint.json");
  const file = path.join(fixtureDirectory, name);

  mkdirSync(fixtureDirectory, { recursive: true });
  writeFileSync(
    config,
    JSON.stringify({
      jsPlugins: [{ name: "good-css", specifier: plugin }],
      rules: { [RULE]: "error" },
    })
  );
  writeFileSync(file, source);

  try {
    const result = spawnSync(oxlint, ["-c", config, "--no-ignore", file], {
      cwd: repoRoot,
      encoding: "utf-8",
    });

    return {
      output: `${result.stdout}${result.stderr}`,
      status: result.status ?? -1,
    };
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
};

const styles = (body: string): string =>
  `import * as stylex from "@stylexjs/stylex";\n\nexport const boxStyles = stylex.create({\n${body}\n});\n`;

const DATED: readonly (readonly [string, string, string])[] = [
  [
    "a physical margin",
    '  box: { marginTop: "1rem" },',
    "Write marginBlockStart in place of marginTop",
  ],
  [
    "a physical offset",
    '  box: { left: 0, position: "absolute" },',
    "Write insetInlineStart in place of left",
  ],
  [
    "a physical size inside a condition's own block",
    '  box: { "::before": { width: "1rem" } },',
    "Write inlineSize in place of width",
  ],
  [
    "a removed outline",
    '  box: { outline: "none" },',
    "Never remove the outline",
  ],
  [
    "hidden overflow",
    '  box: { overflow: "hidden" },',
    'Cut overflow off with "clip"',
  ],
  [
    "a hover value outside the hover query",
    '  box: { color: { ":hover": "black", default: "gray" } },',
    "Put a :hover value inside the hover query",
  ],
  [
    "a hex colour",
    '  box: { color: "#0a0a0a" },',
    "Write the colour in oklch()",
  ],
  [
    "a transition of everything",
    '  box: { transitionProperty: "all" },',
    "Name the properties a transition changes",
  ],
  [
    "an easing that starts slow",
    '  box: { transitionTimingFunction: "ease-in" },',
    "ease-in starts slow",
  ],
  [
    "text aligned to a physical side",
    '  box: { textAlign: "right" },',
    'Write textAlign "start" or "end"',
  ],
];

describe("the good-css rule for the site's styles", () => {
  it("is on in the repo config", () => {
    const configSource = readFileSync(
      path.join(repoRoot, "oxlint.config.ts"),
      "utf-8"
    );

    expect(configSource).toContain(`"${RULE}": "error"`);
  });

  it("flags each dated declaration and says what to write instead", () => {
    for (const [name, body, message] of DATED) {
      const result = lintFixture("box.stylex.ts", styles(body));

      expect.soft(result.status, name).not.toBe(0);
      expect.soft(result.output, name).toContain(message);
    }
  });

  it("flags a width query, wherever the style file writes it", () => {
    const result = lintFixture(
      "box.stylex.ts",
      `import * as stylex from "@stylexjs/stylex";\n\nconst NARROW = "@media (max-width: 760px)";\n\nexport const boxStyles = stylex.create({\n  box: { display: { [NARROW]: "block", default: "flex" } },\n});\n`
    );

    expect(result.status).not.toBe(0);
    expect(result.output).toContain("A width query is a breakpoint");
  });

  it("passes logical properties, a hover inside its query, and a style that is merely named after a side", () => {
    const result = lintFixture(
      "box.stylex.ts",
      `import * as stylex from "@stylexjs/stylex";\n\nconst HOVER = "@media (hover: hover) and (pointer: fine)";\n\nexport const boxStyles = stylex.create({\n  box: {\n    color: { ":hover": { [HOVER]: "black", default: "gray" }, default: "gray" },\n    insetInlineStart: 0,\n    marginBlockStart: "1rem",\n    overflow: "clip",\n    textAlign: "end",\n  },\n  top: { display: "flex" },\n});\n`
    );

    expect(result.output).not.toContain("good-css");
    expect(result.status).toBe(0);
  });

  it("leaves a file that is no style file alone", () => {
    const result = lintFixture(
      "box.ts",
      'export const box = { color: "#0a0a0a", marginTop: "1rem", outline: "none" };\n'
    );

    expect(result.status).toBe(0);
  });
});
