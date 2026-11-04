import { MAX_PRICES, MIN_PASSAGE_TEXT } from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";

import { readPage } from "../src/index.js";

const page = (body: string): string =>
  `<!doctype html><html lang="cs"><head><title>Obchod</title></head><body>${body}</body></html>`;

const long = (text: string): string =>
  `${text} ${"slovo ".repeat(MIN_PASSAGE_TEXT / 6)}`.trim();

describe("passages and prices for model-judged observations", () => {
  it("keeps each block's text with the language that applies to it", () => {
    const czech = long("Doprava zdarma nad tisíc korun.");
    const english = long("Free delivery on orders over fifty euros.");

    const { passages } = readPage(
      page(
        `<p>${czech}</p><div lang="en-GB"><p>${english}</p></div><p>Krátký.</p>`
      )
    );

    expect(passages).toEqual([
      { landmark: null, lang: "cs", text: czech },
      { landmark: null, lang: "en-GB", text: english },
    ]);
  });

  it("does not double the text of a block nested in another", () => {
    const inner = long("Vnitřní odstavec v položce seznamu.");

    const { passages } = readPage(page(`<ul><li><p>${inner}</p></li></ul>`));

    expect(passages).toEqual([{ landmark: null, lang: "cs", text: inner }]);
  });

  it("marks the landmark a block sits in", () => {
    const text = long("Prohlášení o přístupnosti.");

    const { passages } = readPage(
      page(`<nav><p>${text}</p></nav><main><p>${text} Hlavní.</p></main>`)
    );

    expect(passages.map(({ landmark }) => landmark)).toEqual(["nav", "main"]);
  });

  it("leaves out hidden blocks", () => {
    const { passages } = readPage(
      page(`<div hidden><p>${long("Skrytý text.")}</p></div>`)
    );

    expect(passages).toEqual([]);
  });

  it("finds prices in visible text, also when the currency is a separate node", () => {
    const { prices } = readPage(
      page(
        "<p>Cena <b>1 299</b> Kč</p><span>€ 19,99</span><span>24.90 EUR</span><span>Rok 2025</span><span>199,-</span>"
      )
    );

    expect(prices).toEqual(["1 299 Kč", "€ 19,99", "24.90 EUR", "199,-"]);
  });

  it("keeps at most a fixed number of distinct prices", () => {
    const { prices } = readPage(
      page(
        Array.from(
          { length: MAX_PRICES + 5 },
          (_, index) => `<span>${index + 1} €</span>`
        ).join("")
      )
    );

    expect(prices).toHaveLength(MAX_PRICES);
  });
});
