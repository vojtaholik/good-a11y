import { MAX_CONTEXT, MAX_TEXT_SAMPLE } from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";

import { readPage } from "../src/index.js";

const page = (body: string): string =>
  `<!doctype html><html lang="en"><head><title>Shop</title><script>var x = "not text";</script></head><body>${body}</body></html>`;

describe("evidence for model-judged observations", () => {
  it("keeps the paragraph, list item or cell around each link", () => {
    const { links } = readPage(
      page(
        '<p>See our <a href="/h">holiday hours</a> before you visit.</p><ul><li><a href="/n">More</a></li></ul><a href="/x">Loose</a>'
      )
    );

    expect(links.map(({ context, text }) => ({ context, text }))).toEqual([
      {
        context: "See our holiday hours before you visit.",
        text: "holiday hours",
      },
      { context: "More", text: "More" },
      { context: "", text: "Loose" },
    ]);
  });

  it("marks links that carry hreflang or lang", () => {
    const { links } = readPage(
      page(
        '<a href="/fr" hreflang="fr">Français</a><a href="/eu" lang="eu">Euskara</a><a href="/x">Shop</a>'
      )
    );

    expect(links.map(({ language }) => language)).toEqual([true, true, false]);
  });

  it("reads headings with their level, and label texts", () => {
    const evidence = readPage(
      page(
        '<h1>Sunny <em>Bikes</em></h1><h3>Untitled</h3><label for="e">Email address</label><input id="e"><label>Name <input></label>'
      )
    );

    expect(evidence.headings).toEqual([
      { level: 1, text: "Sunny Bikes" },
      { level: 3, text: "Untitled" },
    ]);
    expect(evidence.labels).toEqual(["Email address", "Name"]);
  });

  it("keeps the image file name without its path or query", () => {
    const { images } = readPage(
      page(
        '<img src="/media/IMG_2041.jpg?w=400" alt="x"><img src="data:image/png;base64,AAAA" alt="y">'
      )
    );

    expect(images.map(({ file }) => file)).toEqual(["IMG_2041.jpg", null]);
  });

  it("samples visible text, not scripts, the title or hidden parts", () => {
    const { textSample } = readPage(
      page("<p>We repair bikes.</p><div hidden>Secret</div><p>Open daily.</p>")
    );

    expect(textSample).toBe("We repair bikes. Open daily.");
  });

  it("caps link context and the text sample", () => {
    const long = "word ".repeat(2000);
    const evidence = readPage(page(`<p>${long}<a href="/">here</a></p>`));

    expect(evidence.links[0]?.context.length).toBeLessThanOrEqual(MAX_CONTEXT);
    expect(evidence.textSample.length).toBeLessThanOrEqual(MAX_TEXT_SAMPLE);
  });
});
