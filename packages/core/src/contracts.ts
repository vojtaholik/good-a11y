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

export type { Applicability, ProfileLine, StateRef } from "./applicability.js";

export { fixPromptFor } from "./fix-prompt.js";

export {
  isTested,
  SAMPLE_SOURCE_LABELS,
  SAME_CONCERN,
  concernOf,
  issuesFrom,
  issuesOf,
  quietChecksOf,
  quietSummary,
  type Issue,
  type IssueSample,
  type SampleSource,
} from "./report-sections.js";

export type { FindingReference } from "./report.js";

export {
  NEWER_VERSION_LABEL,
  newerWcagLabel,
  type Sourced,
} from "./reference.js";

export { METHOD_NAMES } from "./coverage.js";

export type { Verdict } from "./verdict.js";

export type { Site, SitePageResult } from "./report.js";

export { ROLE_NAMES, siteSummary, type SiteFinding } from "./site-checks.js";

export {
  EXAMPLE_LABEL,
  REQUIREMENT_STATUS_NAMES,
  REQUIREMENT_STATUS_ORDER,
  COMPARED_PREFIX,
  COMPARED_RESULTS,
  checklistGroups,
  requirementsOf,
  statusCounts,
  tallyText,
  type RequirementGroupView,
  type RequirementRow,
  type RequirementStatus,
} from "./requirements.js";

export { AXE_CORE_VERSION } from "./axe-rules.js";

export type { Rendered, RenderedFinding } from "./rendered.js";

export { DailyCapReached } from "./daily-cap-reached.js";

export {
  ContactMessageSchema,
  MAX_MESSAGE_LENGTH,
  type ContactMessage,
} from "./contact-message.js";

export {
  getScanContract,
  sendMessageContract,
  startScanContract,
} from "./scan-lifecycle.js";

export { ScanTargetRejected } from "./scan-target-rejected.js";

export { ScanViewSchema, type ScanView } from "./scan-view.js";

export { ScanUnavailable } from "./scan-unavailable.js";

export { UnknownScan } from "./unknown-scan.js";

export type { Judged, Observation } from "./judged.js";

export { shownObservations } from "./judged.js";

export {
  SC_COVERAGE,
  TEST_METHOD_NAMES,
  scCoverageCounts,
  scCoverageSummary,
  type ScCoverageRow,
  type TestMethod,
} from "./sc-coverage.js";
