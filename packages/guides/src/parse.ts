import { verifiedFact } from "@eaa-check/facts";
import { Result, Schema } from "effect";
import { parse as parseYaml } from "yaml";

import { GuideFrontmatterSchema, MalformedGuide } from "./guide.js";
import type { Guide, GuideFrontmatter } from "./guide.js";

export const GUIDE_FILES = [
  "guide.md",
  "demo.html",
  "expectations.md",
] as const;

export type GuideFile = (typeof GUIDE_FILES)[number];

export const MAX_GUIDE_TOKENS = 3000;

export interface GuideFolder {
  readonly category: string;
  readonly files: Partial<Record<GuideFile, string>>;
  readonly slug: string;
}

const FRONTMATTER = /^---\r?\n(?<yaml>[\s\S]*?)\r?\n---\r?\n/u;

const FENCE = /^\s*(?:```|~~~)/u;

const HEADING = /^#{1,6}\s+(?<text>.+?)\s*#*\s*$/u;

const LINKS = [
  /\[[^\]\n]*\]\([^)\n]*\)/u,
  /\[[^\]\n]*\]\[[^\]\n]*\]/u,
  /^\s*\[[^\]\n]+\]:\s*\S/u,
  /https?:\/\//iu,
  /\bwww\.[a-z\d-]+\.[a-z]/iu,
];

const decodeFrontmatter = Schema.decodeUnknownResult(GuideFrontmatterSchema);

export const estimateTokens = (text: string): number =>
  Math.ceil(text.length / 4);

const proseLines = (body: string): string[] => {
  const lines: string[] = [];
  let fenced = false;

  for (const line of body.split(/\r?\n/u)) {
    if (FENCE.test(line)) {
      fenced = !fenced;
    } else if (!fenced) {
      lines.push(line);
    }
  }

  return lines;
};

const parseFrontmatter = (
  yaml: string
): Result.Result<GuideFrontmatter, string> => {
  let value: unknown = undefined;

  try {
    value = parseYaml(yaml, { maxAliasCount: 0 });
  } catch (error) {
    return Result.fail(`frontmatter is not YAML (${String(error)})`);
  }

  const decoded = decodeFrontmatter(value);

  return Result.isFailure(decoded)
    ? Result.fail(`frontmatter: ${decoded.failure.message}`)
    : Result.succeed(decoded.success);
};

export const parseGuide = (
  folder: GuideFolder
): Result.Result<Guide, MalformedGuide> => {
  const guide = `${folder.category}/${folder.slug}`;

  const fail = (problem: string) =>
    Result.fail(new MalformedGuide({ guide, problem }));

  const missing = GUIDE_FILES.filter(
    (file) => folder.files[file] === undefined
  );

  if (missing.length > 0) {
    return fail(`missing ${missing.join(", ")}`);
  }

  const text = folder.files["guide.md"] ?? "";
  const demo = folder.files["demo.html"] ?? "";
  const expectations = folder.files["expectations.md"] ?? "";

  if (!/^[a-z\d]+(?:-[a-z\d]+)*$/u.test(folder.category)) {
    return fail("the category folder must be kebab-case");
  }

  if (!/^[a-z\d]+(?:-[a-z\d]+)*$/u.test(folder.slug)) {
    return fail("the guide folder must be kebab-case");
  }

  const frontmatter = FRONTMATTER.exec(text);

  if (frontmatter?.groups?.yaml === undefined) {
    return fail("guide.md must start with a --- frontmatter block");
  }

  const decoded = parseFrontmatter(frontmatter.groups.yaml);

  if (Result.isFailure(decoded)) {
    return fail(decoded.failure);
  }

  const meta = decoded.success;

  if (meta.category !== undefined && meta.category !== folder.category) {
    return fail(
      `frontmatter category "${meta.category}" is not its folder "${folder.category}"`
    );
  }

  const unverified = meta.criteria.filter(
    (id) => verifiedFact(id) === undefined
  );

  if (unverified.length > 0) {
    return fail(
      `criteria ${unverified.join(", ")} are not verified facts in research/facts/standards.md`
    );
  }

  const tokens = estimateTokens(text);

  if (tokens > MAX_GUIDE_TOKENS) {
    return fail(
      `guide.md is about ${tokens} tokens (characters / 4); the cap is ${MAX_GUIDE_TOKENS}`
    );
  }

  const prose = proseLines(text.slice(frontmatter[0].length));
  const linked = prose.find((line) => LINKS.some((link) => link.test(line)));

  if (linked !== undefined) {
    return fail(
      `guide.md must be self-contained, with no links outside code blocks: "${linked.trim().slice(0, 80)}"`
    );
  }

  if (demo.trim() === "") {
    return fail("demo.html is empty");
  }

  if (expectations.trim() === "") {
    return fail("expectations.md is empty");
  }

  const headings = prose.flatMap((line) => {
    const heading = HEADING.exec(line)?.groups?.text;

    return heading === undefined ? [] : [heading];
  });

  return Result.succeed({
    category: folder.category,
    criteria: meta.criteria,
    demo,
    description: meta.description,
    expectations,
    headings,
    id: folder.slug,
    name: meta.name,
    text,
  });
};

export const parseGuides = (
  folders: readonly GuideFolder[]
): Result.Result<Guide[], MalformedGuide> => {
  const guides: Guide[] = [];
  const seen = new Map<string, string>();

  for (const folder of folders) {
    const parsed = parseGuide(folder);

    if (Result.isFailure(parsed)) {
      return Result.fail(parsed.failure);
    }

    const other = seen.get(parsed.success.id);

    if (other !== undefined) {
      return Result.fail(
        new MalformedGuide({
          guide: `${folder.category}/${folder.slug}`,
          problem: `its id "${parsed.success.id}" is also guides/${other}; a guide id is its folder name and must be unique`,
        })
      );
    }

    seen.set(parsed.success.id, `${folder.category}/${folder.slug}`);
    guides.push(parsed.success);
  }

  return Result.succeed(guides.toSorted((a, b) => a.id.localeCompare(b.id)));
};
