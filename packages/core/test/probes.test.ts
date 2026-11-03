import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  AxeResultsJson,
  ProbesJson,
  probeResults,
  renderedOf,
} from "../src/index.js";
import type { ProbeResult, ProbesMeasured } from "../src/index.js";

const NOTHING: ProbesMeasured = {
  reflow: null,
  targetSize: null,
  textSpacing: null,
  walk: null,
};

const resultOf = (
  measured: Partial<ProbesMeasured>,
  probe: ProbeResult["probe"]
): ProbeResult | undefined =>
  probeResults({ ...NOTHING, ...measured }).find(
    (result) => result.probe === probe
  );

const stop = (key: number, changed = 3) => ({
  changed,
  judged: true,
  key,
  modal: false,
  obscuredBy: null,
  snippet: `<a href="/${key}">`,
});

const candidate = (key: number) => ({
  clippedAway: false,
  composite: false,
  hidden: false,
  key,
  radioGroup: null,
  snippet: `<a href="/${key}">`,
  tabindex: null,
});

const cycle = (count: number) => [
  ...Array.from({ length: count }, (_, key) => stop(key)),
  stop(0),
];

const walk = (
  overrides: Partial<NonNullable<ProbesMeasured["walk"]>> = {}
) => ({
  backward: null,
  candidates: Array.from({ length: 5 }, (_, key) => candidate(key)),
  cycled: true,
  forward: cycle(5),
  navigated: false,
  onFocus: null,
  presses: 10,
  ...overrides,
});

const EMPTY_AXE = {
  inapplicable: [],
  incomplete: [],
  passes: [],
  testEngine: { name: "axe-core", version: "4.14.0" },
  violations: [],
};

describe("reflow at 320 CSS pixels", () => {
  it("passes when the page does not scroll sideways", () => {
    expect(
      resultOf(
        {
          reflow: {
            clientWidth: 320,
            offenders: [],
            scrollWidth: 321,
          },
        },
        "reflow"
      )?.status
    ).toBe("pass");
  });

  it("fails with the widest offenders when content forces a sideways scroll", () => {
    const result = resultOf(
      {
        reflow: {
          clientWidth: 320,
          offenders: [
            { exempt: false, right: 980, snippet: '<div class="hero">' },
            { exempt: true, right: 700, snippet: "<td>" },
          ],
          scrollWidth: 980,
        },
      },
      "reflow"
    );

    expect(result).toMatchObject({
      criterion: "1.4.10",
      failing: 1,
      samples: ['<div class="hero">'],
      status: "fail",
    });
  });

  it("reports a sideways scroll as one page-level instance, with the widest offenders as samples", () => {
    const result = resultOf(
      {
        reflow: {
          clientWidth: 320,
          offenders: Array.from({ length: 5 }, (_, index) => ({
            exempt: false,
            right: 900 - index,
            snippet: `<div id="wide-${index}">`,
          })),
          scrollWidth: 900,
        },
      },
      "reflow"
    );

    expect(result).toMatchObject({ failing: 1, status: "fail" });
    expect(result?.samples).toHaveLength(5);
  });

  it("passes when only a data table, code or a map is wider than the screen", () => {
    expect(
      resultOf(
        {
          reflow: {
            clientWidth: 320,
            offenders: [{ exempt: true, right: 900, snippet: "<table>" }],
            scrollWidth: 900,
          },
        },
        "reflow"
      )?.status
    ).toBe("pass");
  });

  it("does not judge a scroll it cannot attribute to an element", () => {
    expect(
      resultOf(
        {
          reflow: {
            clientWidth: 320,
            offenders: [],
            scrollWidth: 600,
          },
        },
        "reflow"
      )?.status
    ).toBe("not_applicable");
  });
});

describe("text spacing", () => {
  it("fails on text newly cut off, and keeps the text and markup for a person to confirm", () => {
    const result = resultOf(
      {
        textSpacing: {
          checked: 40,
          newlyClipped: [
            { snippet: '<p class="price">', text: "Free delivery" },
          ],
          newlyClippedCount: 7,
        },
      },
      "text-spacing"
    );

    expect(result).toMatchObject({
      failing: 7,
      samples: ['Free delivery | <p class="price">'],
      status: "fail",
    });
  });

  it("does not judge a page with no box that clips text", () => {
    expect(
      resultOf(
        { textSpacing: { checked: 0, newlyClipped: [], newlyClippedCount: 0 } },
        "text-spacing"
      )?.status
    ).toBe("not_applicable");
  });
});

describe("the tab walk", () => {
  it("fails focus visible for a control whose look did not change on focus", () => {
    const result = resultOf(
      { walk: walk({ forward: [stop(0), stop(1, 0), stop(2), stop(0)] }) },
      "focus-visible"
    );

    expect(result).toMatchObject({
      criterion: "2.4.7",
      failing: 1,
      samples: ['<a href="/1">'],
      status: "fail",
    });
  });

  it("does not judge focus visible on a control covered by a fixed layer", () => {
    expect(
      resultOf(
        {
          walk: walk({
            forward: [
              { ...stop(0, 0), obscuredBy: '<div class="cookie-bar">' },
              stop(0),
            ],
          }),
        },
        "focus-visible"
      )?.status
    ).toBe("not_applicable");
  });

  it("fails keyboard reach for a visible control the walk never reached after a full cycle", () => {
    const result = resultOf(
      {
        walk: walk({
          candidates: [
            ...Array.from({ length: 5 }, (_, key) => candidate(key)),
            { ...candidate(9), snippet: '<a href="/basket" tabindex="-1">' },
          ],
        }),
      },
      "keyboard-reach"
    );

    expect(result).toMatchObject({
      criterion: "2.1.1",
      failing: 1,
      samples: ['<a href="/basket" tabindex="-1">'],
      status: "fail",
    });
  });

  it("does not count controls in composite widgets, hidden layers, clipped slides or reached radio groups", () => {
    const result = resultOf(
      {
        walk: walk({
          candidates: [
            ...Array.from({ length: 5 }, (_, key) => candidate(key)),
            { ...candidate(6), composite: true },
            { ...candidate(7), hidden: true },
            { ...candidate(8), clippedAway: true },
            { ...candidate(0), radioGroup: "size" },
            { ...candidate(10), radioGroup: "size" },
          ],
        }),
      },
      "keyboard-reach"
    );

    expect(result?.status).toBe("pass");
  });

  it("does not judge keyboard reach when the walk did not finish a cycle or stayed in a dialog", () => {
    expect(
      resultOf({ walk: walk({ cycled: false }) }, "keyboard-reach")?.status
    ).toBe("not_applicable");

    expect(
      resultOf(
        {
          walk: walk({
            forward: cycle(5).map((visited) => ({ ...visited, modal: true })),
          }),
        },
        "keyboard-reach"
      )?.status
    ).toBe("not_applicable");
  });

  it("does not judge keyboard reach when a consent dialog holds most of the cycle, but still does for a fixed header", () => {
    const heldBy = (modalKeys: readonly number[]) =>
      resultOf(
        {
          walk: walk({
            candidates: Array.from({ length: 10 }, (_, key) => candidate(key)),
            forward: cycle(4).map((visited) => ({
              ...visited,
              modal: modalKeys.includes(visited.key),
            })),
          }),
        },
        "keyboard-reach"
      );

    expect(heldBy([1, 2, 3])?.status).toBe("not_applicable");
    expect(heldBy([0])).toMatchObject({ failing: 6, status: "fail" });
  });

  const trapped = Array.from({ length: 60 }, (_, press) => stop(press % 2));

  it("fails a keyboard trap when focus cycles among two controls in both directions", () => {
    expect(
      resultOf(
        { walk: walk({ backward: trapped, cycled: false, forward: trapped }) },
        "keyboard-trap"
      )
    ).toMatchObject({ criterion: "2.1.2", failing: 2, status: "fail" });
  });

  it("does not call a modal dialog a trap, and needs both directions", () => {
    const modal = trapped.map((visited) => ({ ...visited, modal: true }));

    expect(
      resultOf(
        { walk: walk({ backward: modal, cycled: false, forward: modal }) },
        "keyboard-trap"
      )?.status
    ).toBe("not_applicable");

    expect(
      resultOf(
        { walk: walk({ backward: null, cycled: false, forward: trapped }) },
        "keyboard-trap"
      )?.status
    ).toBe("not_applicable");
  });

  it("reports a focused control hidden under a fixed layer as the newer criterion 2.4.11", () => {
    const result = resultOf(
      {
        walk: walk({
          forward: [
            stop(0),
            { ...stop(1), obscuredBy: '<div class="cookie-bar">' },
            stop(0),
          ],
        }),
      },
      "focus-obscured"
    );

    expect(result).toMatchObject({
      criterion: "2.4.11",
      failing: 1,
      newer: true,
      status: "fail",
    });
  });
});

describe("focus not obscured, behind a large overlay", () => {
  it("does not judge controls behind a layer covering half the screen or more, such as a consent overlay", () => {
    expect(
      resultOf(
        {
          walk: walk({
            forward: [
              {
                ...stop(0),
                coverShare: 1,
                obscuredBy: '<div class="consent">',
              },
              {
                ...stop(1),
                coverShare: 0.9,
                obscuredBy: '<div class="consent">',
              },
              stop(0),
            ],
          }),
        },
        "focus-obscured"
      )
    ).toMatchObject({ failing: 0, status: "not_applicable" });
  });

  it("still fails a control hidden under a small sticky bar", () => {
    expect(
      resultOf(
        {
          walk: walk({
            forward: [
              stop(0),
              {
                ...stop(1),
                coverShare: 0.12,
                obscuredBy: '<footer class="sticky">',
              },
              stop(0),
            ],
          }),
        },
        "focus-obscured"
      )
    ).toMatchObject({ failing: 1, status: "fail" });
  });
});

describe("on focus", () => {
  it("fails when focusing a control sent the page elsewhere, confirmed twice", () => {
    expect(
      resultOf(
        {
          walk: walk({
            cycled: false,
            navigated: true,
            onFocus: {
              snippet: '<select onfocus="location=this.value">',
              to: "https://www.example.com/de/",
            },
          }),
        },
        "on-focus"
      )
    ).toMatchObject({
      criterion: "3.2.1",
      failing: 1,
      samples: [
        '<select onfocus="location=this.value"> | goes to https://www.example.com/de/',
      ],
      status: "fail",
    });
  });

  it("passes a full cycle with no navigation, and does not judge an unconfirmed one", () => {
    expect(resultOf({ walk: walk() }, "on-focus")?.status).toBe("pass");
    expect(
      resultOf({ walk: walk({ navigated: true }) }, "on-focus")?.status
    ).toBe("not_applicable");
    expect(
      resultOf({ walk: walk({ cycled: false }) }, "on-focus")?.status
    ).toBe("not_applicable");
  });
});

describe("target size", () => {
  it("fails on the nodes axe target-size reports, as the newer criterion 2.5.8", () => {
    const axe = JSON.stringify({
      ...EMPTY_AXE,
      violations: [
        {
          help: "All touch targets must be 24px large, or leave sufficient space",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.14/target-size",
          id: "target-size",
          impact: "serious",
          nodes: [{ html: '<a class="dot">' }],
          tags: ["wcag22aa"],
        },
      ],
    });

    expect(resultOf({ targetSize: axe }, "target-size")).toMatchObject({
      criterion: "2.5.8",
      failing: 1,
      newer: true,
      status: "fail",
    });
  });

  it("does not judge when target-size did not run", () => {
    expect(
      resultOf({ targetSize: JSON.stringify(EMPTY_AXE) }, "target-size")?.status
    ).toBe("not_applicable");
  });
});

describe("probes in the rendered result", () => {
  const axe = Schema.decodeUnknownSync(AxeResultsJson)(
    JSON.stringify(EMPTY_AXE)
  );

  it("turns a failed probe into a finding tied to its criterion and EN clause facts, and counts the criterion as checked", () => {
    const [reflow] = probeResults({
      ...NOTHING,
      reflow: {
        clientWidth: 320,
        offenders: [{ exempt: false, right: 980, snippet: "<div>" }],
        scrollWidth: 980,
      },
    });

    const rendered = renderedOf(
      axe,
      undefined,
      reflow === undefined ? [] : [reflow]
    );

    expect(rendered.status === "ran" && rendered.criteria).toEqual(["1.4.10"]);
    expect(
      rendered.status === "ran" &&
        rendered.findings.map((finding) => [
          finding.rule,
          finding.references.map((reference) => reference.factId),
        ])
    ).toEqual([["reflow", ["STD-SC-1.4.10", "STD-EN-9.1.4.10"]]]);
  });

  it("keeps a newer WCAG 2.2 criterion out of the checked criteria and marks its reference as newer", () => {
    const [target] = probeResults({
      ...NOTHING,
      targetSize: JSON.stringify({
        ...EMPTY_AXE,
        violations: [
          {
            help: "x",
            helpUrl: "https://dequeuniversity.com/rules/axe/4.14/target-size",
            id: "target-size",
            nodes: [{ html: "<a>" }],
            tags: ["wcag22aa"],
          },
        ],
      }),
    });

    const rendered = renderedOf(
      axe,
      undefined,
      target === undefined ? [] : [target]
    );

    expect(rendered.status === "ran" && rendered.criteria).toEqual([]);
    expect(
      rendered.status === "ran" &&
        rendered.findings.flatMap((finding) =>
          finding.references.map((reference) => [
            reference.kind,
            reference.factId,
          ])
        )
    ).toEqual([["wcag-newer", "STD-SC22-2.5.8"]]);
  });

  it("reads measurements the browser sent as JSON", () => {
    expect(
      Schema.decodeUnknownSync(ProbesJson)(JSON.stringify(NOTHING))
    ).toEqual(NOTHING);
  });
});
