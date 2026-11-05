import { localRenderedAuditLayer } from "@good-a11y/browser-audit/node";
import {
  ReportSchema,
  SafeFetch,
  checkLocally,
  formatLocalCheck,
} from "@good-a11y/core";
import { guidesForCheck } from "@good-a11y/guides";
import { htmlPageReaderLayer } from "@good-a11y/html-reader";
import { localNodeHopTransportLayer } from "@good-a11y/http-transport/node";
import { Console, Effect, Layer, Option, Schema } from "effect";
import { Argument, Command, Flag } from "effect/cli";

export const guideUrl = (id: string): string =>
  `https://good-a11y.com/${id}.md`;

const localLayer = (executablePath: string | null) =>
  Layer.mergeAll(
    SafeFetch.localLayer.pipe(Layer.provide(localNodeHopTransportLayer)),
    htmlPageReaderLayer,
    localRenderedAuditLayer({ executablePath })
  );

export const checkCommand = Command.make(
  "check",
  {
    chrome: Flag.String("chrome").pipe(
      Flag.withDescription(
        "Path to the Chrome or Chromium binary. Default: the installed Google Chrome"
      ),
      Flag.optional
    ),
    json: Flag.Boolean("json").pipe(
      Flag.withDescription("Print the schema-encoded report as JSON"),
      Flag.withDefault(false)
    ),
    url: Argument.String("url").pipe(
      Argument.withDescription(
        "The page to check: localhost:5173, http://127.0.0.1:8080/cart or https://example.com"
      )
    ),
  },
  Effect.fn("check")(function* check({ chrome, json, url }) {
    const checked = yield* checkLocally(url).pipe(
      Effect.provide(localLayer(Option.getOrNull(chrome)))
    );

    yield* Console.log(
      json
        ? JSON.stringify(
            yield* Schema.encodeEffect(ReportSchema)(checked.report),
            null,
            2
          )
        : formatLocalCheck(checked, {
            guideUrl,
            guidesFor: guidesForCheck,
          })
    );
  })
).pipe(
  Command.withDescription(
    "Check a page in your local Chrome (localhost works): static checks, axe-core and rendered probes. Prints Markdown findings, each with its fix prompt and guide"
  )
);
