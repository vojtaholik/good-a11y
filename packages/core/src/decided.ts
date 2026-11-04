import { AXE_RULES } from "./axe-rules.js";
import { entryOf } from "./catalogue.js";
import type { FindingReference } from "./finding-reference.js";
import type { Report } from "./report.js";

export interface EmptyByMethod {
  readonly rendered: ReadonlySet<string> | null;
  readonly served: ReadonlySet<string> | null;
}

export interface Decided {
  readonly decided: ReadonlySet<string>;
  readonly empty: EmptyByMethod;
  readonly undecided: ReadonlySet<string>;
}

const SC_NUMBER = /^STD-SC(?:22)?-(?<number>\d+\.\d+\.\d+)$/u;

export const numbersOf = (references: readonly FindingReference[]): string[] =>
  references.flatMap((reference) => {
    const number = SC_NUMBER.exec(reference.factId)?.groups?.number;

    return number === undefined ? [] : [number];
  });

const ruleCriteria = (rules: readonly string[]): string[] =>
  rules.flatMap((rule) => AXE_RULES.get(rule)?.criteria ?? []);

export const decidedOf = (report: Report): Decided => {
  const served = report.outcome === "checked" ? report.findings : [];

  const rendered = report.rendered?.status === "ran" ? report.rendered : null;

  const decided = new Set([
    ...served.flatMap((finding) =>
      finding.status === "not_applicable"
        ? []
        : (entryOf(finding.id)?.criteria ?? [])
    ),
    ...(rendered === null
      ? []
      : [
          ...ruleCriteria(rendered.passed),
          ...rendered.findings.flatMap((finding) =>
            numbersOf(finding.references)
          ),
          ...rendered.probes.flatMap((probe) =>
            probe.status === "not_applicable" ? [] : [probe.criterion]
          ),
        ]),
  ]);

  const settled = new Set([
    ...(rendered?.passed ?? []),
    ...(rendered?.findings ?? []).map((finding) => finding.rule),
    ...(rendered?.inapplicable ?? []),
  ]);

  const undecidedOnly = (numbers: readonly string[]): ReadonlySet<string> =>
    new Set(numbers.filter((number) => !decided.has(number)));

  const empty: EmptyByMethod = {
    rendered:
      rendered === null
        ? null
        : undecidedOnly([
            ...ruleCriteria(rendered.inapplicable),
            ...rendered.probes.flatMap((probe) =>
              probe.status === "not_applicable" ? [probe.criterion] : []
            ),
          ]),
    served:
      report.outcome === "checked"
        ? undecidedOnly(
            served.flatMap((finding) =>
              finding.status === "not_applicable"
                ? (entryOf(finding.id)?.criteria ?? [])
                : []
            )
          )
        : null,
  };

  const anyEmpty = new Set([
    ...(empty.served ?? []),
    ...(empty.rendered ?? []),
  ]);

  const undecided = new Set(
    ruleCriteria(
      (rendered?.rules ?? []).filter((rule) => !settled.has(rule))
    ).filter((number) => !decided.has(number) && !anyEmpty.has(number))
  );

  return { decided, empty, undecided };
};
