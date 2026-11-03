import * as stylex from "@stylexjs/stylex";

const INK = "oklch(0.24 0.03 265)";

const MUTED = "oklch(0.47 0.02 265)";

const LINE = "oklch(0.9 0.012 265)";

const TINT = "oklch(0.97 0.008 265)";

const ISSUE = "oklch(0.5 0.18 28)";

const ACCENT = "oklch(0.38 0.14 265)";

export const report = stylex.create({
  card: {
    borderBlockEndColor: LINE,
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    borderInlineStartColor: ISSUE,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: "3px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    paddingBlock: "1rem",
    paddingInline: "1rem 0",
  },
  cardTitle: {
    fontSize: "1.0625rem",
    margin: 0,
  },
  count: {
    color: ISSUE,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  disclosure: {
    borderColor: LINE,
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
  },
  factTerm: {
    color: MUTED,
    fontSize: "0.875rem",
  },
  factValue: {
    margin: 0,
    marginBlockEnd: "0.5rem",
  },
  facts: {
    display: "grid",
    gap: "0.25rem 1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))",
    margin: 0,
  },
  flag: {
    blockSize: "0.875rem",
    borderRadius: "2px",
    boxShadow: `0 0 0 1px ${LINE}`,
    flexShrink: 0,
    inlineSize: "1.25rem",
    objectFit: "cover",
  },
  headline: {
    color: INK,
    fontSize: "clamp(1.375rem, 1.1rem + 1.2vw, 1.75rem)",
    fontWeight: 650,
    lineHeight: 1.2,
    margin: 0,
    textWrap: "balance",
  },
  link: {
    color: ACCENT,
  },
  meta: {
    color: MUTED,
    fontSize: "0.875rem",
    margin: 0,
  },
  refs: {
    color: MUTED,
    display: "flex",
    flexDirection: "column",
    fontSize: "0.8125rem",
    gap: "0.125rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  sample: {
    backgroundColor: TINT,
    borderRadius: "0.25rem",
    display: "block",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.8125rem",
    overflowWrap: "anywhere",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    whiteSpace: "pre-wrap",
  },
  samples: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBlockStart: "2.5rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    margin: 0,
  },
  state: {
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    gap: "0.5rem",
    minBlockSize: "2.75rem",
    paddingInline: "0.5rem",
  },
  stateBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    paddingBlock: "0.25rem 0.75rem",
    paddingInline: "0.75rem",
  },
  stateBox: {
    backgroundColor: {
      ":is([open])": TINT,
      default: "transparent",
    },
    borderColor: LINE,
    borderRadius: "0.375rem",
    borderStyle: "solid",
    borderWidth: "1px",
  },
  states: {
    display: "grid",
    gap: "0.5rem",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 10.5rem), 1fr))",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  summary: {
    cursor: "pointer",
    fontWeight: 600,
  },
  text: {
    margin: 0,
  },
  top: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
});
