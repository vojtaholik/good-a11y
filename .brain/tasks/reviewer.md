# Task: reviewer (lead, 21:55 CET)

Read-only, except your output file. No questions, no agents, no commits. Deadline: findings by 23:45 CET.

This repo is an EU accessibility checker on rat-stack (Effect 4, XState in a Cloudflare Workflow, Alchemy). Read `AGENTS.md`, `VISION.md`, `BRIEF.md`, then review the code for real defects, ranked by severity:

1. **Hostile input safety**: `packages/core` SafeFetch / scan target parsing, `packages/http-transport`, `packages/browser-audit` (Browser Run navigates to user-supplied URLs: redirects to private/internal addresses, file:/data:/javascript: schemes, huge pages, slow pages, infinite redirects, credentials in URLs), and the RPC surface in `apps/scanner` (`startScan`, `getScan`, `sendMessage`): input validation, rate limits/caps, what an anonymous caller can make the system do or spend.
2. **Spend bounds**: the browser budget, judge budget, daily scan cap, message cap. Can a caller exceed them (races, reserve/release bugs, negative releases, retries in the Workflow re-spending)?
3. **Workflow correctness**: replay safety of the XState machine inside the Workflow (side effects only in steps, deterministic replay), failure paths, a stuck scan.
4. **Facts gate**: can an unverified or rejected fact reach product text (`packages/facts` generator, report builders, fix prompts)?
5. **Report honesty**: anything that could read as "compliant" or a clean bill of health; counts that mix judged observations with issues.

For each finding: file:line, what is wrong, a concrete failure scenario, and a suggested fix. Verify each by reading the code paths end to end (and running tests or the CLI where useful); drop anything you cannot substantiate. Write `docs/review.md` and send the lead (`hc send t1t`) the path and counts by severity.
