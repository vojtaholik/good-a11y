import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect, FileSystem, Path, Schema, pipe } from "effect";
import { build } from "esbuild";

import { BUNDLE_PATH, LICENSES_PATH, bundleOptions } from "./bundle-options.ts";
import { renderLicenses } from "./third-party-licenses.ts";
import type { BundledPackage } from "./third-party-licenses.ts";

const PACKAGE_ROOT = /^(?<root>.*node_modules\/(?:@[^/]+\/)?[^/]+)\//u;

const EMBEDDED = ["../../packages/browser-audit/node_modules/axe-core"];

const LICENSE_FILE = /^(?:licen[cs]e|copying|notice)(?:[.-]|$)/iu;

const Manifest = Schema.Struct({
  license: Schema.optional(Schema.String),
  name: Schema.String,
  version: Schema.String,
});

const packageRoots = (inputs: readonly string[]): readonly string[] => [
  ...new Set(
    inputs.flatMap((input) => {
      const root = PACKAGE_ROOT.exec(input)?.groups?.root;

      return root === undefined ? [] : [root];
    })
  ),
];

const readPackage = Effect.fn("readPackage")(function* readPackage(
  root: string
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.resolve(bundleOptions.absWorkingDir ?? "", root);

  const manifest = yield* fileSystem
    .readFileString(path.join(directory, "package.json"))
    .pipe(Effect.flatMap(Schema.decodeEffect(Schema.fromJsonString(Manifest))));

  const licenseFiles = (yield* fileSystem.readDirectory(directory))
    .filter((name) => LICENSE_FILE.test(name))
    .toSorted();

  const readText = (name: string) =>
    fileSystem.readFileString(path.join(directory, name));

  const texts = yield* pipe(licenseFiles, Effect.forEach(readText));

  const bundled: BundledPackage = {
    license: manifest.license ?? "unknown",
    name: manifest.name,
    texts,
    version: manifest.version,
  };

  return bundled;
});

const program = Effect.gen(function* bundle() {
  const fileSystem = yield* FileSystem.FileSystem;

  const result = yield* Effect.tryPromise(
    build.bind(undefined, { ...bundleOptions, metafile: true })
  );

  const metafile = yield* Effect.fromNullishOr(result.metafile);

  const packages = yield* Effect.forEach(
    [...packageRoots(Object.keys(metafile.inputs)), ...EMBEDDED],
    readPackage
  );

  yield* fileSystem.writeFileString(LICENSES_PATH, renderLicenses(packages));
  yield* Console.log(`bundled ${BUNDLE_PATH} and ${LICENSES_PATH}`);
}).pipe(Effect.provide(NodeServices.layer));

NodeRuntime.runMain(program);
