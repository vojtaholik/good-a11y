// @effect-diagnostics nodeBuiltinImport:off -- These tests create temporary source fixtures and run the real oxlint binary against them.
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

const oxlint = path.join(repoRoot, "node_modules/.bin/oxlint");

const plugin = path.join(repoRoot, "scripts/oxlint-plugin-effect-tests.ts");

const RULE = "effect-tests/size-reaches-declared-lengths";

interface LintResult {
  readonly output: string;
  readonly status: number;
}

const lintFile = (name: string, source: string): LintResult => {
  const directory = mkdtempSync(path.join(tmpdir(), "effect-tests-rule-"));
  const fixtureDirectory = path.join(directory, "packages/thing/test");
  const config = path.join(directory, "oxlint.json");
  const file = path.join(fixtureDirectory, name);

  mkdirSync(fixtureDirectory, { recursive: true });
  writeFileSync(
    config,
    JSON.stringify({
      jsPlugins: [{ name: "effect-tests", specifier: plugin }],
      rules: { [RULE]: "error" },
    })
  );
  writeFileSync(file, source);

  try {
    const result = spawnSync(oxlint, ["-c", config, "--no-ignore", file], {
      cwd: repoRoot,
      encoding: "utf-8",
    });

    return {
      output: `${result.stdout}${result.stderr}`,
      status: result.status ?? -1,
    };
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
};

const lint = (source: string): LintResult =>
  lintFile("fixture.test.ts", source);

const HEAD = `
import { it } from "@effect/vitest";
import { Effect, Schema } from "effect";
`;

const NO_SIZE = "and sets no size";

const TOO_SMALL = "and runs at size";

const UNREAD = "that is not a number or a constant of this file";

const history = (longest: string): string => `
const Command = Schema.Struct({ do: Schema.Literal("keep") });

const History = Schema.Struct({
  commands: Schema.Array(Command).check(Schema.isMaxLength(${longest})),
  dailyCap: Schema.Int,
});
`;

const property = (options: string): string => `
it.effect.prop(
  "any history leaves the store as the model says",
  { history: History },
  ({ history }) => Effect.void${options}
);
`;

const expectClean = (result: LintResult) => {
  expect(result.output).not.toContain(RULE.replace("/", "("));
  expect(result.status).toBe(0);
};

const expectFlagged = (result: LintResult, ...said: readonly string[]) => {
  expect(result.status).not.toBe(0);

  for (const words of said) {
    expect(result.output).toContain(words);
  }
};

describe("the rule that a property runs the lengths it declares", () => {
  it("is on in the repo config", () => {
    const configSource = readFileSync(
      path.join(repoRoot, "oxlint.config.ts"),
      "utf-8"
    );

    expect(configSource).toContain(`"${RULE}": "error"`);
  });

  it("flags a property over a history declared longer than the default size that sets no size, and names the length", () => {
    expectFlagged(
      lint(`${HEAD}${history("24")}${property("")}`),
      NO_SIZE,
      "up to 24 long",
      "size: 24"
    );
    expectFlagged(
      lint(
        `${HEAD}${history("24")}${property(",\n  { arbitrary: { runs: 500 } }")}`
      ),
      NO_SIZE
    );
    expectFlagged(
      lint(`${HEAD}${history("24")}${property(",\n  60_000")}`),
      NO_SIZE
    );
  });

  it("reads the longest of the lengths a generator declares, in whichever order they stand, and a number written with separators", () => {
    const few = "few: Schema.Array(Schema.Int).check(Schema.isMaxLength(6))";
    const many = "many: Schema.Array(Schema.Int).check(Schema.isMaxLength(40))";

    for (const generated of [`${few}, ${many}`, `${many}, ${few}`]) {
      expectFlagged(
        lint(`${HEAD}
it.prop("any few and any many", { ${generated} }, () => {});
`),
        NO_SIZE,
        "up to 40 long"
      );
    }

    expectFlagged(
      lint(`${HEAD}${history("1_000")}${property("")}`),
      NO_SIZE,
      "up to 1000 long"
    );
  });

  it("flags a size below the declared length and names both", () => {
    expectFlagged(
      lint(
        `${HEAD}${history("24")}${property(",\n  { arbitrary: { runs: 500, size: 12 } }")}`
      ),
      TOO_SMALL,
      "up to 24 long",
      "size 12"
    );
  });

  it("accepts a size that reaches the declared length, written as a number or as a constant of the file", () => {
    expectClean(
      lint(
        `${HEAD}${history("24")}${property(",\n  { arbitrary: { runs: 500, size: 24 } }")}`
      )
    );
    expectClean(
      lint(
        `${HEAD}const LONGEST_HISTORY = 1_000;\n${history("LONGEST_HISTORY")}${property(",\n  { arbitrary: { size: LONGEST_HISTORY }, timeout: 60_000 }")}`
      )
    );
    expectClean(
      lint(
        `${HEAD}${history("24")}const OPTIONS = { arbitrary: { size: 30 } };\n${property(",\n  OPTIONS")}`
      )
    );
  });

  it("leaves alone a property whose longest declared length the default size reaches", () => {
    expectClean(lint(`${HEAD}${history("10")}${property("")}`));
    expectClean(
      lint(`${HEAD}
it.prop(
  "any few words",
  { words: Schema.Array(Schema.String).check(Schema.isMinLength(1), Schema.isMaxLength(6)) },
  ({ words }) => {
    expect(words.length).toBeLessThan(7);
  }
);
`)
    );
  });

  it("reads a length through the constants and the functions of the file that build the generator", () => {
    expectFlagged(
      lint(`${HEAD}
const LONGEST_SESSION = 60;

const sessionOf = <S extends Schema.Top>(event: S) =>
  Schema.Array(event).check(
    Schema.isMinLength(20),
    Schema.isMaxLength(LONGEST_SESSION)
  );

const Sessions = { forms: sessionOf(Schema.String), report: sessionOf(Schema.Int) };

it.prop("ignores late results", Sessions, (sessions) => {
  expect(sessions).toBeDefined();
});
`),
      NO_SIZE,
      "up to 60 long"
    );
    expectFlagged(
      lint(`${HEAD}
export const Visits = Schema.Array(Schema.Int).check(Schema.isMaxLength(30));

function visitsBy(visitor: string) {
  return Schema.Struct({ visitor: Schema.Literal(visitor), visits: Visits });
}

test.prop("any visits", [visitsBy("a")], ([run]) => {
  expect(run).toBeDefined();
});
`),
      NO_SIZE,
      "up to 30 long"
    );
  });

  it("flags a long string as it flags a long list", () => {
    expectFlagged(
      lint(`${HEAD}
it.prop(
  "cuts any address to one line",
  { written: Schema.String.check(Schema.isMaxLength(600)) },
  ({ written }) => {
    expect(written.length).toBeLessThan(601);
  }
);
`),
      NO_SIZE,
      "up to 600 long"
    );
  });

  it("asks for a size where the declared length is not a number it can read, and accepts any size there", () => {
    const withAnImportedLength = (options: string) => `${HEAD}
import { CHECKS, MAX_TASK_STEPS } from "@good-a11y/core";

it.prop(
  "any outcomes of the checks",
  {
    outcomes: Schema.Array(Schema.Boolean).check(Schema.isMaxLength(CHECKS.length)),
  },
  ({ outcomes }) => {
    expect(outcomes).toBeDefined();
  }${options}
);
`;

    expectFlagged(lint(withAnImportedLength("")), UNREAD);
    expectClean(
      lint(withAnImportedLength(",\n  { arbitrary: { size: CHECKS.length } }"))
    );
    expectClean(
      lint(withAnImportedLength(",\n  { arbitrary: { size: MAX_TASK_STEPS } }"))
    );
  });

  it("counts only what the property generates: a length declared in its body, in another property or in a file that is no test is not its length", () => {
    expectClean(
      lint(`${HEAD}${history("8")}
const Stored = Schema.Array(Schema.String).check(Schema.isMaxLength(500));

it.effect.prop(
  "any history leaves the store as the model says",
  { history: History },
  ({ history }) =>
    Effect.sync(() => {
      expect(Schema.is(Stored)(history.commands)).toBe(false);
    })
);
`)
    );

    const two = lint(`${HEAD}${history("8")}
const Long = Schema.Array(Schema.Int).check(Schema.isMaxLength(45));

it.prop("the short one", { history: History }, () => {});

it.prop("the long one", { long: Long }, () => {});
`);

    expectFlagged(two, NO_SIZE, "up to 45 long");
    expect(two.output.split(RULE.replace("/", "(")).length - 1).toBe(1);
    expectClean(
      lintFile("generators.ts", `${HEAD}${history("24")}${property("")}`)
    );
  });

  it("looks at properties only: a plain test beside a long generator is left alone", () => {
    expectClean(
      lint(`${HEAD}${history("24")}
it.effect("keeps one message", () => Effect.succeed(History));

it("is a schema", () => {
  expect(Schema.is(History)({})).toBe(false);
});
`)
    );
  });
});
