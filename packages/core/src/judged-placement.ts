import { JUDGE_MODEL_NAME } from "./judge.js";
import { DOES_NOT_SELL, shownObservations } from "./judged.js";
import type { JudgedId, Observation } from "./judged.js";
import { verifiedText } from "./reference.js";
import type { Sourced } from "./reference.js";
import type { Report } from "./report.js";

export const PLACED_JUDGED_IDS: ReadonlySet<JudgedId> = new Set([
  "sells-to-consumers",
  "statement-annex-v",
]);

const observationsOf = (report: Report): readonly Observation[] =>
  report.judged?.status === "ran"
    ? shownObservations(report.judged.observations)
    : [];

export const sectionObservations = (report: Report): readonly Observation[] =>
  observationsOf(report).filter(
    (observation) => !PLACED_JUDGED_IDS.has(observation.id)
  );

export const placedObservation = (
  report: Report,
  id: JudgedId
): Observation | null =>
  observationsOf(report).find(
    (observation) => observation.id === id && observation.asked > 0
  ) ?? null;

export const percent = (probability: number): string =>
  `${Math.round(probability * 100)}%`;

export const sellsLine = (report: Report): string | null => {
  const [note] = placedObservation(report, "sells-to-consumers")?.notes ?? [];

  return note === undefined
    ? null
    : `Judged by a model (${JUDGE_MODEL_NAME}), not used for the list of states: ${note.sample} Model confidence ${percent(note.confidence)}.`;
};

export const ECOMMERCE_DEFINITION_FACT = "EU-DEF-1";

export const NOT_SELLING_LEAD =
  "If the model is right, the EAA's e-commerce rules may not apply to this site: they cover services provided with a view to concluding a consumer contract.";

export const notSellingBasis = (report: Report): Sourced | null => {
  const [note] = placedObservation(report, "sells-to-consumers")?.notes ?? [];

  return note?.sample === DOES_NOT_SELL
    ? verifiedText(ECOMMERCE_DEFINITION_FACT)
    : null;
};
