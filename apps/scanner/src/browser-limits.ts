import { DAILY_BROWSER_SECONDS } from "@eaa-check/core";
import { Stack } from "alchemy/Stack";
import { Config } from "effect";

export const DAILY_BROWSER_SECONDS_NAME = "DAILY_BROWSER_SECONDS";

export const DEV_STAGE = "dev";

export const DEV_DAILY_BROWSER_SECONDS = 5400;

export const dailyBrowserSeconds = Stack.useSync(({ stage }) =>
  String(
    stage === DEV_STAGE ? DEV_DAILY_BROWSER_SECONDS : DAILY_BROWSER_SECONDS
  )
);

export const secondsUsed = (startedAt: number, endedAt: number): number =>
  Math.ceil(Math.max(0, endedAt - startedAt) / 1000);

export const EMPTY_SUBMITS_NAME = "EMPTY_SUBMITS";

export const emptySubmitsSetting = Config.String(EMPTY_SUBMITS_NAME).pipe(
  Config.withDefault("false")
);
