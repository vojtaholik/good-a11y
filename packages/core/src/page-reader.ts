import { Context } from "effect";

import type { PageEvidence } from "./page-evidence.js";

export interface PageReading {
  readonly read: (html: string) => PageEvidence;
}

export class PageReader extends Context.Service<PageReader, PageReading>()(
  "@good-a11y/core/PageReader"
) {}
