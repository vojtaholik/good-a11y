import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path, Schema } from "effect";

import { EvalResultsSchema } from "../src/evals.js";
import type {
  AgentId,
  EvalCell,
  EvalEntry,
  EvalResults,
  Rate,
} from "../src/evals.js";

const rate = ([passed, runs]: Rate): string => `${passed}/${runs}`;

const guided = (cell: EvalCell): string =>
  cell.guidedBefore === undefined
    ? rate(cell.guided)
    : `${rate(cell.guidedBefore)}, then ${rate(cell.guided)}`;

const arms = (entry: EvalEntry): readonly string[] => [
  rate(entry.cells.claude.unguided),
  guided(entry.cells.claude),
  rate(entry.cells.codex.unguided),
  guided(entry.cells.codex),
];

const SHIPS_FOR: Readonly<Record<AgentId, string>> = {
  claude: "Claude",
  codex: "Codex",
};

const shipsFor = (entry: EvalEntry): string => {
  if (!entry.published) {
    return "neither, removed";
  }

  if (entry.shipsFor.length === 2) {
    return "both";
  }

  return entry.shipsFor[0] === undefined
    ? "neither"
    : SHIPS_FOR[entry.shipsFor[0]];
};

const row = (cells: readonly string[]): string => `| ${cells.join(" | ")} |`;

const sections = (doc: string): ReadonlyMap<string, string> =>
  new Map(
    doc
      .split(/^#{2,3} /mu)
      .slice(1)
      .map((section) => {
        const [heading = "", ...body] = section.split("\n");

        return [heading, body.join("\n")] as const;
      })
  );

const tables = (section: string): readonly (readonly string[])[] =>
  section
    .split(/\n(?!\|)/u)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => line.startsWith("|"))
        .slice(2)
    )
    .filter((body) => body.length > 0);

const firstRate = (cell: string): string =>
  /\d+\/\d+/u.exec(cell)?.[0] ?? cell.trim();

const columns = (line: string): readonly string[] =>
  line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

const inRound = (results: EvalResults, round: string) =>
  results.guides.filter((entry) => entry.round === round);

const screen = (results: EvalResults, name: string) =>
  results.screens.filter((candidate) => candidate.screen === name);

const read = Effect.gen(function* read() {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const root = path.resolve(import.meta.dirname, "../../..");

  const results = yield* fileSystem
    .readFileString(path.join(root, "evals/results.json"))
    .pipe(
      Effect.flatMap(
        Schema.decodeEffect(Schema.fromJsonString(EvalResultsSchema))
      )
    );

  const doc = yield* fileSystem.readFileString(
    path.join(root, "docs/evals.md")
  );

  return { doc: sections(doc), results };
});

const section = (doc: ReadonlyMap<string, string>, heading: string): string =>
  doc.get(heading) ?? "";

it.layer(NodeServices.layer)("evals/results.json", (test) => {
  test.effect("matches the guide tables in docs/evals.md", () =>
    Effect.gen(function* guideTables() {
      const { doc, results } = yield* read;

      const shipTable = (heading: string, round: string, index: number) => {
        expect(tables(section(doc, heading))[index]).toEqual(
          inRound(results, round).map((entry) =>
            row([entry.guide, ...arms(entry), shipsFor(entry)])
          )
        );
      };

      shipTable("Round 1 (2026-11-04)", "Round 1", 0);
      shipTable("Layer 5, first guides (2026-11-04)", "Screens 1 and 2", 0);
      shipTable("Layer 5, screen 3 (2026-11-04)", "Screen 3", 0);
      shipTable("Layer 5, screen 4 (2026-11-05)", "Screen 4", 1);

      expect(
        tables(
          section(
            doc,
            "Screen 4 follow-up: autofill-off and press-remove (2026-11-05)"
          )
        )[0]
      ).toEqual(
        inRound(results, "Screen 4 follow-up").map((entry) =>
          row([entry.task ?? "", ...arms(entry)])
        )
      );

      const screen5 = section(
        doc,
        "Layer 5, screen 5: the WCAG 3 draft (2026-11-05)"
      );

      const [confirmEmail, ...perTask] = inRound(
        results,
        "Screen 5"
      ).toReversed();

      expect(tables(screen5)[1]).toEqual(
        perTask
          .toReversed()
          .map((entry) => row([entry.guide, entry.task ?? "", ...arms(entry)]))
      );

      expect(confirmEmail?.task).toBe("confirm email field");
      expect(screen5).toContain(
        `Claude ${rate(confirmEmail?.cells.claude.unguided ?? [0, 0])} unguided and ${rate(confirmEmail?.cells.claude.guided ?? [0, 0])} guided, Codex ${rate(confirmEmail?.cells.codex.unguided ?? [0, 0])} unguided and ${rate(confirmEmail?.cells.codex.guided ?? [0, 0])} guided`
      );
    })
  );

  test.effect("matches the screens in docs/evals.md", () =>
    Effect.gen(function* screens() {
      const { doc, results } = yield* read;

      const firstGuides = section(doc, "Layer 5, first guides (2026-11-04)");

      const passedBoth = (name: string) =>
        screen(results, name).filter(
          (candidate) =>
            candidate.claude === "pass" && candidate.codex === "pass"
        ).length;

      expect(firstGuides).toContain(
        `Screen 1, ${screen(results, "Screen 1").length} candidates: ${passedBoth("Screen 1")} passed for both agents`
      );
      expect(firstGuides).toContain(
        `Screen 2, ${screen(results, "Screen 2").length} candidates`
      );

      for (const [heading, name] of [
        ["Layer 5, screen 3 (2026-11-04)", "Screen 3"],
        ["Layer 5, screen 4 (2026-11-05)", "Screen 4"],
      ] as const) {
        const text = section(doc, heading);

        expect(text).toContain(`${screen(results, name).length} candidates`);
        expect(text).toContain(`Agents passed ${passedBoth(name)} for both.`);
      }

      expect(
        tables(
          section(doc, "Layer 5, screen 5: the WCAG 3 draft (2026-11-05)")
        )[0]?.map((line) => {
          const [task = "", , claude = "", codex = ""] = columns(line);

          return [task, claude, codex];
        })
      ).toEqual(
        screen(results, "Screen 5").map((candidate) => [
          candidate.candidate,
          candidate.claude,
          candidate.codex,
        ])
      );
    })
  );

  test.effect("matches the URL route and the scenarios step", () =>
    Effect.gen(function* studies() {
      const { doc, results } = yield* read;

      const name = (agent: string) =>
        results.agents.find((entry) => entry.id === agent)?.name.split(" ")[0];

      expect(
        tables(section(doc, "The URL route (2026-11-05)"))[0]?.map((line) =>
          columns(line).map(firstRate)
        )
      ).toEqual(
        results.urlRoute
          .filter((entry) => entry.study !== "url")
          .map((entry) => [
            name(entry.agent),
            entry.arm === "url" && entry.agent === "codex"
              ? "url (default sandbox, no network)"
              : entry.arm,
            `${entry.passed}/${entry.graded}`,
            entry.installed === null
              ? "(preinstalled)"
              : `${entry.installed}/${entry.runs}`,
            `${entry.ranCheck ?? 0}/${entry.runs}`,
          ])
      );

      const gap = results.urlRoute.filter((entry) => entry.study === "url");
      const codex = gap.find((entry) => entry.agent === "codex");
      const claude = gap.find((entry) => entry.agent === "claude");

      expect(section(doc, "Known gap: Codex without network")).toContain(
        `${codex?.passed} of ${codex?.runs} url-arm runs passed on 2026-11-05, against ${claude?.passed} of ${claude?.runs} for Claude`
      );

      expect(
        tables(
          section(doc, "Layer 5: the scenarios step in the skill (2026-11-05)")
        )[0]
      ).toEqual(
        results.scenariosStep.rows.map((entry) =>
          row([
            name(entry.agent) ?? "",
            entry.skill,
            rate(entry.passed),
            rate(entry.taskCompletion),
            rate(entry.ranCheck),
            rate(entry.ranScenarios),
          ])
        )
      );
    })
  );
});
