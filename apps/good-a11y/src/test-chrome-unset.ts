import { Schema } from "effect";

export const TEST_CHROME_UNSET =
  "check runs under a test (VITEST is set) with neither --chrome nor GOOD_A11Y_CHROME, so it would open the installed Google Chrome. Spawn it with GOOD_A11Y_CHROME set to headlessShellPath() from @good-a11y/browser-audit/headless-shell.";

export class TestChromeUnset extends Schema.TaggedError<TestChromeUnset>()(
  "TestChromeUnset",
  {}
) {}
