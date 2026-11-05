# Cross-page consistency and interaction probes

Task `ga-probes` (2026-11-04): turn seven manual criteria into deterministic checks, each kept only when it shows no false positive on the accuracy-qa sites and its fixture pages pass and fail as they should. A check that cannot get there is left out and written up here, like 2.5.3.

## Layer 1: cross-page checks (3.2.3, 3.2.4, 3.2.6)

Round 6 (`docs/accuracy-qa.md`) dropped the first version: 5 differences on 21 sites, all false. Every one came from two causes, and this version removes both before it compares anything.

- **Same-page links are not navigation.** A link whose raw `href` starts with `#`, or that resolves (fragment dropped) to the page's own address, is left out of every list. Skip links, "back to top", menu toggles written as `href="#"` and the page's own entry in its menu go. Links that are not `http(s)`, and links with `hreflang` or `lang` (language switchers), go too.
- **Only addresses that occur once count.** An address that occurs twice on a page (a logo and a Home link, a desktop and a mobile menu, a link repeated in a mega-menu) has no single place, so it is left out of that page's comparison.

- **Only pages that landed where they were linked.** A crawled page whose fetch was redirected to another path (host and path compared, a trailing slash ignored) is not compared. vodafone.de sends the sign-in link to `/cprx/captcha`, a bot wall with its own template.
- **Names agree when a reader would see the same name.** Two names of one address agree when one contains the other, or when more than half the words of the longer name have a match in the other: the same first four letters, or one edit apart for words longer than four letters. "Infos & Services" and "Infos & Sevices" agree, and so do "Informationen für CallYa-Kund:innen" and "Informationen für CallYa Kunden" (both on vodafone.de); "Search" and "Find", "Cart" and "Basket", "Mobile phones" and "Mobile accessories" do not. WCAG's Understanding text: consistent does not mean identical.

Each page read by the crawl is compared with the page entered, pair by pair. The evidence is the static HTML the crawl already reads (`PageSummary`); nothing new is fetched.

| Check | Criterion | Compared | Fails when | Not judged when |
| --- | --- | --- | --- | --- |
| `consistent-navigation` | 3.2.3 (STD-SC-3.2.3) | links inside `nav` and `header` landmarks, in document order, kept as above | the addresses both pages share come in a different order | the pair shares fewer than 3 addresses |
| `consistent-identification` | 3.2.4 (STD-SC-3.2.4) | the same navigation links: address and text | an address both pages share has names that do not agree (above), after lower-casing, collapsing spaces and dropping digits (cart counts) | the pair shares fewer than 3 addresses |
| `consistent-help` | 3.2.6 (STD-SC22-3.2.6), newer | help links anywhere on the page (help, FAQ, support or contact by text or last path segment, `mailto:`, `tel:`), each placed by how many shared navigation links come before it | a help address on both pages has a different number of shared navigation links before it | no help address on both pages, fewer than 3 shared navigation addresses, or the navigation itself is out of order (that is 3.2.3's finding) |

3.2.3 and 3.2.4 count in the verdict like any WCAG 2.1 AA failure. 3.2.6 is WCAG 2.2, so it has only its `wcag-newer` reference and never counts.

## Layer 2: interaction probes (2.1.4, 1.4.13, 1.3.4, 1.4.11)

`packages/browser-audit/page/interaction-probes.ts` measures, `packages/browser-audit/src/interaction.ts` drives the pointer, keys and viewport, and `packages/core/src/probes.ts` decides. They run after the tab walk, under the full request blocking the empty-submit probe uses (navigations answered with a local 204, every other request failed, offline mode, `sendBeacon` and `WebSocket.send` muted), so a key or hover that would send something sends nothing. Order: contrast, hover, keys, orientation. Each part has its own limit (contrast and orientation 8 s, hover 13 s, keys 12 s) and the whole interaction 40 s; a part that throws or times out is `null` and its probe is left out.

| Probe | SC (fact) | Measured | Fails when | Not judged when |
| --- | --- | --- | --- | --- |
| `character-keys` | 2.1.4 (STD-SC-2.1.4) | for `/ ? s f k j m 1`: focus moved off the body, and elements holding text that became shown (the topmost of each changed subtree), read 200 ms after the key, with no field focused; a 200 ms control read with no key first; a key with an effect is tried twice | the same effect (focus moved to a control, the page shown changed, or a main-frame navigation) on both trials, with a quiet control before each | every control read changed by itself (clocks, carousels) |
| `hover-content` | 1.4.13 (STD-SC-1.4.13) | up to 10 triggers in view (ARIA popup, expanded, described-by and tooltip attributes, then links and buttons in `nav` and `header`, logos skipped), at most 2 that show content, and no new trigger after 9 s. A 32 px grid of hit tests (`elementFromPoint`, through open shadow roots) before and 400 ms after the hover; points that change with the pointer away (a 300 ms quiet read) are noise for the rest of the run. The content is the deepest element holding 80% of the changed points of the largest DOM branch outside the trigger, at least 2 points, with text or an image. Then: Escape, pointer away, hover again, pointer onto the content, one more second, and focus on the trigger plus Escape | the content vanishes when the pointer moves onto it, vanishes by itself within a second, or covers text that was shown before and Escape does not close it (on hover, or on focus) | no content that closes when the pointer leaves and opens again on the next hover |
| `orientation` | 1.3.4 (STD-SC-1.3.4) | CSSOM style rules under `orientation` media queries, read at 800×1200 portrait and 800×600 landscape: whether each hides (`display:none`, `visibility:hidden`) or rotates (a 90° or 270° `transform`/`rotate`) what it matches, and the share of the page text it matches | an active rule in one orientation rotates elements holding half the text, or hides elements that hold half the text in the other orientation while the page shows less than half its text | no orientation rule matched anything |
| `non-text-contrast` | 1.4.11 (STD-SC-1.4.11) | up to 60 text fields with a solid border of one colour on all four sides, or a solid bottom border only; up to 60 icon-only links and buttons with one `svg` painted in one solid colour (fill or stroke), no `use`, `image` or `text`, at least 10 px, not a logo. The backdrop is the first ancestor with an opaque background, confirmed by a hit test 3 px outside the field, or a clear stack under the icon's centre. Shadows that are not fully transparent, gradients, background images, opacity, filters and blend modes skip the element | a field's border and its own background are both under 3:1 against the backdrop, or an icon's paint is under 3:1 | nothing judged |

Decisions and limits:

- **Escape is the dismiss mechanism we test.** 1.4.13 asks for a way to dismiss without moving the pointer or focus. The probe tries Escape only. A page that dismisses with another key fails here; none in the QA set did.
- **Borderless fields are not judged.** A field without its own border may be drawn by a wrapper, a pseudo-element or a shadow the probe does not read. Judging the field's background alone would fail those. gov.uk's search (white on blue, no border) is therefore not judged.
- **A shortcut setting is not seen.** 2.1.4 also passes when the user can turn a shortcut off or remap it. The probe cannot find such a setting, so a site that offers one only to signed-in users fails here. The sample names the key and its effect so a reviewer can check.
- **Shown text only, for keys.** A key that only changes an image or an empty element (a carousel slide, a progress bar) is not counted: ikea.com/cz/cs and mamacoffee.cz each produced one such false positive in the second QA run before the filter.
- **A consent dialog that makes the page inert hides the navigation.** Triggers under `inert` or `aria-hidden` are not hovered, so o2.cz, whose consent dialog marks the page that way, is not judged for 1.4.13.
- **No guide for 2.1.4, 1.4.11 or 3.2.x.** The guides agent mapped `hover-content` to hover-popups and `orientation` to orientation; the others report without a guide link.
- **Clipped menus need hit tests.** Per-element visibility missed otto.de's mega menu: it sits in a shadow root inside a container that clips it, so every element inside counted as shown before the hover. The grid of hit tests sees what is on top, which is what a user sees.
