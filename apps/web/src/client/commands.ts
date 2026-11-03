import {
  DailyCapReached,
  ScanTargetRejected,
  ScanUnavailable,
  UnknownScan,
} from "@eaa-check/core/contracts";
import { Cause, Effect, Option, Schema } from "effect";
import { Command } from "foldkit";
import { load, pushUrl } from "foldkit/navigation";

import { Message } from "./model.js";
import { ScanApi } from "./scan-api.js";

const isRefusal = Schema.is(
  Schema.Union([ScanTargetRejected, DailyCapReached, ScanUnavailable])
);

export const StartScan = Command.define("StartScan", {
  args: { generation: Schema.Int, url: Schema.String },
  execute: ({ generation, url }) =>
    ScanApi.use((api) => api.startScan({ url })).pipe(
      Effect.matchCause({
        onFailure: (cause) =>
          Message.FailedStartScan({
            generation,
            maybeMessage: Cause.findErrorOption(cause).pipe(
              Option.filter(isRefusal),
              Option.map((error) => error.message)
            ),
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
      Effect.matchCause({
        onFailure: (cause) =>
          Message.FailedGetScan({
            generation,
            unknown: Option.exists(
              Cause.findErrorOption(cause),
              Schema.is(UnknownScan)
            ),
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
