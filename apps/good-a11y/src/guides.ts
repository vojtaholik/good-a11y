import {
  GUIDES,
  flowForCheck,
  makeGuideIndex,
  scenarioForCheck,
} from "@good-a11y/guides";
import type { GuideHit } from "@good-a11y/guides";
import { Console, Effect } from "effect";
import { Argument, Command } from "effect/cli";

import { deliverText } from "./deliver.js";

const index = makeGuideIndex(GUIDES);

const printHits = (hits: readonly GuideHit[]) =>
  Console.log(JSON.stringify(hits, null, 2));

export const listCommand = Command.make("list", {}, () =>
  printHits(index.list())
).pipe(
  Command.withDescription("Print every guide as JSON: [{ id, description }]")
);

export const searchCommand = Command.make(
  "search",
  {
    query: Argument.String("query").pipe(
      Argument.withDescription(
        'What you are building, in 2-5 words, e.g. "modal dialog focus"'
      )
    ),
  },
  ({ query }) => printHits(index.search(query))
).pipe(
  Command.withDescription(
    "Find guides for a task. Prints the best 8 as JSON: [{ id, description }], or [] when nothing matches"
  )
);

export const retrieveCommand = Command.make(
  "retrieve",
  {
    ids: Argument.String("ids").pipe(
      Argument.withDescription(
        'One guide id or several separated by commas, e.g. "modal-dialog,form-errors"'
      )
    ),
  },
  Effect.fn("retrieve")(function* retrieve({ ids }) {
    const wanted = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    const guides = yield* Effect.fromResult(index.retrieve(wanted));

    const text = guides
      .map((guide) =>
        [
          guide.text.trimEnd(),
          "",
          ...flowForCheck(guide),
          ...scenarioForCheck(guide),
        ]
          .join("\n")
          .trimEnd()
      )
      .join("\n\n");

    yield* Console.log(yield* deliverText(text, wanted.join("+")));
  })
).pipe(
  Command.withDescription(
    "Print the guide text. Over 9.5 KB it is written to a temp file and the file path is printed instead"
  )
);
