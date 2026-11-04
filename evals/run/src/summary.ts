import type { GuideIndex } from "@good-a11y/guides";

import type { RunResult } from "./run.js";

export interface QueryLog {
  readonly agent: string;
  readonly app: string;
  readonly expected: string;
  readonly query: string;
  readonly run: string;
  readonly top3: readonly string[];
}

const rate = (results: readonly RunResult[]): number | null => {
  const graded = results.filter((result) => result.status === "graded");

  return graded.length === 0
    ? null
    : graded.filter((result) => result.passed).length / graded.length;
};

const percent = (value: number | null): string =>
  value === null ? "n/a" : `${Math.round(value * 100)}%`;

const countOf = (results: readonly RunResult[]): string => {
  const graded = results.filter((result) => result.status === "graded");

  return `${graded.filter((result) => result.passed).length}/${graded.length}`;
};

const mean = (values: readonly number[]): number | null =>
  values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;

const tokensOf = (result: RunResult): number | null =>
  result.transcript.usage === null
    ? null
    : result.transcript.usage.inputTokens +
      result.transcript.usage.cachedInputTokens +
      result.transcript.usage.outputTokens;

const formatTokens = (value: number | null): string =>
  value === null ? "n/a" : `${Math.round(value / 1000)}k`;

const costOf = (results: readonly RunResult[]): string => {
  const costs = results.flatMap((result) =>
    result.transcript.usage?.costUsd === null ||
    result.transcript.usage === null
      ? []
      : [result.transcript.usage.costUsd]
  );

  return costs.length === 0
    ? "n/a"
    : `$${(costs.reduce((sum, cost) => sum + cost, 0) / costs.length).toFixed(2)}`;
};

export const queryLogOf = (
  results: readonly RunResult[],
  index: GuideIndex
): QueryLog[] =>
  results
    .filter((result) => result.arm === "guided")
    .flatMap((result) =>
      result.transcript.use.searches.map((query) => ({
        agent: result.agent,
        app: result.app,
        expected: result.guide,
        query,
        run: result.id,
        top3: index
          .search(query)
          .slice(0, 3)
          .map((hit) => hit.id),
      }))
    );

export const summaryOf = (results: readonly RunResult[]): string => {
  const lines = ["# good-a11y eval", ""];
  const guides = [...new Set(results.map((result) => result.guide))].toSorted();

  for (const guide of guides) {
    const forGuide = results.filter((result) => result.guide === guide);
    lines.push(
      `## ${guide}`,
      "",
      "| Agent | Unguided pass | Guided pass | Uplift | Guided runs that retrieved the guide | Opened the skill | Mean tokens (unguided / guided) | Mean cost (unguided / guided) | Mean minutes | Errors |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
    );

    for (const agent of [
      ...new Set(forGuide.map((result) => result.agent)),
    ].toSorted()) {
      const runs = forGuide.filter((result) => result.agent === agent);
      const unguided = runs.filter((result) => result.arm === "unguided");
      const guided = runs.filter((result) => result.arm === "guided");
      const unguidedRate = rate(unguided);
      const guidedRate = rate(guided);

      const uplift =
        unguidedRate === null || guidedRate === null
          ? "n/a"
          : `${Math.round((guidedRate - unguidedRate) * 100)} points`;

      const minutes = mean(runs.map((result) => result.durationMs / 60_000));

      lines.push(
        `| ${agent} | ${countOf(unguided)} (${percent(unguidedRate)}) | ${countOf(guided)} (${percent(guidedRate)}) | ${uplift} | ${guided.filter((result) => result.guideRetrieved).length}/${guided.length} | ${guided.filter((result) => result.transcript.use.skillOpened).length}/${guided.length} | ${formatTokens(mean(unguided.flatMap((result) => tokensOf(result) ?? [])))} / ${formatTokens(mean(guided.flatMap((result) => tokensOf(result) ?? [])))} | ${costOf(unguided)} / ${costOf(guided)} | ${minutes === null ? "n/a" : minutes.toFixed(1)} | ${runs.filter((result) => result.status !== "graded").length} |`
      );
    }

    lines.push("", "### Runs", "");

    for (const result of forGuide) {
      const failed = result.expectations
        .filter((expectation) => !expectation.ok)
        .map((expectation) => expectation.title);

      const detail =
        result.status === "graded"
          ? [
              failed.length === 0
                ? "all expectations pass"
                : `fails ${failed.join("; ")} (first error: ${result.expectations.find((expectation) => !expectation.ok)?.error ?? "none reported"})`,
              result.check === null || result.check.guideFailing.length === 0
                ? "no check issue for this guide"
                : `check issues ${result.check.guideFailing.join(", ")}`,
            ].join(", ")
          : `${result.status}: ${result.problem ?? ""}`;

      lines.push(
        `- \`${result.id}\`: ${result.passed ? "pass" : "fail"}, ${detail}`
      );
    }

    lines.push("");
  }

  return lines.join("\n");
};
