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
    Schema.Struct({
      changed: Schema.optional(Schema.Finite),
      judged: Schema.Boolean,
      snippet: Schema.String,
    })
  )
);

const ReflowJson = Schema.fromJsonString(
  Schema.Struct({
    offenderCount: Schema.Finite,
    offenders: Schema.Array(Schema.Struct({ snippet: Schema.String })),
  })
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

  const changedOnFocus = (ring: string) => {
    const window = pageWith(
      `<style>a { opacity: 1 }</style><a id=link href="/">Home</a><div id=host></div>`
    );

    window.eval(probesSource);
    window.eval(
      `document.querySelector("#host").attachShadow({ mode: "open" }).innerHTML = ${JSON.stringify(ring)}`
    );
    window.eval("__eaaProbes.walkStart()");
    focus(window, "link");

    return Schema.decodeUnknownSync(StopsJson)(
      window.eval("JSON.stringify(__eaaProbes.walkStops(0))")
    ).map((stop) => stop.changed);
  };

  it("counts a floating focus ring drawn in another element's shadow DOM as a visible change", () => {
    expect(
      changedOnFocus(
        '<div style="position: absolute; pointer-events: none; outline: 2px solid blue; opacity: 1"></div>'
      )
    ).toEqual([1]);
  });

  it("does not count a layer that takes pointer events or paints no edge", () => {
    expect(
      changedOnFocus(
        '<div style="position: absolute; outline: 2px solid blue; opacity: 1"></div><div style="position: absolute; pointer-events: none; opacity: 1"></div>'
      )
    ).toEqual([0]);
  });

  const changedOn = (html: string) => {
    const window = pageWith(html);

    window.eval(probesSource);
    window.eval("__eaaProbes.walkStart()");
    focus(window, "link");

    return Schema.decodeUnknownSync(StopsJson)(
      window.eval("JSON.stringify(__eaaProbes.walkStops(0))")
    ).map((stop) => stop.changed);
  };

  it("counts a focus class the page's own handler adds after the walk saw the focus", () => {
    expect(
      changedOn(
        `<style>a, div { opacity: 1 } .focused { border-top-color: blue }</style><div id=wrap><a id=link href="/">Home</a></div><script>document.addEventListener("focusin", () => document.querySelector("#wrap").classList.add("focused"))</script>`
      )
    ).toEqual([1]);
  });

  it("does not count an outline offset that changes while no outline is drawn", () => {
    expect(
      changedOn(
        '<style>a { opacity: 1; outline: none } a:focus { outline-offset: 1px }</style><a id=link href="/">Home</a>'
      )
    ).toEqual([0]);
  });
});

describe("reflow in the page", () => {
  it("counts every element past the right edge and keeps five samples", () => {
    const window = pageWith(
      `<style>div { opacity: 1 }</style>${Array.from({ length: 8 }, (_, index) => `<div id="wide-${index}"></div>`).join("")}`
    );

    window.eval(probesSource);

    expect(
      Schema.decodeUnknownSync(ReflowJson)(
        window.eval("JSON.stringify(__eaaProbes.reflow())")
      )
    ).toMatchObject({ offenderCount: 8, offenders: { length: 5 } });
  });
});
