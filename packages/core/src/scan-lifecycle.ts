import { defineContract } from "@eaa-check/capability/contract";
import { Schema } from "effect";

import { ContactMessageSchema } from "./contact-message.js";
import { DailyCapReached } from "./daily-cap-reached.js";
import { ScanTargetRejected } from "./scan-target-rejected.js";
import { ScanUnavailable } from "./scan-unavailable.js";
import { ScanViewSchema } from "./scan-view.js";
import { UnknownScan } from "./unknown-scan.js";

export const startScanContract = defineContract("startScan", {
  annotations: { openWorld: true },
  description:
    "Start a scan of one public web page and return the slug its report is read by",
  failure: Schema.Union([ScanTargetRejected, DailyCapReached, ScanUnavailable]),
  input: Schema.Struct({
    url: Schema.String.annotate({
      description: "Address of the page to scan, for example example.com",
    }),
  }),
  output: Schema.Struct({ scanId: Schema.String, slug: Schema.String }),
});

export const getScanContract = defineContract("getScan", {
  annotations: { idempotent: true, readOnly: true },
  description:
    "Read the newest scan of a site: its stage, and its report once published",
  failure: Schema.Union([UnknownScan, ScanUnavailable]),
  input: Schema.Struct({
    slug: Schema.String.annotate({
      description: "The site's hostname without www, for example example.com",
    }),
  }),
  output: ScanViewSchema,
});

export const sendMessageContract = defineContract("sendMessage", {
  description:
    "Keep a visitor's message to studio9, with the scanned page it was sent from",
  failure: Schema.Union([DailyCapReached, ScanUnavailable]),
  input: ContactMessageSchema,
  output: Schema.Struct({ received: Schema.Boolean }),
});
