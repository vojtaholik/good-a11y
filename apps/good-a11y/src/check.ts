import { localRenderedAuditLayer } from "@good-a11y/browser-audit/node";
import {
  FlowFileSchema,
  FlowFileUnreadable,
  LocalReportSchema,
  SafeFetch,
  ScenarioFileSchema,
  ScenarioFileUnreadable,
  checkLocally,
  formatLocalCheck,
} from "@good-a11y/core";
import type { Flow, Scenario } from "@good-a11y/core";
import {
  claudeDriverLayer,
  playwrightFlowAuditLayer,
  playwrightScenarioAuditLayer,
} from "@good-a11y/graders";
import { guidesForCheck } from "@good-a11y/guides";
import { htmlPageReaderLayer } from "@good-a11y/html-reader";
import { localNodeHopTransportLayer } from "@good-a11y/http-transport/node";
import {
  Config,
  Console,
  Effect,
  FileSystem,
  Layer,
  Option,
  Schema,
} from "effect";
import { Argument, Command, Flag } from "effect/cli";

import { TestChromeUnset } from "./test-chrome-unset.js";

const CHROME_ENV = "GOOD_A11Y_CHROME";

const chromeFor = Effect.fn("chromeFor")(function* chromeFor(
  flag: Option.Option<string>
) {
  const fromEnv = yield* Config.String(CHROME_ENV).pipe(Config.option);
  const chosen = Option.getOrNull(Option.orElse(flag, () => fromEnv));
  const underTest = yield* Config.String("VITEST").pipe(Config.option);

  if (chosen === null && Option.isSome(underTest)) {
    return yield* new TestChromeUnset();
  }

  return chosen;
});

export const guideUrl = (id: string): string =>
  `https://good-a11y.com/${id}.md`;

const localLayer = (executablePath: string | null) =>
  Layer.mergeAll(
    SafeFetch.localLayer.pipe(Layer.provide(localNodeHopTransportLayer)),
    htmlPageReaderLayer,
    localRenderedAuditLayer({ executablePath }),
    playwrightFlowAuditLayer({ executablePath }),
    playwrightScenarioAuditLayer({ executablePath }).pipe(
      Layer.provide(claudeDriverLayer)
    )
  );

const decodeFlows = Schema.decodeUnknownEffect(
  Schema.fromJsonString(FlowFileSchema)
);

const flowsFrom = (file: string) =>
  Effect.gen(function* readFlows() {
    const fs = yield* FileSystem.FileSystem;
    const text = yield* fs.readFileString(file);
    const decoded = yield* decodeFlows(text);
    const flows: readonly Flow[] = Array.isArray(decoded) ? decoded : [decoded];

    return flows;
  }).pipe(
    Effect.mapError(
      (failed) => new FlowFileUnreadable({ detail: failed.message, file })
    )
  );

const decodeScenarios = Schema.decodeUnknownEffect(
  Schema.fromJsonString(ScenarioFileSchema)
);

const scenariosFrom = (file: string) =>
  Effect.gen(function* readScenarios() {
    const fs = yield* FileSystem.FileSystem;
    const text = yield* fs.readFileString(file);
    const decoded = yield* decodeScenarios(text);

    const scenarios: readonly Scenario[] = Array.isArray(decoded)
      ? decoded
      : [decoded];

    return scenarios;
  }).pipe(
    Effect.mapError(
      (failed) => new ScenarioFileUnreadable({ detail: failed.message, file })
    )
  );

export const checkCommand = Command.make(
  "check",
  {
    chrome: Flag.String("chrome").pipe(
      Flag.withDescription(
        "Path to the Chrome or Chromium binary. Default: the path in GOOD_A11Y_CHROME, else the installed Google Chrome"
      ),
      Flag.optional
    ),
    flow: Flag.String("flow").pipe(
      Flag.withDescription(
        "A JSON file with one flow or a list of flows to run on a local page: guide id, path, setup, requires and targets. Each runs that guide's grader"
      ),
      Flag.optional
    ),
    json: Flag.Boolean("json").pipe(
      Flag.withDescription("Print the schema-encoded report as JSON"),
      Flag.withDefault(false)
    ),
    scenarios: Flag.String("scenarios").pipe(
      Flag.withDescription(
        "A JSON file with one scenario or a list: a task (goal, path, inputs, keys) and its success condition. A scenario with keys is replayed by keyboard only; one without keys is driven by Claude Code (claude on your PATH) seeing only the accessibility tree, in 3 runs, each confirmed by a replay without the model. Counted in Task completion on a local page"
      ),
      Flag.optional
    ),
    url: Argument.String("url").pipe(
      Argument.withDescription(
        "The page to check: localhost:5173, http://127.0.0.1:8080/cart or https://example.com"
      )
    ),
  },
  Effect.fn("check")(function* check({ chrome, flow, json, scenarios, url }) {
    const flows = Option.isSome(flow) ? yield* flowsFrom(flow.value) : [];
    const executablePath = yield* chromeFor(chrome);

    const tasks = Option.isSome(scenarios)
      ? yield* scenariosFrom(scenarios.value)
      : [];

    const checked = yield* checkLocally(url, flows, tasks).pipe(
      Effect.provide(localLayer(executablePath))
    );

    yield* Console.log(
      json
        ? JSON.stringify(
            yield* Schema.encodeEffect(LocalReportSchema)({
              ...checked.report,
              flows: checked.flows,
              tasks: checked.tasks,
            }),
            null,
            2
          )
        : formatLocalCheck(checked, {
            guideUrl,
            guidesFor: guidesForCheck,
          })
    );
  })
).pipe(
  Command.withDescription(
    "Check a page in your local Chrome (localhost works): static checks, axe-core and rendered probes, and with --flow the guides' graders on the flows you describe. Prints Markdown findings, each with its fix prompt and guide"
  )
);
