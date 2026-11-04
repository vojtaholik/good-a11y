import {
  MAX_CONTEXT,
  MAX_ELEMENTS_PER_KIND,
  MAX_HREF,
  MAX_NAME,
  MAX_SNIPPET,
  MAX_STRUCTURED_TYPES,
  MAX_TEXT_SAMPLE,
} from "@eaa-check/core";
import type {
  ControlEvidence,
  FrameEvidence,
  HeadingEvidence,
  ImageEvidence,
  Landmark,
  LinkEvidence,
  NamedEvidence,
  PageEvidence,
} from "@eaa-check/core";
import { constVoid } from "effect/Function";
import { Tokenizer } from "htmlparser2";
import type { TokenizerCallbacks } from "htmlparser2";

type Attributes = Map<string, string>;

interface NameRegion {
  readonly depth: number;
  labelled: boolean;
  parts: string[];
  size: number;
  readonly snippet: string;
}

interface TextRegion {
  readonly depth: number;
  parts: string[];
  size: number;
}

interface HeadingRegion extends TextRegion {
  readonly level: number;
}

interface LinkRegion extends NameRegion {
  readonly context: TextRegion | undefined;
  readonly href: string;
  readonly landmark: Landmark | null;
  readonly language: boolean;
}

interface PendingLink {
  readonly context: TextRegion | undefined;
  readonly evidence: NamedEvidence;
  readonly href: string;
  readonly landmark: Landmark | null;
  readonly language: boolean;
}

interface LandmarkRegion {
  readonly depth: number;
  readonly landmark: Landmark;
}

interface Reading {
  attributeName: string | undefined;
  attributeParts: string[];
  attributes: Attributes;
  readonly buttons: NamedEvidence[];
  button: NameRegion | undefined;
  readonly contexts: TextRegion[];
  readonly controls: ControlEvidence[];
  foreignFrom: number | undefined;
  readonly frames: FrameEvidence[];
  heading: HeadingRegion | undefined;
  readonly headings: HeadingEvidence[];
  hiddenFrom: number | undefined;
  readonly images: ImageEvidence[];
  jsonLdFrom: number | undefined;
  readonly jsonLd: string[];
  jsonLdSize: number;
  label: TextRegion | undefined;
  labelFrom: number | undefined;
  readonly labelTargets: string[];
  readonly labels: string[];
  readonly landmarks: LandmarkRegion[];
  lang: string | null;
  link: LinkRegion | undefined;
  readonly links: PendingLink[];
  readonly open: string[];
  readonly openCount: Map<string, number>;
  readonly refreshes: string[];
  readonly sample: string[];
  sampleSize: number;
  sawHtml: boolean;
  search: boolean;
  readonly structuredTypes: Set<string>;
  tag: string;
  title: string[] | undefined;
  titleDone: boolean;
  truncated: boolean;
  readonly viewports: string[];
}

const KEPT_ATTRIBUTES = new Set([
  "alt",
  "aria-disabled",
  "aria-hidden",
  "aria-label",
  "aria-labelledby",
  "autocomplete",
  "class",
  "content",
  "disabled",
  "for",
  "hidden",
  "href",
  "hreflang",
  "http-equiv",
  "id",
  "itemtype",
  "lang",
  "name",
  "placeholder",
  "role",
  "src",
  "style",
  "tabindex",
  "title",
  "type",
  "value",
]);

const SNIPPET_ATTRIBUTES = [
  "id",
  "class",
  "name",
  "type",
  "href",
  "src",
  "alt",
  "role",
  "aria-label",
  "title",
  "for",
  "autocomplete",
] as const;

const MAX_ATTRIBUTE_IN_SNIPPET = 40;

const MAX_STYLE = 1000;

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const CONTEXT_BLOCKS = new Set([
  "caption",
  "dd",
  "dt",
  "figcaption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "p",
  "td",
  "th",
]);

const HEADING = /^h(?<level>[1-6])$/u;

const FOREIGN = new Set(["math", "svg"]);

const SILENT = new Set(["noscript", "template"]);

const NOT_TEXT = new Set(["script", "style"]);

const NEVER_CLOSED_BY_ITS_TAG = new Set(["body", "html"]);

const PRESENTATIONAL = new Set(["none", "presentation"]);

const NOT_A_FIELD = new Set(["button", "hidden", "image", "reset", "submit"]);

const DEFAULT_BUTTON_TEXT = new Map([
  ["reset", "Reset"],
  ["submit", "Submit"],
]);

const LANDMARK_TAGS = new Map<string, Landmark>([
  ["aside", "aside"],
  ["main", "main"],
  ["nav", "nav"],
]);

const LANDMARK_ROLES = new Map<string, Landmark>([
  ["banner", "header"],
  ["complementary", "aside"],
  ["contentinfo", "footer"],
  ["main", "main"],
  ["navigation", "nav"],
]);

const SECTIONING = ["article", "aside", "main", "nav", "section"] as const;

const MAX_JSON_LD = 100_000;

const JSON_LD_TYPE =
  /"@type"\s*:\s*(?:"(?<one>[^"]{1,100})"|\[(?<many>[^\]]{0,1000})\])/gu;

const QUOTED = /"(?<value>[^"]{1,100})"/gu;

const SCHEMA_ORG = /^(?:https?:\/\/)?(?:www\.)?schema\.org\//iu;

const WHITESPACE = /\s+/gu;

const collapse = (text: string): string =>
  text.replaceAll(WHITESPACE, " ").trim();

const capped = (text: string, most: number): string =>
  text.length > most ? text.slice(0, most) : text;

const attribute = (attributes: Attributes, name: string): string | null =>
  attributes.get(name) ?? null;

const filled = (attributes: Attributes, name: string): boolean =>
  collapse(attributes.get(name) ?? "") !== "";

const labelledByAria = (attributes: Attributes): boolean =>
  filled(attributes, "aria-label") || filled(attributes, "aria-labelledby");

const snippetOf = (tag: string, attributes: Attributes): string => {
  const shown = SNIPPET_ATTRIBUTES.flatMap((name) => {
    const value = attributes.get(name);

    return value === undefined
      ? []
      : [
          `${name}="${capped(collapse(value), MAX_ATTRIBUTE_IN_SNIPPET).replaceAll('"', "&quot;")}"`,
        ];
  });

  return capped(
    `<${[tag, ...shown].join(" ")}>`.replaceAll(WHITESPACE, " "),
    MAX_SNIPPET
  );
};

const keep = <T>(reading: Reading, list: T[], item: T) => {
  if (list.length < MAX_ELEMENTS_PER_KIND) {
    list.push(item);
  } else {
    reading.truncated = true;
  }
};

const addName = (reading: Reading, text: string) => {
  for (const region of [reading.link, reading.button]) {
    if (region !== undefined && region.size < MAX_NAME * 2) {
      region.parts.push(text);
      region.size += text.length;
    }
  }
};

const addTo = (region: TextRegion | undefined, text: string, most: number) => {
  if (region !== undefined && region.size < most * 2) {
    region.parts.push(text);
    region.size += text.length;
  }
};

const addText = (reading: Reading, text: string) => {
  addName(reading, text);
  addTo(reading.heading, text, MAX_NAME);
  addTo(reading.label, text, MAX_NAME);
  addTo(reading.contexts.at(-1), text, MAX_CONTEXT);

  const words = collapse(text);

  if (words !== "" && reading.sampleSize < MAX_TEXT_SAMPLE) {
    reading.sample.push(words);
    reading.sampleSize += words.length + 1;
  }
};

const textOf = (region: TextRegion, most: number): string =>
  capped(collapse(region.parts.join("")), most);

const fileOf = (src: string | null): string | null => {
  if (src === null || src.trim().startsWith("data:")) {
    return null;
  }

  const path = src.split(/[?#]/u, 1)[0] ?? "";

  return capped(path.slice(path.lastIndexOf("/") + 1), MAX_NAME);
};

const nameOf = (region: NameRegion): NamedEvidence => ({
  labelled: region.labelled,
  snippet: region.snippet,
  text: capped(collapse(region.parts.join("")), MAX_NAME),
});

const endLink = (reading: Reading) => {
  if (reading.link !== undefined) {
    keep(reading, reading.links, {
      context: reading.link.context,
      evidence: nameOf(reading.link),
      href: reading.link.href,
      landmark: reading.link.landmark,
      language: reading.link.language,
    });
    reading.link = undefined;
  }
};

const endButton = (reading: Reading) => {
  if (reading.button !== undefined) {
    keep(reading, reading.buttons, nameOf(reading.button));
    reading.button = undefined;
  }
};

const endStructure = (reading: Reading, depth: number) => {
  while ((reading.landmarks.at(-1)?.depth ?? -1) >= depth) {
    reading.landmarks.pop();
  }

  if (reading.jsonLdFrom !== undefined && reading.jsonLdFrom >= depth) {
    reading.jsonLdFrom = undefined;
  }
};

const endRegions = (reading: Reading, depth: number) => {
  if (reading.link !== undefined && reading.link.depth >= depth) {
    endLink(reading);
  }

  if (reading.button !== undefined && reading.button.depth >= depth) {
    endButton(reading);
  }

  if (reading.labelFrom !== undefined && reading.labelFrom >= depth) {
    reading.labelFrom = undefined;
  }

  if (reading.label !== undefined && reading.label.depth >= depth) {
    keep(reading, reading.labels, textOf(reading.label, MAX_NAME));
    reading.label = undefined;
  }

  if (reading.heading !== undefined && reading.heading.depth >= depth) {
    keep(reading, reading.headings, {
      level: reading.heading.level,
      text: textOf(reading.heading, MAX_NAME),
    });
    reading.heading = undefined;
  }

  while ((reading.contexts.at(-1)?.depth ?? -1) >= depth) {
    reading.contexts.pop();
  }

  endStructure(reading, depth);

  if (reading.hiddenFrom !== undefined && reading.hiddenFrom >= depth) {
    reading.hiddenFrom = undefined;
  }

  if (reading.foreignFrom !== undefined && reading.foreignFrom >= depth) {
    reading.foreignFrom = undefined;
  }
};

const closeDownTo = (reading: Reading, depth: number) => {
  while (reading.open.length > depth) {
    const tag = reading.open.pop() ?? "";

    reading.openCount.set(tag, (reading.openCount.get(tag) ?? 1) - 1);

    if (tag === "title" && reading.title !== undefined) {
      reading.titleDone = true;
    }

    endRegions(reading, reading.open.length);
  }
};

const closeNearest = (reading: Reading, tag: string) => {
  if ((reading.openCount.get(tag) ?? 0) > 0) {
    closeDownTo(reading, reading.open.lastIndexOf(tag));
  }
};

const HIDDEN_STYLE =
  /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\s*(?:!important\s*)?(?:;|$)/iu;

const isHidden = (attributes: Attributes): boolean =>
  attributes.has("hidden") ||
  (attributes.get("aria-hidden") ?? "").trim().toLowerCase() === "true";

const isStyledHidden = (attributes: Attributes): boolean =>
  HIDDEN_STYLE.test(capped(attributes.get("style") ?? "", MAX_STYLE));

const readMeta = (reading: Reading, attributes: Attributes) => {
  const content = capped(attribute(attributes, "content") ?? "", MAX_NAME);
  const name = (attribute(attributes, "name") ?? "").trim().toLowerCase();

  const equiv = (attribute(attributes, "http-equiv") ?? "")
    .trim()
    .toLowerCase();

  if (name === "viewport") {
    keep(reading, reading.viewports, content);
  }

  if (equiv === "refresh") {
    keep(reading, reading.refreshes, content);
  }
};

const readImage = (reading: Reading, attributes: Attributes) => {
  const alt = attribute(attributes, "alt");

  keep(reading, reading.images, {
    alt: alt === null ? null : capped(alt, MAX_NAME),
    file: fileOf(attribute(attributes, "src")),
    kind: "img",
    labelled: labelledByAria(attributes) || filled(attributes, "title"),
    presentational: PRESENTATIONAL.has(
      (attribute(attributes, "role") ?? "").trim().toLowerCase()
    ),
    snippet: snippetOf("img", attributes),
  });

  if (alt !== null) {
    addName(reading, ` ${alt} `);
  }
};

const FIXED_VALUE = new Set(["checkbox", "file", "radio"]);

const takesAutofill = (attributes: Attributes, type: string): boolean =>
  !FIXED_VALUE.has(type) &&
  !attributes.has("disabled") &&
  (attribute(attributes, "aria-disabled") ?? "").trim().toLowerCase() !==
    "true" &&
  !(Number(attribute(attributes, "tabindex") ?? "0") < 0);

const autocompleteOf = (
  attributes: Attributes,
  type: string
): string | null => {
  const value = attribute(attributes, "autocomplete");

  return value === null || !takesAutofill(attributes, type)
    ? null
    : capped(collapse(value), MAX_NAME);
};

const readControl = (
  reading: Reading,
  tag: string,
  attributes: Attributes,
  type: string
) => {
  const id = attribute(attributes, "id");

  keep(reading, reading.controls, {
    autocomplete: autocompleteOf(attributes, type),
    id: id === null ? null : capped(id, MAX_NAME),
    insideLabel: reading.labelFrom !== undefined,
    labelled:
      labelledByAria(attributes) ||
      filled(attributes, "title") ||
      filled(attributes, "placeholder"),
    snippet: snippetOf(tag, attributes),
  });
};

const readInput = (reading: Reading, attributes: Attributes) => {
  const type = (attribute(attributes, "type") ?? "text").trim().toLowerCase();

  if (type === "hidden") {
    return;
  }

  if (type === "image") {
    const alt = attribute(attributes, "alt");

    keep(reading, reading.images, {
      alt: alt === null ? null : capped(alt, MAX_NAME),
      file: fileOf(attribute(attributes, "src")),
      kind: "input-image",
      labelled: labelledByAria(attributes) || filled(attributes, "title"),
      presentational: false,
      snippet: snippetOf("input", attributes),
    });

    return;
  }

  if (NOT_A_FIELD.has(type)) {
    keep(reading, reading.buttons, {
      labelled: labelledByAria(attributes) || filled(attributes, "title"),
      snippet: snippetOf("input", attributes),
      text: capped(
        collapse(
          attribute(attributes, "value") ?? DEFAULT_BUTTON_TEXT.get(type) ?? ""
        ),
        MAX_NAME
      ),
    });

    return;
  }

  readControl(reading, "input", attributes, type);
};

const regionOf = (
  reading: Reading,
  tag: string,
  attributes: Attributes
): NameRegion => ({
  depth: reading.open.length,
  labelled: labelledByAria(attributes) || filled(attributes, "title"),
  parts: [],
  size: 0,
  snippet: snippetOf(tag, attributes),
});

const openTextRegions = (reading: Reading, tag: string) => {
  const depth = reading.open.length;

  if (CONTEXT_BLOCKS.has(tag)) {
    reading.contexts.push({ depth, parts: [], size: 0 });
  }

  const level = HEADING.exec(tag)?.groups?.level;

  if (level !== undefined && reading.heading === undefined) {
    reading.heading = { depth, level: Number(level), parts: [], size: 0 };
  }
};

const addDescendantName = (
  reading: Reading,
  tag: string,
  attributes: Attributes
) => {
  if (tag.includes("-")) {
    for (const region of [reading.link, reading.button]) {
      if (region !== undefined) {
        region.labelled = true;
      }
    }
  }

  if (tag !== "a" && tag !== "button" && filled(attributes, "aria-label")) {
    addName(reading, ` ${attribute(attributes, "aria-label") ?? ""} `);
  }
};

const readElement = (reading: Reading, tag: string, attributes: Attributes) => {
  openTextRegions(reading, tag);
  addDescendantName(reading, tag, attributes);

  if (tag === "img") {
    readImage(reading, attributes);
  } else if (tag === "input") {
    readInput(reading, attributes);
  } else if (tag === "select" || tag === "textarea") {
    readControl(reading, tag, attributes, tag);
  } else if (tag === "button") {
    endButton(reading);
    reading.button = regionOf(reading, tag, attributes);
  } else if (tag === "a" && attributes.has("href")) {
    endLink(reading);
    reading.link = {
      ...regionOf(reading, tag, attributes),
      context: reading.contexts.at(-1),
      href: capped((attribute(attributes, "href") ?? "").trim(), MAX_HREF),
      landmark: reading.landmarks.at(-1)?.landmark ?? null,
      language: attributes.has("hreflang") || attributes.has("lang"),
    };
  } else if (tag === "label") {
    const target = attribute(attributes, "for");

    reading.labelFrom ??= reading.open.length;
    reading.label ??= { depth: reading.open.length, parts: [], size: 0 };

    if (target !== null && target.trim() !== "") {
      keep(reading, reading.labelTargets, capped(target.trim(), MAX_NAME));
    }
  } else if (tag === "iframe" || tag === "frame") {
    keep(reading, reading.frames, {
      labelled: labelledByAria(attributes) || filled(attributes, "title"),
      snippet: snippetOf(tag, attributes),
    });
  }
};

const insideSectioning = (reading: Reading): boolean =>
  SECTIONING.some((tag) => (reading.openCount.get(tag) ?? 0) > 0);

const landmarkOf = (
  reading: Reading,
  tag: string,
  attributes: Attributes
): Landmark | null => {
  const [role] = (attribute(attributes, "role") ?? "")
    .trim()
    .toLowerCase()
    .split(WHITESPACE);

  const byRole = LANDMARK_ROLES.get(role ?? "");

  if (byRole !== undefined) {
    return byRole;
  }

  if (role !== undefined && role !== "") {
    return null;
  }

  if ((tag === "header" || tag === "footer") && !insideSectioning(reading)) {
    return tag;
  }

  return LANDMARK_TAGS.get(tag) ?? null;
};

const addStructuredType = (reading: Reading, value: string) => {
  const type = capped(value.trim().replace(SCHEMA_ORG, ""), MAX_NAME);

  if (type !== "" && reading.structuredTypes.size < MAX_STRUCTURED_TYPES) {
    reading.structuredTypes.add(type);
  }
};

const readStructure = (
  reading: Reading,
  tag: string,
  attributes: Attributes
) => {
  const role = (attribute(attributes, "role") ?? "").trim().toLowerCase();
  const type = (attribute(attributes, "type") ?? "").trim().toLowerCase();

  if (
    tag === "search" ||
    role === "search" ||
    (tag === "input" && type === "search")
  ) {
    reading.search = true;
  }

  const itemtype = attribute(attributes, "itemtype");

  if (itemtype !== null) {
    for (const value of capped(itemtype, MAX_HREF).split(WHITESPACE)) {
      addStructuredType(reading, value);
    }
  }
};

const readJsonLd = (reading: Reading) => {
  const text = reading.jsonLd.join("");

  for (const match of text.matchAll(JSON_LD_TYPE)) {
    const { many, one } = match.groups ?? {};

    if (one !== undefined) {
      addStructuredType(reading, one);
    }

    for (const quoted of (many ?? "").matchAll(QUOTED)) {
      addStructuredType(reading, quoted.groups?.value ?? "");
    }
  }
};

const openStructure = (
  reading: Reading,
  tag: string,
  attributes: Attributes,
  depth: number
) => {
  const landmark = landmarkOf(reading, tag, attributes);

  if (landmark !== null) {
    reading.landmarks.push({ depth, landmark });
  }

  if (
    tag === "script" &&
    (attribute(attributes, "type") ?? "").trim().toLowerCase() ===
      "application/ld+json"
  ) {
    reading.jsonLdFrom = depth;
  }
};

const openElement = (reading: Reading, selfClosed: boolean) => {
  const { attributes, tag } = reading;
  const depth = reading.open.length;

  if (tag === "html" && !reading.sawHtml) {
    reading.sawHtml = true;
    reading.lang = attribute(attributes, "lang");
  }

  if (tag === "meta") {
    readMeta(reading, attributes);
  }

  readStructure(reading, tag, attributes);

  if (tag === "a" || tag === "button") {
    closeNearest(reading, tag);
  }

  if (
    reading.hiddenFrom === undefined &&
    (SILENT.has(tag) || isHidden(attributes))
  ) {
    reading.hiddenFrom = reading.open.length;
  }

  if (reading.hiddenFrom === undefined && !isStyledHidden(attributes)) {
    readElement(reading, tag, attributes);
  }

  if (
    tag === "title" &&
    reading.foreignFrom === undefined &&
    !reading.titleDone
  ) {
    reading.title = [];
  }

  if (FOREIGN.has(tag) && reading.foreignFrom === undefined) {
    reading.foreignFrom = depth;
  }

  if (VOID.has(tag) || (selfClosed && reading.foreignFrom !== undefined)) {
    endRegions(reading, reading.open.length);

    return;
  }

  openStructure(reading, tag, attributes, depth);
  reading.open.push(tag);
  reading.openCount.set(tag, (reading.openCount.get(tag) ?? 0) + 1);
};

const say = (reading: Reading, text: string) => {
  const top = reading.open.at(-1) ?? "";

  if (reading.jsonLdFrom !== undefined && reading.jsonLdSize < MAX_JSON_LD) {
    const part = capped(text, MAX_JSON_LD - reading.jsonLdSize);

    reading.jsonLd.push(part);
    reading.jsonLdSize += part.length;

    return;
  }

  if (top === "title" && reading.title !== undefined && !reading.titleDone) {
    if (reading.title.length < MAX_NAME) {
      reading.title.push(text);
    }

    return;
  }

  if (reading.hiddenFrom === undefined && !NOT_TEXT.has(top)) {
    addText(reading, text);
  }
};

const endAttribute = (reading: Reading) => {
  if (reading.attributeName !== undefined) {
    reading.attributes.set(
      reading.attributeName,
      reading.attributeParts.join("")
    );
  }

  reading.attributeName = undefined;
  reading.attributeParts = [];
};

const listenTo = (html: string, reading: Reading): TokenizerCallbacks => ({
  isInForeignContext: () => reading.foreignFrom !== undefined,
  onattribdata: (start, end) => {
    if (reading.attributeName !== undefined) {
      reading.attributeParts.push(html.slice(start, end));
    }
  },
  onattribend: () => {
    endAttribute(reading);
  },
  onattribentity: (codePoint) => {
    if (reading.attributeName !== undefined) {
      reading.attributeParts.push(String.fromCodePoint(codePoint));
    }
  },
  onattribname: (start, end) => {
    const name = html.slice(start, end).toLowerCase();

    reading.attributeName =
      KEPT_ATTRIBUTES.has(name) && !reading.attributes.has(name)
        ? name
        : undefined;
  },
  oncdata: constVoid,
  onclosetag: (start, end) => {
    const tag = html.slice(start, end).toLowerCase();

    if (!NEVER_CLOSED_BY_ITS_TAG.has(tag)) {
      closeNearest(reading, tag);
    }
  },
  oncomment: constVoid,
  ondeclaration: constVoid,
  onend: () => {
    closeDownTo(reading, 0);
    endLink(reading);
    endButton(reading);
  },
  onopentagend: () => {
    openElement(reading, false);
  },
  onopentagname: (start, end) => {
    reading.tag = html.slice(start, end).toLowerCase();
    reading.attributes = new Map();
  },
  onprocessinginstruction: constVoid,
  onselfclosingtag: () => {
    openElement(reading, true);
  },
  ontext: (start, end) => {
    say(reading, html.slice(start, end));
  },
  ontextentity: (codePoint) => {
    say(reading, String.fromCodePoint(codePoint));
  },
});

const blank = (): Reading => ({
  attributeName: undefined,
  attributeParts: [],
  attributes: new Map(),
  button: undefined,
  buttons: [],
  contexts: [],
  controls: [],
  foreignFrom: undefined,
  frames: [],
  heading: undefined,
  headings: [],
  hiddenFrom: undefined,
  images: [],
  jsonLd: [],
  jsonLdFrom: undefined,
  jsonLdSize: 0,
  label: undefined,
  labelFrom: undefined,
  labelTargets: [],
  labels: [],
  landmarks: [],
  lang: null,
  link: undefined,
  links: [],
  open: [],
  openCount: new Map(),
  refreshes: [],
  sample: [],
  sampleSize: 0,
  sawHtml: false,
  search: false,
  structuredTypes: new Set(),
  tag: "",
  title: undefined,
  titleDone: false,
  truncated: false,
  viewports: [],
});

const linkOf = ({
  context,
  evidence,
  href,
  landmark,
  language,
}: PendingLink): LinkEvidence => ({
  ...evidence,
  context: context === undefined ? "" : textOf(context, MAX_CONTEXT),
  href,
  landmark,
  language,
});

export const readPage = (html: string): PageEvidence => {
  const reading = blank();
  const tokenizer = new Tokenizer({}, listenTo(html, reading));

  tokenizer.write(html);
  tokenizer.end();
  readJsonLd(reading);

  return {
    buttons: reading.buttons,
    controls: reading.controls,
    frames: reading.frames,
    headings: reading.headings,
    images: reading.images,
    labelTargets: reading.labelTargets,
    labels: reading.labels,
    lang: reading.lang === null ? null : capped(reading.lang, MAX_NAME),
    links: reading.links.map(linkOf),
    refreshes: reading.refreshes,
    search: reading.search,
    structuredTypes: [...reading.structuredTypes],
    textSample: capped(reading.sample.join(" "), MAX_TEXT_SAMPLE),
    title:
      reading.title === undefined
        ? null
        : capped(collapse(reading.title.join("")), MAX_NAME),
    truncated: reading.truncated,
    viewports: reading.viewports,
  };
};
