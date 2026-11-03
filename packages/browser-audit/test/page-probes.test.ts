import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";
import { Window } from "happy-dom";

import { probesSource } from "#page-scripts";

const BOX = {
  bottom: 40,
  height: 30,
  left: 10,
  right: 110,
  top: 10,
  width: 100,
  x: 10,
  y: 10,
};

const StopsJson = Schema.fromJsonString(
  Schema.Array(
    Schema.Struct({ judged: Schema.Boolean, snippet: Schema.String })
  )
);

const pageWith = (html: string) => {
  const window = new Window({
    settings: {
      enableJavaScriptEvaluation: true,
      suppressInsecureJavaScriptEnvironmentWarning: true,
    },
  });

  window.Element.prototype.getBoundingClientRect = () =>
    new window.DOMRect(BOX.x, BOX.y, BOX.width, BOX.height);
  window.document.write(html);

  return window;
};

const focus = (window: Window, id: string) => {
  const element = window.document.querySelector(`#${id}`);

  if (element instanceof window.HTMLElement) {
    element.focus();
  }
};

describe("the tab walk in the page", () => {
  it("does not judge focus visible on a control that had focus when the walk started", () => {
    const window = pageWith(
      "<style>input { opacity: 1 }</style><input id=search autofocus><input id=other>"
    );

    focus(window, "search");
    window.eval(probesSource);

    window.eval("__eaaProbes.walkStart()");
    focus(window, "search");
    focus(window, "other");

    expect(
      Schema.decodeUnknownSync(StopsJson)(
        window.eval("JSON.stringify(__eaaProbes.walkStops(0))")
      ).map((stop) => [stop.snippet, stop.judged])
    ).toEqual([
      ['<input id="search" autofocus="">', false],
      ['<input id="other">', true],
    ]);
  });
});
