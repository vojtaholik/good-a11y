import { Schema } from "effect";

export const MAX_ELEMENTS_PER_KIND = 5000;

export const MAX_SNIPPET = 160;

export const MAX_NAME = 200;

export const MAX_CONTEXT = 300;

export const MAX_TEXT_SAMPLE = 1200;

export const MAX_HREF = 500;

export const MAX_STRUCTURED_TYPES = 20;

const Snippet = Schema.String.check(Schema.isMaxLength(MAX_SNIPPET));

const Name = Schema.String.check(Schema.isMaxLength(MAX_NAME));

const OptionalText = Schema.NullOr(Name);

export const ImageEvidenceSchema = Schema.Struct({
  alt: OptionalText,
  file: OptionalText,
  kind: Schema.Literals(["img", "input-image"]),
  labelled: Schema.Boolean,
  presentational: Schema.Boolean,
  snippet: Snippet,
});

export type ImageEvidence = typeof ImageEvidenceSchema.Type;

export const ControlEvidenceSchema = Schema.Struct({
  autocomplete: OptionalText,
  id: OptionalText,
  insideLabel: Schema.Boolean,
  labelled: Schema.Boolean,
  snippet: Snippet,
});

export type ControlEvidence = typeof ControlEvidenceSchema.Type;

export const NamedEvidenceSchema = Schema.Struct({
  labelled: Schema.Boolean,
  snippet: Snippet,
  text: Name,
});

export type NamedEvidence = typeof NamedEvidenceSchema.Type;

export const LandmarkSchema = Schema.Literals([
  "nav",
  "header",
  "footer",
  "main",
  "aside",
]);

export type Landmark = typeof LandmarkSchema.Type;

export const LinkEvidenceSchema = Schema.Struct({
  ...NamedEvidenceSchema.fields,
  context: Schema.String.check(Schema.isMaxLength(MAX_CONTEXT)),
  href: Schema.String.check(Schema.isMaxLength(MAX_HREF)).annotate({
    description: "The href attribute as written, trimmed and capped",
  }),
  landmark: Schema.NullOr(LandmarkSchema).annotate({
    description:
      "The nearest landmark around the link, by tag or role; header and footer count only outside article, aside, main, nav and section",
  }),
  language: Schema.Boolean.annotate({
    description:
      "The link carries hreflang or lang, so it names a page in another language",
  }),
});

export type LinkEvidence = typeof LinkEvidenceSchema.Type;

export const HeadingEvidenceSchema = Schema.Struct({
  level: Schema.Int.check(Schema.isBetween({ maximum: 6, minimum: 1 })),
  text: Name,
});

export type HeadingEvidence = typeof HeadingEvidenceSchema.Type;

export const FrameEvidenceSchema = Schema.Struct({
  labelled: Schema.Boolean,
  snippet: Snippet,
});

export type FrameEvidence = typeof FrameEvidenceSchema.Type;

const Listed = <S extends Schema.Top>(item: S) =>
  Schema.Array(item).check(Schema.isMaxLength(MAX_ELEMENTS_PER_KIND));

export const PageEvidenceSchema = Schema.Struct({
  buttons: Listed(NamedEvidenceSchema),
  controls: Listed(ControlEvidenceSchema),
  frames: Listed(FrameEvidenceSchema),
  headings: Listed(HeadingEvidenceSchema),
  images: Listed(ImageEvidenceSchema),
  labelTargets: Listed(Name),
  labels: Listed(Name),
  lang: OptionalText,
  links: Listed(LinkEvidenceSchema),
  refreshes: Listed(Name),
  search: Schema.Boolean.annotate({
    description:
      "The page has a search: a search element, role=search or an input of type search",
  }),
  structuredTypes: Schema.Array(Name)
    .check(Schema.isMaxLength(MAX_STRUCTURED_TYPES))
    .annotate({
      description:
        "schema.org types named in JSON-LD @type or microdata itemtype, without the schema.org prefix",
    }),
  textSample: Schema.String.check(Schema.isMaxLength(MAX_TEXT_SAMPLE)),
  title: OptionalText,
  truncated: Schema.Boolean,
  viewports: Listed(Name),
});

export type PageEvidence = typeof PageEvidenceSchema.Type;
