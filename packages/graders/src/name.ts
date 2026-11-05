// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Locator } from "playwright/test";

const FIRST_NODE = /^- [\w-]+(?: "(?<name>(?:[^"\\]|\\.)*)")?/u;

export const accessibleName = async (locator: Locator): Promise<string> => {
  const tree = await locator.ariaSnapshot();
  const quoted = FIRST_NODE.exec(tree)?.groups?.name;

  return quoted === undefined ? "" : String(JSON.parse(`"${quoted}"`));
};
