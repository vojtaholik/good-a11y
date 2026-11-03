export {
  APPLICABILITY,
  ApplicabilitySchema,
  MICROENTERPRISE_FACT,
  PROFILE_LABELS,
  UNKNOWN_VALUE,
  ProfileLineSchema,
  StateRefSchema,
  applicabilityFrom,
  type Applicability,
  type ProfileLine,
  type StateRef,
} from "./applicability.js";

export { decodeBody, readCapped } from "./body.js";

export {
  CATALOGUE,
  CHECKS,
  catalogueIds,
  criterion,
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
  STATIC_TESTED,
  coverageFrom,
  testedBy,
  type Coverage,
  type Method,
  type Tested,
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
  NEWER_PUBLISHED_FACT,
  NEWER_VERSION_LABEL,
  newerWcagLabel,
  NO_CITATION_FACT,
  NewerVersionSchema,
  REFERENCE,
  ReferenceSchema,
  SourcedSchema,
  referenceFrom,
  type NewerVersion,
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
  REFUSED_THEN_RENDERED,
  UNREACHABLE_HEADLINE,
  FindingSchema,
  OutcomeSchema,
  ReportSchema,
  referencesOf,
  reportOf,
  runChecks,
  withRendered,
  type Finding,
  type FindingReference,
  type Outcome,
  type PageVisit,
  type Report,
} from "./report.js";

export { formatReport } from "./report-text.js";

export { QUOTE_MARK, fixPromptFor, fixPromptOf } from "./fix-prompt.js";

export {
  ISSUE_SAMPLES,
  isTested,
  SAMPLE_SOURCE_LABELS,
  SAME_CONCERN,
  concernOf,
  issuesFrom,
  issuesOf,
  levelOf,
  quietChecksOf,
  quietSummary,
  type Issue,
  type IssueSample,
  type SampleSource,
  type Level,
} from "./report-sections.js";

export {
  AxeResultsJson,
  AxeResultsSchema,
  AxeRuleSchema,
  type AxeResults,
  type AxeRule,
} from "./axe-results.js";

export {
  AXE_TAGS,
  DAILY_BROWSER_SECONDS,
  RENDERED_AUDIT_RESERVE_SECONDS,
  RENDERED_HTML_CHARACTERS,
  RenderedAudit,
  type RenderedPage,
} from "./rendered-audit.js";

export { RenderedAuditFailed } from "./rendered-audit-failed.js";

export {
  BUDGET_SPENT,
  DROPPED_RULES,
  RENDERED_BLOCKED,
  RENDERED_UNREADABLE,
  RenderedFindingSchema,
  RenderedSchema,
  criteriaOfRule,
  renderedFrom,
  renderedOf,
  skippedBecause,
  type Rendered,
  type RenderedFinding,
  type RenderedOutcome,
} from "./rendered.js";

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
  inspectPage,
  inspectUrl,
  judgePage,
  type Inspection,
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

export { ScanUnavailable } from "./scan-unavailable.js";

export { UnknownScan } from "./unknown-scan.js";

export {
  HeadingEvidenceSchema,
  LinkEvidenceSchema,
  MAX_CONTEXT,
  MAX_TEXT_SAMPLE,
  type HeadingEvidence,
  type LinkEvidence,
} from "./page-evidence.js";

export {
  Judge,
  JUDGE_MODEL,
  JUDGE_MODEL_NAME,
  JudgeReplySchema,
  JudgeRequestSchema,
  type Answer,
  type JudgeReply,
  type JudgeRequest,
  type Question,
} from "./judge.js";

export {
  DAILY_JUDGE_TOKENS,
  EU_LANGUAGES,
  JUDGE_BUDGET_SPENT,
  JUDGE_FAILED,
  JUDGE_NOT_CHECKED,
  JUDGE_UNBOUND,
  JUDGED_CHECKS,
  JUDGED_LABEL,
  JudgedIdSchema,
  JudgedSchema,
  MAX_JUDGED_ITEMS,
  NOTE_AT,
  ObservationSchema,
  judgedOf,
  judgedSkipped,
  questionsFor,
  questionsOf,
  SHOWN_JUDGED_CHECKS,
  shownObservations,
  tokensToReserve,
  type Answered,
  type Asked,
  type Judged,
  type JudgedId,
  type Observation,
} from "./judged.js";

export { withJudged } from "./report.js";

export { JudgeUnavailable } from "./judge-unavailable.js";

export {
  FOCUS_JUDGED_STOPS,
  PROBES,
  ProbeResultSchema,
  ProbesJson,
  ProbesMeasuredSchema,
  TRAP_PRESSES,
  TRAP_SIZE,
  probeResults,
} from "./probes.js";

export type { ProbeId, ProbeResult, ProbesMeasured } from "./probes.js";
