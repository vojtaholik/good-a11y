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
| craigslist.org | frame-title | `<iframe id="cl-local-storage">` | FP, fixed | The iframe has `style="display:none;"`, so it is not exposed to assistive technology. The reader now treats inline `display: none` and `visibility: hidden` as hidden |
| otto.de | image-alt | 10 `<img>` in navigation chips and tiles | TP | Light-DOM `<img>` slotted into Otto's web components, with no alt |
| otto.de | link-name | `<a href="/wishlist-view/">` | TP in the served HTML | All content is `aria-hidden`. The wrapping `oc-interactive-overlay-v1` carries `oc-aria-label="Merkzettel"`, which its script may copy onto the link after load. The rendered check would settle it |
| otto.de | link-name | `<a id="to-login-link" href="">` | Uncertain | The link wraps `oc-media-object-card-v1 oc-aria-label="…"`, whose shadow DOM may hold the name. Shadow content counts toward a link's name, and static HTML cannot see it |

The two web-component cases show a limit of static checks: a name may be supplied by a custom element's shadow DOM or script. They stay reported. The rendered audit sees the flat tree and is the better judge there.
