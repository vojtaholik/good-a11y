import { Command } from "effect/cli";

import { VERSION } from "./version.js";

export { VERSION } from "./version.js";

export const rootCommand = Command.make("eaa-check").pipe(
  Command.withDescription("EU accessibility (EAA) checker for public web pages")
);

export const runCommand = Command.runWith(rootCommand, { version: VERSION });
