import { ScanViewSchema } from "@good-a11y/core/contracts";
import { Schema } from "effect";
import { defineMessageUnion } from "foldkit/message";
import { UrlRequest } from "foldkit/navigation";
import { Url } from "foldkit/url";

export const Message = defineMessageUnion({
  ChangedUrl: { url: Url },
  ClickedCopyFixPrompt: { key: Schema.String },
  ClickedCopyText: { text: Schema.String },
  ClickedLink: { request: UrlRequest },
  CompletedFocusFragment: {},
  CompletedFocusMainHeading: {},
  CompletedLoadExternal: {},
  CompletedNavigate: {},
  FailedCopyText: { key: Schema.String, text: Schema.String },
  FailedGetScan: { generation: Schema.Int, isUnknownScan: Schema.Boolean },
  FailedSendMessage: { maybeMessage: Schema.Option(Schema.String) },
  FailedStartScan: {
    generation: Schema.Int,
    maybeMessage: Schema.Option(Schema.String),
  },
  SubmittedContactForm: { url: Schema.String },
  SubmittedScanForm: {},
  SucceededCopyText: { key: Schema.String },
  SucceededGetScan: { generation: Schema.Int, view: ScanViewSchema },
  SucceededSendMessage: {},
  SucceededStartScan: {
    generation: Schema.Int,
    scanId: Schema.String,
    slug: Schema.String,
  },
  TickedPoll: {},
  UpdatedContactEmail: { value: Schema.String },
  UpdatedContactMessage: { value: Schema.String },
  UpdatedContactName: { value: Schema.String },
  UpdatedScanUrl: { value: Schema.String },
});

export type AppMessage = typeof Message.Type;
