# Judged observations (decision model on Workers AI)

Built 2026-11-03 by builder-judge. After the static and rendered checks, a scan can ask a decision model typed questions about the evidence the static reader collected. The answers become **judged observations**, the noun AGENTS.md defines: a separate list in the report, labelled as judged by a model with its version and each answer's confidence. They are never counted as issues, never change a finding, and are never presented as fact-backed. Their WCAG mapping reads "the question relates to".

## Model

- `@cf/cloudflare/clef` on Workers AI (`JUDGE_MODEL` in `packages/core/src/judge.ts`), called through the Worker's `AI` binding and routed through AI Gateway with `gateway: { id: "default" }`. The default gateway is created by Cloudflare on the first request, with standard billing, logs on, cache off.
- TypeSafe Jev (`typesafe/jev-1.14.0`) was the first choice (decision 18). A real call through this account's `/ai/run` returned HTTP 402 "Insufficient balance; add money to your gateway or use BYOK": Jev is a third-party model billed through AI Gateway credits, which is a paid service that needs sign-off. Clef speaks the same System One API (state + typed `noul` / `choice` questions, probabilities back), so Jev is a one-constant swap once credits or BYOK are approved (decision 21).
- Only text goes to the model. Images ("danger zone") are not sent.

## Flow

1. The `scan` Workflow task runs the static scan with `inspectUrl` and archives the page evidence to R2 as `<slug>/<scanId>.evidence.json`.
2. After `render`, the `judge` task runs (only for a `checked` report; a refused, unreachable or non-HTML page gets no judged section):
   - reads the evidence back from R2;
   - builds one request per judged check with `questionsFor(evidence, statement)`, where `statement` is the evidence of the accessibility statement page the crawl read (decision 28), or `null`;
   - reserves `tokensToReserve(asked)` tokens with `JudgeBudget.reserve` against `DAILY_JUDGE_TOKENS` (400,000 a day). The insert is conditional, so a reservation never passes the cap; after the call the reservation is settled to real use (below);
   - asks the model, at most 4 requests at once, through the `Judge` port (`packages/ai-judge`: 30 s hard timeout, reply decoded with `JudgeReplySchema`, any failure becomes `JudgeUnavailable`);
   - turns the answers into observations with `judgedOf` and attaches them with `withJudged`.
3. If the budget is spent, the report says "Today's budget for model-judged observations is spent." If the model fails, times out or answers outside the schema, the report says "The decision model did not answer, so nothing was judged by a model." The failure detail goes to the Worker log only; nothing the service wrote is shown to a visitor.
4. A failed `judge` task never fails the scan: the machine moves on to `storing` with the report it had.

## The questions

At most 20 distinct items per check (`MAX_JUDGED_ITEMS`), taken in document order unless the row says otherwise. One request per check, one question per item.

| Check | Relates to | Items | Question (noul unless noted) |
| --- | --- | --- | --- |
| `alt-text-describes` | 1.1.1 | images with non-empty alt, not `role="presentation"`/`none` | Is the alt text a description of what the image shows or what it is for? No for a file name, a placeholder or only a generic word. State: alt text and file name. |
| `link-purpose` | 2.4.4 | links of one or two words without `aria-label`/`aria-labelledby`/`title`, outside `nav`, `header` and `footer` landmarks (by tag or role), each text once (case-insensitive), links in `main` first, then links in no landmark, then `aside` | Is it clear from the link text together with its surrounding paragraph, list item or cell where the link goes? |
| `headings-labels-describe` | 2.4.6 | up to 8 label texts, then headings up to 20 in all | Does the heading name a topic a reader can recognise? Does the label say what to enter? |
| `page-language-matches` | 3.1.1 | the page, when it declares `lang` and has at least 200 characters of visible text | Choice over the 24 EU official languages plus "other": which language is most of the text in? |
| `sells-to-consumers` | EAA scope (EU-SCOPE-1, EU-DEF-1); no WCAG criterion | the entered page: title, first 1,200 characters of text, up to 20 prices, up to 10 links whose text or href names a cart, checkout, subscription or booking, schema.org types | Does this website let consumers buy, order, book or subscribe online, so that a consumer contract is concluded through the site? A note says either "appears to sell" or "does not appear to sell"; no note means the model was not sure. Shown beside the member-state list, never changes it |
| `statement-annex-v` | Art. 13 and Annex V point 1 (EU-STMT-3, -4, -5); no WCAG criterion | the statement page the crawl found, when its text outside `nav`, `header` and `footer` is at least 300 characters; the text is capped at 6,000 characters | Three questions, items `statement_1` to `statement_3`: does the text give (a) a general description of the service, (b) an explanation of how the service works, (c) a description of how it meets the accessibility requirements? A note per point the model judged missing |
| `visual-headings-marked` | 1.3.1 | the rendered page's `visualHeadings` candidates (builder-cloud's probe: short blocks outside heading elements set at 1.2 times body size or larger, or bold at body size alone on their line; none that contains a heading or follows one), with at least three letters once currency words are removed, each text once, up to 20 | Is the text the title of a section of the page, the way a heading names the content below it? No for a price, a card or teaser name, a slogan, a date, a number, an icon name, a button or link label, a notice or part of a sentence. State: text, size, weight, body size, the start of its HTML. Noted where P(yes) is high. Hidden, calibrating (round 3) |
| `passage-language-marked` | 3.1.2 | the rendered page's `foreignBlocks` (blocks whose common words point to another language than the `lang` in force on them), when that `lang` is an EU language, each text once, up to 20 | Choice over the EU languages: which language is most of the block written in, names not counting? Noted like `page-language-matches`. Hidden, calibrating (round 3) |

The static reader collects the extra evidence in its single tokenizer pass: link context (the innermost `p`, `li`, `td`, `th`, `dd`, `dt`, `caption`, `figcaption` or heading, capped at 300 characters), headings with level, label texts, the image file name (last path segment, no query, none for `data:`), the first 1,200 characters of visible text, each block's text (`passages`: paragraph, list item, cell or heading of at least 40 characters, with its effective `lang` and landmark, at most 400), and up to 20 distinct prices (an amount with a currency sign or code, or `,-`, also when the currency is in the next text node).

## Thresholds (fixed in code)

`NOTE_AT` in `packages/core/src/judged.ts` holds one threshold per check, chosen on the labelled set below for precision of at least 0.9 with the most recall:

| Check | Noted when | Precision | Recall |
| --- | --- | --- | --- |
| `alt-text-describes` | P(no) ≥ 0.70 | 1.00 (30/30) | 1.00 (30/30) |
| `link-purpose` | P(no) ≥ 0.90 (round 2, real items) | 0.94 (29/31) | 0.66 (29/44) |
| `headings-labels-describe` | P(no) ≥ 0.70 | 1.00 (26/26) | 0.96 (26/27) |
| `page-language-matches` | P(not declared) ≥ 0.80 and the top choice is another language | 1.00 (18/18, round 3, real items) | 1.00 (18/18) |
| `sells-to-consumers` | P(yes) ≥ 0.85 or P(no) ≥ 0.85 (round 2, real items) | 1.00 (60/60) | answers 60 of 71 sites |
| `statement-annex-v` | P(no) ≥ 0.80 per point (round 2, real items) | 1.00 (27/27) | 0.93 (27/29) |

- Each note shows the model's confidence in that answer (the probability above, rounded to a percent).
- What a note means: the model, reading only the text shown, thinks this item probably does not do what the success criterion asks. It is a pointer for a person to look at, not a failure. A check with no notes means nothing was noted, never that the criterion is met.
- The first four thresholds were set on the hand-written set (below); `link-purpose` was moved to 0.90 on real items in round 2. The last two were set on real items only.

## Shown in the report (decision 23)

Each check has a `shown` flag in `packages/core/src/judged.ts`. A check that is not shown is not asked, costs no model budget and adds nothing to the report. Its code and thresholds stay, for calibration.

| Check | Shown | Why |
| --- | --- | --- |
| `alt-text-describes` | no | On real pages it noted a correct logo alt (idnes.cz `alt="iDNES.cz"` on `idnes.svg`, 83%): 0 of 1 real notes were right (docs/accuracy-qa.md, round 4) |
| `link-purpose` | yes | 0.94 on 209 real items (round 2) |
| `headings-labels-describe` | no | 1 of 6 real notes right. It noted ordinary Czech headings and labels on seznam.cz ("Vyhledat", "Hlavní obsah", "Méně služeb") at 70 to 98% |
| `page-language-matches` | yes | 18 of 18 real notes right, no note on 71 correct real pages (round 3) |
| `sells-to-consumers` | yes | 60 of 60 real answers right (round 2) |
| `statement-annex-v` | yes | 27 of 27 real notes right (round 2) |
| `visual-headings-marked` | no | Calibrating: needs a holdout of real candidates the probe drops were not designed on (round 3) |
| `passage-language-marked` | no | Calibrating: 2 real positives in 81 real blocks so far, too few to measure precision (round 3) |

The hand-written set above did not predict the failures on real pages. A hidden check comes back only when it reaches precision 0.9 on a set of at least 30 real items, labelled by hand, taken from scanned pages.

## Round 2 calibration on real items (2026-11-04)

Run by builder-judge for decision 29.

Pages: 82 home pages fetched once with the scanner's user agent on 2026-11-04 (the QA sites that still answer, more EU shops, and public, university and NGO sites), 53 help or FAQ pages linked from them, and 24 accessibility statements linked from them. Sites that answered with a bot wall or an error were dropped.

Labels: every item was labelled by hand before any answer was seen. Ambiguous items were left out (`null`). Labels and items are in `packages/core/test/fixtures/judged-round2-items.json`.

Answers: one Clef run of 174 requests through builder-cloud's local calibrator (`apps/scanner/src/calibrator.ts`, alchemy dev only), 162,148 input tokens, recorded in `judged-round2-replies.json`.

`packages/core/test/judged-round2-calibration.test.ts` rebuilds every request from the fixture with `questionsOf`, checks it asks the same items, scores the recorded answers, and fails if a check is shown below precision 0.9.

| Check | Items | Bad | Threshold | Noted | Right | Precision | Recall |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `link-purpose` | 209 links, 14 sites | 44 | 0.90 | 31 | 29 | 0.94 | 0.66 |
| `page-language-matches` | 60 pages | 0 | 0.80 | 0 | 0 | none noted | unmeasured (measured in round 3) |
| `sells-to-consumers` | 71 sites (34 sell, 37 do not) |  | 0.85 | 60 answers | 60 | 1.00 | 60 of 71 answered |
| `statement-annex-v` | 64 points, 24 statements | 29 missing | 0.80 | 27 | 27 | 1.00 | 0.93 |

### What the numbers show

- **Link purpose.** At 0.85 precision was exactly 0.90 (37/41). The false notes were product and brand names ("Needly dāvana", "Dexcom One+" on apotheka.lv, "Premium" on idnes.cz) and craigslist's "post". At 0.90 two remain ("Needly dāvana" and "Dexcom One+") and precision is 0.94. Misses at 0.90 include "View more" (0.84), "Více informací" (0.81), "Zobrazit všechny" (0.64), "Zobrazit více" (0.63), "Zum Artikel" (0.50) and "Acquista ora" (0.48). The model is less sure about generic links that are not in English, as in round 1.
- **Navigation is left out.** Links in `nav`, `header` and `footer` are menus, so their purpose comes from the menu, and the model can only guess at them. Many sites put their menus in plain `div`s, though, so section names such as "Politics" or "Damen" are still asked. They were labelled good, and none was noted at 0.90.
- **Page language.** None of the 60 real pages declares a language that does not match its text, and the model noted none. The one page the model leaned against (european-union.europa.eu, a language picker, P(not English) 0.71) stays under the threshold. The check stays shown: on real pages it adds no false notes, and the hand-written set shows that it catches a real mismatch.
- **Sells to consumers.** At 0.80 the model said ING (a consumer bank) does not sell (P(yes) 0.20). At 0.85 every answer is right, and 11 sites get no answer: coolblue.nl, power.dk, o2.cz, spotify.com, vinted.fr, airbnb.com, ah.nl, praha.eu, seznam.cz and the ING home page. These are mostly script-built shop pages, where the static HTML shows no prices or cart. The answer is shown beside the member-state list and never changes it.
- **Statement.** The model separates statements that only cover WCAG conformance (gov.uk, ecb.europa.eu, thomann.de, vodafone.de, city and ministry statements) from the EAA-style service statements of German and Czech shops (otto.de, bonprix.de, jysk.cz, martinus.sk, sportisimo.cz), which describe the service and how ordering works. Two missing points were not noted: datart.cz 1(a) at 0.74 (its text says the description is "in the general terms and conditions") and bbc.co.uk 1(c) at 0.66 (the page is a list of links). Point 1(c) had only one missing item in the set, so its recall rests on one case.

### Retired questions

| Question | Relates to | Why it was retired |
| --- | --- | --- |
| Sensory instructions | 1.3.3 | A phrase prefilter for an instruction verb together with a colour, shape, position or sound word, in 12 EU languages, found 8 candidate sentences in 135 real pages, 53 of them help pages. A first version also matched "links" (German "left") and "use" and fired on navigation. So the 30 real items the bar needs cannot be collected from scanned pages, and per scan the question would almost never be asked. One true candidate was seen: knihydobrovsky.cz marks unavailable goods "with a red cross". |
| Passages in another language | 3.1.2 | 2,251 passages of at least 80 characters whose effective `lang` equals the page's were checked by a word-list heuristic. It found no passage in another language: the only hits were the fixture page and a Finnish passage misread by the heuristic. Real pages in the set give the question nothing to find, so it cannot reach the bar, and it would cost about 3,000 tokens a scan. |
| Product accessibility information | Annex I IV (g)(i) | The obligation is to pass on accessibility information "when this information is provided by the responsible economic operator". A scan cannot see whether the manufacturer provided any. A note that a product page has no accessibility information would read as a failure the scan cannot show, so the row stays with a person. |

The rendered questions in decision 29 (visual headings 1.3.1, form instructions 3.3.2, error messages 3.3.1 and 3.3.3, consistent identification 3.2.4) wait for evidence from the rendered session; none is in this round.

## Round 3: wrong page languages and rendered evidence (2026-11-04)

### Page language on real mismatches

Round 2 had no real page whose `lang` is wrong, so the question was shown with its precision on real pages unmeasured (review R2-L3). Round 3 found real ones: the links on the round 2 pages, and the links on those pages two levels further, gave 1,690 host names on EU country domains; each home page was fetched once, its `lang` read, and its text matched against short common-word lists. Each candidate the lists flagged was read with the product's own reader and labelled by hand before Clef was asked. Kept: 18 real pages whose `lang` is wrong (17 Czech pages declaring `en` or `en-US`, such as cuni.cz, platba.portalprazana.cz, chytravolba.gov.cz and region24.cz, and klaranademlynska.cz, which declares `cs` over English text) and 11 Czech pages that declare `cs` correctly. A page whose `lang` is not a language code (`cz`, `en_US_POSIX`) was left out: the question is not asked for it, and 3.1.1 covers it as a static check.

| Check | Items | Bad | Threshold | Noted | Right | Precision | Recall |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `page-language-matches` | 89 pages (60 round 2, 29 round 3) | 18 | 0.80 | 18 | 18 | 1.00 | 1.00 |

Every wrong page was noted with P(declared) at most 0.014. The lowest P(declared) on a correct page was 0.60 (jiri-vancura-kresby.cz). The question stays shown.

### Retired without a model question

| Question | Relates to | Why |
| --- | --- | --- |
| Labels or instructions | 3.3.2 | The rendered form evidence was read on 49 real contact, newsletter and registration pages: 242 fields. Every field with a visible label had one a person would accept. The failures were fields with no label, or only a placeholder (alza.cz chat, sportisimo.cz and pilulka.cz newsletters). That is a fact about the markup, not a judgement, so a model adds nothing and only costs tokens. A deterministic check for placeholder-only fields would be a check, not a judged question. |
| Consistent identification | 3.2.4 | It would read the same per-page link lists as the cross-page checks dropped in accuracy round 6. Every false positive there came from that evidence: skip links and self-links that share an address with Home or the logo, and page-local links next to the shared navigation. A model reading those lists inherits the same errors. 3.2.4 stays "Needs a person", and builder-cloud dropped the navigation and help lists from the page summary (1614b61). |

## Real-item calibration

`packages/core/test/fixtures/judged-real-items.json` holds items from the pages in docs/accuracy-qa.md, labelled by hand by builder-core on 2026-11-03; ambiguous items were left out. `judged-real-requests.json` is the exact request per site, built with `questionsOf`. builder-cloud sent each request once to `@cf/cloudflare/clef` without opening the labels and recorded `judged-real-replies.json` (17 replies, 19,895 input tokens). `packages/core/test/judged-real-calibration.test.ts` scores it and fails if a check is shown below precision 0.9.

| Check | Items | Bad | Noted | Right | Precision | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `alt-text-describes` | 50 | 7 | 4 | 1 | 0.25 | stays hidden |
| `headings-labels-describe` | 56 | 2 | 12 | 2 | 0.17 | stays hidden |

What it got wrong:

- Alt text: it noted correct logo alts on Wikipedia ("Wikibooks logo", "Wikimedia Commons logo") and missed `alt="logo"`, `alt="Counter"` and the keyword lists on arngren.net. It caught only `alt="icon"`.
- Headings and labels: it noted ordinary control labels ("Small", "Large", "Wide" on Wikipedia; "Zobrazit více", "Méně služeb", "Meteoradar" on seznam.cz). It caught both bad headings (`{NADPIS}`, "Načítání textu").

Both questions fail the same way: the model does not separate a short but correct name from a missing one. Both checks stay hidden; a new question wording needs a new real set before either comes back.

- `packages/core/test/judged-calibration.test.ts` fails if a check with a hand-written batch falls below 0.9 on its recorded answers. `link-purpose` left the hand-written set in round 2: deduping by text merges its hand-written items, and real items replace them.

## Calibration (2026-11-03)

Set: `packages/core/test/fixtures/judged-calibration-items.json`, 212 labelled items. Answers: `judged-calibration-replies.json`, one Clef run, 36,370 input tokens (about $0.009, inside the daily allocation; one language text was asked twice because the first answer was lost in transcription).

- Alt text: 60 (30 bad: file names such as `IMG_2041`, `DSC00123.JPG`, placeholders, generic words in five languages; 30 good: product and content descriptions, functional icon alts, logos, non-English descriptions).
- Links: 60 (30 bad: "click here", "more", "read more", "here" alone, with filler context, and in Czech, German, French and Spanish; 30 good: descriptive nav text, and short text whose sentence gives the purpose).
- Headings 36 (15 bad) and labels 24 (12 bad): "Section 1", "Untitled", "Heading goes here", "Field", "label_1", "*" against descriptive headings and labels in several languages.
- Language: 32 pages (15 bad: `lang` names another language than the text; 17 good, including region subtags and a page whose navigation mixes English and German).
- Asked the way a scan asks: 20 items per request in a fixed shuffled order, headings 12 and labels 8 per request, one language request per page (18 distinct texts; the declared `lang` is not part of the question).

What it shows:

- Clef separates clear cases well: most bad items sit at P(no) 0.85 to 0.99, most good ones under 0.3.
- The misses are real limits: `link-purpose` does not note "Read more" after lorem ipsum (P(no) 0.57), "En savoir" (0.52) or "Více informací" (0.36), and lets go of non-English short links more readily. `headings-labels-describe` misses "New section" (0.69).
- Near misses on good items: the logo alt "Sunny Bikes" (0.65 no), the heading "Sunny Bikes" (0.52), the icon alt "Facebook" (0.52), the link "More" after a product sentence (0.56). These set the 0.7 floor.
- The old single 0.8 threshold already noted 30/30 bad alts and 14/15 bad headings here, so the threshold alone does not explain the silence on otto.de (41 items) and Brno Wikipedia (61). The likely reason, not verified item by item, is that those pages' alt texts, headings and short links are mostly fine.
- The set is small and partly hand-written, so the precision is a floor check, not a rate. Recalibrate with real-shop items when the model or questions change.

## Cost per scan

Measured on the fixture page (`packages/core/test/fixtures/judged-page.html`, 4 images, 6 short links, 4 headings, 3 labels, a language sample): 4 requests, 3,114 input tokens, 0 output tokens.

- Clef lists $0.24 per million input tokens. Workers AI bills $0.011 per 1,000 neurons, so that is about 21,800 neurons per million tokens: about 68 neurons, $0.00075, for this scan.
- Workers AI includes 10,000 neurons a day, about 458,000 Clef input tokens. `DAILY_JUDGE_TOKENS = 400,000` keeps the judged step inside that allocation: roughly 100 scans a day of this size, and about 40 at the 20-item cap on every check. Past the cap the step is skipped, never billed.
- The reservation is computed before the call from the request size (characters / 3, plus 40 tokens per question and 300 per request). On the fixture it reserves 3,802 for 3,114 used.
- Measured on stage `dev`, 2026-11-03, scanning https://en.wikipedia.org/wiki/Brno: 61 items asked (20 images, 20 links, 20 headings and labels, 1 language sample), 9,632 input tokens, about 210 neurons, $0.0023. Nothing was noted. The reservation was 16,629 tokens (1.7× the real use: long link contexts escape into more characters per token), so at the 20-item cap the daily budget allows about 24 scans. Lowering the estimate is the lever if that is too few; the budget sits under the free allocation either way.
- Round 2 adds about 600 tokens a scan for `sells-to-consumers` (599 on average over 72 real pages, 367 on the fixture page) and about 2,000 for `statement-annex-v` when the crawl finds a statement (24 real statements: 34,971 tokens, about 1,460 each). `link-purpose` asks fewer items now that menus are left out (3 instead of 6 on the fixture page). On the fixture page the scan now reserves for 3 requests and the model counted 1,511 tokens.
- Each scan's tokens are logged by the `judge` task (`Judged step for <url>: <n> input tokens`) and stored in `report.judged.inputTokens`.
- After the answers, `JudgeBudget.settle` replaces the reservation with the input tokens the model reported (`reply.usage.input_tokens`, summed), up or down. The day's count is then real use, so an undercount (dense scripts such as Greek or Bulgarian take more tokens per character) can push it past the cap once, and the next reservation is refused. When a call fails, the whole reservation stays counted. On the real calibration set the estimate was 20,041 tokens for 16,895 used.
- w3.org's BAD demo page was tried first and refused the scanner (HTTP 403 from Cloudflare's network), so it got no judged section, as designed.

## Known failure modes

- **Page text steers the model.** The state is text the scanned site wrote. A page can write alt text or link text that argues with the question ("this alt text is a full description"). That can only hide or add a judged observation, never a finding, and the label says the model may be wrong.
- **Text only.** `alt-text-describes` never sees the image, so it cannot tell whether "Sunny Bikes" on a logo is right. It catches file names, placeholders and generic words, not wrong descriptions.
- **Context is the innermost block.** A link in a long paragraph past the 300-character context cap is judged without its own sentence. Links in `nav`, `header` and `footer` are not asked. Menus built from plain `div`s still are, and are judged on their own text. That is usually right for menus, and wrong for card grids whose heading sits outside the link's block.
- **Headings are judged alone.** 2.4.6 asks whether a heading describes its section; the model sees only the heading. It catches "Section 1" and "Untitled", not a heading that names the wrong topic.
- **Language sample.** The first 1,200 characters of visible text include navigation and cookie banners. A multilingual page or a page whose banner is in another language can be noted wrongly; the 0.2 threshold keeps borderline cases out.
- **Scope from one page.** `sells-to-consumers` reads the static HTML of the entered page only. A shop whose home page is built by script shows no prices or cart in it, so the model leans to "does not sell" (coolblue.nl, power.dk). Under the threshold the observation says nothing. Above it, it was right every time in the set, but a script-built shop is the likely error, and the answer never changes the state list.
- **Statement text is capped.** The statement question reads at most 6,000 characters of the statement page outside navigation, after deduping repeated blocks. A long statement whose service description comes late can be noted wrongly for 1(a) or 1(b). A page that only points to another document (for example the general terms and conditions, which Annex V allows) is noted as missing that point, because the model reads only this page.
- **Calibration.** Clef's probabilities are the model's own; the thresholds come from 212 labelled items (see Calibration). A changed question template or model invalidates them: rerun the set.

## Tests

- `packages/core/test/judged.test.ts` runs the checks on recorded evidence (`judged-evidence.json`, read from the fixture page by the real reader) and recorded Clef answers (`judged-replies.json`, re-recorded 2026-11-04 in the round 2 run). It also covers leaving menu links out, asking each link text once, and when the statement question is asked. No test calls a model. It covers what is noted and what is not, the item cap, skipping the language question, confidences, references from verified facts only, the token reservation covering real usage, and that judged observations never change findings or the headline.
- `packages/core/test/judged-calibration.test.ts` rebuilds the hand-written calibration requests with `questionsOf`, decides them with each check's `decide` on the recorded answers, and checks precision and recall per check.
- `packages/ai-judge/test/ai-judge.test.ts` checks the pinned model and gateway, decoding, and the `service`, `unreadable` and `timeout` failures.
- `packages/scan-store/test/judge-budget.test.ts` checks the daily token cap.
- `packages/core/test/judged-round2-calibration.test.ts` scores the round 2 real items (above) and ties each shown flag to its real-item precision.
- `packages/html-reader/test/judge-evidence.test.ts` checks the link, heading and label evidence. `judged-passages.test.ts` checks passages (language, landmark, no doubled text, hidden blocks left out) and prices. The hostile-input test runs every judged question, shown or not, on input at the size cap, with digit runs and prices among the units, and checks it stays within the linear-time budget.
- `packages/core/test/scan-machine.test.ts` checks that a failed judge step still publishes.
