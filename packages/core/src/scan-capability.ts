import { implement } from "@good-a11y/capability/implement";
import { Effect } from "effect";

import { scanContract } from "./contracts.js";
import { crawlSite } from "./crawl-site.js";
import { withSite } from "./report.js";
import { inspectUrl } from "./scan.js";

export const scanUrl = Effect.fn("scanUrl")(function* scanUrl(url: string) {
  const { evidence, report } = yield* inspectUrl(url);

  if (report.outcome !== "checked" || evidence === null) {
    return report;
  }

  const crawl = yield* crawlSite(
    report.finalUrl ?? report.requestedUrl,
    evidence
  );

  return withSite(report, crawl.site);
});

export const scan = implement(scanContract, ({ url }) => scanUrl(url));

export const capabilities = [scan] as const;
