#!/usr/bin/env node

import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect } from "effect";

import { runCommand } from "./command.js";

const program = runCommand(process.argv.slice(2)).pipe(
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Oxlint mistakes this Effect handler for an async Promise callback.
  Effect.catchTag("GuideNotFound", (error) =>
    Console.error(error.message).pipe(
      Effect.andThen(
        Effect.sync(() => {
          process.exitCode = 1;
        })
      )
    )
  ),
  Effect.provide(NodeServices.layer)
);

NodeRuntime.runMain(program);
