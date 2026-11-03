import { Schema } from "effect";

import { criterion } from "./catalogue.js";
import { MAX_SAMPLES } from "./check.js";
import { FindingReferenceSchema, referencesFor } from "./finding-reference.js";
import { JUDGE_MODEL, JUDGE_MODEL_NAME, Probability } from "./judge.js";
import type { Answer, JudgeReply, JudgeRequest, Question } from "./judge.js";
import type { PageEvidence } from "./page-evidence.js";
import { REFERENCE } from "./reference.js";
import type { Reference } from "./reference.js";

export const MAX_JUDGED_ITEMS = 20;

export const MIN_LANGUAGE_SAMPLE = 200;

export const DAILY_JUDGE_TOKENS = 400_000;

const CHARACTERS_PER_TOKEN = 3;

const TOKENS_PER_QUESTION = 40;

const TOKENS_PER_CALL = 300;

export const JudgedIdSchema = Schema.Literals([
  "alt-text-describes",
  "link-purpose",
  "headings-labels-describe",
  "page-language-matches",
]);

export type JudgedId = typeof JudgedIdSchema.Type;

export const NOTE_AT = {
  "alt-text-describes": 0.7,
  "headings-labels-describe": 0.7,
  "link-purpose": 0.85,
  "page-language-matches": 0.8,
} as const satisfies Record<JudgedId, number>;

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const JudgedNoteSchema = Schema.Struct({
  confidence: Probability,
  sample: Schema.String,
});

export type JudgedNote = typeof JudgedNoteSchema.Type;

export const ObservationSchema = Schema.Struct({
  about: Schema.String,
  asked: Count,
  id: JudgedIdSchema,
  noted: Count,
  notes: Schema.Array(JudgedNoteSchema).check(Schema.isMaxLength(MAX_SAMPLES)),
  relatesTo: Schema.Array(FindingReferenceSchema),
  title: Schema.String,
});

export type Observation = typeof ObservationSchema.Type;

export const JudgedSchema = Schema.Union([
  Schema.Struct({
    inputTokens: Count,
    label: Schema.String,
    model: Schema.String,
    observations: Schema.Array(ObservationSchema),
    status: Schema.Literal("ran"),
  }),
  Schema.Struct({
    reason: Schema.String,
    status: Schema.Literal("skipped"),
  }),
]);

export type Judged = typeof JudgedSchema.Type;

export const JUDGED_LABEL = `Judged by a model (${JUDGE_MODEL_NAME}, ${JUDGE_MODEL}); it may be wrong. These observations are not counted with the automated checks above and no source backs them. A person should look at each one.`;

export const JUDGE_UNBOUND =
  "No decision model is connected to this scanner, so nothing was judged by a model.";

export const JUDGE_BUDGET_SPENT =
  "Today's budget for model-judged observations is spent. Try again tomorrow.";

export const JUDGE_FAILED =
  "The decision model did not answer, so nothing was judged by a model.";

export const JUDGE_NOT_CHECKED =
  "The page was not checked, so nothing was judged by a model.";

interface Item {
  readonly expected?: string;
  readonly key: string;
  readonly sample: string;
}

export interface Asked {
  readonly id: JudgedId;
  readonly items: readonly Item[];
  readonly request: JudgeRequest;
}

interface JudgedCheck {
  readonly about: string;
  readonly ask: (evidence: PageEvidence) => Asked | null;
  readonly criteria: readonly string[];
  readonly decide: (asked: Asked, reply: JudgeReply) => readonly JudgedNote[];
  readonly id: JudgedId;
  readonly title: string;
}

const quoted = (text: string): string => JSON.stringify(text);

const distinctFirst = <T>(
  items: readonly T[],
  keyOf: (item: T) => string
): T[] => {
  const seen = new Set<string>();
  const kept: T[] = [];

  for (const item of items) {
    const key = keyOf(item);

    if (kept.length < MAX_JUDGED_ITEMS && !seen.has(key)) {
      seen.add(key);
      kept.push(item);
    }
  }

  return kept;
};

const noul = (instructions: string): Question => ({
  instructions,
  type: "noul",
});

const askedOf = (
  id: JudgedId,
  state: string,
  entries: readonly (Item & { readonly question: Question })[]
): Asked | null =>
  entries.length === 0
    ? null
    : {
        id,
        items: entries.map(({ question: _question, ...item }) => item),
        request: {
          questions: Object.fromEntries(
            entries.map(({ key, question }) => [key, question])
          ),
          state,
        },
      };

const noulAnswer = (answer: Answer | undefined): number | null =>
  answer?.type === "noul" ? answer.noul : null;

const rounded = (probability: number): number =>
  Math.round(probability * 100) / 100;

const notedWhereNo =
  (noteAt: number) =>
  (asked: Asked, reply: JudgeReply): readonly JudgedNote[] =>
    asked.items.flatMap(({ key, sample }) => {
      const yes = noulAnswer(reply.answers[key]);

      return yes !== null && 1 - yes >= noteAt
        ? [{ confidence: rounded(1 - yes), sample }]
        : [];
    });

const altTextDescribes: JudgedCheck = {
  about:
    "The model read the alt text and the image's file name, not the image, and judged that the alt text does not describe what the image shows or what it is for.",
  ask: (evidence) => {
    const images = distinctFirst(
      evidence.images.filter(
        (image) =>
          !image.presentational && image.alt !== null && image.alt.trim() !== ""
      ),
      (image) => `${image.alt ?? ""}|${image.file ?? ""}`
    );

    const entries = images.map((image, index) => ({
      key: `image_${index + 1}`,
      question: noul(
        `Is the alt text of Image ${index + 1} a description of what the image shows or what it is for? Answer no if it is a file name, a placeholder, or only a generic word such as "image", "photo", "picture", "banner" or "icon".`
      ),
      sample: `alt=${quoted(image.alt ?? "")}${image.file === null ? "" : ` (file ${image.file})`}`,
    }));

    return askedOf(
      "alt-text-describes",
      [
        "Images on a web page, each with its alt text and file name.",
        ...images.map(
          (image, index) =>
            `Image ${index + 1}: alt text ${quoted(image.alt ?? "")}; file name ${quoted(image.file ?? "unknown")}.`
        ),
      ].join("\n"),
      entries
    );
  },
  criteria: ["1.1.1"],
  decide: notedWhereNo(NOTE_AT["alt-text-describes"]),
  id: "alt-text-describes",
  title: "Alt text that may not describe its image",
};

const SHORT_LINK_WORDS = 2;

const wordsIn = (text: string): number =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/u).length;

const linkPurpose: JudgedCheck = {
  about:
    "The model read short link texts with the sentence, list item or cell around them and judged that the link's purpose is not clear from them.",
  ask: (evidence) => {
    const links = distinctFirst(
      evidence.links.filter(
        (link) =>
          !link.labelled &&
          wordsIn(link.text) > 0 &&
          wordsIn(link.text) <= SHORT_LINK_WORDS
      ),
      (link) => `${link.text}|${link.context}`
    );

    const entries = links.map((link, index) => ({
      key: `link_${index + 1}`,
      question: noul(
        `Read Link ${index + 1}'s text together with its surrounding text. Is it clear from these alone where the link goes or what it does?`
      ),
      sample:
        link.context === ""
          ? quoted(link.text)
          : `${quoted(link.text)} in ${quoted(link.context)}`,
    }));

    return askedOf(
      "link-purpose",
      [
        "Links on a web page, each with its text and the text of the paragraph, list item or table cell it sits in (empty if none).",
        ...links.map(
          (link, index) =>
            `Link ${index + 1}: text ${quoted(link.text)}; surrounding text ${quoted(link.context)}.`
        ),
      ].join("\n"),
      entries
    );
  },
  criteria: ["2.4.4"],
  decide: notedWhereNo(NOTE_AT["link-purpose"]),
  id: "link-purpose",
  title: "Links whose purpose may be unclear",
};

const MAX_JUDGED_LABELS = 8;

const headingsLabelsDescribe: JudgedCheck = {
  about:
    "The model read each heading and form label on its own and judged that it does not describe a topic or say what to enter.",
  ask: (evidence) => {
    const labels = distinctFirst(
      evidence.labels.filter((label) => label.trim() !== ""),
      (label) => label
    ).slice(0, MAX_JUDGED_LABELS);

    const headings = distinctFirst(
      evidence.headings.filter((heading) => heading.text.trim() !== ""),
      (heading) => heading.text
    ).slice(0, MAX_JUDGED_ITEMS - labels.length);

    const entries = [
      ...headings.map((heading, index) => ({
        key: `heading_${index + 1}`,
        question: noul(
          `Does Heading ${index + 1} name a topic a reader can recognise? Answer no if it is filler, a placeholder, or only a generic word such as "Title", "Heading", "Section" or "Untitled".`
        ),
        sample: `h${heading.level} ${quoted(heading.text)}`,
      })),
      ...labels.map((label, index) => ({
        key: `label_${index + 1}`,
        question: noul(
          `Does Label ${index + 1} say what a person should enter or choose in its form field?`
        ),
        sample: `label ${quoted(label)}`,
      })),
    ];

    return askedOf(
      "headings-labels-describe",
      [
        "Headings and form field labels from a web page.",
        ...headings.map(
          (heading, index) =>
            `Heading ${index + 1} (level ${heading.level}): ${quoted(heading.text)}.`
        ),
        ...labels.map(
          (label, index) => `Label ${index + 1}: ${quoted(label)}.`
        ),
      ].join("\n"),
      entries
    );
  },
  criteria: ["2.4.6"],
  decide: notedWhereNo(NOTE_AT["headings-labels-describe"]),
  id: "headings-labels-describe",
  title: "Headings or labels that may not describe their topic",
};

const LANGUAGE_NAMES = {
  bg: "Bulgarian",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  es: "Spanish",
  et: "Estonian",
  fi: "Finnish",
  fr: "French",
  ga: "Irish",
  hr: "Croatian",
  hu: "Hungarian",
  it: "Italian",
  lt: "Lithuanian",
  lv: "Latvian",
  mt: "Maltese",
  nl: "Dutch",
  other: "Another language",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  sk: "Slovak",
  sl: "Slovenian",
  sv: "Swedish",
} as const satisfies Readonly<Record<string, string>>;

export const EU_LANGUAGES: ReadonlyMap<string, string> = new Map(
  Object.entries(LANGUAGE_NAMES)
);

const LANGUAGE_KEY = "language";

const declaredLanguage = (lang: string | null): string | null => {
  const primary = (lang ?? "").trim().toLowerCase().split("-")[0] ?? "";

  if (primary === "") {
    return null;
  }

  return EU_LANGUAGES.has(primary) ? primary : "other";
};

const pageLanguageMatches: JudgedCheck = {
  about:
    "The model read the start of the page's text and judged that it is not written in the language the page declares in its lang attribute.",
  ask: (evidence) => {
    const declared = declaredLanguage(evidence.lang);

    return declared === null || evidence.textSample.length < MIN_LANGUAGE_SAMPLE
      ? null
      : askedOf("page-language-matches", evidence.textSample, [
          {
            expected: declared,
            key: LANGUAGE_KEY,
            question: {
              criteria: LANGUAGE_NAMES,
              instructions: "Which language is most of this text written in?",
              type: "choice",
            },
            sample: `lang=${quoted(evidence.lang ?? "")}`,
          },
        ]);
  },
  criteria: ["3.1.1"],
  decide: (asked, reply) => {
    const answer = reply.answers[LANGUAGE_KEY];
    const [item] = asked.items;
    const declared = item?.expected;

    if (
      answer?.type !== "choice" ||
      item === undefined ||
      declared === undefined
    ) {
      return [];
    }

    const notDeclared = 1 - (answer.probabilities[declared] ?? 0);

    return notDeclared >= NOTE_AT["page-language-matches"] &&
      answer.choice !== declared
      ? [
          {
            confidence: rounded(notDeclared),
            sample: `${item.sample}, text reads as ${EU_LANGUAGES.get(answer.choice) ?? answer.choice}`,
          },
        ]
      : [];
  },
  id: "page-language-matches",
  title: "Declared page language may not match the text",
};

export const JUDGED_CHECKS: readonly JudgedCheck[] = [
  altTextDescribes,
  linkPurpose,
  headingsLabelsDescribe,
  pageLanguageMatches,
];

export const judgedCriteria = (): readonly string[] =>
  JUDGED_CHECKS.flatMap((check) => check.criteria);

export const questionsFor = (evidence: PageEvidence): readonly Asked[] =>
  JUDGED_CHECKS.flatMap((check) => {
    const asked = check.ask(evidence);

    return asked === null ? [] : [asked];
  });

export const tokensToReserve = (asked: readonly Asked[]): number =>
  asked.reduce(
    (total, { request }) =>
      total +
      TOKENS_PER_CALL +
      Object.keys(request.questions).length * TOKENS_PER_QUESTION +
      Math.ceil(JSON.stringify(request).length / CHARACTERS_PER_TOKEN),
    0
  );

export interface Answered {
  readonly asked: Asked;
  readonly reply: JudgeReply;
}

const observationOf = (
  check: JudgedCheck,
  { asked, reply }: Answered,
  reference: Reference
): Observation => {
  const notes = check.decide(asked, reply);

  return {
    about: check.about,
    asked: asked.items.length,
    id: check.id,
    noted: notes.length,
    notes: notes.slice(0, MAX_SAMPLES),
    relatesTo: referencesFor(check.criteria.map(criterion), reference),
    title: check.title,
  };
};

export const judgedOf = (
  answered: readonly Answered[],
  reference: Reference = REFERENCE
): Judged => ({
  inputTokens: answered.reduce(
    (total, { reply }) => total + reply.usage.input_tokens,
    0
  ),
  label: JUDGED_LABEL,
  model: JUDGE_MODEL,
  observations: JUDGED_CHECKS.flatMap((check) => {
    const found = answered.find(({ asked }) => asked.id === check.id);

    return found === undefined ? [] : [observationOf(check, found, reference)];
  }),
  status: "ran",
});

export const judgedSkipped = (reason: string): Judged => ({
  reason,
  status: "skipped",
});
