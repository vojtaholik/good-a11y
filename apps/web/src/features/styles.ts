import * as stylex from "@stylexjs/stylex";

import { colors, font } from "./tokens.stylex.js";

export const styles = stylex.create({
  button: {
    backgroundColor: colors["--accent"],
    borderColor: colors["--accent"],
    borderRadius: "0.25rem",
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors["--on-accent"],
    cursor: "pointer",
    font: "inherit",
    paddingBlock: "0.5rem",
    paddingInline: "1rem",
  },
  contact: {
    backgroundColor: colors["--sunken"],
    borderRadius: "0.5rem",
    marginBlockStart: "2rem",
    padding: "1rem",
  },
  finding: {
    borderBlockStartColor: colors["--line"],
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    paddingBlock: "1rem",
  },
  flag: {
    blockSize: "0.75rem",
    borderColor: colors["--line"],
    borderStyle: "solid",
    borderWidth: "1px",
    inlineSize: "1rem",
    marginInlineEnd: "0.25rem",
    verticalAlign: "middle",
  },
  headline: {
    fontSize: "1.25rem",
    fontWeight: 600,
  },
  input: {
    boxSizing: "border-box",
    display: "block",
    font: "inherit",
    inlineSize: "100%",
    marginBlock: "0.25rem 0.75rem",
    padding: "0.5rem",
  },
  page: {
    color: colors["--ink"],
    fontFamily: font["--font-text"],
    lineHeight: 1.5,
    marginInline: "auto",
    maxInlineSize: "46rem",
    paddingBlock: "2rem",
    paddingInline: "1rem",
  },
  sample: {
    fontSize: "0.875rem",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  state: {
    display: "inline-block",
    marginInlineEnd: "0.75rem",
    whiteSpace: "nowrap",
  },
  statement: {
    backgroundColor: colors["--notice-soft"],
    borderInlineStartColor: colors["--notice"],
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: "4px",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
  },
  status: {
    fontWeight: 600,
  },
});
