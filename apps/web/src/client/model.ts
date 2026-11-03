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

export const ContactField = Schema.Literals(["email", "message"]);

export type ContactFieldName = typeof ContactField.Type;

export const ContactState = defineTaggedUnion({
  Editing: {},
  Invalid: { fields: Schema.Array(ContactField) },
  Refused: { message: Schema.String },
  Sending: {},
  Sent: {},
  Unavailable: {},
});

export const ContactForm = Schema.Struct({
  email: Schema.String,
  message: Schema.String,
  name: Schema.String,
  state: ContactState,
});

export const Model = Schema.Struct({
  contact: ContactForm,
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
  FailedSendMessage: { maybeMessage: Schema.Option(Schema.String) },
  FailedStartScan: {
    generation: Schema.Int,
    maybeMessage: Schema.Option(Schema.String),
  },
  SubmittedContactForm: { url: Schema.String },
  SubmittedScanForm: {},
  SucceededGetScan: { generation: Schema.Int, view: ScanViewSchema },
  SucceededSendMessage: {},
  SucceededStartScan: { generation: Schema.Int, slug: Schema.String },
  TickedPoll: {},
  UpdatedContactEmail: { value: Schema.String },
  UpdatedContactMessage: { value: Schema.String },
  UpdatedContactName: { value: Schema.String },
  UpdatedScanUrl: { value: Schema.String },
});

export type AppMessage = typeof Message.Type;
