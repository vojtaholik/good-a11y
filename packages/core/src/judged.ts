import { Schema } from "effect";

import { criterion } from "./catalogue.js";
import { MAX_SAMPLES } from "./check.js";
import { FindingReferenceSchema, referencesFor } from "./finding-reference.js";
import { JUDGE_MODEL, JUDGE_MODEL_NAME, Probability } from "./judge.js";
import type { Answer, JudgeReply, JudgeRequest, Question } from "./judge.js";
import type { Landmark, LinkEvidence, PageEvidence } from "./page-evidence.js";
import { REFERENCE } from "./reference.js";
import type { Reference } from "./reference.js";
import type { RenderedEvidence } from "./rendered-evidence.js";

export const MAX_JUDGED_ITEMS = 20;

export const MIN_LANGUAGE_SAMPLE = 200;

const CHARACTERS_PER_TOKEN = 3;

const MAX_SNIPPET = 160;

const TOKENS_PER_QUESTION = 40;

const TOKENS_PER_CALL = 300;

export const JudgedIdSchema = Schema.Literals([
  "alt-text-describes",
  "link-purpose",
  "headings-labels-describe",
  "passage-language-marked",
  "page-language-matches",
  "sells-to-consumers",
  "statement-annex-v",
  "visual-headings-marked",
]);

export type JudgedId = typeof JudgedIdSchema.Type;

export const NOTE_AT = {
  "alt-text-describes": 0.7,
  "headings-labels-describe": 0.7,
  "link-purpose": 0.9,
  "page-language-matches": 0.8,
  "passage-language-marked": 0.8,
  "sells-to-consumers": 0.85,
  "statement-annex-v": 0.8,
  "visual-headings-marked": 0.6,
} as const satisfies Record<JudgedId, number>;

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const JudgedNoteSchema = Schema.Struct({
  confidence: Probability,
  item: Schema.String.annotate({
    description: "The key of the item the note is about",
  }),
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

export interface JudgedPages {
  readonly entered: PageEvidence;
  readonly rendered: RenderedEvidence | null;
  readonly statement: PageEvidence | null;
}

export interface JudgedCheck {
  readonly about: string;
  readonly ask: (pages: JudgedPages) => Asked | null;
  readonly criteria: readonly string[];
  readonly decide: (asked: Asked, reply: JudgeReply) => readonly JudgedNote[];
  readonly id: JudgedId;
  readonly shown: boolean;
  readonly title: string;
}

const quoted = (text: string): string => JSON.stringify(text);

const capped = (text: string, most: number): string =>
  text.length > most ? text.slice(0, most) : text;

const distinctFirstAll = <T>(
  items: readonly T[],
  keyOf: (item: T) => string
): T[] => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = keyOf(item);
    const fresh = !seen.has(key);

    seen.add(key);

    return fresh;
  });
};

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
        ? [{ confidence: rounded(1 - yes), item: key, sample }]
        : [];
    });

const notedWhereYes =
  (noteAt: number) =>
  (asked: Asked, reply: JudgeReply): readonly JudgedNote[] =>
    asked.items.flatMap(({ key, sample }) => {
      const yes = noulAnswer(reply.answers[key]);

      return yes !== null && yes >= noteAt
        ? [{ confidence: rounded(yes), item: key, sample }]
        : [];
    });

const altTextDescribes: JudgedCheck = {
  about:
    "The model read the alt text and the image's file name, not the image, and judged that the alt text does not describe what the image shows or what it is for.",
  ask: ({ entered: evidence }) => {
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
  shown: false,
  title: "Alt text that may not describe its image",
};

const SHORT_LINK_WORDS = 2;

const wordsIn = (text: string): number =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/u).length;

const PAGE_FURNITURE: ReadonlySet<Landmark> = new Set([
  "footer",
  "header",
  "nav",
]);

const contentFirst = (link: LinkEvidence): number => {
  if (link.landmark === "main") {
    return 0;
  }

  return link.landmark === null ? 1 : 2;
};

const linkPurpose: JudgedCheck = {
  about:
    "The model read short link texts in the page content with the sentence, list item or cell around them and judged that the link's purpose is not clear from them.",
  ask: ({ entered: evidence }) => {
    const links = distinctFirst(
      evidence.links
        .filter(
          (link) =>
            !link.labelled &&
            !link.language &&
            (link.landmark === null || !PAGE_FURNITURE.has(link.landmark)) &&
            wordsIn(link.text) > 0 &&
            wordsIn(link.text) <= SHORT_LINK_WORDS
        )
        .toSorted((one, other) => contentFirst(one) - contentFirst(other)),
      (link) => link.text.trim().toLowerCase()
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
  shown: true,
  title: "Links whose purpose may be unclear",
};

const MAX_JUDGED_LABELS = 8;

const headingsLabelsDescribe: JudgedCheck = {
  about:
    "The model read each heading and form label on its own and judged that it does not describe a topic or say what to enter.",
  ask: ({ entered: evidence }) => {
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
  shown: false,
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

const notDeclaredNote = (
  item: Item,
  answer: Answer | undefined,
  noteAt: number
): JudgedNote[] => {
  const declared = item.expected;

  if (answer?.type !== "choice" || declared === undefined) {
    return [];
  }

  const notDeclared = 1 - (answer.probabilities[declared] ?? 0);

  return notDeclared >= noteAt && answer.choice !== declared
    ? [
        {
          confidence: rounded(notDeclared),
          item: item.key,
          sample: `${item.sample}, text reads as ${EU_LANGUAGES.get(answer.choice) ?? answer.choice}`,
        },
      ]
    : [];
};

const pageLanguageMatches: JudgedCheck = {
  about:
    "The model read the start of the page's text and judged that it is not written in the language the page declares in its lang attribute.",
  ask: ({ entered: evidence }) => {
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
    const [item] = asked.items;

    return item === undefined
      ? []
      : notDeclaredNote(
          item,
          reply.answers[LANGUAGE_KEY],
          NOTE_AT["page-language-matches"]
        );
  },
  id: "page-language-matches",
  shown: true,
  title: "Declared page language may not match the text",
};

const passageLanguageMarked: JudgedCheck = {
  about:
    "The model read text blocks whose common words point to another language than the lang in force on them, and judged that the block is not written in that language, which its markup does not say.",
  ask: ({ rendered }) => {
    const foreign = rendered?.foreignBlocks ?? null;

    if (foreign === null) {
      return null;
    }

    const blocks = distinctFirst(
      foreign.blocks.flatMap((block) => {
        const declared = declaredLanguage(block.lang);

        const name =
          declared === null || declared === "other"
            ? undefined
            : EU_LANGUAGES.get(declared);

        return name === undefined ? [] : [{ name, text: block.text }];
      }),
      ({ text }) => text
    );

    const entries = blocks.map(({ name, text }, index) => ({
      key: `block_${index + 1}`,
      question: noul(
        `Is most of Block ${index + 1} written in ${name}? Names of people, places, products and brands do not count.`
      ),
      sample: `${quoted(capped(text, MAX_SNIPPET))} marked as ${name}`,
    }));

    return askedOf(
      "passage-language-marked",
      [
        "Text blocks from a rendered web page.",
        ...blocks.map(
          ({ text }, index) =>
            `Block ${index + 1}: ${quoted(capped(text, MAX_SNIPPET))}.`
        ),
      ].join("\n"),
      entries
    );
  },
  criteria: ["3.1.2"],
  decide: notedWhereNo(NOTE_AT["passage-language-marked"]),
  id: "passage-language-marked",
  shown: true,
  title: "Passages that may be in another language than marked",
};

const SHOPPING_LINK =
  /(?<!\p{L})(?:cart|basket|checkout|košík|kosik|pokladn|warenkorb|kasse|panier|carrito|carrello|winkelwagen|winkelmand|koszyk|kosár|indkøbskurv|handlekurv|varukorg|ostoskori|ostukorv|grozs|krepšel|coș|καλάθι|кошница|carrinho|košarica|subscri|abonn|předplat|book|rezerv|buchen|réserv)/iu;

const MAX_SHOPPING_LINKS = 10;

const SELLS_KEY = "sells";

export const SELLS =
  "The site appears to sell goods or services to consumers online.";

export const DOES_NOT_SELL =
  "The site does not appear to sell goods or services to consumers online.";

const sellsToConsumers: JudgedCheck = {
  about:
    "The model read the page's title, the start of its text, prices, shopping links and schema.org types, and judged whether the site sells goods or services to consumers online.",
  ask: ({ entered: evidence }) => {
    const shopping = distinctFirst(
      evidence.links.filter(
        (link) => SHOPPING_LINK.test(link.text) || SHOPPING_LINK.test(link.href)
      ),
      (link) => link.text.trim().toLowerCase()
    ).slice(0, MAX_SHOPPING_LINKS);

    return askedOf(
      "sells-to-consumers",
      [
        "Evidence collected from the home page of a website.",
        `Title: ${quoted(evidence.title ?? "")}.`,
        `Start of the visible text: ${quoted(evidence.textSample)}.`,
        `Prices seen on the page: ${evidence.prices.length === 0 ? "none" : evidence.prices.map(quoted).join(", ")}.`,
        `Links that may lead to a cart, a checkout, a subscription or a booking: ${shopping.length === 0 ? "none" : shopping.map((link) => `${quoted(link.text)} (${quoted(link.href)})`).join(", ")}.`,
        `schema.org types: ${evidence.structuredTypes.length === 0 ? "none" : evidence.structuredTypes.join(", ")}.`,
      ].join("\n"),
      [
        {
          key: SELLS_KEY,
          question: noul(
            "Does this website let consumers buy, order, book or subscribe to goods or services online, so that a contract with a consumer is concluded through the site? Answer no for sites that only inform, publish news, or sell only to businesses."
          ),
          sample: evidence.title ?? "",
        },
      ]
    );
  },
  criteria: [],
  decide: (asked, reply) => {
    const yes = noulAnswer(reply.answers[SELLS_KEY]);
    const noteAt = NOTE_AT["sells-to-consumers"];

    if (yes === null) {
      return [];
    }

    if (yes >= noteAt) {
      return [{ confidence: rounded(yes), item: SELLS_KEY, sample: SELLS }];
    }

    return 1 - yes >= noteAt
      ? [
          {
            confidence: rounded(1 - yes),
            item: SELLS_KEY,
            sample: DOES_NOT_SELL,
          },
        ]
      : [];
  },
  id: "sells-to-consumers",
  shown: true,
  title: "Whether the site sells to consumers online",
};

const MAX_STATEMENT_TEXT = 6000;

const MIN_STATEMENT_TEXT = 300;

const ANNEX_V_POINTS = [
  {
    key: "statement_1",
    question:
      "Does the text give a general description of the service the website offers, such as what can be bought, booked or used on it?",
    sample: "Annex V 1(a): a general description of the service",
  },
  {
    key: "statement_2",
    question:
      "Does the text explain how the service works, such as how to find, order, pay for or use what it offers?",
    sample:
      "Annex V 1(b): descriptions and explanations needed to understand how the service operates",
  },
  {
    key: "statement_3",
    question:
      "Does the text describe how the service meets accessibility requirements, such as the standard it follows, how far it conforms, what is not yet accessible and what is being done about it?",
    sample:
      "Annex V 1(c): a description of how the service meets the accessibility requirements",
  },
] as const;

const statementText = (statement: PageEvidence): string =>
  capped(
    distinctFirstAll(
      statement.passages.filter(
        (passage) =>
          passage.landmark === null || !PAGE_FURNITURE.has(passage.landmark)
      ),
      (passage) => passage.text
    )
      .map((passage) => passage.text)
      .join("\n"),
    MAX_STATEMENT_TEXT
  );

const statementAnnexV: JudgedCheck = {
  about:
    "The model read the text of the page the site links to as its accessibility statement and judged that it does not contain a point Annex V asks a service provider to give.",
  ask: ({ statement }) => {
    const text = statement === null ? "" : statementText(statement);

    return text.length < MIN_STATEMENT_TEXT
      ? null
      : askedOf(
          "statement-annex-v",
          [
            "The text of the page a website links to as its accessibility statement.",
            text,
          ].join("\n"),
          ANNEX_V_POINTS.map(({ key, question, sample }) => ({
            key,
            question: noul(question),
            sample,
          }))
        );
  },
  criteria: [],
  decide: notedWhereNo(NOTE_AT["statement-annex-v"]),
  id: "statement-annex-v",
  shown: true,
  title:
    "Points of Annex V the model judged missing from the accessibility statement",
};

const MIN_HEADING_LETTERS = /\p{L}{3}/u;

const CURRENCY_WORDS =
  /(?<!\p{L})(?:EUR|CZK|PLN|RON|HUF|SEK|DKK|NOK|BGN|Kč|zł|lei|Ft|kr|лв)(?!\p{L})/giu;

const mayTitle = (text: string): boolean =>
  MIN_HEADING_LETTERS.test(text.replace(CURRENCY_WORDS, ""));

const visualHeadingsMarked: JudgedCheck = {
  about:
    "The model read short texts the page sets larger or bolder than its body text outside any heading element, with their markup, and judged that the text is the title of a section, so it would be marked up as a heading.",
  ask: ({ rendered }) => {
    const visual = rendered?.visualHeadings ?? null;

    if (visual === null) {
      return null;
    }

    const { bodyFontSize, candidates } = visual;

    const texts = distinctFirst(
      candidates.filter(({ text }) => mayTitle(text)),
      ({ text }) => text.trim().toLowerCase()
    );

    const entries = texts.map((text, index) => ({
      key: `text_${index + 1}`,
      question: noul(
        `Is Text ${index + 1} the title of a section of the page, the way a heading names the content below it? Answer no if it is a price, a product or teaser name inside a card, a slogan, a date, a number, an icon name, a button or link label, a notice, or part of a sentence.`
      ),
      sample: quoted(text.text),
    }));

    return askedOf(
      "visual-headings-marked",
      [
        `Short texts on a rendered web page that are not marked up as headings but are set larger or bolder than the body text (${bodyFontSize}px), each with its size, weight and the start of its HTML.`,
        ...texts.map(
          (text, index) =>
            `Text ${index + 1}: ${quoted(text.text)}; ${text.fontSize}px, weight ${text.fontWeight}; markup ${quoted(capped(text.snippet, MAX_SNIPPET))}.`
        ),
      ].join("\n"),
      entries
    );
  },
  criteria: ["1.3.1"],
  decide: notedWhereYes(NOTE_AT["visual-headings-marked"]),
  id: "visual-headings-marked",
  shown: true,
  title: "Text that may look like a heading but is not marked up as one",
};

export const JUDGED_CHECKS: readonly JudgedCheck[] = [
  altTextDescribes,
  linkPurpose,
  headingsLabelsDescribe,
  pageLanguageMatches,
  passageLanguageMarked,
  sellsToConsumers,
  statementAnnexV,
  visualHeadingsMarked,
];

export const SHOWN_JUDGED_CHECKS: readonly JudgedCheck[] = JUDGED_CHECKS.filter(
  (check) => check.shown
);

const SHOWN_IDS: ReadonlySet<JudgedId> = new Set(
  SHOWN_JUDGED_CHECKS.map((check) => check.id)
);

export const shownObservations = (
  observations: readonly Observation[]
): readonly Observation[] =>
  observations.filter((observation) => SHOWN_IDS.has(observation.id));

export const judgedCriteria = (): readonly string[] =>
  SHOWN_JUDGED_CHECKS.flatMap((check) => check.criteria);

export const questionsOf = (
  checks: readonly JudgedCheck[],
  pages: JudgedPages
): readonly Asked[] =>
  checks.flatMap((check) => {
    const asked = check.ask(pages);

    return asked === null ? [] : [asked];
  });

export const questionsFor = (pages: JudgedPages): readonly Asked[] =>
  questionsOf(SHOWN_JUDGED_CHECKS, pages);

export const tokensToReserve = (
  asked: readonly Pick<Asked, "request">[]
): number =>
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
  reference: Reference = REFERENCE,
  checks: readonly JudgedCheck[] = SHOWN_JUDGED_CHECKS
): Judged => ({
  inputTokens: answered.reduce(
    (total, { reply }) => total + reply.usage.input_tokens,
    0
  ),
  label: JUDGED_LABEL,
  model: JUDGE_MODEL,
  observations: checks.flatMap((check) => {
    const found = answered.find(({ asked }) => asked.id === check.id);

    return found === undefined ? [] : [observationOf(check, found, reference)];
  }),
  status: "ran",
});

export const judgedSkipped = (reason: string): Judged => ({
  reason,
  status: "skipped",
});
