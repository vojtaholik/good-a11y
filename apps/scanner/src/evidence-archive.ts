import type { CrawlRole, ScanJob } from "@eaa-check/core";
import * as Cloudflare from "alchemy/Cloudflare";

export const EvidenceArchive = Cloudflare.R2.Bucket("EvidenceArchive");

export const axeEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.axe.json`;

export const siteEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.site.json`;

export const crawledEvidenceKey = (job: ScanJob, role: CrawlRole): string =>
  `${job.slug}/${job.scanId}.${role}.evidence.json`;

export const crawledPageKey = (job: ScanJob, role: CrawlRole): string =>
  `${job.slug}/${job.scanId}.${role}.html`;

export const pageEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.evidence.json`;
