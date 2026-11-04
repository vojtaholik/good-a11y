import { toCommand } from "@good-a11y/capability";
import { formatReport, scan } from "@good-a11y/core";
import { Command } from "effect/cli";

import { cliCapabilities } from "./surfaces.js";
import { VERSION } from "./version.js";

export { VERSION } from "./version.js";

const capabilityCommands = cliCapabilities.map((capability) =>
  capability === scan
    ? toCommand(capability, { positional: ["url"], render: formatReport })
    : toCommand(capability)
);

export const rootCommand = Command.make("good-a11y-scan").pipe(
  Command.withDescription(
    "Scan a public web page the way the hosted good-a11y checker does"
  ),
  Command.withSubcommands([...capabilityCommands])
);

export const runCommand = Command.runWith(rootCommand, { version: VERSION });
