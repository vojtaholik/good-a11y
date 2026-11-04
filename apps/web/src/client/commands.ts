import {
  DailyCapReached,
  ScanTargetRejected,
  ScanUnavailable,
  UnknownScan,
} from "@good-a11y/core/contracts";
import { Cause, Effect, Option, Schema } from "effect";
import { Command, Dom } from "foldkit";
import { load, pushUrl } from "foldkit/navigation";

import { Message } from "./message.js";
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
        onFailure: () => Message.FailedCopyText({ key, text }),
        onSuccess: () => Message.SucceededCopyText({ key }),
      })
    ),
  messages: [Message.SucceededCopyText, Message.FailedCopyText],
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
            isUnknownScan: Option.exists(
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
    maybeUrl: Schema.Option(Schema.String),
    message: Schema.String,
  },
  execute: ({ email, maybeName, maybeUrl, message }) =>
    ScanApi.use((api) =>
      api.sendMessage({
        email,
        message,
        ...Option.match(maybeName, {
          onNone: () => ({}),
          onSome: (name) => ({ name }),
        }),
        ...Option.match(maybeUrl, {
          onNone: () => ({}),
          onSome: (url) => ({ url }),
        }),
      })
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

export const FocusMainHeading = Command.define("FocusMainHeading", {
  execute: Dom.scrollIntoViewAfterPaint("body", { block: "start" }).pipe(
    Effect.andThen(
      Dom.focus("main h1", { makeFocusable: true, preventScroll: true })
    ),
    Effect.ignore,
    Effect.as(Message.CompletedFocusMainHeading())
  ),
  messages: [Message.CompletedFocusMainHeading],
});

export const FocusFragment = Command.define("FocusFragment", {
  args: { id: Schema.String },
  execute: ({ id }) =>
    Dom.scrollIntoViewAfterPaint(`#${CSS.escape(id)}`, { block: "start" }).pipe(
      Effect.andThen(
        Dom.focus(`#${CSS.escape(id)}`, {
          makeFocusable: true,
          preventScroll: true,
        })
      ),
      Effect.ignore,
      Effect.as(Message.CompletedFocusFragment())
    ),
  messages: [Message.CompletedFocusFragment],
});
