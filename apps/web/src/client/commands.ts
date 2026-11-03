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

export const CopyText = Command.define("CopyText", {
  args: { key: Schema.String, text: Schema.String },
  execute: ({ key, text }) =>
    Effect.tryPromise(
      navigator.clipboard.writeText.bind(navigator.clipboard, text)
    ).pipe(
      Effect.match({
        onFailure: () => Message.FailedCopyFixPrompt({ key, text }),
        onSuccess: () => Message.SucceededCopyFixPrompt({ key }),
      })
    ),
  messages: [Message.SucceededCopyFixPrompt, Message.FailedCopyFixPrompt],
});

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
        onSuccess: ({ scanId, slug }) =>
          Message.SucceededStartScan({ generation, scanId, slug }),
      })
    ),
  messages: [Message.SucceededStartScan, Message.FailedStartScan],
});

export const GetScan = Command.define("GetScan", {
  args: {
    generation: Schema.Int,
    maybeScanId: Schema.Option(Schema.String),
    slug: Schema.String,
  },
  execute: ({ generation, maybeScanId, slug }) =>
    ScanApi.use((api) =>
      api.getScan(
        Option.match(maybeScanId, {
          onNone: () => ({ slug }),
          onSome: (scanId) => ({ scanId, slug }),
        })
      )
    ).pipe(
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

export const SendMessage = Command.define("SendMessage", {
  args: {
    email: Schema.String,
    maybeName: Schema.Option(Schema.String),
    message: Schema.String,
    url: Schema.String,
  },
  execute: ({ email, maybeName, message, url }) =>
    ScanApi.use((api) =>
      api.sendMessage(
        Option.match(maybeName, {
          onNone: () => ({ email, message, url }),
          onSome: (name) => ({ email, message, name, url }),
        })
      )
    ).pipe(
      Effect.matchCause({
        onFailure: (cause) =>
          Message.FailedSendMessage({
            maybeMessage: Cause.findErrorOption(cause).pipe(
              Option.filter(isRefusal),
              Option.map((error) => error.message)
            ),
          }),
        onSuccess: () => Message.SucceededSendMessage(),
      })
    ),
  messages: [Message.SucceededSendMessage, Message.FailedSendMessage],
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
