# SC coverage plan (verifier, round 3)

Date: 2026-11-03, about 21:40 CET. One row per verified WCAG 2.1 Level A and AA criterion (`STD-SC-*`, 50 rows), then the six WCAG 2.2 additions (`STD-SC22-*`). SC names and levels are the verified fact values. "Today" reads `packages/core/src/catalogue.ts` (static checks) and the axe rules that `packages/core/src/rendered.ts` keeps: axe-core 4.14.0, `runOnly` tags `wcag2a wcag2aa wcag21a wcag21aa` (`rendered-audit.ts:8`), and a rule counts only when a verified `STD-SC-*` fact exists for its SC tag.

Ground rules used:

- axe rules that are `experimental` (`css-orientation-lock`, `p-as-heading`) or `deprecated` (`audio-caption`) carry the tags but do not run with a tag-only `runOnly`. They are listed in brackets and do not count as coverage.
- Nothing may submit a form, log in, buy, or type into a third-party site. Every SC that needs that (3.3.x error handling, most of 3.2.2) is `manual`.
- `manual` is also used where a method exists but would be noisy. Rejected methods are named in the row so nobody re-proposes them blind.
- The tab walk (one rendered probe: press Tab up to 300 times from the top of the page, record each focused element, its box and a crop screenshot before and after focus) feeds 2.1.1, 2.1.2, 2.4.7, 3.2.1 and 2.4.11. Build it once.
- Priority: 1 = add tonight, 2 = next, 3 = later, 4 = only after the judged layer exists. `-` = nothing to add.

## WCAG 2.1 Level A and AA (50)

| SC (fact) | Today | Best method to add | Exact signal | Fails when | FP risk | Prio |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1.1 Non-text Content (STD-SC-1.1.1) | static `image-alt`; axe `image-alt`, `input-image-alt`, `object-alt`, `role-img-alt`, `svg-img-alt`, `aria-meter-name`, `aria-progressbar-name` | static | `alt` of each `<img>`/`input[type=image]` compared with the `src` file name and a fixed placeholder list (`image`, `img`, `photo`, `picture`, `graphic`, `logo` alone is allowed) | alt equals the file name or its stem (`IMG_1234.jpg`, `hero-banner`), ends in an image extension, or is a placeholder word | low | 1 |
| 1.2.1 Audio-only and Video-only (STD-SC-1.2.1) | [axe `audio-caption`, deprecated] | manual | - | needs a person to compare media with its alternative | - | - |
| 1.2.2 Captions (Prerecorded) (STD-SC-1.2.2) | axe `video-caption` (reports `incomplete` for most videos) | manual | rejected: `<track kind=captions>` presence, since embedded players (YouTube, Vimeo) carry captions outside the DOM | - | - | - |
| 1.2.3 Audio Description or Media Alternative (STD-SC-1.2.3) | none | manual | - | - | - | - |
| 1.2.4 Captions (Live) (STD-SC-1.2.4) | none | manual | - | - | - | - |
| 1.2.5 Audio Description (STD-SC-1.2.5) | none | manual | - | - | - | - |
| 1.3.1 Info and Relationships (STD-SC-1.3.1) | static `form-labels`; axe `aria-hidden-body`, `aria-required-children`, `aria-required-parent`, `definition-list`, `dlitem`, `list`, `listitem`, `table-fake-caption`, `td-has-header`, `td-headers-attr`, `th-has-data-cells` [`p-as-heading`, experimental] | manual | rejected: heading-level skips (not a 1.3.1 failure by the SC text) | - | - | - |
| 1.3.2 Meaningful Sequence (STD-SC-1.3.2) | none | manual | rejected: DOM order vs visual order diff, noisy with grid/flex reordering that keeps meaning | - | - | - |
| 1.3.3 Sensory Characteristics (STD-SC-1.3.3) | none | manual | rejected: phrase lists ("on the right", "round button"), noisy | - | - | - |
| 1.3.4 Orientation (STD-SC-1.3.4) | [axe `css-orientation-lock`, experimental] | rendered | load at 390x844 and 844x390; read computed `transform` on `html`/`body` and whether `main` (or `body` children) is `display:none` in one orientation only | content rotated 90 degrees or hidden in one orientation only | med | 3 |
| 1.3.5 Identify Input Purpose (STD-SC-1.3.5) | static `autocomplete-valid`; axe `autocomplete-valid` | static | `input` with `type=email` or `type=tel`, or `name`/`id` matching `email`, `phone`, `given-name`, `family-name`, `postal-code`, without `autocomplete` | such a field has no `autocomplete` token | med (fields about another person are exempt) | 3 |
| 1.4.1 Use of Color (STD-SC-1.4.1) | axe `link-in-text-block` | manual | - | - | - | - |
| 1.4.2 Audio Control (STD-SC-1.4.2) | axe `no-autoplay-audio` | manual | - | - | - | - |
| 1.4.3 Contrast (Minimum) (STD-SC-1.4.3) | axe `color-contrast` | manual (text on images; axe `incomplete`) | - | - | - | - |
| 1.4.4 Resize Text (STD-SC-1.4.4) | static `meta-viewport-zoom`; axe `meta-viewport` | rendered | page zoom 200% (viewport width halved, `deviceScaleFactor` 2); for each element with text and `overflow` hidden/clip, `scrollWidth > clientWidth + 1` or `scrollHeight > clientHeight + 1` that was not true at 100% | text newly clipped at 200% | med | 3 |
| 1.4.5 Images of Text (STD-SC-1.4.5) | none | judged | per `<img>` crop: "Does this image show text that is not a logo or brand name?" (yes/no) | yes, and the alt holds that text | med | 4 |
| 1.4.10 Reflow (STD-SC-1.4.10) | none | rendered | viewport 320x256 CSS px; `document.scrollingElement.scrollWidth`; walk elements whose right edge exceeds 320 | page scrolls horizontally (`scrollWidth > 321`) and the widest offender is not `table`, `pre`, `canvas`, `video`, `iframe` of a map, or inside one | low-med | 1 |
| 1.4.11 Non-text Contrast (STD-SC-1.4.11) | none | manual | rejected: input-border vs background contrast, noisy (shadows, gradients, adjacent-colour exception) | - | - | - |
| 1.4.12 Text Spacing (STD-SC-1.4.12) | axe `avoid-inline-spacing` | rendered | inject the SC's values (`line-height:1.5`, paragraph spacing `2em`, `letter-spacing:0.12em`, `word-spacing:0.16em`) with `!important`; same clipping test as 1.4.4 | text clipped or overlapping after injection that was not before | med | 2 |
| 1.4.13 Content on Hover or Focus (STD-SC-1.4.13) | none | manual | rejected: hover probing, noisy and slow | - | - | - |
| 2.1.1 Keyboard (STD-SC-2.1.1) | axe `frame-focusable-content`, `scrollable-region-focusable`, `server-side-image-map` | rendered | tab walk; set of visible native controls (`a[href]`, `button`, `input`, `select`, `textarea`, `summary`, `[tabindex="0"]`) minus those reached | a visible, enabled native control is never reached (typically `tabindex="-1"` on a link or button) | low | 1 |
| 2.1.2 No Keyboard Trap (STD-SC-2.1.2) | none | rendered | tab walk, then Shift+Tab walk | focus cycles among 3 or fewer elements for 50 presses while more focusable elements exist outside them, in both directions | low | 1 |
| 2.1.4 Character Key Shortcuts (STD-SC-2.1.4) | none | manual | - | - | - | - |
| 2.2.1 Timing Adjustable (STD-SC-2.2.1) | static `meta-refresh`; axe `meta-refresh` | manual (rest) | - | - | - | - |
| 2.2.2 Pause, Stop, Hide (STD-SC-2.2.2) | axe `blink`, `marquee` | manual | rejected: running CSS animations or carousels without a pause button, noisy | - | - | - |
| 2.3.1 Three Flashes or Below Threshold (STD-SC-2.3.1) | none | manual | - | - | - | - |
| 2.4.1 Bypass Blocks (STD-SC-2.4.1) | axe `bypass` | manual (rest) | - | - | - | - |
| 2.4.2 Page Titled (STD-SC-2.4.2) | static `document-title`; axe `document-title` | static | trimmed `<title>` against a fixed list (`Home`, `Untitled`, `Document`, `Index`, `React App`, `Vite App`, `Page`, the bare host name) | title is on the list | low | 2 |
| 2.4.3 Focus Order (STD-SC-2.4.3) | none | manual | rejected: tab order vs reading order, noisy | - | - | - |
| 2.4.4 Link Purpose (In Context) (STD-SC-2.4.4) | static `link-name`; axe `link-name`, `area-alt` | judged | per link with text in a fixed generic list ("read more", "more", "here", "click here", "learn more"): text, accessible name, enclosing sentence or list item, nearest heading. Question: "Can a user tell where this link goes from this text and context?" | no | med | 3 |
| 2.4.5 Multiple Ways (STD-SC-2.4.5) | none | manual (needs the whole site) | - | - | - | - |
| 2.4.6 Headings and Labels (STD-SC-2.4.6) | none | manual | rejected: judged "heading describes topic", subjective and the SC does not require headings | - | - | - |
| 2.4.7 Focus Visible (STD-SC-2.4.7) | none | rendered | tab walk; per focused element, pixel diff of its box padded 4px between before-focus and after-focus screenshots | fewer than 1% of pixels change for that element (no visible indicator) | low-med (indicator drawn far from the element) | 1 |
| 2.5.1 Pointer Gestures (STD-SC-2.5.1) | none | manual | - | - | - | - |
| 2.5.2 Pointer Cancellation (STD-SC-2.5.2) | none | manual | - | - | - | - |
| 2.5.3 Label in Name (STD-SC-2.5.3) | axe `label-content-name-mismatch` | manual (rest) | - | - | - | - |
| 2.5.4 Motion Actuation (STD-SC-2.5.4) | none | manual | - | - | - | - |
| 3.1.1 Language of Page (STD-SC-3.1.1) | static `html-lang`; axe `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch` | static | n-gram language identification over the visible text of `main` (or `body`), at least 300 characters, compared with the primary subtag of `<html lang>` | identifier is confident (above its high threshold) and its language differs from the declared one | low | 1 |
| 3.1.2 Language of Parts (STD-SC-3.1.2) | axe `valid-lang` | manual | - | - | - | - |
| 3.2.1 On Focus (STD-SC-3.2.1) | none | rendered | tab walk; URL, open windows and focused document after each focus | focusing an element (no key other than Tab) navigates or opens a window | low | 2 |
| 3.2.2 On Input (STD-SC-3.2.2) | none | manual | rejected: changing selects on a third-party site can trigger real actions | - | - | - |
| 3.2.3 Consistent Navigation (STD-SC-3.2.3) | none | manual (needs several pages) | - | - | - | - |
| 3.2.4 Consistent Identification (STD-SC-3.2.4) | none | manual (needs several pages) | - | - | - | - |
| 3.3.1 Error Identification (STD-SC-3.3.1) | none | manual (needs form submission) | - | - | - | - |
| 3.3.2 Labels or Instructions (STD-SC-3.3.2) | axe `form-field-multiple-labels` | manual (rest) | - | - | - | - |
| 3.3.3 Error Suggestion (STD-SC-3.3.3) | none | manual (needs form submission) | - | - | - | - |
| 3.3.4 Error Prevention (Legal, Financial, Data) (STD-SC-3.3.4) | none | manual (needs transactions) | - | - | - | - |
| 4.1.1 Parsing (STD-SC-4.1.1) | none | manual (do not add) | obsolete and removed in WCAG 2.2 (STD-SC22-4.1.1), void in EN 301 549 V4.1.1 (STD-EN-8). A parser check would report noise | - | - | - |
| 4.1.2 Name, Role, Value (STD-SC-4.1.2) | static `form-labels`, `link-name`, `button-name`, `frame-title`; axe `aria-*` name and attribute rules, `button-name`, `input-button-name`, `label`, `select-name`, `summary-name`, `frame-title`, `frame-title-unique`, `nested-interactive`, `duplicate-id-aria`, `area-alt`, `link-name`, `input-image-alt` | manual (rest) | - | - | - | - |
| 4.1.3 Status Messages (STD-SC-4.1.3) | none | manual | - | - | - | - |

## WCAG 2.2 additions (6), shown as upcoming

These belong to EN 301 549 V4.1.1 (STD-EN-7), which is not cited in the Official Journal (EU-HS-1). Any finding must carry the "upcoming" label and never count toward the WCAG 2.1 coverage line.

| SC (fact) | Today | Best method to add | Exact signal | Fails when | FP risk | Prio |
| --- | --- | --- | --- | --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) (STD-SC22-2.4.11) | none | rendered | tab walk; for the focused element, `document.elementsFromPoint` at its centre and four inset corners | at every sample point the top element is a `position: fixed/sticky` element that is not the focused element or its ancestor or descendant | low-med | 2 |
| 2.5.7 Dragging Movements (STD-SC22-2.5.7) | none | manual | - | - | - | - |
| 2.5.8 Target Size (Minimum) (STD-SC22-2.5.8) | none (axe `target-size` exists but is tagged `wcag22aa`, outside `AXE_TAGS`) | rendered | axe 4.14 `target-size` run alone, with findings mapped to STD-SC22-2.5.8 only | axe reports a violation (target under 24x24 CSS px without the spacing exception) | med (inline-link exception) | 2 |
| 3.2.6 Consistent Help (STD-SC22-3.2.6) | none | manual (needs several pages) | - | - | - | - |
| 3.3.7 Redundant Entry (STD-SC22-3.3.7) | none | manual (needs a multi-step process) | - | - | - | - |
| 3.3.8 Accessible Authentication (Minimum) (STD-SC22-3.3.8) | none | manual | rejected: detecting paste blocking on password fields needs typing into a third-party login | - | - | - |

## Summary

Best method per row (56 rows):

| Method | WCAG 2.1 (50) | WCAG 2.2 (6) | Total |
| --- | --- | --- | --- |
| static | 4 (1.1.1, 1.3.5, 2.4.2, 3.1.1) | 0 | 4 |
| rendered | 8 (1.3.4, 1.4.4, 1.4.10, 1.4.12, 2.1.1, 2.1.2, 2.4.7, 3.2.1) | 2 (2.4.11, 2.5.8) | 10 |
| judged | 2 (1.4.5, 2.4.4) | 0 | 2 |
| manual | 36 | 4 | 40 |

Today, 20 of the 50 WCAG 2.1 criteria have at least one running check (static or axe): 1.1.1, 1.2.2, 1.3.1, 1.3.5, 1.4.1, 1.4.2, 1.4.3, 1.4.4, 1.4.12, 2.1.1, 2.2.1, 2.2.2, 2.4.1, 2.4.2, 2.4.4, 2.5.3, 3.1.1, 3.1.2, 3.3.2, 4.1.2. Most are covered only partly.

Top 8 additions by value and accuracy:

1. 1.4.10 Reflow: rendered, 320 CSS px horizontal scroll. One measurement, common failure, low-med FP.
2. 2.4.7 Focus Visible: rendered, before/after focus pixel diff on the tab walk. Common failure, invisible to axe.
3. 2.1.1 Keyboard: rendered, native controls never reached by Tab. Same walk, low FP.
4. 2.1.2 No Keyboard Trap: rendered, focus cycling on the same walk. Rare but near-certain when it fires.
5. 3.1.1 Language of Page: static language identification against `<html lang>`. Catches the copied `lang="en"` on non-English sites, low FP.
6. 1.1.1 Non-text Content: static alt equals file name or placeholder. Deterministic, low FP.
7. 1.4.12 Text Spacing: rendered, injected spacing CSS and new clipping. Med FP; keep samples visible so a person can confirm.
8. 2.5.8 Target Size (upcoming): rendered, axe `target-size` run alone and labelled upcoming. Cheap, axe owns the exception logic.

Next after these: 2.4.2 generic titles (static, low FP), 3.2.1 focus-triggered navigation and 2.4.11 obscured focus (both ride the tab walk).
