import { Result, Schema } from "effect";

const Text = Schema.String;

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

const Size = Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0));

const Capped = <S extends Schema.Top>(item: S, most: number) =>
  Schema.Array(item).check(Schema.isMaxLength(most));

export const VisualHeadingSchema = Schema.Struct({
  fontSize: Size,
  fontWeight: Size,
  snippet: Text,
  text: Text,
});

export const VisualHeadingsSchema = Schema.Struct({
  bodyFontSize: Size.annotate({
    description: "The font size that holds the most text on the page",
  }),
  candidates: Capped(VisualHeadingSchema, 20).annotate({
    description:
      "Short blocks outside heading elements set larger than body text, or bold at body size and alone on their line",
  }),
  headings: Count.annotate({
    description: "Elements that are headings: h1 to h6 or role=heading",
  }),
});

export const FieldInstructionSchema = Schema.Struct({
  describedBy: Text,
  form: Schema.Int,
  label: Text,
  nearby: Text.annotate({
    description:
      "Text of the field's container two levels up, without its label",
  }),
  placeholder: Text,
  required: Schema.Boolean,
  snippet: Text,
  type: Text,
});

export const FormInstructionsSchema = Schema.Struct({
  fields: Capped(FieldInstructionSchema, 40),
});

export const ForeignBlockSchema = Schema.Struct({
  guess: Text.annotate({
    description: "The EU language whose common words the block uses most",
  }),
  hits: Count,
  lang: Text.annotate({
    description: "The lang in force on the block, from it or an ancestor",
  }),
  snippet: Text,
  text: Text,
});

export const ForeignBlocksSchema = Schema.Struct({
  blocks: Capped(ForeignBlockSchema, 15),
  pageLang: Text,
});

export const FormSkipSchema = Schema.Literals([
  "search",
  "password",
  "payment",
  "no_fields",
  "over_cap",
]);

export const ListedFormSchema = Schema.Struct({
  index: Schema.Int,
  skipped: Schema.NullOr(FormSkipSchema),
  snippet: Text,
});

export const InvalidFieldSchema = Schema.Struct({
  ariaInvalid: Schema.Boolean,
  describedBy: Text,
  label: Text,
  native: Schema.NullOr(Text).annotate({
    description:
      "The browser's own validation message, which the site did not write",
  }),
  snippet: Text,
});

export const AppearedTextSchema = Schema.Struct({
  inForm: Schema.Boolean,
  live: Schema.Boolean,
  snippet: Text,
  text: Text,
});

export const SubmissionSchema = Schema.Struct({
  blocked: Capped(Text, 5),
  blockedCount: Count.annotate({
    description:
      "Requests the page tried to send after the submit; all were aborted",
  }),
  errors: Schema.NullOr(
    Schema.fromJsonString(
      Schema.Struct({
        invalid: Capped(InvalidFieldSchema, 40),
        messages: Capped(AppearedTextSchema, 10),
      })
    )
  ).annotate({
    description:
      "Null when the page left after the submit or the read failed; the forms before it keep theirs",
  }),
  index: Count,
  left: Schema.Boolean.annotate({
    description:
      "The page was at another address after the submit, so no later form was submitted",
  }),
  submitted: Schema.NullOr(
    Schema.fromJsonString(Schema.Struct({ submitted: Schema.Boolean }))
  ),
});

export const EmptySubmitsSchema = Schema.Struct({
  forms: Schema.fromJsonString(Capped(ListedFormSchema, 9)),
  submissions: Capped(SubmissionSchema, 3),
});

const fromJson = <S extends Schema.Top>(schema: S) =>
  Schema.NullOr(Schema.fromJsonString(schema));

const RenderedEvidenceJson = Schema.Struct({
  emptySubmits: Schema.NullOr(EmptySubmitsSchema),
  foreignBlocks: fromJson(ForeignBlocksSchema),
  formInstructions: fromJson(FormInstructionsSchema),
  visualHeadings: fromJson(VisualHeadingsSchema),
});

export const RenderedEvidenceSchema = Schema.Struct({
  emptySubmits: Schema.NullOr(Schema.toType(EmptySubmitsSchema)),
  foreignBlocks: Schema.NullOr(ForeignBlocksSchema),
  formInstructions: Schema.NullOr(FormInstructionsSchema),
  visualHeadings: Schema.NullOr(VisualHeadingsSchema),
});

export type RenderedEvidence = typeof RenderedEvidenceSchema.Type;

const decodeProbes = Schema.decodeUnknownResult(
  Schema.fromJsonString(Schema.Struct({ evidence: RenderedEvidenceJson }))
);

export const renderedEvidenceOf = (
  probes: string | null
): RenderedEvidence | null => {
  if (probes === null) {
    return null;
  }

  const decoded = decodeProbes(probes);

  return Result.isSuccess(decoded) ? decoded.success.evidence : null;
};
