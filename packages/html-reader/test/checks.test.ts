import { CATALOGUE, runChecks } from "@eaa-check/core";
import type { CheckId, CheckStatus } from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";

import { readPage } from "../src/index.js";

const doc = (head: string, body: string, html = '<html lang="en">') =>
  `<!doctype html>${html}<head><title>Shop</title>${head}</head><body>${body}</body></html>`;

const statusOf = (html: string, id: CheckId) => {
  const finding = runChecks(readPage(html)).find((entry) => entry.id === id);

  return {
    failing: finding?.failing,
    samples: finding?.samples,
    status: finding?.status,
  };
};

const cases: readonly (readonly [CheckId, string, CheckStatus, number?])[] = [
  ["html-lang", doc("", ""), "pass"],
  ["html-lang", doc("", "", "<html>"), "fail", 1],
  ["html-lang", doc("", "", '<html lang="">'), "fail", 1],
  ["html-lang", doc("", "", '<html lang="english language">'), "fail", 1],
  ["html-lang", doc("", "", '<html lang="pt-BR">'), "pass"],
  ["html-lang", doc("", "", '<html lang="zh-Hant-TW">'), "pass"],
  ["html-lang", doc("", "", '<html lang="es-419">'), "pass"],
  ["html-lang", doc("", "", '<html lang="de-CH-1996">'), "pass"],
  ["html-lang", doc("", "", '<html lang="EN">'), "pass"],
  ["html-lang", doc("", "", '<html lang="en_US">'), "fail", 1],
  ["html-lang", doc("", "", '<html lang="english">'), "fail", 1],
  ["html-lang", doc("", "", '<html lang="en-">'), "fail", 1],
  ["html-lang", doc("", "", '<html lang="en-a">'), "fail", 1],
  ["autocomplete-valid", doc("", '<input name="q">'), "not_applicable"],
  [
    "autocomplete-valid",
    doc("", '<input autocomplete="off">'),
    "not_applicable",
  ],
  [
    "autocomplete-valid",
    doc("", '<input autocomplete=" ON ">'),
    "not_applicable",
  ],
  ["autocomplete-valid", doc("", '<input autocomplete="email">'), "pass"],
  [
    "autocomplete-valid",
    doc("", '<input autocomplete="section-blue shipping street-address">'),
    "pass",
  ],
  [
    "autocomplete-valid",
    doc("", '<input autocomplete="billing work tel">'),
    "pass",
  ],
  [
    "autocomplete-valid",
    doc("", '<input autocomplete="username webauthn">'),
    "pass",
  ],
  [
    "autocomplete-valid",
    doc(
      "",
      '<select autocomplete="country"></select><textarea autocomplete="Street-Address"></textarea>'
    ),
    "pass",
  ],
  ["autocomplete-valid", doc("", '<input autocomplete="nope">'), "fail", 1],
  [
    "autocomplete-valid",
    doc("", '<input autocomplete="home name">'),
    "fail",
    1,
  ],
  [
    "autocomplete-valid",
    doc("", '<input autocomplete="email email">'),
    "fail",
    1,
  ],
  [
    "autocomplete-valid",
    doc("", '<textarea autocomplete="badname"></textarea>'),
    "fail",
    1,
  ],
  [
    "autocomplete-valid",
    doc(
      "",
      '<input autocomplete="badname" disabled><input autocomplete="badname" aria-disabled="true"><input type="checkbox" autocomplete="badname"><input autocomplete="badname" tabindex="-1"><input type="hidden" autocomplete="badname"><div hidden><input autocomplete="badname"></div>'
    ),
    "not_applicable",
  ],
  ["document-title", doc("", ""), "pass"],
  [
    "document-title",
    '<html lang="en"><head></head><body></body></html>',
    "fail",
    1,
  ],
  [
    "document-title",
    '<html lang="en"><head><title>  </title></head></html>',
    "fail",
    1,
  ],
  [
    "document-title",
    '<html lang="en"><head><title>A &amp; B</title></head></html>',
    "pass",
  ],
  [
    "title-generic",
    '<html lang="en"><head><title></title></head></html>',
    "not_applicable",
  ],
  [
    "title-generic",
    '<html lang="en"><head><title>Shop</title></head></html>',
    "pass",
  ],
  [
    "title-generic",
    '<html lang="en"><head><title>Home | Example Shop</title></head></html>',
    "pass",
  ],
  [
    "title-generic",
    '<html lang="en"><head><title>Home</title></head></html>',
    "fail",
    1,
  ],
  [
    "title-generic",
    '<html lang="en"><head><title> untitled document </title></head></html>',
    "fail",
    1,
  ],
  [
    "title-generic",
    '<html lang="en"><head><title>index.html</title></head></html>',
    "fail",
    1,
  ],
  [
    "title-generic",
    '<html lang="en"><head><title>React App</title></head></html>',
    "fail",
    1,
  ],
  [
    "title-generic",
    '<html lang="en"><head><title>Home.</title></head></html>',
    "fail",
    1,
  ],
  [
    "title-generic",
    '<html lang="en"><head><title>Documents</title></head></html>',
    "pass",
  ],
  ["image-alt", doc("", ""), "not_applicable"],
  ["image-alt", doc("", '<img src="a.png" alt="Logo">'), "pass"],
  ["image-alt", doc("", '<img src="a.png" alt="">'), "pass"],
  ["image-alt", doc("", '<img src="a.png" role="presentation">'), "pass"],
  ["image-alt", doc("", '<img src="a.png" aria-label="Logo">'), "pass"],
  [
    "image-alt",
    doc("", '<img src="a.png"><img src="b.png" alt="B">'),
    "fail",
    1,
  ],
  [
    "image-alt",
    doc("", '<div hidden><img src="a.png"></div><img alt=x>'),
    "pass",
  ],
  [
    "image-alt",
    doc("", '<div aria-hidden="true"><img src="a.png"></div>'),
    "not_applicable",
  ],
  [
    "image-alt",
    doc("", '<template><img src="a.png"></template>'),
    "not_applicable",
  ],
  ["image-alt", doc("", '<input type="image" src="go.png">'), "fail", 1],
  [
    "image-alt",
    doc("", '<input type="image" src="go.png" alt="Search">'),
    "pass",
  ],
  ["alt-placeholder", doc("", '<img src="a.png">'), "not_applicable"],
  ["alt-placeholder", doc("", '<img src="a.png" alt="">'), "not_applicable"],
  ["alt-placeholder", doc("", '<img src="logo.png" alt="Logo">'), "pass"],
  ["alt-placeholder", doc("", '<img src="nike.jpg" alt="Nike">'), "pass"],
  [
    "alt-placeholder",
    doc("", '<img src="/p/red-shoes.jpg" alt="Red running shoes">'),
    "pass",
  ],
  [
    "alt-placeholder",
    doc("", '<img src="/p/hero.jpg?w=800" alt="hero.jpg">'),
    "fail",
    1,
  ],
  ["alt-placeholder", doc("", '<img src="x" alt="DSC_0042.JPG">'), "fail", 1],
  ["alt-placeholder", doc("", '<img src="x" alt="IMG_1234">'), "fail", 1],
  ["alt-placeholder", doc("", '<img src="x" alt=" Image ">'), "fail", 1],
  ["alt-placeholder", doc("", '<img src="x" alt="photo">'), "fail", 1],
  [
    "alt-placeholder",
    doc("", '<img src="/img/product%20shot.webp" alt="product shot.webp">'),
    "fail",
    1,
  ],
  [
    "alt-placeholder",
    doc("", '<img src="x" alt="image" aria-label="Summer sale">'),
    "not_applicable",
  ],
  [
    "alt-placeholder",
    doc("", '<input type="image" src="go.png" alt="go.png">'),
    "fail",
    1,
  ],
  [
    "button-name",
    doc(
      "",
      '<button><span><svg aria-label="Submit Search"><use href="#s"></use></svg></span></button>'
    ),
    "pass",
  ],
  [
    "link-name",
    doc("", '<a href="/"><span aria-label="Home"></span></a>'),
    "pass",
  ],
  [
    "frame-title",
    doc("", '<iframe src="/store.html" style="display:none;"></iframe>'),
    "not_applicable",
  ],
  [
    "image-alt",
    doc("", '<img src="a.png" style="visibility: hidden">'),
    "not_applicable",
  ],
  [
    "image-alt",
    doc("", '<div style="display: none"><img src="a.png"></div>'),
    "fail",
    1,
  ],
  [
    "link-name",
    doc("", '<a href="/"><shop-card label="Sale"></shop-card></a>'),
    "pass",
  ],
  [
    "link-name",
    doc(
      "",
      '<a href="/"><div aria-hidden="true"><shop-icon></shop-icon></div></a>'
    ),
    "fail",
    1,
  ],
  ["form-labels", doc("", ""), "not_applicable"],
  [
    "form-labels",
    doc("", '<label for="q">Search</label><input id="q">'),
    "pass",
  ],
  ["form-labels", doc("", '<label>Email <input type="email"></label>'), "pass"],
  ["form-labels", doc("", '<input aria-label="Search">'), "pass"],
  ["form-labels", doc("", '<input placeholder="Search">'), "pass"],
  [
    "form-labels",
    doc("", '<input type="hidden" name="t"><input type="submit">'),
    "not_applicable",
  ],
  [
    "form-labels",
    doc("", '<input id="q"><label for="other">X</label>'),
    "fail",
    1,
  ],
  [
    "form-labels",
    doc("", "<select><option>A</option></select><textarea></textarea>"),
    "fail",
    2,
  ],
  ["link-name", doc("", '<a href="/">Home</a>'), "pass"],
  [
    "link-name",
    doc("", '<a href="/"><img src="l.png" alt="Home"></a>'),
    "pass",
  ],
  [
    "link-name",
    doc("", '<a href="/"><svg><title>Home</title><path/></svg></a>'),
    "pass",
  ],
  [
    "link-name",
    doc("", '<a href="/" aria-label="Home"><i class="icon"></i></a>'),
    "pass",
  ],
  [
    "link-name",
    doc("", '<a href="/"><i class="icon"></i></a><a href="/x"> </a>'),
    "fail",
    2,
  ],
  ["link-name", doc("", '<a name="top"></a>'), "not_applicable"],
  [
    "link-name",
    doc("", '<a href="/"><span aria-hidden="true">x</span></a>'),
    "fail",
    1,
  ],
  ["button-name", doc("", "<button>Buy</button>"), "pass"],
  [
    "button-name",
    doc("", '<button><svg aria-hidden="true"></svg></button>'),
    "fail",
    1,
  ],
  ["button-name", doc("", '<button title="Close"></button>'), "pass"],
  ["button-name", doc("", '<input type="submit">'), "pass"],
  ["button-name", doc("", '<input type="button">'), "fail", 1],
  ["button-name", doc("", '<input type="submit" value="">'), "fail", 1],
  ["frame-title", doc("", '<iframe src="/map" title="Map"></iframe>'), "pass"],
  ["frame-title", doc("", '<iframe src="/map"></iframe>'), "fail", 1],
  ["frame-title", doc("", ""), "not_applicable"],
  [
    "meta-viewport-zoom",
    doc(
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      ""
    ),
    "pass",
  ],
  [
    "meta-viewport-zoom",
    doc(
      '<meta name="viewport" content="width=device-width, user-scalable=no">',
      ""
    ),
    "fail",
    1,
  ],
  [
    "meta-viewport-zoom",
    doc(
      '<meta name="viewport" content="width=device-width, maximum-scale=1">',
      ""
    ),
    "fail",
    1,
  ],
  [
    "meta-viewport-zoom",
    doc('<meta name="viewport" content="maximum-scale=5">', ""),
    "pass",
  ],
  ["meta-viewport-zoom", doc("", ""), "not_applicable"],
  [
    "meta-refresh",
    doc('<meta http-equiv="refresh" content="0; url=/new">', ""),
    "pass",
  ],
  [
    "meta-refresh",
    doc('<meta http-equiv="Refresh" content="30">', ""),
    "fail",
    1,
  ],
  ["meta-refresh", doc("", ""), "not_applicable"],
];

describe("checks over HTML fixtures", () => {
  it.each(
    cases.map(([id, html, status, failing]) => ({ failing, html, id, status }))
  )("$id on $html is $status", ({ failing, html, id, status }) => {
    const result = statusOf(html, id);

    expect(result.status).toBe(status);

    if (failing !== undefined) {
      expect(result.failing).toBe(failing);
      expect(result.samples?.length).toBe(Math.min(failing, 5));
    }
  });

  it("covers every check in the catalogue", () => {
    const covered = new Set(cases.map(([id]) => id));

    expect(CATALOGUE.filter(({ check }) => !covered.has(check.id))).toEqual([]);
  });

  it("keeps a snippet of the failing element as the sample", () => {
    expect(
      statusOf(doc("", '<img src="/hero.jpg" class="hero">'), "image-alt")
        .samples
    ).toEqual(['<img class="hero" src="/hero.jpg">']);
  });

  it("does not take text from scripts or styles as a link's name", () => {
    expect(
      statusOf(
        doc(
          "",
          '<a href="/"><script>var x = 1;</script><style>a{}</style></a>'
        ),
        "link-name"
      ).status
    ).toBe("fail");
  });
});
