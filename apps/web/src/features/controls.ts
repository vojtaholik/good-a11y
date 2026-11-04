import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import { infoIcon, progressIcon, warningIcon } from "./icons.js";
import { sx } from "./sx.js";
import { colors, font, radius, space } from "./tokens.stylex.js";

const HOVER = "@media (hover: hover) and (pointer: fine)";

export const buttons = stylex.create({
  base: {
    alignItems: "center",
    borderRadius: radius["--radius-md"],
    cursor: "pointer",
    display: "inline-flex",
    font: "inherit",
    fontWeight: 600,
    gap: space["--s2"],
    justifyContent: "center",
    textDecorationLine: {
      ":hover:not(:disabled)": { [HOVER]: "underline", default: "none" },
      default: "none",
    },
    textUnderlineOffset: "0.18em",
  },
  primary: {
    backgroundColor: {
      ":disabled": colors["--line"],
      ":hover:not(:disabled)": {
        [HOVER]: colors["--accent-hover"],
        default: colors["--accent"],
      },
      default: colors["--accent"],
    },
    borderStyle: "none",
    color: {
      ":disabled": colors["--ink-muted"],
      default: colors["--on-accent"],
    },
    cursor: { ":disabled": "default", default: "pointer" },
    minBlockSize: "48px",
    paddingInline: "18px",
  },
  secondary: {
    backgroundColor: {
      ":disabled": colors["--bg"],
      ":hover:not(:disabled)": {
        [HOVER]: colors["--sunken"],
        default: colors["--surface"],
      },
      default: colors["--surface"],
    },
    borderColor: {
      ":hover:not(:disabled)": {
        [HOVER]: colors["--ink"],
        default: colors["--control"],
      },
      default: colors["--control"],
    },
    borderStyle: { ":disabled": "dashed", default: "solid" },
    borderWidth: "1px",
    color: {
      ":disabled": colors["--ink-muted"],
      default: colors["--ink"],
    },
    cursor: { ":disabled": "default", default: "pointer" },
    minBlockSize: "44px",
    paddingInline: "14px",
  },
});

const status = stylex.create({
  box: {
    alignItems: "flex-start",
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    display: "flex",
    gap: space["--s3"],
    paddingBlock: "14px",
    paddingInline: space["--s4"],
  },
  error: {
    backgroundColor: colors["--issue-soft"],
    borderColor: colors["--issue"],
  },
  icon: {
    display: "flex",
    flexShrink: 0,
    marginBlockStart: "2px",
  },
  iconError: { color: colors["--issue"] },
  iconNote: { color: colors["--ink"] },
  iconProgress: { color: colors["--accent"] },
  kindError: {
    color: colors["--issue"],
  },
  note: {
    backgroundColor: colors["--sunken"],
    borderColor: colors["--control"],
  },
  progress: {
    backgroundColor: colors["--accent-soft"],
    borderColor: colors["--accent"],
  },
  text: {
    margin: 0,
  },
});

export type StatusKind = "error" | "note" | "progress";

const KIND_WORD: Readonly<Record<StatusKind, string>> = {
  error: "Error:",
  note: "Note:",
  progress: "In progress:",
};

const iconOf = <M>(h: HtmlBuilder<M>, kind: StatusKind): Html => {
  if (kind === "error") {
    return warningIcon(h, 20);
  }

  return kind === "progress" ? progressIcon(h, 20) : infoIcon(h, 20);
};

const ICON_COLOR = {
  error: status.iconError,
  note: status.iconNote,
  progress: status.iconProgress,
};

export const statusMessage = <M>(
  h: HtmlBuilder<M>,
  kind: StatusKind,
  text: string
): Html =>
  h.div(
    [
      h.Role(kind === "error" ? "alert" : "status"),
      sx(h, status.box, status[kind]),
    ],
    [
      h.span([sx(h, status.icon, ICON_COLOR[kind])], [iconOf(h, kind)]),
      h.p(
        [sx(h, status.text)],
        [
          h.b(kind === "error" ? [sx(h, status.kindError)] : [], [
            KIND_WORD[kind],
          ]),
          ` ${text}`,
        ]
      ),
    ]
  );

export const codeFont = stylex.create({
  code: { fontFamily: font["--font-code"] },
});
