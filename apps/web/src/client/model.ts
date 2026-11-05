import { ScanViewSchema } from "@good-a11y/core/contracts";
import { Schema } from "effect";
import { defineTaggedUnion } from "foldkit/schema";

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

export const CopyState = defineTaggedUnion({
  Copied: { key: Schema.String },
  Failed: { key: Schema.String, text: Schema.String },
  Idle: {},
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
  copy: CopyState,
  generation: Schema.Int,
  origin: Schema.String,
  route: AppRoute,
  scan: ScanState,
  section: Schema.Option(Schema.String),
  start: StartState,
  url: Schema.String,
});

export type AppModel = typeof Model.Type;

export const Flags = Schema.Struct({
  maybeScan: Schema.OptionFromNullOr(ScanViewSchema),
  origin: Schema.String,
});

export type AppFlags = typeof Flags.Type;
