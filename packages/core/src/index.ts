export {
  APPLICABILITY,
  ApplicabilitySchema,
  StateRefSchema,
  applicabilityFrom,
  type Applicability,
  type StateRef,
} from "./applicability.js";

export { decodeBody, readCapped } from "./body.js";

export {
  CATALOGUE,
  CHECKS,
  catalogueIds,
  criteriaOf,
  entryOf,
  type CatalogueEntry,
  type Criterion,
} from "./catalogue.js";

export {
  CheckIdSchema,
  CheckResultSchema,
  CheckStatusSchema,
  MAX_SAMPLES,
  type Check,
  type CheckId,
  type CheckResult,
  type CheckStatus,
} from "./check.js";

export { blocksZoom } from "./checks/meta-viewport-zoom.js";

export { refreshesLater } from "./checks/meta-refresh.js";

export {
  CHALLENGE_SYSTEM_NAMES,
  ChallengeSystemSchema,
  challengeIn,
  type ChallengeSystem,
} from "./challenge.js";

export { scanContract } from "./contracts.js";

export {
  CoverageSchema,
  METHOD_NAMES,
  MethodSchema,
  STATIC_COVERAGE,
  coverageFrom,
  type Coverage,
  type Method,
} from "./coverage.js";

export {
  FetchFailureReasonSchema,
  FetchFailureSchema,
  FetchResultSchema,
  FetchSuccessSchema,
  RedirectSchema,
  type FetchFailure,
  type FetchFailureReason,
  type FetchResult,
  type FetchSuccess,
  type Redirect,
} from "./fetch-result.js";

export {
  HopTransport,
  type HeaderMap,
  type HopRequest,
  type HopResponse,
} from "./hop-transport.js";

export {
  ControlEvidenceSchema,
  FrameEvidenceSchema,
  ImageEvidenceSchema,
  MAX_ELEMENTS_PER_KIND,
  MAX_NAME,
  MAX_SNIPPET,
  NamedEvidenceSchema,
  PageEvidenceSchema,
  type ControlEvidence,
  type FrameEvidence,
  type ImageEvidence,
  type NamedEvidence,
  type PageEvidence,
} from "./page-evidence.js";

export { PageReader, type PageReading } from "./page-reader.js";

export {
  MAX_URL_LENGTH,
  vetUrl,
  type PublicUrl,
  type UrlRejection,
} from "./public-url.js";

export {
  CITED_VERSION_USE,
  LEGAL_REQUIREMENT_USE,
  NO_CITATION_FACT,
  REFERENCE,
  ReferenceSchema,
  SourcedSchema,
  referenceFrom,
  type Reference,
  type Sourced,
  type Version,
} from "./reference.js";

export {
  looksBlocked,
  refusesAPlainRequest,
  unmasked,
  unmaskedAtTheTestedAddress,
} from "./refusal.js";

export {
  AUTOMATED_LIMIT,
  AUTOMATED_LIMIT_FACT,
  BLOCKED_CONTACT_TEXT,
  BLOCKED_HEADLINE,
  CONTACT_TEXT,
  NOT_HTML_HEADLINE,
  UNREACHABLE_HEADLINE,
  FindingSchema,
  OutcomeSchema,
  ReportSchema,
  referencesOf,
  reportOf,
  runChecks,
  type Finding,
  type FindingReference,
  type Outcome,
  type PageVisit,
  type Report,
} from "./report.js";

export { formatReport } from "./report-text.js";

export {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_TIMEOUT,
  SafeFetch,
  type FetchOptions,
} from "./safe-fetch.js";

export {
  LOOKS_EMPTY,
  SCANNER_USER_AGENT,
  capabilities,
  fetchPage,
  judgePage,
  scan,
  scanUrl,
} from "./scan.js";

export { ScanTargetRejected } from "./scan-target-rejected.js";

export {
  ScanTargetSchema,
  parseScanTarget,
  type ScanTarget,
} from "./scan-target.js";

export { TransportFailure } from "./transport-failure.js";

export { DailyCapReached } from "./daily-cap-reached.js";

export {
  SCAN_FAILED,
  ScanJobSchema,
  ScanOutcomeSchema,
  type ScanJob,
  type ScanOutcome,
} from "./scan-job.js";

export { getScanContract, startScanContract } from "./scan-lifecycle.js";

export { runScan, scanMachine } from "./scan-machine.js";

export { ScanStepFailed } from "./scan-step-failed.js";

export { ScanSteps } from "./scan-steps.js";

export {
  STALE_AFTER_MILLIS,
  ScanStageSchema,
  ScanViewSchema,
  readAt,
  slugKey,
  slugOf,
  type ScanStage,
  type ScanView,
} from "./scan-view.js";

export { UnknownScan } from "./unknown-scan.js";
