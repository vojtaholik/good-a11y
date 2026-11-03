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
    offenders: Schema.Array(Schema.Struct({ snippet: Schema.String })),
  })
);

const MarkedJson = Schema.fromJsonString(
  Schema.Struct({
    violations: Schema.Array(
      Schema.Struct({
        nodes: Schema.Array(Schema.Struct({ inComponent: Schema.Boolean })),
      })
    ),
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
  it("leaves out elements inside an ancestor that clips or scrolls sideways", () => {
    const window = pageWith(
      `<style>div { opacity: 1 }</style><div id="wide"></div><div id="track" style="overflow-x: auto"><div id="slide-1"></div><div id="slide-2"></div></div>`
    );

    Object.defineProperty(window.document.documentElement, "scrollWidth", {
      value: BOX.right,
    });
    window.eval(probesSource);

    expect(
      Schema.decodeUnknownSync(ReflowJson)(
        window.eval("JSON.stringify(__eaaProbes.reflow())")
      ).offenders.map((offender) => offender.snippet)
    ).toEqual([
      '<div id="wide"></div>',
      '<div id="track" style="overflow-x: auto"><div id="slide-1"></div><div id="slide-2"></div></div>',
    ]);
  });
});

describe("reflow offenders past the page's own width", () => {
  it("are clipped somewhere, so they are not named as the cause", () => {
    const window = pageWith(
      `<style>div { opacity: 1 }</style><div id="clipped"></div>`
    );

    Object.defineProperty(window.document.documentElement, "scrollWidth", {
      value: BOX.right - 20,
    });
    window.eval(probesSource);

    expect(
      Schema.decodeUnknownSync(ReflowJson)(
        window.eval("JSON.stringify(__eaaProbes.reflow())")
      ).offenders
    ).toEqual([]);
  });
});

describe("contrast results in web components", () => {
  it("marks contrast nodes that sit in a shadow root or are slotted into one", () => {
    const window = pageWith(
      `<div id="plain">Plain</div><card-box id="card"><span id="slotted" slot="title">Slotted</span></card-box>`
    );

    window.eval(probesSource);
    window.eval(`
      const card = document.querySelector("#card");
      card.attachShadow({ mode: "open" }).innerHTML = '<slot name="title"></slot><p id="inner">Inner</p>';
    `);

    expect(
      Schema.decodeUnknownSync(MarkedJson)(
        window.eval(`JSON.stringify(__eaaProbes.markComponents({
          violations: [
            { id: "color-contrast", nodes: [
              { target: ["#plain"] },
              { target: ["#slotted"] },
              { target: [["#card", "#inner"]] },
            ] },
          ],
        }))`)
      ).violations[0]?.nodes.map((node) => node.inComponent)
    ).toEqual([false, true, true]);
  });
});
