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

## Layer 2: interaction probes

Planned in `packages/browser-audit/page/interaction-probes.ts`, run after the tab walk and before reflow, under the full request blocking the empty-submit probe uses (navigations answered with a local 204, every other request failed, offline mode, `sendBeacon` and `WebSocket.send` muted). Each is written up below as it lands.
