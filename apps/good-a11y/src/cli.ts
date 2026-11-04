#!/usr/bin/env node

import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect } from "effect";

import { runCommand } from "./command.js";

const failWith = (message: string) =>
  Console.error(message).pipe(
    Effect.andThen(
      Effect.sync(() => {
        process.exitCode = 1;
      })
    )
  );

const program = runCommand(process.argv.slice(2)).pipe(
  Effect.catchTags({
    GuideNotFound: (error) => failWith(error.message),
    ScanTargetRejected: (error) =>
      failWith(
        `${error.reason} Give a page address such as localhost:5173 or https://example.com.`
      ),
  }),
  Effect.provide(NodeServices.layer)
);

NodeRuntime.runMain(program);
