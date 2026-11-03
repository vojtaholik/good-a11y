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

- `NOTE_AT = 0.8`. A noul item is noted when the probability of "no" (`1 - noul`) is at least 0.8.
- The language observation is noted when the probability that the text is in the declared language is at most 0.2 and the model's top choice is another language.
- Each note shows the model's confidence in that answer (the probability above, rounded to a percent).
- What a note means: the model, reading only the text shown, thinks this item probably does not do what the success criterion asks. It is a pointer for a person to look at, not a failure. A check with no notes means nothing was noted, never that the criterion is met.

## Cost per scan

Measured on the fixture page (`packages/core/test/fixtures/judged-page.html`, 4 images, 6 short links, 4 headings, 3 labels, a language sample): 4 requests, 3,114 input tokens, 0 output tokens.

- Clef lists $0.24 per million input tokens. Workers AI bills $0.011 per 1,000 neurons, so that is about 21,800 neurons per million tokens: about 68 neurons, $0.00075, for this scan.
- Workers AI includes 10,000 neurons a day, about 458,000 Clef input tokens. `DAILY_JUDGE_TOKENS = 400,000` keeps the judged step inside that allocation: roughly 100 scans a day of this size, and about 40 at the 20-item cap on every check. Past the cap the step is skipped, never billed.
- The reservation is computed before the call from the request size (characters / 3, plus 40 tokens per question and 300 per request). On the fixture it reserves 3,802 for 3,114 used.
- The deployed dev scan's tokens are logged by the `judge` task (`Judged step for <url>: <n> input tokens`) and stored in `report.judged.inputTokens`.

## Known failure modes

- **Page text steers the model.** The state is text the scanned site wrote. A page can write alt text or link text that argues with the question ("this alt text is a full description"). That can only hide or add a judged observation, never a finding, and the label says the model may be wrong.
- **Text only.** `alt-text-describes` never sees the image, so it cannot tell whether "Sunny Bikes" on a logo is right. It catches file names, placeholders and generic words, not wrong descriptions.
- **Context is the innermost block.** A link in a long paragraph past the 300-character context cap is judged without its own sentence. Navigation links are judged on their own text, which is usually right for nav and wrong for card grids whose heading sits outside the link's block.
- **Headings are judged alone.** 2.4.6 asks whether a heading describes its section; the model sees only the heading. It catches "Section 1" and "Untitled", not a heading that names the wrong topic.
- **Language sample.** The first 1,200 characters of visible text include navigation and cookie banners. A multilingual page or a page whose banner is in another language can be noted wrongly; the 0.2 threshold keeps borderline cases out.
- **Calibration.** Clef's probabilities are the model's own. The 0.8 threshold was set from the fixture answers (noted items scored 0.96 to 0.98 "no"; borderline "click here" with context scored 0.56, not noted). It needs a labelled sample of real shops before anyone reads the confidence as a rate.

## Tests

- `packages/core/test/judged.test.ts` runs the four checks on recorded evidence (`judged-evidence.json`, read from the fixture page by the real reader) and recorded Clef answers (`judged-replies.json`, recorded 2026-11-03). No test calls a model. It covers what is noted and what is not, the item cap, skipping the language question, confidences, references from verified facts only, the token reservation covering real usage, and that judged observations never change findings or the headline.
- `packages/ai-judge/test/ai-judge.test.ts` checks the pinned model and gateway, decoding, and the `service`, `unreadable` and `timeout` failures.
- `packages/scan-store/test/judge-budget.test.ts` checks the daily token cap.
- `packages/html-reader/test/judge-evidence.test.ts` checks the new evidence, and the hostile-input test runs `questionsFor` in the linear-time budget.
- `packages/core/test/scan-machine.test.ts` checks that a failed judge step still publishes.
