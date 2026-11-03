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
