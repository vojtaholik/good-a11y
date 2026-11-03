import {
  RENDERED_HTML_CHARACTERS,
  RenderedAudit,
  RenderedAuditFailed,
} from "@eaa-check/core";
import type { PublicUrl, RenderedPage } from "@eaa-check/core";
import { Effect, Layer, Result, Schema } from "effect";
import type { Duration } from "effect";

import type { BrowserSession, LaunchSession } from "./browser-session.js";

export const SETTLE: Duration.Input = "2 seconds";

export const HARD_TIMEOUT: Duration.Input = "80 seconds";

const decodeText = Schema.decodeUnknownResult(Schema.String);

const auditIn = Effect.fn("RenderedAudit.auditIn")(function* auditIn(
  session: BrowserSession,
  url: PublicUrl
) {
  const landing = yield* session.open(url);

  yield* Effect.sleep(SETTLE);

  const axe = yield* session.runAxe;

  const text = decodeText(axe);

  if (Result.isFailure(text)) {
    return yield* new RenderedAuditFailed({
      detail: "axe.run did not return JSON text.",
      kind: "audit",
    });
  }

  const html = yield* session.html;

  const probes = yield* session.probe.pipe(
    Effect.tapError((failure) =>
      Effect.logWarning(
        `Rendered probes failed (${failure.kind}): ${failure.detail}`
      )
    ),
    Effect.orElseSucceed(() => null)
  );

  const page: RenderedPage = {
    axe: text.success,
    headers: landing.headers,
    html: html.slice(0, RENDERED_HTML_CHARACTERS),
    probes,
    status: landing.status,
  };

  return page;
});

export const renderedAuditWith = (launch: LaunchSession) => ({
  audit: (url: PublicUrl): Effect.Effect<RenderedPage, RenderedAuditFailed> =>
    Effect.acquireRelease(launch, (session) => session.close).pipe(
      Effect.flatMap((session) => auditIn(session, url)),
      Effect.scoped,
      Effect.timeoutOrElse({
        duration: HARD_TIMEOUT,
        orElse: () =>
          Effect.fail(
            new RenderedAuditFailed({
              detail: "The rendered audit ran past its hard timeout.",
              kind: "timeout",
            })
          ),
      })
    ),
});

export const renderedAuditLayer = (launch: LaunchSession) =>
  Layer.succeed(RenderedAudit, RenderedAudit.of(renderedAuditWith(launch)));
