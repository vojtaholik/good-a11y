#!/usr/bin/env node

import { Approval } from "@eaa-check/capability";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";

import { runCommand } from "./command.js";

const program = runCommand(process.argv.slice(2)).pipe(
  Effect.provide(Layer.mergeAll(NodeServices.layer, Approval.denyAll))
);

NodeRuntime.runMain(program);
