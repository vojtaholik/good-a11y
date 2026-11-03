import { Context } from "effect";
import type { Effect } from "effect";

import type { HeaderMap } from "./hop-transport.js";
import type { PublicUrl } from "./public-url.js";
import type { RenderedAuditFailed } from "./rendered-audit-failed.js";

export const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

export const DAILY_BROWSER_SECONDS = 1080;

export const RENDERED_AUDIT_RESERVE_SECONDS = 110;

export const RENDERED_HTML_CHARACTERS = 100_000;

export interface RenderedPage {
  readonly axe: string;
  readonly headers: HeaderMap;
  readonly html: string;
  readonly probes: string | null;
  readonly status: number | null;
}

export class RenderedAudit extends Context.Service<
  RenderedAudit,
  {
    readonly audit: (
      url: PublicUrl
    ) => Effect.Effect<RenderedPage, RenderedAuditFailed>;
  }
>()("@eaa-check/core/RenderedAudit") {}
