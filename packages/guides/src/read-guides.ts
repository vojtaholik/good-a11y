import { Effect, FileSystem, Path } from "effect";

import { FLOW_FILE, GUIDE_FILES, parseGuides } from "./parse.js";
import type { GuideFile, GuideFolder } from "./parse.js";

const FILES: readonly GuideFile[] = [...GUIDE_FILES, FLOW_FILE];

export const GUIDES_DIRECTORY = "guides";

export const readGuides = Effect.fn("readGuides")(function* readGuides(
  root: string
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.join(root, GUIDES_DIRECTORY);

  if (!(yield* fileSystem.exists(directory))) {
    return [];
  }

  const isDirectory = (target: string) =>
    fileSystem
      .stat(target)
      .pipe(Effect.map((info) => info.type === "Directory"));

  const folders: GuideFolder[] = [];

  for (const category of (yield* fileSystem.readDirectory(
    directory
  )).toSorted()) {
    const categoryPath = path.join(directory, category);

    if (!(yield* isDirectory(categoryPath))) {
      continue;
    }

    for (const slug of (yield* fileSystem.readDirectory(
      categoryPath
    )).toSorted()) {
      const guidePath = path.join(categoryPath, slug);

      if (!(yield* isDirectory(guidePath))) {
        continue;
      }

      const files: Partial<Record<GuideFile, string>> = {};

      for (const file of FILES) {
        const filePath = path.join(guidePath, file);

        if (yield* fileSystem.exists(filePath)) {
          files[file] = yield* fileSystem.readFileString(filePath);
        }
      }

      folders.push({ category, files, slug });
    }
  }

  return yield* Effect.fromResult(parseGuides(folders));
});
