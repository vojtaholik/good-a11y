import type { Check, CheckId } from "./check.js";
import { buttonName } from "./checks/button-name.js";
import { documentTitle } from "./checks/document-title.js";
import { formLabels } from "./checks/form-labels.js";
import { frameTitle } from "./checks/frame-title.js";
import { htmlLang } from "./checks/html-lang.js";
import { imageAlt } from "./checks/image-alt.js";
import { linkName } from "./checks/link-name.js";
import { metaRefresh } from "./checks/meta-refresh.js";
import { metaViewportZoom } from "./checks/meta-viewport-zoom.js";

export interface CatalogueEntry {
  readonly check: Check;
  readonly criteria: readonly string[];
}

const criterion = (number: string) => ({
  en3: `STD-EN-9.${number}`,
  en4: `STD-EN4-9.${number}`,
  sc: `STD-SC-${number}`,
});

export type Criterion = ReturnType<typeof criterion>;

export const CATALOGUE: readonly CatalogueEntry[] = [
  { check: htmlLang, criteria: ["3.1.1"] },
  { check: documentTitle, criteria: ["2.4.2"] },
  { check: imageAlt, criteria: ["1.1.1"] },
  { check: formLabels, criteria: ["1.3.1", "4.1.2"] },
  { check: linkName, criteria: ["2.4.4", "4.1.2"] },
  { check: buttonName, criteria: ["4.1.2"] },
  { check: frameTitle, criteria: ["4.1.2"] },
  { check: metaViewportZoom, criteria: ["1.4.4"] },
  { check: metaRefresh, criteria: ["2.2.1"] },
];

export const CHECKS: readonly Check[] = CATALOGUE.map(({ check }) => check);

export const criteriaOf = (entry: CatalogueEntry): readonly Criterion[] =>
  entry.criteria.map(criterion);

export const catalogueIds = (): readonly string[] =>
  CATALOGUE.flatMap(criteriaOf).flatMap(({ en3, en4, sc }) => [sc, en3, en4]);

export const entryOf = (id: CheckId): CatalogueEntry | undefined =>
  CATALOGUE.find((entry) => entry.check.id === id);
