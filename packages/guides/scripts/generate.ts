import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { readGuides, renderGuides } from "@good-a11y/guides";
import { Console, Effect, FileSystem, Path } from "effect";

const program = Effect.gen(function* generateGuides() {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const here = import.meta.dirname;
  const root = path.resolve(here, "../../..");
  const guides = yield* readGuides(root);
  const target = path.join(here, "../src/guides.generated.ts");

  yield* fileSystem.writeFileString(target, renderGuides(guides));
  yield* Console.log(`${guides.length} guides written to ${target}`);
}).pipe(Effect.provide(NodeServices.layer));

NodeRuntime.runMain(program);
