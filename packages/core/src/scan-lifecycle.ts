import { defineContract } from "@eaa-check/capability/contract";
import { Schema } from "effect";

import { DailyCapReached } from "./daily-cap-reached.js";
import { ScanTargetRejected } from "./scan-target-rejected.js";
import { ScanViewSchema } from "./scan-view.js";
import { UnknownScan } from "./unknown-scan.js";

export const startScanContract = defineContract("startScan", {
  annotations: { openWorld: true },
  description:
    "Start a scan of one public web page and return the slug its report is read by",
  failure: Schema.Union([ScanTargetRejected, DailyCapReached]),
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
  failure: UnknownScan,
  input: Schema.Struct({
    slug: Schema.String.annotate({
      description: "The site's hostname without www, for example example.com",
    }),
  }),
  output: ScanViewSchema,
});
