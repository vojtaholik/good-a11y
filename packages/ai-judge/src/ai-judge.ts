import {
  JUDGE_MODEL,
  Judge,
  JudgeReplySchema,
  JudgeUnavailable,
} from "@eaa-check/core";
import type { JudgeReply, JudgeRequest } from "@eaa-check/core";
import { Effect, Layer, Schema } from "effect";
import type { Duration } from "effect";

export const GATEWAY_ID = "default";

export const JUDGE_TIMEOUT = "30 seconds" satisfies Duration.Input;

export interface RunOptions {
  readonly gateway: { readonly id: string };
}

export interface ModelRunner {
  readonly run: (
    model: string,
    inputs: JudgeRequest,
    options: RunOptions
  ) => Promise<object>;
}

const decodeReply = Schema.decodeUnknownEffect(JudgeReplySchema);

export const judgeWith = (runner: ModelRunner) =>
  Judge.of({
    ask: (request): Effect.Effect<JudgeReply, JudgeUnavailable> =>
      Effect.tryPromise({
        catch: (cause) =>
          new JudgeUnavailable({
            detail: cause instanceof Error ? cause.message : String(cause),
            kind: "service",
          }),
        try: runner.run.bind(runner, JUDGE_MODEL, request, {
          gateway: { id: GATEWAY_ID },
        }),
      }).pipe(
        Effect.flatMap((reply) =>
          decodeReply(reply).pipe(
            Effect.mapError(
              (issue) =>
                new JudgeUnavailable({
                  detail: `The reply did not match the decision schema: ${issue.message}`,
                  kind: "unreadable",
                })
            )
          )
        ),
        Effect.timeoutOrElse({
          duration: JUDGE_TIMEOUT,
          orElse: () =>
            Effect.fail(
              new JudgeUnavailable({
                detail: `No answer within ${JUDGE_TIMEOUT}.`,
                kind: "timeout",
              })
            ),
        })
      ),
  });

export const aiJudgeLayer = (runner: ModelRunner) =>
  Layer.succeed(Judge, judgeWith(runner));
