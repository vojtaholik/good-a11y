import type { ScanJob } from "@eaa-check/core";
import * as Cloudflare from "alchemy/Cloudflare";

export const EvidenceArchive = Cloudflare.R2.Bucket("EvidenceArchive");

export const axeEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.axe.json`;

export const pageEvidenceKey = (job: ScanJob): string =>
  `${job.slug}/${job.scanId}.evidence.json`;
