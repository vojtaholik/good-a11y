import { Stack } from "alchemy/Stack";

export const DAILY_JUDGE_TOKENS_NAME = "DAILY_JUDGE_TOKENS";

export const PRODUCTION_STAGE = "prod";

export const PRODUCTION_JUDGE_TOKENS = 250_000;

export const STAGE_JUDGE_TOKENS = 50_000;

export const CALIBRATION_JUDGE_TOKENS = 100_000;

export const CALIBRATION_JUDGE_TOKENS_NAME = "CALIBRATION_JUDGE_TOKENS";

export const dailyJudgeTokens = Stack.useSync(({ stage }) =>
  String(
    stage === PRODUCTION_STAGE ? PRODUCTION_JUDGE_TOKENS : STAGE_JUDGE_TOKENS
  )
);
