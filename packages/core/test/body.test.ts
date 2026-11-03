import { describe, expect, it } from "@effect/vitest";

import { decodeBody } from "../src/index.js";

const bytes = (text: string) => new TextEncoder().encode(text);

describe("decoding a page body", () => {
  it("reads a meta charset that names UTF-16 as UTF-8, as browsers do", () => {
    const page =
      '<meta content="text/html; charset=unicode" http-equiv="Content-Type"><title>Berkshire</title>';

    expect(decodeBody("text/html", bytes(page))).toEqual({
      charset: "utf-8",
      text: page,
    });
  });

  it("keeps a meta charset that is not UTF-16", () => {
    expect(
      decodeBody(
        "text/html",
        new Uint8Array([...bytes('<meta charset="windows-1252">'), 0xe9])
      )
    ).toEqual({
      charset: "windows-1252",
      text: '<meta charset="windows-1252">é',
    });
  });

  it("falls back to UTF-8 for a charset label it does not know", () => {
    expect(
      decodeBody("text/html", bytes('<meta charset="nonsense">ok')).text
    ).toBe('<meta charset="nonsense">ok');
  });
});
