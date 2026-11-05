# Accuracy QA

Started 2026-11-03 by builder-core. Each reported issue is checked by hand against the page's served HTML, fetched once with the scanner's own user agent. A finding is a true positive (TP) when the HTML shows the failure, a false positive (FP) when it does not. A false negative (FN) is a failure visible in the HTML that the check did not report.

## Round 1: static checks through the CLI

Sites: www.gov.uk, www.w3.org/WAI/, en.wikipedia.org/wiki/Main_Page, www.otto.de, www.ikea.com, www.emag.ro, www.rohlik.cz, www.bbc.co.uk, www.berkshirehathaway.com, info.cern.ch, www.craigslist.org.

gov.uk, Wikipedia, ikea.com, emag.ro, rohlik.cz and bbc.co.uk came back with no static issue.

| Site | Check | Sample | Verdict | Cause |
| --- | --- | --- | --- | --- |
| w3.org/WAI | button-name | `<button class="button button-icon …">` | FP, fixed | The button's only content is `<svg aria-label="Submit Search">`. An `aria-label` on a descendant counts toward the button's name, and the reader ignored it |
| berkshirehathaway.com | document-title | no `<title>` element | FP, fixed | The page declares `<meta content="text/html; charset=unicode">`. The Encoding standard maps `unicode` to UTF-16LE, so the body decoded to noise. The HTML spec's prescan turns a UTF-16 charset found in a `<meta>` into UTF-8, which is what browsers do; `decodeBody` now does the same |
| berkshirehathaway.com | html-lang | `<html>` has no lang | TP | Same decode bug, but the page really has `<html>` with no lang |
| info.cern.ch | html-lang | `<html>` has no lang | TP |  |
| craigslist.org | html-lang | `<html>` has no lang | TP |  |
| craigslist.org | form-labels | `<select id="chlang" name="lang">` | TP | The language picker has no label, aria-label or title |
| craigslist.org | frame-title | `<iframe id="cl-local-storage">` | FP, fixed | The iframe has `style="display:none;"`, so it is not exposed to assistive technology. An element hidden by its own inline `display: none` or `visibility: hidden` is now not checked. Its descendants still are: otto.de hides whole navigation regions inline and reveals them with script, and skipping those dropped its checked links from 551 to 4 |
| otto.de | image-alt | 10 `<img>` in navigation chips and tiles | TP | Light-DOM `<img>` slotted into Otto's web components, with no alt |
| otto.de | link-name | `<a href="/wishlist-view/">` | TP in the served HTML | All content is `aria-hidden`. The wrapping `oc-interactive-overlay-v1` carries `oc-aria-label="Merkzettel"`, which its script may copy onto the link after load. The rendered check would settle it |
| otto.de | link-name | `<a id="to-login-link" href="">` | Undecidable, now not reported | The link wraps a visible `oc-media-object-card-v1 oc-aria-label="…"`, whose shadow DOM may hold the name. Shadow content counts toward a link's name, and static HTML cannot see it. A link or button that contains a visible custom element is now treated as named |

Web components are a limit of static checks: a name may come from a custom element's shadow DOM or script. The static check now leaves those links and buttons to the rendered audit, which sees the flat tree.

## Round 2: weaker sites through the CLI

Sites: www.arngren.net, www.spacejam.com/1996/, www.idnes.cz, www.seznam.cz, www.zara.com. lingscars.com, alza.cz, heureka.cz, mediamarkt.de and hm.com refused the fetch.

| Site | Check | Sample | Verdict | Cause |
| --- | --- | --- | --- | --- |
| zara.com | html-lang, document-title, frame-title, meta-refresh | the whole page | FP, fixed | Akamai Bot Manager interstitial (`bm-verify=` refresh and `/_sec/verify?provider=interstitial`) served with HTTP 200. Added to `CHALLENGE_BODIES`; the report is now "refused" with no findings |
| arngren.net | html-lang | `<html>` has no lang | TP |  |
| arngren.net | form-labels | `<input name="p" type="text">` ×3 | TP | Site search fields with only a "Search" submit button next to them |
| arngren.net | link-name | 188 of 611 links | TP | Each link holds only `<img alt="">` |
| spacejam.com/1996 | html-lang | `<html>` has no lang | TP |  |
| idnes.cz | image-alt | 20 of 103 images | TP | Menu logos without alt (Lidovky, Expres) inside named links, and an ad mockup's `free.gif` in the served HTML that the ad script later replaces |
| idnes.cz | link-name | `a.ico-setting`, `a.f-top`, `a.extra-tab` | TP | Icon links drawn with CSS, and a link holding only `<img alt="">` |
| idnes.cz | frame-title | `<iframe src="https://www.impuls.cz/embed/player.html">` | TP |  |
| seznam.cz | link-name | 50 of 441 | TP | Source icons: each link holds only `<img alt="">`. A direct count of that markup in the HTML finds 49 |
| seznam.cz | button-name | 53 of 113 | TP | Hamburger, search submit, avatar and "three dots" buttons hold only an `<svg>` with no name |

## False negatives

An independent count with Python's `html.parser` (images without alt, links without a name) agreed with the reader on gov.uk, Wikipedia, ikea.com, emag.ro, bbc.co.uk, idnes.cz and arngren.net. It disagreed on rohlik.cz and seznam.cz. In both cases the script was wrong: it mishandled `aria-hidden` SVGs before link text, and an `<li>` nested inside an `<a>`. No false negative found in these checks.

Known false negatives by design: names supplied by shadow DOM or script, inline-hidden elements revealed by script, and everything only the rendered page shows.

## Round 3: the rendered check

The daily browser budget on dev was spent, so axe-core 4.14.0 ran in local headless Chrome the same way the adapter runs it: the scanner's user agent, a 1280×800 viewport, the `load` event plus 2 seconds, `runOnly` on `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa`, violations only. The results went through `renderedOf`. Sites: gov.uk, w3.org/WAI, Wikipedia, otto.de, ikea.com, emag.ro, rohlik.cz, bbc.co.uk, idnes.cz, seznam.cz, arngren.net. gov.uk, w3.org/WAI and Wikipedia had no violations.

| Site | Rule | Sample | Verdict | Cause |
| --- | --- | --- | --- | --- |
| bbc.co.uk | label-content-name-mismatch | 23 audio links | FP, rule dropped | Visible "The Global Story They fled Russia - the US sent them back", name "Audio: The Global Story - They fled Russia - the US sent them back". The visible words are in the name in order; only punctuation differs, which 2.5.3 does not count |
| emag.ro | label-content-name-mismatch | 18 product thumbnails | Debatable | The link's visible text is a badge such as "Top Favorite"; the name is the product title |
| otto.de | label-content-name-mismatch | `<a aria-label="Allgemeine Geschäftsbedingungen">AGB</a>` | TP | A speech user saying "AGB" cannot reach it |
| rohlik.cz, ikea.com | label-content-name-mismatch | cart button, store picker | Debatable |  |
| seznam.cz | color-contrast | `#aaaaaa` on white, 2.32:1 | TP | 5 of 5 samples checked |
| emag.ro | color-contrast | white on `#0082e6`, 3.93:1; red price 3.85:1 | TP | 3 of 3 |
| rohlik.cz | color-contrast | white on `#e16e64`, 3.17:1 | TP | 3 of 3 |
| otto.de | color-contrast | "Sichere dir GRATIS Versand…" white on `#f0f0f0` | FP | The card is red on screen; the background sits in the web component's shadow DOM and axe read the page background. 2 of the 3 otto samples |
| seznam.cz | frame-title | 50 `<iframe src="about:blank?…">` | TP | Visible ad slots with no title |
| bbc.co.uk, idnes.cz | link-in-text-block | footer and cookie links | TP | No underline, under 3:1 against the text around them |
| ikea.com, rohlik.cz, seznam.cz, arngren.net | list | `<ul>` with `astro-slot`, `div`, `button`, `a` or `font` children | TP | Invalid list structure. The ikea case is a framework wrapper and low impact |
| seznam.cz | listitem, nested-interactive | `<li>` outside a list, `role="button"` with focusable children | TP |  |
| otto.de, idnes.cz, seznam.cz | image-alt | slotted `<img>`, tracking pixels, `<img src="">` | TP |  |

`label-content-name-mismatch` is out of the rendered map (`DROPPED_RULES` in `packages/core/src/rendered.ts`): most of what it reported needed judgment, and on bbc.co.uk it was wrong 23 times.

## Round 4: judged observations on the live dev page

Scans of idnes.cz, arngren.net, bbc.co.uk and seznam.cz on stage `dev` at commit 9881eb2. Judged observations are labelled as a model's and are never counted as issues, but a wrong one still costs the reader's trust.

| Site | Question | Item | Verdict | Cause |
| --- | --- | --- | --- | --- |
| idnes.cz | alt-text-describes | `alt="iDNES.cz"` on `idnes.svg` | FP | A logo whose alt names the site is the right alt text |
| idnes.cz | link-purpose | "{NADPIS} {LABEL}" | TP | An ad template's placeholders in the served HTML |
| idnes.cz | link-purpose | "Slow" | Not verified |  |
| idnes.cz | headings-labels-describe | h3 "{NADPIS}" | TP | Same template |
| arngren.net | link-purpose | "139,-", "99,-", "2998,-" and 8 more | TP | Price-only link texts |
| bbc.co.uk | all | 61 items, nothing noted |  |  |
| seznam.cz | headings-labels-describe | h6 "Vyhledat", "Právě hledané fráze", "Hlavní obsah"; labels "Méně služeb", "Další služby" | FP | Ordinary Czech headings ("Search", "Trending searches", "Main content") and button labels ("Fewer services", "More services") |

The headings and labels question is wrong on Czech page furniture, and the alt question is wrong on a logo. Handed to builder-judge, who owns the thresholds and the calibration set.

## Precision estimate per check

Counted over the findings checked by hand above, after the fixes in this document. "n" is the number of sites with a finding.

| Check | Method | Precision | n | Note |
| --- | --- | --- | --- | --- |
| html-lang | static | 5 of 5 | 5 |  |
| document-title | static | no finding after the fix | 0 | The one finding was the charset bug |
| title-generic | static | no finding | 0 | Unmeasured |
| image-alt | static | 2 of 2 sites, 30 elements | 2 |  |
| alt-placeholder | static | no finding | 0 | Unmeasured |
| form-labels | static | 2 of 2 | 2 |  |
| link-name | static | 4 of 4 sites, 242 elements | 4 | One web-component case is now left to the rendered check |
| button-name | static | 1 of 1 site, 53 elements | 1 | The w3.org/WAI false positive is fixed |
| frame-title | static | 1 of 1 | 1 | The craigslist false positive is fixed |
| meta-viewport-zoom, meta-refresh, autocomplete-valid | static | no finding | 0 | Unmeasured |
| color-contrast | rendered | 12 of 14 samples | 4 | Misses web-component backgrounds in shadow DOM |
| label-content-name-mismatch | rendered | about 1 of 45 | 5 | Dropped |
| link-name, image-alt, frame-title, list, listitem, link-in-text-block, nested-interactive, html-has-lang, label, button-name | rendered | every sample checked was a TP | 1 to 4 each | Small samples |
| alt-text-describes | judged | 0 of 1 | 1 |  |
| link-purpose | judged | 13 of 14 checked | 2 |  |
| headings-labels-describe | judged | 1 of 6 | 2 | Wrong on Czech headings |

Static precision is high on these sites because the checks only fire on markup that cannot pass. Five static checks fired nowhere in this sample, so their precision is unmeasured, not proven.

## Regression run

Run on 2026-11-03 between 22:00 and 23:30 by builder-core, over the same 21 sites.

- The static checks ran through the CLI on current main.
- Full scans ran on stage `dev`. The first four sites ran on 2254bf6 and the rest on 49d240b, deployed at 22:31; no check changed between the two.
- Every probe finding below was checked by hand in local headless Chrome: a screenshot before and after focus, and the same page script the adapter runs.

"Static" is the CLI result. "Dev" lists the issues in the dev report.

| Site | Static | Dev | Verdict |
| --- | --- | --- | --- |
| gov.uk | none | none | Same |
| w3.org/WAI | none | Static fetch refused (HTTP 403); rendered checks only, none | The site refuses Worker egress but not the CLI. Not a regression |
| Wikipedia | none | Sideways scrolling at 320 px, 5 samples | FP, fixed. The samples are `mwe-popups`, the link preview that the tab walk's last focused link opened. The page itself does not scroll at 320 px |
| otto.de | image-alt 10 of 10, link-name 1 | Focus that cannot be seen 22, contrast 13, image-alt, reflow, link-name 3, text spacing 1 | Focus: FP, fixed (below). Contrast: the known shadow DOM background FP from round 3 |
| ikea.com | none | Text spacing 9, invalid lists 2 | Lists TP (round 3). Text spacing asks a person to check each sample |
| emag.ro | none | Static only: the site blocked Browser Run | Same static result. The site, not a regression |
| rohlik.cz | none | Text spacing 8, contrast 4, invalid list 1 | Contrast and list TP (round 3) |
| bbc.co.uk | none | Links told apart by colour alone 1 | TP (round 3) |
| berkshirehathaway.com | html-lang | html-lang, definition list 1 | Same |
| info.cern.ch | html-lang | html-lang, and one rendered issue | Same |
| craigslist.org | html-lang, form-labels 1 | Focus that cannot be seen 2, form-labels, html-lang, contrast 1, text spacing 1 | Focus: FP, fixed. The frame-title FP from round 1 stays fixed |
| arngren.net | html-lang, form-labels 3, link-name 188 of 611 | The same three, plus contrast 101, reflow, invalid list 1 | Same static result |
| spacejam.com/1996 | html-lang | html-lang | Same |
| idnes.cz | image-alt 20 of 103, link-name 3, frame-title 1 | image-alt, link-name 9, frame-title 7, contrast 6, reflow, text spacing 1 | Same static result. After the fix, local Chrome finds 30 article links with no visible focus: TP, checked by screenshot. The dev rescan with e1ce0a7 did not report them, so Browser Run's walk did not reach those links |
| seznam.cz | link-name 50 of 439, button-name 53 of 113 | The same two, plus contrast 145, frame-title 52 and four structure issues | Same after the gzip fix (below) |
| zara.com | refused (Akamai) | Rendered only: Tab key never reaches 6 | Same static result. Rendered finding not checked by hand |
| lingscars.com | button-name 2 of 3 | button-name 2 (served HTML), contrast 15, focus 4, link-name 1, text spacing 1 | Newly read: refused in round 2, the site answers some fetches and not others. The two Swiper arrows are icon-only `<button>`s with an SVG and no name in the served HTML: TP. Swiper may name them after load. The rendered findings were not checked by hand |
| alza.cz | refused (403) | Rendered only: Tab key never reaches 7, contrast 5, reflow, text spacing 3 | Same static result. Rendered findings not checked by hand |
| heureka.cz | refused (403) | Rendered only: contrast 56, text spacing 32, ARIA value 1 | Same static result. Not checked by hand |
| mediamarkt.de | none | Six rendered issues, structure and hidden focusable elements | Newly read: refused in round 2. Not checked by hand |
| hm.com | refused (403) | refused, nothing tested | Same |

Every report lists all 27 states under "Covers e-commerce services" and none as unknown. No report says "compliant" or "compliance score". The only match for "complian" is "Non-compliance" inside the verified Irish penalty fact IE-PEN-2. No scan crashed.

### Bugs found and fixed

- **The CLI read gzip bodies as noise** (fixed in 1349852). The Node transport (M3) sends requests through `node:http`, which does not decompress. seznam.cz came back as noise. The transport now decodes gzip, deflate, br and zstd by Content-Encoding.
- **Focus that cannot be seen: false positives on otto.de and craigslist.org** (fixed in e1ce0a7). The probe judged a stop from the control's own styles, at the moment of `focusin`. Both pages draw their focus ring later, from their own handlers:
  - otto.de moves a floating ring (`oc-floating-focus-v1`: absolutely positioned, `pointer-events: none`, in a shadow root) in a `setTimeout`, then animates it with a transition inside the shadow root;
  - craigslist.org adds a `bd-focused` class to the field's wrapper.

  Now a stop with no change is settled when focus leaves it. Its styles are read again, and a ring layer hugging the control (each edge within 16 px, open shadow roots included) counts as a visible change. The no-transitions style is now also added to open shadow roots. Re-walking the 17 sites that load: otto.de 34 to 0, craigslist.org 2 to 0, and no other site changes from this part. The dev rescans of otto.de and craigslist.org with e1ce0a7 no longer report the issue.

- **Focus that cannot be seen: false negative on `outline: none`** (fixed in e1ce0a7). Chrome's default focus style sets `outline-offset`, so a page that wrote `outline: none` still showed a change and passed. Outline width, colour and offset now count only while an outline is drawn. In local Chrome this finds 30 article links on idnes.cz and 2 buttons on seznam.cz. The idnes case was confirmed by screenshot: the link is focused and the page does not change.
- **Reflow: a popup opened by the tab walk** (fixed in 14fe334). Wikipedia's link preview stays open after `blur()` and Escape, until the pointer or focus reaches another link. At 320 px it made the page 890 px wide. e1ce0a7 blurred first and the dev rescan still reported it. Reflow is now measured before the tab walk, and the 1280 px viewport is restored after it. The dev rescan with 14fe334 reports no issues on Wikipedia.
- **"The model noted nothing in the 0 items it was asked about"** on emag.ro, where the browser was blocked. The judged section is now left out when nothing was asked (14fe334).

### Left open by this run, settled in round 5

- Reflow showed its sample count (at most 5) as the number of failing elements.
- The rendered findings on lingscars.com, zara.com, alza.cz, heureka.cz and mediamarkt.de were not checked by hand.

## Round 5: rendered findings on the newly read sites

Run on 2026-11-03 by builder-core. The rendered findings on lingscars.com, zara.com, alza.cz, heureka.cz and mediamarkt.de were checked by hand, as in round 3:

- axe-core 4.14.0 and the probe script ran in local headless Chrome;
- each probe finding got a screenshot before and after focus.

Browser Run reached the real page on all five sites, not a bot wall.

| Site | Finding | Verdict | Cause or evidence |
| --- | --- | --- | --- |
| zara.com | Controls the Tab key never reaches, 6 | FP, fixed | The walk cycled inside OneTrust's consent banner (its policy link and three buttons), so the page behind it could not be reached until the banner is dismissed. Keyboard reach is now not judged when modal stops make up at least half of the stops reached. A fixed header alone leaves the check on. The dev rescan with 0c7af11 reports no issues |
| lingscars.com | Buttons have a name, 2 (served HTML) | FP, fixed | Swiper names both arrows (`aria-label="Next slide"`) after load, and axe passes `button-name` on the rendered page. A failure seen only in the served HTML is now left out when axe passed a rule of the same concern and did not leave it incomplete. The dev rescan with 0c7af11 no longer shows it |
| lingscars.com | Contrast, 15 | TP | White on `#01b6e5` at 2.37:1 (badges, toggles), white on `#018eb2` at 3.8:1 for 18px text |
| lingscars.com | Focus that cannot be seen, 4 | TP | "I want a car" has `:focus-visible` and looks exactly the same before and after focus |
| alza.cz | Focused controls hidden behind a fixed layer, 26 | TP by the criterion's text | The cookie banner (`js-cookies-info`) entirely hides the focused links until it is dismissed. It is author content the user did not open |
| alza.cz | Controls the Tab key never reaches, 7 | Plausible TP | "Sleva" badge buttons with `tabindex="-1"`. A person checks whether they do anything that the keyboard cannot reach elsewhere |
| alza.cz | Contrast, 5 | TP | White on `#0094e7` at 3.28:1, white on `#ff7900` at 2.62:1, 14px |
| heureka.cz | Contrast, 56 | TP, 53 of 54 checked | Blue `#0084e0` on white at 3.9:1 for 13px ratings, white on `#0084e0` at 3.9:1. One sample, `#141414` on `#333333`, sits on a dark image and was not settled |
| mediamarkt.de | List items outside a list 27, ARIA parent 12, ARIA children 2 | TP | `<ul role="menu">` with plain `<li>` children: the menu role breaks the list, and the `li` breaks the menu |
| mediamarkt.de | Hidden elements that can still take focus, 17 | TP | Carousel clones with `aria-hidden="true"` keep focusable links |

### Probe counts

Reflow counted only the 5 samples its page script kept, so reports said "5 elements failing" whatever the real number (fixed in 81ec6a0). The page script now returns the number of offenders that are not exempt, and the finding counts that. Text spacing already had its own count. The focus, keyboard and axe counts use the full lists. The dev rescan of otto.de with b361b59 reports 621 elements past the right edge at 320 px: the promotion carousel's slides and everything inside them. That is the real number, and every element wider than the screen counts, nested ones included.

Reflow is now page-level (79493a1). It fails only when the document itself is wider than the viewport at 320 CSS pixels, and counts as one instance. Its samples are the widest elements that end within the page's scroll width and have no ancestor, across shadow roots, that clips or scrolls on x.

| Site | Page at 320 px | Before | After, dev rescan |
| --- | --- | --- | --- |
| alza.cz | 1460 px wide | 547 elements, carousel items | 1 instance, the `brandingEars` side banners |
| otto.de | 326 px wide | 621 elements, carousel slides at 2496 px | 1 instance, the trust seal ending at 324 px |
| idnes.cz | 1015 px wide | 765 elements, the article list | 1 instance, the header menu (`#iph`) |
| Wikipedia | 320 px, no scroll | pass | pass |

### Contrast inside web components

Decision: color-contrast results on content inside a shadow root, or slotted into one, are left out (b361b59).

axe-core reads the background of such content from the light DOM. On otto.de, white text on a red card was reported as white on the grey page (1.13:1).

How it works: after axe runs, the page script resolves each contrast node's target, shadow paths included. It marks the node when the node is in a shadow root, or when the node or an ancestor is assigned to a slot or is a child of an open shadow host. Core then drops the marked nodes.

What it costs:

- On otto.de all 10 contrast nodes go. That is the two known false positives, and also eight red prices on beige at 4.23:1 that may be real. Contrast inside components is left to a person.
- seznam.cz, heureka.cz, rohlik.cz, emag.ro and lingscars.com have no such nodes, so nothing changes there.
- The dev rescan of otto.de with b361b59 shows no contrast issue and no focus issue.

## Round 6: cross-page checks on the 21 QA sites (2026-11-04)

Asked by the lead after verifier finding N1: 3.2.3, 3.2.4 and 3.2.6 count only when this run shows them precise, every fail checked by hand; otherwise they are dropped.

**Method.** `eaa-check scan <site> --json` from the CLI, which now crawls like the Workflow (`scanUrl`: page entered, then up to 4 picked pages), over the 21 sites of the regression run. Each "differences found" was checked against the served HTML.

**Coverage.** 16 sites gave a report. alza.cz, heureka.cz, hm.com, mediamarkt.de and zara.com refused the page entered, and arngren.net did not answer, so no comparison ran there. gov.uk, en.wikipedia.org, rohlik.cz and otto.de compared with no difference. The rest crawled no other page or shared fewer than 3 navigation links ("too little shared to compare").

| Site | Check | Result | Hand check | Cause |
| --- | --- | --- | --- | --- |
| bbc.co.uk | 3.2.3 navigation | 2 of 2 pages differ | false positive | The skip link `href="#main-heading"` resolves to the page's own address, so on the home page it shares `/` with the logo and Home links and moves the first occurrence of `/` |
| bbc.co.uk | 3.2.4 identification | 2 of 16 links differ | false positive | Same cause: `/` is "skip to content", "more menu", "close menu" on the home page (all `#` links) and "homepage", "home" on the others |
| bbc.co.uk | 3.2.6 help | 1 of 2 differ | false positive | The Accessibility Help link sits among page-local links that differ per page; the shared global navigation before it is the same |
| ikea.com | 3.2.3 navigation | 1 of 1 differs | false positive | The logo link is present on one page only and points to an address the other page reaches later; the shared navigation (Stories, Jobs, Newsroom, ...) is in the same order |
| w3.org/WAI | 3.2.3 navigation | 2 of 2 differ | false positive | The "WAI homepage" link is left out on the WAI home page itself (a self-link) and its address appears elsewhere there; "Skip to Content" (`#main`) is again a same-page link |

**Result.** 5 of 5 differences are false positives, 0 true positives. Precision 0 %, and no site shows a check catching a real failure.

**Decision: dropped.** The three checks, their "compared, not yet counted" lines and the `Report.site.findings` field are removed. 3.2.3, 3.2.4 and 3.2.6 are "Needs a person", with a note on what a person compares. The site section keeps the pages read, their own static issues, and the search and site-map links seen.

**What a return needs.** Leave out same-page links (fragment links and links to the page's own address) and compare only addresses that occur once in each page's navigation: the two causes behind all 5 false positives. Then a fixture set with known real inconsistencies, since none of the 21 sites has one, and a fresh run on other sites with every fail checked by hand. Until then the crawl's navigation and help links have no reader in core.

## Round 8: cross-page checks return (2026-11-05)

Task `ga-probes`. Round 6 named what a return needs; this run is that. Rules in `docs/consistency-and-interaction.md`.

**Method.** `good-a11y-scan scan <site> --json` from the CLI (the same `scanUrl` crawl the Workflow runs, so the same evidence), over the 31 sites of round 7 and 30 new EU sites: shops (mall.cz, czc.cz, datart.cz, kosik.cz, tchibo.de, zalando.de, coolblue.nl, ah.nl, allegro.pl, empik.com, tescoma.cz, lidl.cz, dm.de, sportisimo.cz, pilulka.cz, ikea.com/cz/cs), banks and telecoms (csob.cz, mbank.cz, o2.cz, vodafone.de), travel (bahn.de, ryanair.com, lufthansa.com, kiwi.com) and public sites (ceskatelevize.cz, gov.pl, nhs.uk, european-union.europa.eu, mvcr.cz, praha.eu). The cross-page checks read static HTML only, so a dev scan adds nothing but Browser Run time; the CLI fetch differs from Worker egress only in which sites refuse it. Every fail was checked by hand.

**Coverage.** 48 sites gave a report, 10 refused the fetch and 3 did not answer. 3.2.3 and 3.2.4 compared 37 page pairs on 23 sites (716 shared navigation addresses for 3.2.4), 3.2.6 compared 25 help links on 13 sites. The rest crawled no other page or shared fewer than 3 navigation addresses.

| Site | Check | First run | Hand check | Fix |
| --- | --- | --- | --- | --- |
| vodafone.de | 3.2.3 | the sign-in page's menu in another order | false positive: the sign-in link redirects to `/cprx/captcha`, a bot wall with its own template | a page redirected to another path is not compared |
| vodafone.de | 3.2.4 | "Infos & Services" against "Infos & Sevices" on the accessibility statement | false positive: a typo, the same name to a reader | names agree when most words match, one edit allowed |
| vodafone.de | 3.2.4 | "Informationen für CallYa-Kund:innen" against "Informationen für CallYa Kunden" on the captcha page | false positive: a gender-inclusive spelling of the same name | same |

**Result after the fixes.** 0 fails on 61 sites, so 0 false positives. The round 6 cases now pass or are not compared: ikea.com and w3.org/WAI pass, bbc.co.uk shares too little once its self-links are gone. No site showed a real inconsistency, so the fail path rests on the fixtures in `packages/core/test/site-checks.test.ts` (a reordered menu, "Cart" against "Basket", "Search" against "Find", a help link moved from before the menu to after it), which fail as they should.

**Decision: shipped.** 3.2.3 and 3.2.4 count in the verdict; 3.2.6 stays with the WCAG 2.2 issues. Recall is unmeasured: the checks see only static HTML, navigation inside `nav` or `header`, and pairs that share 3 addresses.

## Round 7: the verdict on 31 sites (2026-11-04)

Asked by the lead: the verdict ("This page does not meet WCAG 2.1 Level AA") raises the cost of every false positive, so each WCAG 2.1 Level A or AA failure behind a "does not meet" verdict is checked by hand, and a false positive that flips a verdict is fixed or taken out of the verdict.

**Method.** Dev scans through the page form (static, rendered, crawl and judged steps), 2 at a time to share the Browser Run sessions with builder-cloud's form run. The 21 QA sites plus 10 new EU sites: shops (notino.cz, decathlon.fr, bol.com, fnac.com), public (gov.ie, service-public.fr, bund.de) and small businesses (mamacoffee.cz, cafeimperial.cz, cafeslavia.cz). Reports were read from the `getScan` reply and summarised with `issueGroupsOf`. Each failure class was checked against the served HTML (curl), the live page in local Chrome (computed styles, a focus screenshot before and after, the text-spacing styles injected), or an earlier round's check of the same site.

**Result after the fix below.** 20 sites do not meet WCAG 2.1 Level AA, 8 show no failure (gov.uk, w3.org/WAI, en.wikipedia.org, emag.ro and gov.ie with the served HTML only, zara.com with the rendered page only, service-public.fr, bund.de), 3 blocked both the fetch and the browser and have no verdict (hm.com, bol.com, fnac.com).

| Site | Verdict | Failures behind it (WCAG 2.1) | Hand check |
| --- | --- | --- | --- |
| info.cern.ch | 1 criterion | 3.1.1 html-lang | TP: `<html>` with no `lang` |
| spacejam.com/1996 | 1 | 3.1.1 html-lang | TP: bare `<html>` |
| berkshirehathaway.com | 2 | 3.1.1 html-lang; 1.3.1 definition-list | TP: bare `<html>`; `<dl>` holding `<p>` |
| craigslist.org | 2 | 3.1.1 html-lang; 1.4.3 contrast 1 | TP: bare `<html>`; contrast by axe |
| bbc.co.uk | 1 | 1.4.1 link-in-text-block 1 | TP: the "cookies" link in the banner text differs by colour only |
| ikea.com | 1 | 1.3.1 list 2 | TP: `<ul>` carousel with non-`li` children (round 3). Text spacing 9 was an FP, dropped |
| rohlik.cz | 2 | 1.4.3 contrast 7; 1.3.1 list 1 | TP (round 3) |
| mamacoffee.cz | 1 | 1.4.3 contrast 9 | TP: "Skladem" in `#009901` on white, 3.8:1 at small size |
| heureka.cz | 2 | 1.4.3 contrast 54; 4.1.2 aria-valid-attr-value 1 | Contrast TP (round 5); `aria-controls` naming a panel axe could not find |
| decathlon.fr | 2 | 2.4.7 focus-visible 2; 1.3.1 listitem 1 | `li` outside a list TP. Focus: the two consent buttons; local Chrome is served another page, not reproduced |
| alza.cz | 3 | 2.1.1 keyboard-reach 7; 1.4.3 contrast 5; 1.4.10 reflow | Contrast TP (round 5). Keyboard: "Sleva" badge buttons with `tabindex="-1"`, plausible TP. Reflow: a side banner widens the page at 320 px, TP by the probe's rule |
| mediamarkt.de | 3 | 1.3.1 listitem, ARIA parent/children; 2.4.4 + 4.1.2 link-name 6 | TP (round 5: `role=menu` breaks the list) |
| notino.cz | 3 | 2.4.4 + 4.1.2 link-name 36; 4.1.2 aria-command-name, nested-interactive, button-name; 1.4.3 contrast 2 | TP by axe on the rendered page |
| otto.de | 4 | 1.1.1 image-alt 6; 2.4.4 + 4.1.2 link-name 3; 1.4.10 reflow | image-alt and link-name TP (served and rendered agree); reflow TP by the probe's rule |
| lingscars.com | 4 | 1.4.3 contrast 16; 2.4.7 focus-visible 4; 2.4.4 + 4.1.2 link-name 1 | TP (round 5: 2.37:1 badges; tabs look the same on focus) |
| arngren.net | 5 | link-name 188 of 611, contrast 101, form-labels 3, list 1, html-lang | TP: image links with no alt, unlabelled fields, bare `<html>` |
| idnes.cz | 5 | image-alt 20 of 103, link-name 10, contrast 7, frame-title 6, reflow | TP (rounds 3 and 5) |
| seznam.cz | 5 | contrast 159, button-name 53 of 112, frame-title 51, link-name 51, list/listitem, image-alt 5, nested-interactive 4 | TP by axe and the static checks agreeing |
| cafeimperial.cz | 6 | focus-visible 39; link-name 25; form-labels 8 of 13; contrast 7; button-name 2; frame-title 1 of 2; 1.4.4 meta-viewport-zoom | TP: icon-only social links, Owl arrows `role=presentation` with no name, a Maps iframe with no title, `maximum-scale=1`; focus outline `none` with no shadow on the Instagram link |
| cafeslavia.cz | 5 | focus-visible 26; link-name 11 of 24; frame-title 1; html-lang; contrast 1 | TP: `lang="cs_CZ"` is not a valid tag; the logo link's only content is an `alt=""` image; "Snídaně" looks the same in a focus screenshot before and after |

**False positive found and fixed: text spacing (1.4.12).** It fired on at least 12 of the 20 failing sites. ikea.com: the flagged element is a 606 by 604 video container that overflows by 6 px after the spacing; its only text is a 1 by 1 visually hidden label, so no text is lost. rohlik.cz: product names with `line-clamp: 2` gain a third line and are cut by design, with the full name on the product page. craigslist.org: a one-line header row overflows by 6 px. No round has confirmed a true positive, so the probe cannot decide 1.4.12 reliably and is dropped (40dcdc5 in core, 5e85670 on the page side). 1.4.12 goes back to a person. It drove no verdict alone: every site it fired on has another failure checked above, so no verdict flips. Without it ikea.com goes from 2 failing criteria to 1, and the other sites lose 1.4.12 from their count.

**Not reproduced locally, kept.** decathlon.fr focus-visible on the consent buttons and alza.cz keyboard reach: local Chrome is served a different page. Neither carries a verdict alone. A person checks them from the samples.

**Verdicts flipped by a false positive: none.**
