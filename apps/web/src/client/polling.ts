import { Option, Schema, Stream } from "effect";
import { Subscription } from "foldkit";

import { reportSlugOf } from "../features/route.js";
import { Message, ScanState } from "./model.js";
import type { AppMessage, AppModel } from "./model.js";

export const POLL_INTERVAL = "2500 millis";

const isUnsettled = ScanState.isAnyOf(["Loading", "Running"]);

export const pollTarget = (model: AppModel): Option.Option<string> =>
  isUnsettled(model.scan) ? reportSlugOf(model.route) : Option.none();

export const subscriptions = Subscription.make<AppModel, AppMessage>()(
  (entry) => ({
    poll: entry(
      { generation: Schema.Int, maybeSlug: Schema.Option(Schema.String) },
      {
        dependenciesToStream: ({ maybeSlug }) =>
          Option.match(maybeSlug, {
            onNone: () => Stream.empty,
            onSome: () =>
              Stream.tick(POLL_INTERVAL).pipe(
                Stream.map(() => Message.TickedPoll())
              ),
          }),
        modelToDependencies: (model) => ({
          generation: model.generation,
          maybeSlug: pollTarget(model),
        }),
      }
    ),
  })
);
