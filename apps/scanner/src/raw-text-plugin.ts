import type * as Cloudflare from "alchemy/Cloudflare";

type BuildPlugins = NonNullable<
  NonNullable<NonNullable<Cloudflare.WorkerProps["build"]>["input"]>["plugins"]
>;

const RAW = "?raw";

const withoutRaw = (id: string): string => id.slice(0, -RAW.length);

export const rawTextPlugin: BuildPlugins = {
  // @effect-diagnostics-next-line asyncFunction:off -- A Rolldown hook runs in the bundler, outside any Effect, and must return a Promise.
  async load(id) {
    if (!id.endsWith(RAW)) {
      return null;
    }

    const code = new TextDecoder().decode(
      await this.fs.readFile(withoutRaw(id))
    );

    return { code, moduleType: "text" };
  },
  name: "eaa-check:raw-text",
  // @effect-diagnostics-next-line asyncFunction:off -- A Rolldown hook runs in the bundler, outside any Effect, and must return a Promise.
  async resolveId(source, importer) {
    if (!source.endsWith(RAW)) {
      return null;
    }

    const resolved = await this.resolve(withoutRaw(source), importer);

    return resolved ? { id: `${resolved.id}${RAW}` } : null;
  },
};
