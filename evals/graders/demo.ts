// @effect-diagnostics nodeBuiltinImport:off -- The graders read guide files from the repository with Node built-ins.
// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const guidesRoot = path.join(import.meta.dirname, "..", "..", "guides");

export const guideDirs = (): readonly { id: string; dir: string }[] =>
  readdirSync(guidesRoot).flatMap((category) =>
    readdirSync(path.join(guidesRoot, category)).map((id) => ({
      dir: path.join(guidesRoot, category, id),
      id,
    }))
  );

export const demoUrl = (id: string): string => {
  const guide = guideDirs().find((candidate) => candidate.id === id);
  const file = guide === undefined ? null : path.join(guide.dir, "demo.html");

  if (file === null || !existsSync(file)) {
    throw new Error(
      `No demo.html for guide "${id}" under ${guidesRoot}. Add guides/<category>/${id}/demo.html or fix the grader's guide id.`
    );
  }

  return pathToFileURL(file).href;
};

export const targetUrl = (id: string): string =>
  process.env.EVAL_TARGET_URL ?? demoUrl(id);
