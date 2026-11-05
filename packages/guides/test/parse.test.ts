import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import type { Scenario } from "@good-a11y/core/scenario";
import { Effect, Path, Result } from "effect";

import { parseGuide, parseGuides, readGuides } from "../src/index.js";
import type { GuideFolder } from "../src/index.js";

const fixtureRoot = `${import.meta.dirname}/fixtures`;

const frontmatter = [
  "---",
  "name: Skip link",
  "description: Add a skip link to the main content",
  "criteria: [STD-SC-2.4.1]",
  "---",
  "",
].join("\n");

const folder = (
  guide: string,
  overrides: Partial<GuideFolder> = {}
): GuideFolder => ({
  category: "navigation",
  files: {
    "demo.html": "<!doctype html><title>Skip</title>",
    "expectations.md": "- Tab first reaches the skip link.",
    "guide.md": `${frontmatter}${guide}`,
  },
  slug: "skip-link",
  ...overrides,
});

const problemOf = (input: GuideFolder): string => {
  const parsed = parseGuide(input);

  return Result.isFailure(parsed) ? parsed.failure.message : "parsed";
};

it.layer(NodeServices.layer)("reading a guides folder", (test) => {
  test.effect("parses every guide folder with its headings and criteria", () =>
    Effect.gen(function* readsFixtures() {
      const path = yield* Path.Path;
      const guides = yield* readGuides(path.resolve(fixtureRoot));

      expect(guides.map((guide) => [guide.category, guide.id])).toEqual([
        ["forms", "form-errors"],
        ["widgets", "modal-dialog"],
      ]);

      const dialog = guides.find((guide) => guide.id === "modal-dialog");

      expect(dialog?.criteria).toEqual([
        "STD-SC-2.1.2",
        "STD-SC-2.4.3",
        "STD-SC-4.1.2",
      ]);
      expect(dialog?.headings).toEqual([
        "Modal dialog",
        "When to use",
        "DO",
        "Focus on open and close",
      ]);
      expect(dialog?.demo).toContain("<!doctype html>");
    })
  );

  test.effect("returns no guides when the folder does not exist", () =>
    Effect.gen(function* noFolder() {
      expect(yield* readGuides(`${fixtureRoot}/nowhere`)).toEqual([]);
    })
  );
});

describe("a malformed guide fails with what to fix", () => {
  it("names a criterion that is not a verified fact", () => {
    const input = folder("# Skip");

    const guide = (input.files["guide.md"] ?? "").replace(
      "[STD-SC-2.4.1]",
      "[STD-SC-2.4.1, STD-SC-2.4.99]"
    );

    expect(
      problemOf({ ...input, files: { ...input.files, "guide.md": guide } })
    ).toContain("criteria STD-SC-2.4.99 are not verified facts");
  });

  it("rejects a criterion that is not a WCAG success criterion fact", () => {
    const input = folder("# Skip");

    const guide = (input.files["guide.md"] ?? "").replace(
      "[STD-SC-2.4.1]",
      "[EU-LAW-1]"
    );

    expect(
      problemOf({ ...input, files: { ...input.files, "guide.md": guide } })
    ).toContain("frontmatter");
  });

  it("names each missing file", () => {
    expect(
      problemOf(
        folder("# Skip", { files: { "guide.md": `${frontmatter}# Skip` } })
      )
    ).toContain("missing demo.html, expectations.md");
  });

  it("reads a scenario with the keys that finish it on the demo, and refuses one without keys", () => {
    const input = folder("# Skip");

    const scenario = {
      goal: "Skip to the content",
      id: "skip",
      success: { present: [{ text: "Main content" }] },
    };

    const withScenario = (value: Scenario) =>
      parseGuide({
        ...input,
        files: { ...input.files, "scenario.json": JSON.stringify(value) },
      });

    const parsed = withScenario({ ...scenario, keys: [{ press: "Tab" }] });

    expect(Result.isSuccess(parsed) ? parsed.success.scenario?.id : null).toBe(
      "skip"
    );
    expect(Result.isSuccess(parseGuide(input)) ? "ok" : "failed").toBe("ok");

    const refused = withScenario(scenario);

    expect(Result.isFailure(refused) ? refused.failure.message : "").toContain(
      "give the keys that finish the task on demo.html"
    );
  });

  it("rejects a guide over 3,000 tokens", () => {
    expect(problemOf(folder(`# Skip\n\n${"word ".repeat(2500)}`))).toContain(
      "the cap is 3000"
    );
  });

  it.each([
    "See [the APG](https://www.w3.org/WAI/ARIA/apg/).",
    "Read https://www.w3.org/WAI/WCAG21/Understanding/ first.",
    "See [the spec][apg].",
    "Visit www.w3.org for more.",
  ])("rejects a link in prose: %s", (line) => {
    expect(problemOf(folder(`# Skip\n\n${line}`))).toContain(
      "no links outside code blocks"
    );
  });

  it("allows a URL inside a fenced code block", () => {
    expect(
      problemOf(
        folder(
          '# Skip\n\n```html\n<svg xmlns="http://www.w3.org/2000/svg"></svg>\n```'
        )
      )
    ).toBe("parsed");
  });

  it("rejects a category that is not its folder", () => {
    const input = folder("# Skip");

    const guide = (input.files["guide.md"] ?? "").replace(
      "name:",
      "category: forms\nname:"
    );

    expect(
      problemOf({ ...input, files: { ...input.files, "guide.md": guide } })
    ).toContain('category "forms" is not its folder "navigation"');
  });

  it("rejects guide.md without frontmatter", () => {
    const input = folder("");
    expect(
      problemOf({ ...input, files: { ...input.files, "guide.md": "# Skip" } })
    ).toContain("frontmatter block");
  });

  it("rejects two guides with the same id", () => {
    const parsed = parseGuides([
      folder("# A"),
      folder("# B", { category: "content" }),
    ]);

    expect(
      Result.isFailure(parsed) ? parsed.failure.message : "parsed"
    ).toContain("must be unique");
  });
});
