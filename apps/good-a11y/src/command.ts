import { Command } from "effect/cli";

import { listCommand, retrieveCommand, searchCommand } from "./guides.js";
import { VERSION } from "./version.js";

export const rootCommand = Command.make("good-a11y").pipe(
  Command.withDescription(
    "Accessibility guidance for coding agents: search the guides, retrieve one, build with it"
  ),
  Command.withSubcommands([searchCommand, retrieveCommand, listCommand])
);

export const runCommand = Command.runWith(rootCommand, { version: VERSION });
