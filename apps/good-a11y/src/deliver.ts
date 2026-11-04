import { Effect, FileSystem, Path } from "effect";

export const INLINE_LIMIT_BYTES = 9.5 * 1024;

export const deliverText = Effect.fn("deliverText")(function* deliverText(
  text: string,
  name: string
) {
  if (new TextEncoder().encode(text).byteLength <= INLINE_LIMIT_BYTES) {
    return text;
  }

  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const directory = yield* fileSystem.makeTempDirectory({
    prefix: "good-a11y-",
  });

  const file = path.join(directory, `${name}.md`);

  yield* fileSystem.writeFileString(file, text);

  return file;
});
