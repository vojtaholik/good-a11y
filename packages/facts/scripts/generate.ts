import { readLedger, renderLedger } from "@eaa-check/facts";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect, FileSystem, Path } from "effect";

const program = Effect.gen(function* generateLedger() {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const here = import.meta.dirname;
  const root = path.resolve(here, "../../..");
  const facts = yield* readLedger(root);
  const target = path.join(here, "../src/ledger.generated.ts");

  yield* fileSystem.writeFileString(target, renderLedger(facts));
  yield* Console.log(
    `${facts.filter((fact) => fact.status === "verified").length} verified of ${facts.length} facts written to ${target}`
  );
}).pipe(Effect.provide(NodeServices.layer));

NodeRuntime.runMain(program);
