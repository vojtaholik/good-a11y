import { defineContract } from "@eaa-check/capability/contract";
import { Schema } from "effect";

import { ReportSchema } from "./report.js";
import { ScanTargetRejected } from "./scan-target-rejected.js";

export { ReportSchema } from "./report.js";

export type { Finding, Report } from "./report.js";

export const scanContract = defineContract("scan", {
  annotations: { idempotent: true, openWorld: true, readOnly: true },
  description:
    "Fetch one public web page and run the automated accessibility checks on its HTML",
  failure: ScanTargetRejected,
  input: Schema.Struct({
    url: Schema.String.annotate({
      description: "Address of the page to check, for example example.com",
    }),
  }),
  output: ReportSchema,
});

export type { Applicability, StateRef } from "./applicability.js";

export type { FindingReference } from "./report.js";

export { DailyCapReached } from "./daily-cap-reached.js";

export { getScanContract, startScanContract } from "./scan-lifecycle.js";

export { ScanTargetRejected } from "./scan-target-rejected.js";

export { ScanViewSchema, type ScanView } from "./scan-view.js";

export { UnknownScan } from "./unknown-scan.js";
