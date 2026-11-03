import { Result, Schema } from "effect";

import { FactSchema, MalformedFact } from "./fact.js";
import type { Fact } from "./fact.js";

export const BULLET_KEYS = [
  "claim",
  "field",
  "value",
  "source",
  "excerpt",
  "retrieved",
  "used_by",
  "status",
  "verifier_note",
] as const;

type BulletKey = (typeof BULLET_KEYS)[number];

const FACT_HEADING = /^### (?<heading>.+?)\s*$/u;

const ANY_HEADING = /^#{1,6} /u;

const BULLET = /^- (?<key>[a-z_]+):(?: (?<text>.*))?$/u;

const CONTINUATION = /^ {2,}\S/u;

const decodeFact = Schema.decodeUnknownResult(FactSchema);

interface Block {
  readonly heading: string;
  readonly lines: readonly string[];
}

const blocksOf = (text: string): Block[] => {
  const blocks: { heading: string; lines: string[] }[] = [];
  let open: { heading: string; lines: string[] } | undefined;

  for (const line of text.split(/\r?\n/u)) {
    const heading = FACT_HEADING.exec(line)?.groups?.heading;

    if (heading !== undefined) {
      open = { heading, lines: [] };
      blocks.push(open);
    } else if (ANY_HEADING.test(line)) {
      open = undefined;
    } else if (open !== undefined) {
      open.lines.push(line);
    }
  }

  return blocks;
};

const bulletsOf = (
  block: Block
): Result.Result<Map<BulletKey, string>, string> => {
  const values = new Map<BulletKey, string>();
  let last: BulletKey | undefined;

  for (const line of block.lines) {
    if (line.trim() === "") {
      continue;
    }

    const bullet = BULLET.exec(line);

    if (bullet === null) {
      if (last !== undefined && CONTINUATION.test(line)) {
        values.set(last, `${values.get(last) ?? ""} ${line.trim()}`);
        continue;
      }

      if (values.size === BULLET_KEYS.length) {
        break;
      }

      return Result.fail(`unexpected line "${line.trim().slice(0, 60)}"`);
    }

    const expected = BULLET_KEYS[values.size];

    if (expected === undefined) {
      return Result.fail(`extra bullet "${bullet.groups?.key ?? ""}"`);
    }

    if (bullet.groups?.key !== expected) {
      return Result.fail(
        `expected the "${expected}" bullet, found "${bullet.groups?.key ?? ""}"`
      );
    }

    values.set(expected, (bullet.groups.text ?? "").trim());
    last = expected;
  }

  const missing = BULLET_KEYS.find((key) => !values.has(key));

  return missing === undefined
    ? Result.succeed(values)
    : Result.fail(`missing the "${missing}" bullet`);
};

const factOf = (
  file: string,
  block: Block
): Result.Result<Fact, MalformedFact> => {
  const malformed = (problem: string) =>
    Result.fail(new MalformedFact({ file, heading: block.heading, problem }));

  const bullets = bulletsOf(block);

  if (Result.isFailure(bullets)) {
    return malformed(bullets.failure);
  }

  const read = (key: BulletKey) => bullets.success.get(key) ?? "";

  const decoded = decodeFact({
    claim: read("claim"),
    excerpt: read("excerpt"),
    field: read("field"),
    file,
    id: block.heading,
    retrieved: read("retrieved"),
    source: read("source"),
    status: read("status"),
    usedBy: read("used_by"),
    value: read("value"),
    verifierNote: read("verifier_note"),
  });

  if (Result.isFailure(decoded)) {
    return malformed(decoded.failure.message.split("\n")[0] ?? "invalid");
  }

  const fact = decoded.success;

  return fact.status === "rejected" && fact.verifierNote === ""
    ? malformed("a rejected fact needs a verifier_note")
    : Result.succeed(fact);
};

export const parseLedgerFile = (
  file: string,
  text: string
): Result.Result<readonly Fact[], MalformedFact> => {
  const facts: Fact[] = [];

  for (const block of blocksOf(text)) {
    const fact = factOf(file, block);

    if (Result.isFailure(fact)) {
      return Result.fail(fact.failure);
    }

    facts.push(fact.success);
  }

  return Result.succeed(facts);
};

export interface LedgerFile {
  readonly file: string;
  readonly text: string;
}

export const parseLedger = (
  files: readonly LedgerFile[]
): Result.Result<readonly Fact[], MalformedFact> => {
  const facts: Fact[] = [];
  const seen = new Map<string, string>();

  for (const { file, text } of files) {
    const parsed = parseLedgerFile(file, text);

    if (Result.isFailure(parsed)) {
      return Result.fail(parsed.failure);
    }

    for (const fact of parsed.success) {
      const first = seen.get(fact.id);

      if (first !== undefined) {
        return Result.fail(
          new MalformedFact({
            file,
            heading: fact.id,
            problem: `the ID is also used in research/facts/${first}`,
          })
        );
      }

      seen.set(fact.id, file);
      facts.push(fact);
    }
  }

  return Result.succeed(facts);
};
