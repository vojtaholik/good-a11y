import { describe, expect, it } from "@effect/vitest";

import { renderedEvidenceOf } from "../src/index.js";
import type { EmptySubmitsSchema } from "../src/index.js";

interface EvidenceParts {
  readonly emptySubmits?: typeof EmptySubmitsSchema.Encoded | null;
  readonly foreignBlocks?: string | null;
  readonly formInstructions?: string | null;
  readonly visualHeadings?: string | null;
}

const probesWith = (evidence: EvidenceParts): string =>
  JSON.stringify({ evidence, reflow: null, walk: null });

const HEADINGS = JSON.stringify({
  bodyFontSize: 16,
  candidates: [
    {
      fontSize: 24,
      fontWeight: 700,
      snippet: "<div>",
      text: "Delivery",
    },
  ],
  headings: 2,
});

const ERRORS = JSON.stringify({
  invalid: [
    {
      ariaInvalid: false,
      describedBy: "",
      label: "Email",
      native: "Please fill in this field.",
      snippet: "<input>",
    },
  ],
  messages: [],
});

describe("renderedEvidenceOf", () => {
  it("reads every part the page script measured", () => {
    const evidence = renderedEvidenceOf(
      probesWith({
        emptySubmits: {
          forms: JSON.stringify([
            { index: 0, skipped: null, snippet: "<form>" },
            { index: -1, skipped: "password", snippet: "<form>" },
          ]),
          submissions: [
            {
              blocked: ["https://shop.eu/subscribe"],
              blockedCount: 1,
              errors: ERRORS,
              index: 0,
              left: false,
              submitted: JSON.stringify({ submitted: true }),
            },
            {
              blocked: [],
              blockedCount: 0,
              errors: null,
              index: 1,
              left: true,
              submitted: null,
            },
          ],
        },
        foreignBlocks: JSON.stringify({ blocks: [], pageLang: "en" }),
        formInstructions: null,
        visualHeadings: HEADINGS,
      })
    );

    expect(evidence?.visualHeadings?.candidates[0]?.text).toBe("Delivery");
    expect(evidence?.formInstructions).toBeNull();
    expect(evidence?.foreignBlocks?.pageLang).toBe("en");
    expect(evidence?.emptySubmits?.forms.map(({ skipped }) => skipped)).toEqual(
      [null, "password"]
    );
    expect(
      evidence?.emptySubmits?.submissions[0]?.errors?.invalid[0]?.native
    ).toBe("Please fill in this field.");
    expect(evidence?.emptySubmits?.submissions[1]?.errors).toBeNull();
  });

  it("answers null for no probes, older probes or output that does not parse", () => {
    expect(renderedEvidenceOf(null)).toBeNull();
    expect(renderedEvidenceOf(JSON.stringify({ reflow: null }))).toBeNull();
    expect(
      renderedEvidenceOf(probesWith({ visualHeadings: "{not json" }))
    ).toBeNull();
  });
});
