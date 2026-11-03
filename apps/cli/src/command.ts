import { toCommand } from "@eaa-check/capability";
import { formatReport, scan } from "@eaa-check/core";
import { Command } from "effect/cli";

import { cliCapabilities } from "./surfaces.js";
import { VERSION } from "./version.js";

export { VERSION } from "./version.js";

const capabilityCommands = cliCapabilities.map((capability) =>
  capability === scan
    ? toCommand(capability, { positional: ["url"], render: formatReport })
    : toCommand(capability)
);

export const rootCommand = Command.make("eaa-check").pipe(
  Command.withDescription(
    "EU accessibility (EAA) checker for public web pages"
  ),
  Command.withSubcommands([...capabilityCommands])
);

export const runCommand = Command.runWith(rootCommand, { version: VERSION });
