import { NodeRuntime } from "@effect/platform-node";
import {
  HEADLESS_SHELL_BUILD,
  HEADLESS_SHELL_CACHE,
} from "@good-a11y/browser-audit/headless-shell";
import { Browser, install } from "@puppeteer/browsers";
import { Console, Effect } from "effect";

const program = Effect.tryPromise(
  // @effect-diagnostics-next-line asyncFunction:off -- @puppeteer/browsers install is a Promise API; this awaits it once inside tryPromise.
  async () =>
    await install({
      browser: Browser.CHROMEHEADLESSSHELL,
      buildId: HEADLESS_SHELL_BUILD,
      cacheDir: HEADLESS_SHELL_CACHE,
    })
).pipe(
  Effect.flatMap((installed) =>
    Console.log(
      `chrome-headless-shell ${installed.buildId} at ${installed.executablePath}`
    )
  )
);

NodeRuntime.runMain(program);
