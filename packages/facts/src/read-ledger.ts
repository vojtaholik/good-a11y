import { Effect, FileSystem, Path } from "effect";

import { parseLedger } from "./parse.js";
import type { LedgerFile } from "./parse.js";

const NOT_A_LEDGER_FILE = new Set(["README.md"]);

export const LEDGER_DIRECTORY = "research/facts";

export const readLedger = Effect.fn("readLedger")(function* readLedger(
  root: string
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.join(root, LEDGER_DIRECTORY);

  const entries = yield* fileSystem.readDirectory(directory, {
    recursive: true,
  });

  const names = entries
    .filter(
      (entry) =>
        entry.endsWith(".md") && !NOT_A_LEDGER_FILE.has(path.basename(entry))
    )
    .toSorted();

  const files: LedgerFile[] = [];

  for (const file of names) {
    const text = yield* fileSystem.readFileString(path.join(directory, file));
    files.push({ file: file.split(path.sep).join("/"), text });
  }

  return yield* Effect.fromResult(parseLedger(files));
});
