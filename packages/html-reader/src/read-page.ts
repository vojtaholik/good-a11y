import { MAX_ELEMENTS_PER_KIND, MAX_NAME, MAX_SNIPPET } from "@eaa-check/core";
import type {
  ControlEvidence,
  FrameEvidence,
  ImageEvidence,
  NamedEvidence,
  PageEvidence,
} from "@eaa-check/core";
import { constVoid } from "effect/Function";
import { Tokenizer } from "htmlparser2";
import type { TokenizerCallbacks } from "htmlparser2";

type Attributes = Map<string, string>;

interface NameRegion {
  readonly depth: number;
  readonly labelled: boolean;
  parts: string[];
  size: number;
  readonly snippet: string;
}

interface Reading {
  attributeName: string | undefined;
  attributeParts: string[];
  attributes: Attributes;
  readonly buttons: NamedEvidence[];
  button: NameRegion | undefined;
  readonly controls: ControlEvidence[];
  foreignFrom: number | undefined;
  readonly frames: FrameEvidence[];
  hiddenFrom: number | undefined;
  readonly images: ImageEvidence[];
  labelFrom: number | undefined;
  readonly labelTargets: string[];
  lang: string | null;
  link: NameRegion | undefined;
  readonly links: NamedEvidence[];
  readonly open: string[];
  readonly openCount: Map<string, number>;
  readonly refreshes: string[];
  sawHtml: boolean;
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
  "http-equiv",
  "id",
  "lang",
  "name",
  "placeholder",
  "role",
  "src",
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

const nameOf = (region: NameRegion): NamedEvidence => ({
  labelled: region.labelled,
  snippet: region.snippet,
  text: capped(collapse(region.parts.join("")), MAX_NAME),
});

const endLink = (reading: Reading) => {
  if (reading.link !== undefined) {
    keep(reading, reading.links, nameOf(reading.link));
    reading.link = undefined;
  }
};

const endButton = (reading: Reading) => {
  if (reading.button !== undefined) {
    keep(reading, reading.buttons, nameOf(reading.button));
    reading.button = undefined;
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

const isHidden = (attributes: Attributes): boolean =>
  attributes.has("hidden") ||
  (attributes.get("aria-hidden") ?? "").trim().toLowerCase() === "true";

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

const readElement = (reading: Reading, tag: string, attributes: Attributes) => {
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
    reading.link = regionOf(reading, tag, attributes);
  } else if (tag === "label") {
    const target = attribute(attributes, "for");

    reading.labelFrom ??= reading.open.length;

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

  if (tag === "a" || tag === "button") {
    closeNearest(reading, tag);
  }

  if (
    reading.hiddenFrom === undefined &&
    (SILENT.has(tag) || isHidden(attributes))
  ) {
    reading.hiddenFrom = reading.open.length;
  }

  if (reading.hiddenFrom === undefined) {
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

  reading.open.push(tag);
  reading.openCount.set(tag, (reading.openCount.get(tag) ?? 0) + 1);
};

const say = (reading: Reading, text: string) => {
  const top = reading.open.at(-1) ?? "";

  if (top === "title" && reading.title !== undefined && !reading.titleDone) {
    if (reading.title.length < MAX_NAME) {
      reading.title.push(text);
    }

    return;
  }

  if (reading.hiddenFrom === undefined && !NOT_TEXT.has(top)) {
    addName(reading, text);
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
  controls: [],
  foreignFrom: undefined,
  frames: [],
  hiddenFrom: undefined,
  images: [],
  labelFrom: undefined,
  labelTargets: [],
  lang: null,
  link: undefined,
  links: [],
  open: [],
  openCount: new Map(),
  refreshes: [],
  sawHtml: false,
  tag: "",
  title: undefined,
  titleDone: false,
  truncated: false,
  viewports: [],
});

export const readPage = (html: string): PageEvidence => {
  const reading = blank();
  const tokenizer = new Tokenizer({}, listenTo(html, reading));

  tokenizer.write(html);
  tokenizer.end();

  return {
    buttons: reading.buttons,
    controls: reading.controls,
    frames: reading.frames,
    images: reading.images,
    labelTargets: reading.labelTargets,
    lang: reading.lang === null ? null : capped(reading.lang, MAX_NAME),
    links: reading.links,
    refreshes: reading.refreshes,
    title:
      reading.title === undefined
        ? null
        : capped(collapse(reading.title.join("")), MAX_NAME),
    truncated: reading.truncated,
    viewports: reading.viewports,
  };
};
