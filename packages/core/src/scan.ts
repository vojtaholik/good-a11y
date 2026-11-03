import { implement } from "@eaa-check/capability/implement";
import { Clock, DateTime, Effect } from "effect";

import { scanContract } from "./contracts.js";
import type { FetchResult } from "./fetch-result.js";
import type { PageEvidence } from "./page-evidence.js";
import { PageReader } from "./page-reader.js";
import type { PageReading } from "./page-reader.js";
import { unmaskedAtTheTestedAddress } from "./refusal.js";
import { reportOf, runChecks } from "./report.js";
import type { Report } from "./report.js";
import { SafeFetch } from "./safe-fetch.js";
import { parseScanTarget } from "./scan-target.js";
import type { ScanTarget } from "./scan-target.js";

export const SCANNER_USER_AGENT =
  "Mozilla/5.0 (compatible; eaa-check/0.1; accessibility checker by studio9)";

const HTML_TYPES = new Set(["text/html", "application/xhtml+xml"]);

const isHtml = (contentType: string): boolean => {
  const type = contentType.split(";")[0]?.trim().toLowerCase() ?? "";

  return type === "" || HTML_TYPES.has(type);
};

export const LOOKS_EMPTY =
  "The HTML holds no links, images, buttons or form fields. The page probably builds its content with JavaScript, which these checks do not run, so most checks had nothing to judge.";

const looksEmpty = (evidence: PageEvidence): boolean =>
  evidence.links.length === 0 &&
  evidence.images.length === 0 &&
  evidence.buttons.length === 0 &&
  evidence.controls.length === 0;

export const fetchPage = (target: ScanTarget) =>
  Effect.gen(function* fetchTestedPage() {
    const safeFetch = yield* SafeFetch;

    const fetched = yield* safeFetch.fetch(target.url, {
      userAgent: SCANNER_USER_AGENT,
    });

    return unmaskedAtTheTestedAddress(fetched);
  });

export interface Inspection {
  readonly evidence: PageEvidence | null;
  readonly report: Report;
}

const unread = (report: Report): Inspection => ({ evidence: null, report });

export const inspectPage = (
  fetched: FetchResult,
  reader: PageReading,
  scannedAt: string
): Inspection => {
  if (!fetched.ok) {
    return unread(
      reportOf(
        {
          finalUrl: null,
          httpStatus: fetched.status ?? null,
          outcome: fetched.reason === "blocked" ? "refused" : "unreachable",
          outcomeDetail: fetched.detail,
          requestedUrl: fetched.requestedUrl,
          scannedAt,
          truncated: false,
        },
        []
      )
    );
  }

  const visit = {
    finalUrl: fetched.finalUrl,
    httpStatus: fetched.status,
    requestedUrl: fetched.requestedUrl,
    scannedAt,
    truncated: fetched.truncated,
  };

  if (!isHtml(fetched.contentType)) {
    return unread(
      reportOf(
        {
          ...visit,
          outcome: "not_html",
          outcomeDetail: `The address answered with ${fetched.contentType}, not an HTML page.`,
        },
        []
      )
    );
  }

  const evidence = reader.read(fetched.body);

  const report = reportOf(
    {
      ...visit,
      outcome: "checked",
      outcomeDetail: [
        fetched.status >= 400
          ? `The page answered with HTTP ${fetched.status}; the checks ran on the HTML it sent.`
          : "The checks ran on the HTML the page sent.",
        ...(looksEmpty(evidence) ? [LOOKS_EMPTY] : []),
      ].join(" "),
      truncated: fetched.truncated || evidence.truncated,
    },
    runChecks(evidence)
  );

  return { evidence, report };
};

export const judgePage = (
  fetched: FetchResult,
  reader: PageReading,
  scannedAt: string
): Report => inspectPage(fetched, reader, scannedAt).report;

export const inspectUrl = Effect.fn("inspectUrl")(function* inspectUrl(
  url: string
) {
  const target = yield* Effect.fromResult(parseScanTarget(url));
  const fetched = yield* fetchPage(target);
  const reader = yield* PageReader;
  const now = yield* Clock.currentTimeMillis;

  return inspectPage(
    fetched,
    reader,
    DateTime.formatIso(DateTime.makeUnsafe(now))
  );
});

export const scanUrl = (url: string) =>
  inspectUrl(url).pipe(Effect.map(({ report }) => report));

export const scan = implement(scanContract, ({ url }) => scanUrl(url));

export const capabilities = [scan] as const;
