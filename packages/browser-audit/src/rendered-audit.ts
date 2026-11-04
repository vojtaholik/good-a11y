import {
  RENDERED_HTML_CHARACTERS,
  RenderedAudit,
  RenderedAuditFailed,
} from "@good-a11y/core";
import type { RenderedPage, UrlVet, VettedUrl } from "@good-a11y/core";
import { Effect, Layer, Result, Schema } from "effect";
import type { Duration } from "effect";

import { landedOn } from "./browser-session.js";
import type {
  BrowserSession,
  LaunchSession,
  OnClose,
} from "./browser-session.js";

export const SETTLE: Duration.Input = "2 seconds";

export const HARD_TIMEOUT: Duration.Input = "120 seconds";

const decodeText = Schema.decodeUnknownResult(Schema.String);

const auditIn = Effect.fn("RenderedAudit.auditIn")(function* auditIn(
  session: BrowserSession,
  url: VettedUrl,
  vet: UrlVet
) {
  const landing = yield* session.open(url);

  yield* landedOn(session, vet);

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

  yield* landedOn(session, vet);

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
  vet: UrlVet,
  onClose: OnClose = () => Effect.void
) => ({
  audit: (url: VettedUrl): Effect.Effect<RenderedPage, RenderedAuditFailed> =>
    Effect.acquireRelease(
      launch.pipe(Effect.tapError(() => onClose(false))),
      (session) => closeReporting(session, onClose)
    ).pipe(
      Effect.flatMap((session) => auditIn(session, url, vet)),
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

export const renderedAuditLayer = (
  launch: LaunchSession,
  vet: UrlVet,
  onClose?: OnClose
) =>
  Layer.succeed(
    RenderedAudit,
    RenderedAudit.of(renderedAuditWith(launch, vet, onClose))
  );
