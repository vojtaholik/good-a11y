import { Schema } from "effect";

export const MAX_ELEMENTS_PER_KIND = 5000;

export const MAX_SNIPPET = 160;

export const MAX_NAME = 200;

export const MAX_CONTEXT = 300;

export const MAX_TEXT_SAMPLE = 1200;

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

export const LinkEvidenceSchema = Schema.Struct({
  ...NamedEvidenceSchema.fields,
  context: Schema.String.check(Schema.isMaxLength(MAX_CONTEXT)),
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
  textSample: Schema.String.check(Schema.isMaxLength(MAX_TEXT_SAMPLE)),
  title: OptionalText,
  truncated: Schema.Boolean,
  viewports: Listed(Name),
});

export type PageEvidence = typeof PageEvidenceSchema.Type;
