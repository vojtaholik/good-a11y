import { describe, expect, it } from "@effect/vitest";

import {
  decideCharacterKeys,
  decideHoverContent,
  decideNonTextContrast,
  decideOrientation,
} from "../src/probes.js";
import type { InteractionMeasured } from "../src/probes.js";

type Keys = NonNullable<InteractionMeasured["keys"]>;

type Hover = NonNullable<InteractionMeasured["hover"]>[number];

type Read = NonNullable<Keys[number]["trials"][number]["pressed"]>;

const QUIET: Read = { changed: [], focus: null, snippet: null };

const FOCUSED: Read = {
  changed: [],
  focus: "input#q.",
  snippet: '<input id="q">',
};

const trial = (pressed: Read, control: Read = QUIET, navigated = false) => ({
  control,
  navigated,
  pressed,
});

const HOVER: Hover = {
  closedOnLeave: true,
  escapeClosed: true,
  focusEscapeClosed: null,
  focusShown: false,
  obscures: true,
  persisted: true,
  reshown: true,
  snippet: "<div>",
  stayedOnHover: true,
  trigger: "<a>",
};

describe("2.1.4 character keys", () => {
  it("fails only when two quiet trials show the same effect", () => {
    const keys: Keys = [
      { key: "/", trials: [trial(FOCUSED), trial(FOCUSED)] },
      {
        key: "s",
        trials: [
          trial({ ...QUIET, changed: ["div#slide-1."] }),
          trial({ ...QUIET, changed: ["div#slide-2."] }),
        ],
      },
      { key: "k", trials: [trial(QUIET)] },
    ];

    expect(decideCharacterKeys(keys).samples).toEqual([
      'Pressing "/" with no field focused moves focus to <input id="q">',
    ]);
  });

  it("judges nothing on a page that changes by itself while no key is pressed", () => {
    const busy = { ...QUIET, changed: ["div#ticker."] };

    expect(
      decideCharacterKeys([
        { key: "/", trials: [trial(FOCUSED, busy), trial(FOCUSED, busy)] },
      ]).status
    ).toBe("not_applicable");
  });

  it("counts a navigation seen twice", () => {
    expect(
      decideCharacterKeys([
        {
          key: "1",
          trials: [trial(QUIET, QUIET, true), trial(QUIET, QUIET, true)],
        },
      ]).samples
    ).toEqual([
      'Pressing "1" with no field focused sends the page to another address',
    ]);
  });
});

describe("1.4.13 hover content", () => {
  it("leaves content alone that did not close on leaving or did not come back", () => {
    expect(
      decideHoverContent([
        { ...HOVER, closedOnLeave: false, stayedOnHover: false },
        { ...HOVER, reshown: false, stayedOnHover: false },
      ]).status
    ).toBe("not_applicable");
  });

  it("does not ask Escape of content that covers nothing", () => {
    expect(
      decideHoverContent([{ ...HOVER, escapeClosed: false, obscures: false }])
        .status
    ).toBe("pass");
  });

  it("fails content that vanishes while the pointer rests on it", () => {
    expect(
      decideHoverContent([{ ...HOVER, persisted: false }]).samples
    ).toEqual([
      "<div> (shown on hover over <a>) disappears by itself while the pointer rests on it",
    ]);
  });
});

const read = (
  text: number,
  rules: NonNullable<InteractionMeasured["orientation"]>["portrait"]["rules"]
) => ({ rules, text });

const RULE = {
  active: true,
  hide: false,
  media: "(orientation: portrait)",
  rotate: true,
  selector: "body",
  share: 1,
};

describe("1.3.4 orientation", () => {
  it("fails a page turned by a rule for one orientation", () => {
    expect(
      decideOrientation({
        landscape: read(500, [{ ...RULE, active: false }]),
        portrait: read(500, [RULE]),
      }).samples
    ).toEqual([
      "In portrait orientation, @media (orientation: portrait) turns body",
    ]);
  });

  it("passes a hide rule whose text is still shown, or that hides little", () => {
    const hide = {
      ...RULE,
      hide: true,
      rotate: false,
      selector: ".aside",
      share: 0.1,
    };

    expect(
      decideOrientation({
        landscape: read(500, [{ ...hide, active: false }]),
        portrait: read(480, [hide]),
      }).status
    ).toBe("pass");
  });
});

describe("1.4.11 non-text contrast", () => {
  it("is not judged when no field or icon could be measured", () => {
    expect(
      decideNonTextContrast({
        fields: { judged: 0, low: [] },
        icons: { judged: 0, low: [] },
      }).status
    ).toBe("not_applicable");
  });
});
