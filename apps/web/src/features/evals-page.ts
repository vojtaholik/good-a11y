import { EvalResultsSchema } from "@good-a11y/guides/evals";
import type {
  AgentId,
  EvalCell,
  EvalEntry,
  EvalResults,
  Rate,
  ScreenCandidate,
} from "@good-a11y/guides/evals";
import { Option, Schema } from "effect";

import results from "../../../../evals/results.json";
import { guidePageOf } from "./guides.js";
import { Blocks } from "./info-pages.js";
import type { InfoPage, InfoSection } from "./info-pages.js";
import { GITHUB_URL } from "./shell.js";

export const EVAL_RESULTS: EvalResults =
  Schema.decodeUnknownSync(EvalResultsSchema)(results);

const countText = ([passed, runs]: Rate): string => `${passed} of ${runs}`;

const guidedText = (cell: EvalCell): string =>
  cell.guidedBefore === undefined
    ? countText(cell.guided)
    : `${countText(cell.guided)} (${countText(cell.guidedBefore)} before a guide change)`;

const agentName = (id: AgentId): string =>
  EVAL_RESULTS.agents.find((agent) => agent.id === id)?.name ?? id;

const shipsForText = (row: EvalEntry): string => {
  if (row.shipsFor.length === 0) {
    return "Neither";
  }

  return row.shipsFor.length === EVAL_RESULTS.agents.length
    ? "Both"
    : row.shipsFor.map(agentName).join(", ");
};

const guideName = (row: EvalEntry): string =>
  Option.match(guidePageOf(row.guide), {
    onNone: () => row.guide,
    onSome: (page) => page.name,
  });

const nameOf = (row: EvalEntry): string =>
  row.task === null ? guideName(row) : `${guideName(row)} (${row.task})`;

const cellsOf = (row: EvalEntry): string[] => [
  nameOf(row),
  countText(row.cells.claude.unguided),
  guidedText(row.cells.claude),
  countText(row.cells.codex.unguided),
  guidedText(row.cells.codex),
];

const ARMS = [
  `${agentName("claude")} unguided`,
  `${agentName("claude")} guided`,
  `${agentName("codex")} unguided`,
  `${agentName("codex")} guided`,
];

const published = EVAL_RESULTS.guides.filter((row) => row.published);

const removed = EVAL_RESULTS.guides.filter((row) => !row.published);

const rounds = [...new Set(published.map((row) => row.round))];

const bothPassed = EVAL_RESULTS.screens.filter(
  (screen) => screen.claude === "pass" && screen.codex === "pass"
).length;

const settings = EVAL_RESULTS.agents
  .map((agent) => `${agent.name} ran with ${agent.setting}`)
  .join(", ");

const { maxUnguidedPercent, minUpliftPoints } = EVAL_RESULTS.shipRule;

const roundOne = EVAL_RESULTS.guides.filter(
  (row) => row.round === EVAL_RESULTS.guides[0]?.round
);

const roundOneNeither = roundOne.filter(
  (row) => row.shipsFor.length === 0
).length;

const ROUND_ONE_NOTE = `Round 1 measured ${roundOne.length} guides that already existed; the ship rule did not gate them, and ${roundOneNeither} of them met it for neither agent.`;

const sourceLink = (before: string, path: string) =>
  Blocks.Link({
    before,
    href: `${GITHUB_URL}/tree/main/${path}`,
    label: path,
  });

const roundSection = (round: string, index: number): InfoSection => ({
  blocks: [
    Blocks.Table({
      caption: `Eval results, ${round}`,
      head: ["Guide", ...ARMS, "Ships for", "Note"],
      rows: published
        .filter((row) => row.round === round)
        .map((row) => [...cellsOf(row), shipsForText(row), row.note ?? ""]),
    }),
  ],
  heading: round,
  id: `round-${index + 1}`,
});

const SCREEN_RESULT: Record<ScreenCandidate["claude"], string> = {
  fail: "Fail",
  "not-graded": "Not graded",
  pass: "Pass",
};

export const EVALS: InfoPage = {
  lead: "Claude Code and Codex build the patterns we guide right far more often when they read the guide first, for the agent each guide ships for. This page shows the evals behind that claim: every guide, each agent with and without the guide, the guides that did not make it, and every candidate we screened.",
  sections: [
    {
      blocks: [
        Blocks.Text({
          text: "Each cell counts the runs that passed every claim of the guide's grader with no checker issue for that guide, out of the runs graded. Most rows ran 3 times on each of two base apps; rows with a task ran 3 times on one app. A guide measured more than once has a row per measurement.",
        }),
        Blocks.Text({
          text: "Rows whose note names the screening probe (autofill-off, press-remove, confirm email field) were graded by the probe written to screen that task, not by the guide's full grader.",
        }),
        Blocks.Text({
          text: `"Ships for" names the agents the guide helps under the ship rule in Method. Results as of ${EVAL_RESULTS.updated}.`,
        }),
      ],
      heading: "How to read the results",
      id: "reading",
    },
    ...rounds.map(roundSection),
    {
      blocks: [
        Blocks.Text({
          text: `${ROUND_ONE_NOTE} From screen 3 on, a guide that met the rule for neither agent is removed.`,
        }),
        Blocks.Table({
          caption: "Guides that did not ship",
          head: ["Guide", ...ARMS, "Why"],
          rows: removed.map((row) => [...cellsOf(row), row.note ?? ""]),
        }),
      ],
      heading: "Guides that did not ship",
      id: "not-shipped",
    },
    {
      blocks: [
        Blocks.Text({
          text: `Before a guide is written, its candidate is screened: one unguided run per agent. ${bothPassed} of the ${EVAL_RESULTS.screens.length} candidates screened passed for both agents and got no guide.`,
        }),
        Blocks.Table({
          caption: "Screened candidates",
          head: [
            "Candidate",
            "Screen",
            agentName("claude"),
            agentName("codex"),
            "Guide",
            "Note",
          ],
          rows: EVAL_RESULTS.screens.map((screen) => [
            screen.candidate,
            screen.screen,
            SCREEN_RESULT[screen.claude],
            SCREEN_RESULT[screen.codex],
            screen.guide ?? "",
            screen.note ?? "",
          ]),
        }),
      ],
      heading: "Screened candidates",
      id: "screens",
    },
    {
      blocks: [
        Blocks.Text({
          text: "Each guide has two tasks, one on a React shop and one on a static content site, each asked the way a product owner asks for a feature. A prompt never names the accessibility technique.",
        }),
        Blocks.Text({
          text: `The unguided arm gets the task alone. The guided arm has the good-a11y skill installed and finds the guide itself. ${settings}.`,
        }),
        Blocks.Text({
          text: "A grader drives the result in a headless browser and tests every claim in the guide's expectations list, one test per claim. Our checker runs on the result too. A run passes when every claim holds and the checker finds no issue that belongs to the guide.",
        }),
        Blocks.Text({
          text: `Only a candidate that fails its screen earns a guide. A guide ships for an agent when that agent passes under ${maxUnguidedPercent} % of runs unguided and the guide raises its pass rate by at least ${minUpliftPoints} points. ${ROUND_ONE_NOTE}`,
        }),
      ],
      heading: "Method",
      id: "method",
    },
    {
      blocks: [
        Blocks.List({
          items: [
            "Six runs per cell, three in rows with a task. One run moves a six-run cell by 17 points and a three-run cell by 33.",
            `Selection bias: from screen 1 on, a guide exists only where an agent failed unguided, so the guided gain is measured where there was the most room to gain. ${bothPassed} of ${EVAL_RESULTS.screens.length} screened candidates passed for both agents and got no guide.`,
            "The graders are our own, and public in packages/graders. They test the claims the guide makes, so a guided build is graded against the rules it just read.",
            "Graders were corrected after round 1 and screen runs when they misjudged builds; the affected runs were regraded with the fixed grader (docs/evals.md lists each fix).",
            "Both agents ran at low effort. We did not measure higher settings.",
          ],
        }),
      ],
      heading: "Limits",
      id: "limits",
    },
    {
      blocks: [
        sourceLink("The task prompts are in", "evals/tasks"),
        sourceLink("The base apps are in", "evals/apps"),
        sourceLink("The graders are in", "packages/graders"),
        sourceLink("The runner is in", "evals/run"),
      ],
      heading: "Source",
      id: "source",
    },
  ],
  title: "Evals",
};
