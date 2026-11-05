import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  DriverDecisionSchema,
  ScenarioFileSchema,
  actionOf,
  driverPrompt,
  isOnTree,
  reached,
  statusOf,
  tasksHeadline,
  treeOf,
} from "../src/index.js";
import type { ScenarioResult, ScenarioRun } from "../src/index.js";

const PLACED = `- banner:
  - link "Trail Shop":
    - /url: /
- main:
  - heading "Thank you" [level=1]
  - paragraph: Your order is placed.
  - 'button "Track: order 42"'
  - text: "Total: 249 EUR"
  - link "Say \\"hi\\""`;

describe("the accessibility tree of a snapshot", () => {
  it("reads roles and names, inline text and quoted keys, and skips properties", () => {
    const tree = treeOf(PLACED);

    expect(tree.nodes).toEqual([
      { name: "", role: "banner" },
      { name: "Trail Shop", role: "link" },
      { name: "", role: "main" },
      { name: "Thank you", role: "heading" },
      { name: "", role: "paragraph" },
      { name: "Track: order 42", role: "button" },
      { name: 'Say "hi"', role: "link" },
    ]);
    expect(tree.text).toContain("Your order is placed.");
    expect(tree.text).toContain("Total: 249 EUR");
    expect(tree.text).not.toContain("/url");
  });

  it("stays linear on a long hostile line", () => {
    const hostile = `- button "${'\\"'.repeat(50_000)}`;

    expect(treeOf(hostile).nodes).toEqual([]);
  });
});

describe("a scenario's success condition", () => {
  const state = { ...treeOf(PLACED), path: "/order-placed" };

  it("holds when the path matches and every present target is on the tree", () => {
    expect(
      reached(
        {
          path: "/order-placed",
          present: [
            { name: "Thank you", role: "heading" },
            { text: "order is placed" },
          ],
        },
        state
      )
    ).toBe(true);
  });

  it("fails on another path, a missing target or a target that must be absent", () => {
    const present = [{ name: "Thank you", role: "heading" }];

    expect(reached({ path: "/cart", present }, state)).toBe(false);
    expect(
      reached({ present: [{ name: "Order history", role: "link" }] }, state)
    ).toBe(false);
    expect(reached({ absent: [{ text: "total: 249" }], present }, state)).toBe(
      false
    );
  });

  it("matches names exactly unless the target says exact: false", () => {
    expect(isOnTree({ name: "Thank", role: "heading" }, state)).toBe(false);
    expect(
      isOnTree({ exact: false, name: "thank", role: "heading" }, state)
    ).toBe(true);
  });
});

describe("the scenario file", () => {
  const decode = Schema.decodeUnknownSync(ScenarioFileSchema);

  it("refuses a success with nothing to find, a key outside the keyboard set and an empty key list", () => {
    const base = {
      goal: "Buy",
      id: "buy",
      keys: [{ press: "Tab" }],
      success: { present: [{ text: "Thank you" }] },
    };

    expect(() => decode(base)).not.toThrow();
    expect(() => decode({ ...base, success: { present: [] } })).toThrow();
    expect(() => decode({ ...base, keys: [{ press: "MouseLeft" }] })).toThrow();
    expect(() => decode({ ...base, keys: [] })).toThrow();
    expect(() =>
      decode({ ...base, success: { present: [{ css: "#placed" }] } })
    ).toThrow();
  });
});

const run = (confirmed: boolean): ScenarioRun => ({
  confirmed,
  focused: null,
  problem: null,
  reached: confirmed,
  trace: [{ press: "Tab" }, { press: "Enter" }],
});

const result = (status: ScenarioResult["status"]): ScenarioResult => ({
  blocked: [],
  driver: null,
  goal: "Buy",
  id: "buy",
  mode: "replayed",
  runs: [run(status === "finished")],
  status,
  url: "http://localhost:4173/",
});

describe("the task score", () => {
  it("counts finished tasks and says how they were done", () => {
    expect(tasksHeadline([result("finished"), result("not_finished")])).toBe(
      "Task completion: 1 of 2 tasks finished with the keyboard and the accessibility tree only."
    );
    expect(tasksHeadline([result("finished")])).toBe(
      "Task completion: 1 of 1 task finished with the keyboard and the accessibility tree only."
    );
  });

  it("finishes a driven task only when two of its three runs are confirmed by replay", () => {
    const reachedUnconfirmed: ScenarioRun = { ...run(false), reached: true };

    expect(statusOf("driven", [run(true), run(true), run(false)])).toBe(
      "finished"
    );
    expect(
      statusOf("driven", [run(true), reachedUnconfirmed, reachedUnconfirmed])
    ).toBe("not_finished");
    expect(statusOf("replayed", [run(true)])).toBe("finished");
    expect(statusOf("replayed", [reachedUnconfirmed])).toBe("not_finished");
  });
});

describe("the driver", () => {
  it("turns a decision into one keyboard step, a give-up or nothing", () => {
    expect(actionOf({ action: "press", key: "Tab" })).toStrictEqual({
      press: "Tab",
    });
    expect(actionOf({ action: "type", input: "email" })).toStrictEqual({
      type: "email",
    });
    expect(actionOf({ action: "give_up", reason: "trapped" })).toStrictEqual({
      giveUp: "trapped",
    });
    expect(actionOf({ action: "press", key: null })).toBeNull();
    expect(actionOf({ action: "type" })).toBeNull();
  });

  it("refuses a key outside the keyboard set", () => {
    expect(() =>
      Schema.decodeUnknownSync(DriverDecisionSchema)({
        action: "press",
        key: "MouseLeft",
      })
    ).toThrow();
  });

  it("gives the model the input names, its own steps and the tree as data", () => {
    const prompt = driverPrompt({
      focused: '- textbox "Email"',
      goal: "Place the order",
      inputs: ["email"],
      left: 10,
      path: "/checkout",
      taken: [{ press: "Tab" }, { type: "email" }],
      tree: '- heading "Checkout" [level=1]',
    });

    expect(prompt).toContain('<tree>\n- heading "Checkout" [level=1]\n</tree>');
    expect(prompt).toContain("by name: email.");
    expect(prompt).toContain('press Tab; type the input "email"');
    expect(prompt).toContain('Focus is on: - textbox "Email"');
  });
});
