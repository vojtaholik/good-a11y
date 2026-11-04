# Local check (`good-a11y check`)

Built 2026-11-04 by check for decision 6 of the good-a11y brief. An agent checks its own work, on localhost or on a public page, in the user's own Chrome, with its own tokens. Nothing goes to our servers and nothing is counted against our budgets.

```sh
npx github:vojtaholik/good-a11y check localhost:5173
npx github:vojtaholik/good-a11y check https://example.com/cart
npx github:vojtaholik/good-a11y check --json localhost:5173
npx github:vojtaholik/good-a11y check --chrome /path/to/chromium localhost:5173
```

## What runs

`checkLocally` in `packages/core/src/local-check.ts`, in the order the hosted scan uses:

1. `parseLocalTarget` reads what was typed. Without a scheme, `localhost`, `*.localhost`, an IP address, a one-label host or any `host:port` gets `http://`; everything else gets `https://`.
2. `SafeFetch.localLayer` fetches the page: the same hand-followed redirects, body cap, timeout and typed failures as the hosted scan, vetted per hop by `vetLocalUrl`.
3. `PageReader` reads the HTML and every static check runs.
4. `RenderedAudit` opens the page in the user's Chrome (`@good-a11y/browser-audit/node`): the same page scripts, the pinned axe-core 4.14.0 and the same rendered probes as Browser Run, at the same viewport and with the same timeouts. On a private target (below) the forms are also submitted empty, under the hosted fence.
5. `withRendered` adds the rendered findings, or a skip with its reason, to the `Report`.
6. The shown judged questions that relate to a WCAG criterion are built with `questionsFor` from the static and rendered evidence. No model is asked.

There is no crawl: the check reads the one page it was given. The scope question (`sells-to-consumers`) and the statement question are left out; they belong to the EAA view of the hosted report.

## Output

Markdown for agents (`formatLocalCheck` in `packages/core/src/local-check-text.ts`):

- the verdict line with its fact ID, the verdict detail, the methods run and the outcome detail;
- the issues worst first, in the order the hosted report uses, then the WCAG 2.2 issues that are not counted. Each issue has its level and count, a `retrieve <guide-id>` line when a guide fixes it, and its fix prompt (`fixPromptOf`) in a fence: what fails, how to fix, up to three samples quoted as data, the criteria from verified facts only, and the rules for the agent;
- "Questions for you", labelled "Judged by your agent, not calibrated": each question's WCAG criterion (from verified facts), its evidence as a fenced block of page text, and each item's question with the expected answer form. They are never counted as issues and change nothing above;
- the automated-limit statement (`STD-AUTO-1`).

`--json` prints the report encoded with `ReportSchema`, the same shape the hosted scanner stores. The guide links and questions are Markdown only.

The check-to-guide map is `packages/guides/src/check-guides.ts`, keyed by the issue key: a static check id (`image-alt`), or `axe:` plus an axe rule or probe id (`axe:focus-visible`). axe rules that the report folds into a static check (`select-name` into `form-labels`) map through the static key. `apps/good-a11y/test/check-guides.test.ts` fails on a key the report cannot show or a guide id not in `GUIDES`.

## Local mode and its fence

The local check is the one place that may fetch and open localhost and private addresses. The user is checking their own app, on their own machine and network.

| Piece | Hosted scan | Local check |
| --- | --- | --- |
| URL vetting | `vetUrl` makes a `PublicUrl`: no IP, no port, public TLD | `vetLocalUrl` makes a `LocalUrl`: http or https without credentials, any host and port |
| Port | `HopTransport`, whose `open` takes only a `PublicUrl` | `LocalHopTransport`, whose `open` takes `PublicUrl` or `LocalUrl` (`VettedUrl`) |
| Node transport | `nodeHopTransportLayer`, refuses names resolving to private addresses | `localNodeHopTransportLayer`, plain DNS |
| Browser | Browser Run, navigations vetted with `vetUrl` | the user's Chrome through puppeteer-core 25.13.0, navigations vetted with `vetLocalUrl` |

The fences:

- `rat-stack-boundaries/no-local-mode-in-hosted-apps` fails lint when `apps/scanner`, `apps/web` or `apps/infra` import `@good-a11y/browser-audit/node`, `@good-a11y/http-transport/node` or `puppeteer-core`, or name `vetLocalUrl`, `LocalUrl`, `VettedUrl`, `LocalHopTransport`, `localLayer`, `checkLocally`, `parseLocalTarget` or the local layers. `packages/core/test/boundaries-rule.test.ts` runs the rule on fixtures in each hosted app.
- `packages/core/test/local-target.test.ts` holds a `@ts-expect-error` on passing a `LocalUrl` to `HopTransport.open`: if the hosted port ever accepts one, the typecheck fails.
- The same test file checks that `parseScanTarget` still refuses `localhost:5173` and `127.0.0.1`.

Still in force locally: no `file:`, `javascript:` or other schemes, no credentials in the address, the redirect cap, the body cap, timeouts, popups closed and service workers bypassed.

### Empty submits on the user's own app (lead, 2026-11-04)

The 3.3.1 and 3.3.3 questions (`error-identified`, `error-suggestion`, docs/judged-checks.md) read what a form shows after it is submitted empty. The hosted checker keeps that off. The local check turns it on when `isPrivateTarget` (`packages/core/src/public-url.ts`) holds for the page: `localhost`, `*.localhost`, a one-label host, a loopback, RFC 1918, link-local or unique-local address. A public name stays off, also when it resolves to a private address, since the check cannot tell a dev host from someone else's server by its name.

The submits run under the same fence as on Browser Run (docs/rendered-probes.md, "Submitting forms without sending anything"): every request of every target fails at the browser level, navigations get a local 204, the page goes offline, `WebSocket.send` and `sendBeacon` send nothing, no field is typed into, and search, password and payment forms are skipped. `apps/good-a11y/test/check.e2e.test.ts` serves a form whose submit handler posts with `fetch`, `sendBeacon` and an image, plus a native POST, and asserts that the local server received no request while the error-text question reached the output.

## Calls made

- **A `./node` entry of browser-audit, not a new package.** The page scripts, axe and the session code live there; a second package would have to import them across packages or copy them. Only `packages/browser-audit` imports puppeteer, as before.
- **The session code runs on a structural type.** `SessionBrowser` (`packages/browser-audit/src/session-browser.ts`) lists the few browser, page, request and CDP methods the session uses. `@cloudflare/puppeteer` 1.4.0 and `puppeteer-core` 25.13.0 both satisfy it without a cast, so `sessionOn` is one implementation for both.
- **puppeteer-core with the installed Chrome.** `launch({ channel: "chrome" })` finds Google Chrome where it installs itself. Full `puppeteer` would download a Chrome of its own on every `npx` install. `--chrome <path>` takes any Chrome or Chromium binary. If Chrome does not start, the static checks still run and the report says why the rendered check was skipped and how to fix it.
- **puppeteer-core is not bundled.** The bundle keeps it external and the root `package.json` lists it under `dependencies`, so `npx` installs it next to the bundle.
- **Empty submits only on private targets.** On a public URL a form may post to someone's real backend; the fence blocks every request, but the hosted rule (off unless calibrating) stays for public pages.
- **The user agent is the scanner's.** A local dev server does not care, and the same string keeps bot-wall detection the same.

## Tests

- `apps/good-a11y/test/check.e2e.test.ts` serves two fixture pages from a local server in the test and runs the committed bundle against them in Chrome: a broken page (issues worst first, a sample only the rendered page has, the guide line, the criterion, the questions section, no "compliant"), a clean page (no failures, "not a pass"), `--json` decoded with `ReportSchema`, and a refused scheme (exit 1, the reason on stderr). CI needs Chrome on the runner; GitHub's Ubuntu images have it.
- `packages/core/test/local-target.test.ts`: target parsing, `vetLocalUrl` refusals, a redirect between local addresses through `SafeFetch.localLayer`, the hosted port's type.
- `packages/browser-audit/test/rendered-audit.test.ts`: navigation vetting with each vet function.

Checked by hand on 2026-11-04: a localhost page (4.6 s) and https://www.gov.uk/ (5.5 s), both with the rendered check run.
