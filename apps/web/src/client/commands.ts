import {
  DailyCapReached,
  ScanTargetRejected,
  UnknownScan,
} from "@eaa-check/core/contracts";
import { Effect, Option, Schema } from "effect";
import { Command } from "foldkit";
import { load, pushUrl } from "foldkit/navigation";

import { Message } from "./model.js";
import { ScanApi } from "./scan-api.js";

const isRefusal = Schema.is(
  Schema.Union([ScanTargetRejected, DailyCapReached])
);

export const StartScan = Command.define("StartScan", {
  args: { generation: Schema.Int, url: Schema.String },
  execute: ({ generation, url }) =>
    ScanApi.use((api) => api.startScan({ url })).pipe(
      Effect.match({
        onFailure: (error) =>
          Message.FailedStartScan({
            generation,
            maybeMessage: isRefusal(error)
              ? Option.some(error.message)
              : Option.none(),
          }),
        onSuccess: ({ slug }) =>
          Message.SucceededStartScan({ generation, slug }),
      })
    ),
  messages: [Message.SucceededStartScan, Message.FailedStartScan],
});

export const GetScan = Command.define("GetScan", {
  args: { generation: Schema.Int, slug: Schema.String },
  execute: ({ generation, slug }) =>
    ScanApi.use((api) => api.getScan({ slug })).pipe(
      Effect.match({
        onFailure: (error) =>
          Message.FailedGetScan({
            generation,
            unknown: Schema.is(UnknownScan)(error),
          }),
        onSuccess: (view) => Message.SucceededGetScan({ generation, view }),
      })
    ),
  messages: [Message.SucceededGetScan, Message.FailedGetScan],
});

export const Navigate = Command.define("Navigate", {
  args: { url: Schema.String },
  execute: ({ url }) =>
    pushUrl(url).pipe(Effect.as(Message.CompletedNavigate())),
  messages: [Message.CompletedNavigate],
});

export const LoadExternal = Command.define("LoadExternal", {
  args: { href: Schema.String },
  execute: ({ href }) =>
    load(href).pipe(Effect.as(Message.CompletedLoadExternal())),
  messages: [Message.CompletedLoadExternal],
});
