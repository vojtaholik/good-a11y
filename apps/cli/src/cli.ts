#!/usr/bin/env node

import { Approval } from "@eaa-check/capability";
import { SafeFetch } from "@eaa-check/core";
import { htmlPageReaderLayer } from "@eaa-check/html-reader";
import { httpHopTransportLayer } from "@eaa-check/http-transport";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
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
      SafeFetch.layer.pipe(Layer.provide(httpHopTransportLayer)),
      htmlPageReaderLayer,
      NodeServices.layer,
      Approval.denyAll
    )
  )
);

NodeRuntime.runMain(program);
