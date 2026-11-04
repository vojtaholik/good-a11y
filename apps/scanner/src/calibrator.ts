import { GATEWAY_ID } from "@eaa-check/ai-judge";
import {
  DAILY_JUDGE_TOKENS,
  JUDGE_MODEL,
  JudgeRequestSchema,
  tokensToReserve,
} from "@eaa-check/core";
import type { JudgeRequest } from "@eaa-check/core";
import { JudgeBudget, utcDayOf } from "@eaa-check/scan-store";
import { scanStoreD1 } from "@eaa-check/scan-store/d1";
import * as Cloudflare from "alchemy/Cloudflare";
import { Clock, Context, Effect, Layer, Option, Schema } from "effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

export const CALIBRATION_BATCH = 200;

const AT_ONCE = 4;

const Batch = Schema.Array(JudgeRequestSchema).check(
  Schema.isMaxLength(CALIBRATION_BATCH)
);

const UsageSchema = Schema.Struct({
  usage: Schema.Struct({ input_tokens: Schema.Int }),
});

const decodeUsage = Schema.decodeUnknownOption(UsageSchema);

interface Runner {
  readonly run: (
    model: string,
    inputs: JudgeRequest,
    options: { readonly gateway: { readonly id: string } }
  ) => Promise<object>;
}

export default class Calibrator extends Cloudflare.Worker<Calibrator>()(
  "Calibrator",
  {
    compatibility: { date: "2026-09-01" },
    main: import.meta.url,
    workersDev: false,
  },
  Effect.gen(function* makeCalibrator() {
    const stores = yield* Layer.build(scanStoreD1);
    const budget = Context.get(stores, JudgeBudget);
    const ai = yield* Cloudflare.Workers.AI();

    const askOnce = (runner: Runner, request: JudgeRequest) =>
      Effect.gen(function* askClef() {
        const day = utcDayOf(yield* Clock.currentTimeMillis);
        const tokens = tokensToReserve([{ request }]);

        const reserved = yield* budget.reserve({
          dailyTokens: DAILY_JUDGE_TOKENS,
          day,
          tokens,
        });

        if (!reserved) {
          return { error: "The daily judge budget is spent." };
        }

        const reply = yield* Effect.tryPromise(
          runner.run.bind(runner, JUDGE_MODEL, request, {
            gateway: { id: GATEWAY_ID },
          })
        );

        const used = Option.match(decodeUsage(reply), {
          onNone: () => tokens,
          onSome: ({ usage }) => usage.input_tokens,
        });

        yield* budget.settle({ day, reserved: tokens, used });

        return reply;
      }).pipe(
        Effect.match({
          onFailure: (error) => ({ error: String(error).slice(0, 500) }),
          onSuccess: (reply) => reply,
        })
      );

    return {
      fetch: Effect.gen(function* calibrate() {
        const request = yield* HttpServerRequest.HttpServerRequest;

        if (request.method !== "POST") {
          return HttpServerResponse.text("POST a JSON array of requests.", {
            status: 405,
          });
        }

        const batch = yield* request.json.pipe(
          Effect.flatMap(Schema.decodeUnknownEffect(Batch)),
          Effect.option
        );

        if (Option.isNone(batch)) {
          return HttpServerResponse.text(
            `The body must be a JSON array of at most ${CALIBRATION_BATCH} judge requests ({state, questions}).`,
            { status: 400 }
          );
        }

        // oxlint-disable-next-line typescript/no-unsafe-assignment -- The linter does not load workers-types' global Ai; tsc types this binding, and the next line narrows it to Runner.
        const binding = yield* ai.raw;

        // SAFETY: the Workers AI binding's run(model, inputs, options) is the Runner call; workers-types only lists catalogue models by name.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- workers-types types Ai.run by its built-in model list, which does not name @cf/cloudflare/clef; calibration keeps the raw reply.
        const runner = binding as unknown as Runner;

        const replies = yield* Effect.forEach(
          batch.value,
          (item) => askOnce(runner, item),
          { concurrency: AT_ONCE }
        );

        return yield* HttpServerResponse.json(replies);
      }),
    };
  }).pipe(Effect.provide(Cloudflare.Workers.AIBinding))
) {}
