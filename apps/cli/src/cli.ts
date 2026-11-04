#!/usr/bin/env node

import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Approval } from "@good-a11y/capability";
import { SafeFetch } from "@good-a11y/core";
import { htmlPageReaderLayer } from "@good-a11y/html-reader";
import { nodeHopTransportLayer } from "@good-a11y/http-transport/node";
import { Console, Effect, Layer } from "effect";

import { runCommand } from "./command.js";

const program = runCommand(process.argv.slice(2)).pipe(
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Oxlint mistakes this Effect handler for an async Promise callback.
  Effect.catchTag("ScanTargetRejected", (error) =>
    Console.error(`${error.reason}\n${error.message}`).pipe(
      Effect.andThen(Effect.fail(error))
    )
  ),
  Effect.provide(
    Layer.mergeAll(
      SafeFetch.layer.pipe(Layer.provide(nodeHopTransportLayer)),
      htmlPageReaderLayer,
      NodeServices.layer,
      Approval.denyAll
    )
  )
);

NodeRuntime.runMain(program);
