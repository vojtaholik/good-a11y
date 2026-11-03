import { ScanViewSchema } from "@eaa-check/core/contracts";
import { Schema } from "effect";
import { defineMessageUnion } from "foldkit/message";
import { UrlRequest } from "foldkit/navigation";
import { defineTaggedUnion } from "foldkit/schema";
import { Url } from "foldkit/url";

import { AppRoute } from "../features/route.js";

export const StartState = defineTaggedUnion({
  Idle: {},
  Refused: { message: Schema.String },
  Submitting: {},
  Unavailable: {},
});

export const ScanState = defineTaggedUnion({
  Idle: {},
  Loading: {},
  Running: { view: ScanViewSchema },
  Settled: { view: ScanViewSchema },
  Unavailable: {},
  Unknown: {},
});

export const Model = Schema.Struct({
  generation: Schema.Int,
  route: AppRoute,
  scan: ScanState,
  start: StartState,
  url: Schema.String,
});

export type AppModel = typeof Model.Type;

export const Message = defineMessageUnion({
  ChangedUrl: { url: Url },
  ClickedLink: { request: UrlRequest },
  CompletedLoadExternal: {},
  CompletedNavigate: {},
  FailedGetScan: { generation: Schema.Int, unknown: Schema.Boolean },
  FailedStartScan: {
    generation: Schema.Int,
    maybeMessage: Schema.Option(Schema.String),
  },
  SubmittedScanForm: {},
  SucceededGetScan: { generation: Schema.Int, view: ScanViewSchema },
  SucceededStartScan: { generation: Schema.Int, slug: Schema.String },
  TickedPoll: {},
  UpdatedScanUrl: { value: Schema.String },
});

export type AppMessage = typeof Message.Type;
