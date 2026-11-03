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
   - builds one request per judged check with `questionsFor(evidence)`;
   - reserves `tokensToReserve(asked)` tokens with `JudgeBudget.reserve` against `DAILY_JUDGE_TOKENS` (400,000 a day). The insert is conditional, so the budget is never overspent;
   - asks the model, at most 4 requests at once, through the `Judge` port (`packages/ai-judge`: 30 s hard timeout, reply decoded with `JudgeReplySchema`, any failure becomes `JudgeUnavailable`);
   - turns the answers into observations with `judgedOf` and attaches them with `withJudged`.
3. If the budget is spent, the report says "Today's budget for model-judged observations is spent." If the model fails, times out or answers outside the schema, the report says "The decision model did not answer, so nothing was judged by a model." The failure detail goes to the Worker log only; nothing the service wrote is shown to a visitor.
4. A failed `judge` task never fails the scan: the machine moves on to `storing` with the report it had.

## The questions

At most 20 distinct items per check (`MAX_JUDGED_ITEMS`), taken in document order. One request per check, one question per item.

| Check | Relates to | Items | Question (noul unless noted) |
| --- | --- | --- | --- |
| `alt-text-describes` | 1.1.1 | images with non-empty alt, not `role="presentation"`/`none` | Is the alt text a description of what the image shows or what it is for? No for a file name, a placeholder or only a generic word. State: alt text and file name. |
| `link-purpose` | 2.4.4 | links of one or two words without `aria-label`/`aria-labelledby`/`title` | Is it clear from the link text together with its surrounding paragraph, list item or cell where the link goes? |
| `headings-labels-describe` | 2.4.6 | up to 8 label texts, then headings up to 20 in all | Does the heading name a topic a reader can recognise? Does the label say what to enter? |
| `page-language-matches` | 3.1.1 | the page, when it declares `lang` and has at least 200 characters of visible text | Choice over the 24 EU official languages plus "other": which language is most of the text in? |

The static reader collects the extra evidence in its single tokenizer pass: link context (the innermost `p`, `li`, `td`, `th`, `dd`, `dt`, `caption`, `figcaption` or heading, capped at 300 characters), headings with level, label texts, the image file name (last path segment, no query, none for `data:`), and the first 1,200 characters of visible text.

## Thresholds (fixed in code)

`NOTE_AT` in `packages/core/src/judged.ts` holds one threshold per check, chosen on the labelled set below for precision of at least 0.9 with the most recall:

| Check | Noted when | Precision | Recall |
| --- | --- | --- | --- |
| `alt-text-describes` | P(no) ≥ 0.70 | 1.00 (30/30) | 1.00 (30/30) |
| `link-purpose` | P(no) ≥ 0.85 | 1.00 (24/24) | 0.80 (24/30) |
| `headings-labels-describe` | P(no) ≥ 0.70 | 1.00 (26/26) | 0.96 (26/27) |
| `page-language-matches` | P(not declared) ≥ 0.80 and the top choice is another language | 1.00 (15/15) | 1.00 (15/15) |

- Each note shows the model's confidence in that answer (the probability above, rounded to a percent).
- What a note means: the model, reading only the text shown, thinks this item probably does not do what the success criterion asks. It is a pointer for a person to look at, not a failure. A check with no notes means nothing was noted, never that the criterion is met.
- All four checks reach 0.9 precision on that set.

## Shown in the report (decision 23)

Each check has a `shown` flag in `packages/core/src/judged.ts`. A check that is not shown is not asked, costs no model budget and adds nothing to the report. Its code and thresholds stay, for calibration.

| Check | Shown | Why |
| --- | --- | --- |
| `alt-text-describes` | no | On real pages it noted a correct logo alt (idnes.cz `alt="iDNES.cz"` on `idnes.svg`, 83%): 0 of 1 real notes were right (docs/accuracy-qa.md, round 4) |
| `link-purpose` | yes | 13 of 14 real notes right |
| `headings-labels-describe` | no | 1 of 6 real notes right. It noted ordinary Czech headings and labels on seznam.cz ("Vyhledat", "Hlavní obsah", "Méně služeb") at 70 to 98% |
| `page-language-matches` | yes |  |

The hand-written set above did not predict the failures on real pages. A hidden check comes back only when it reaches precision 0.9 on a set of at least 30 real items, labelled by hand, taken from scanned pages.

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

- `packages/core/test/judged-calibration.test.ts` fails if a check in the report falls below 0.9 on the recorded answers, or a check has no calibration batch.

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
- Each scan's tokens are logged by the `judge` task (`Judged step for <url>: <n> input tokens`) and stored in `report.judged.inputTokens`.
- w3.org's BAD demo page was tried first and refused the scanner (HTTP 403 from Cloudflare's network), so it got no judged section, as designed.

## Known failure modes

- **Page text steers the model.** The state is text the scanned site wrote. A page can write alt text or link text that argues with the question ("this alt text is a full description"). That can only hide or add a judged observation, never a finding, and the label says the model may be wrong.
- **Text only.** `alt-text-describes` never sees the image, so it cannot tell whether "Sunny Bikes" on a logo is right. It catches file names, placeholders and generic words, not wrong descriptions.
- **Context is the innermost block.** A link in a long paragraph past the 300-character context cap is judged without its own sentence. Navigation links are judged on their own text, which is usually right for nav and wrong for card grids whose heading sits outside the link's block.
- **Headings are judged alone.** 2.4.6 asks whether a heading describes its section; the model sees only the heading. It catches "Section 1" and "Untitled", not a heading that names the wrong topic.
- **Language sample.** The first 1,200 characters of visible text include navigation and cookie banners. A multilingual page or a page whose banner is in another language can be noted wrongly; the 0.2 threshold keeps borderline cases out.
- **Calibration.** Clef's probabilities are the model's own; the thresholds come from 212 labelled items (see Calibration). A changed question template or model invalidates them: rerun the set.

## Tests

- `packages/core/test/judged.test.ts` runs the four checks on recorded evidence (`judged-evidence.json`, read from the fixture page by the real reader) and recorded Clef answers (`judged-replies.json`, recorded 2026-11-03). No test calls a model. It covers what is noted and what is not, the item cap, skipping the language question, confidences, references from verified facts only, the token reservation covering real usage, and that judged observations never change findings or the headline.
- `packages/core/test/judged-calibration.test.ts` rebuilds the calibration requests with `questionsFor`, decides them with each check's `decide` on the recorded answers, and checks precision and recall per check.
- `packages/ai-judge/test/ai-judge.test.ts` checks the pinned model and gateway, decoding, and the `service`, `unreadable` and `timeout` failures.
- `packages/scan-store/test/judge-budget.test.ts` checks the daily token cap.
- `packages/html-reader/test/judge-evidence.test.ts` checks the new evidence, and the hostile-input test runs `questionsFor` in the linear-time budget.
- `packages/core/test/scan-machine.test.ts` checks that a failed judge step still publishes.
