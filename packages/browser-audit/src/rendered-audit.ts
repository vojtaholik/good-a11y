import {
  RENDERED_HTML_CHARACTERS,
  RenderedAudit,
  RenderedAuditFailed,
} from "@eaa-check/core";
import type { PublicUrl, RenderedPage } from "@eaa-check/core";
import { Effect, Layer, Result, Schema } from "effect";
import type { Duration } from "effect";

import { landedOn } from "./browser-session.js";
import type {
  BrowserSession,
  LaunchSession,
  OnClose,
} from "./browser-session.js";

export const SETTLE: Duration.Input = "2 seconds";

export const HARD_TIMEOUT: Duration.Input = "100 seconds";

const decodeText = Schema.decodeUnknownResult(Schema.String);

const auditIn = Effect.fn("RenderedAudit.auditIn")(function* auditIn(
  session: BrowserSession,
  url: PublicUrl
) {
  const landing = yield* session.open(url);

  yield* landedOn(session);

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

  yield* landedOn(session);

  const page: RenderedPage = {
    axe: text.success,
    headers: landing.headers,
    html: html.slice(0, RENDERED_HTML_CHARACTERS),
    probes,
    status: landing.status,
  };

  return page;
});

const closeReporting = (session: BrowserSession, onClose: OnClose) =>
  session.close.pipe(
    Effect.matchEffect({
      onFailure: (failure) =>
        Effect.logWarning(`The browser did not close: ${failure.detail}`).pipe(
          Effect.andThen(onClose(false))
        ),
      onSuccess: () => onClose(true),
    })
  );

export const renderedAuditWith = (
  launch: LaunchSession,
  onClose: OnClose = () => Effect.void
) => ({
  audit: (url: PublicUrl): Effect.Effect<RenderedPage, RenderedAuditFailed> =>
    Effect.acquireRelease(launch, (session) =>
      closeReporting(session, onClose)
    ).pipe(
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

export const renderedAuditLayer = (launch: LaunchSession, onClose?: OnClose) =>
  Layer.succeed(
    RenderedAudit,
    RenderedAudit.of(renderedAuditWith(launch, onClose))
  );
