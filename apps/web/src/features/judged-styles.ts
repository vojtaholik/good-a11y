import * as stylex from "@stylexjs/stylex";

const LINE = "oklch(0.9 0.012 265)";

const JUDGED = "oklch(0.55 0.08 265)";

const MUTED = "oklch(0.47 0.02 265)";

export const judged = stylex.create({
  card: {
    borderBlockEndColor: LINE,
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    borderInlineStartColor: JUDGED,
    borderInlineStartStyle: "dashed",
    borderInlineStartWidth: "3px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    paddingBlock: "1rem",
    paddingInline: "1rem 0",
  },
  confidence: {
    color: MUTED,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  label: {
    color: MUTED,
    margin: 0,
  },
});
