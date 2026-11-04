# Task: builder-core (round 2)

Read `_common-2.md`. You own `packages/core` report model, checks, catalogue, coverage, `apps/web`, `apps/cli`.

1. Verdict (decision 25): headline when a deterministic failure exists: "This page does not meet WCAG 2.1 Level AA, the reference benchmark for the EAA. N failures found." (wording may be tightened, must cite the WCAG conformance fact research-2 adds first, STD-WCAG21-x; until verified, ship the verdict hidden behind that fact being present, as the catalogue does). No failure: "Automated checks found no failures. That is not a pass: M of 50 criteria need a person." Blocked stays. Tests: compliance-word test still passes; verdict never comes from judged observations.
2. Requirement checklist (decision 26): a report section and `/checks`-style table for this scan: every WCAG 2.1 A/AA SC (2.2 additions labelled newer) with status fails / no failure found / judged by a model / needs a person / not checked on this scan, plus EAA rows (Annex I III (b), III (d), IV (g), Art. 13/Annex V) from research-2's facts, rows shown only when their fact is verified. Status from catalogue + coverage + this scan's results. Same in the CLI text report. Mobile first, issues still come first in the report.
3. Site section (decision 28) once builder-cloud's crawl lands: pages read, cross-page findings (2.4.5, 3.2.3, 3.2.4, 3.2.6 as deterministic checks over the pages' evidence, which you write in core with builder-cloud's evidence shape).
4. Show builder-judge's new observations where they belong (scope beside the state list; statement in the EAA rows; others in the judged section).
Write `docs/requirement-checklist.md`. Screenshots at 360 px and desktop to the lead when each step is deployed.
