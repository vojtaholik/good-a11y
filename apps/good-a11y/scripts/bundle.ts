import { NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { build } from "esbuild";

import { BUNDLE_PATH, bundleOptions } from "./bundle-options.ts";

const program = Effect.tryPromise(build.bind(undefined, bundleOptions)).pipe(
  Effect.andThen(Console.log(`bundled ${BUNDLE_PATH}`))
);

NodeRuntime.runMain(program);
