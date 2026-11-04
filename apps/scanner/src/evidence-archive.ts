import type { CrawlRole, ScanJob } from "@good-a11y/core";
import * as Cloudflare from "alchemy/Cloudflare";

export const EVIDENCE_DAYS = 30;

export const EvidenceArchive = Cloudflare.R2.Bucket("EvidenceArchive", {
  lifecycleRules: [
    {
      deleteObjectsTransition: {
        condition: { maxAge: EVIDENCE_DAYS * 24 * 60 * 60, type: "Age" },
      },
      id: "delete-evidence-after-30-days",
    },
  ],
});

export const axeEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.axe.json`;

export const siteEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.site.json`;

export const crawledEvidenceKey = (job: ScanJob, role: CrawlRole): string =>
  `${job.slug}/${job.scanId}.${role}.evidence.json`;

export const renderedEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.rendered-evidence.json`;

export const pageEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.evidence.json`;
