import * as stylex from "@stylexjs/stylex";
import { Schema } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../client/message.js";
import type { AppMessage } from "../client/message.js";
import { CopyState } from "../client/model.js";
import type { AppModel } from "../client/model.js";
import { copyIcon } from "./icons.js";
import { report as reportStyles } from "./report-styles.js";
import { sx } from "./sx.js";
import { colors, focus, font, radius, space } from "./tokens.stylex.js";

const HOVER = "@media (hover: hover) and (pointer: fine)";

const block = stylex.create({
  box: {
    alignItems: "center",
    borderStyle: "solid",
    borderWidth: "1px",
    display: "flex",
    flexWrap: "wrap",
  },
  boxInverse: {
    backgroundColor: colors["--inverse-deep"],
    borderColor: colors["--inverse-line"],
    borderRadius: radius["--radius-lg"],
    color: colors["--on-inverse"],
    gap: `${space["--s3"]} ${space["--s4"]}`,
    paddingBlock: "14px",
    paddingInline: `clamp(16px, 2cqi, 24px) 14px`,
  },
  boxLight: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--control"],
    borderRadius: radius["--radius-md"],
    gap: `${space["--s2"]} ${space["--s3"]}`,
    paddingBlock: space["--s2"],
    paddingInline: `${space["--s4"]} ${space["--s2"]}`,
  },
  button: {
    alignItems: "center",
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    font: "inherit",
    fontSize: "0.9375rem",
    fontWeight: 600,
    gap: space["--s2"],
    minBlockSize: "44px",
    paddingInline: "14px",
    textDecorationLine: {
      ":hover": { [HOVER]: "underline", default: "none" },
      default: "none",
    },
    textUnderlineOffset: "0.18em",
  },
  buttonInverse: {
    backgroundColor: "transparent",
    borderColor: {
      ":hover": {
        [HOVER]: colors["--on-inverse"],
        default: colors["--inverse-control"],
      },
      default: colors["--inverse-control"],
    },
    color: colors["--on-inverse"],
    outlineColor: {
      ":focus-visible": colors["--focus-inverse"],
      default: null,
    },
    outlineOffset: focus["--focus-offset"],
  },
  buttonLight: {
    backgroundColor: {
      ":hover": { [HOVER]: colors["--sunken"], default: colors["--bg"] },
      default: colors["--bg"],
    },
    borderColor: {
      ":hover": { [HOVER]: colors["--ink"], default: colors["--control"] },
      default: colors["--control"],
    },
    color: colors["--ink"],
  },
  pre: {
    flexBasis: "260px",
    flexGrow: 1,
    fontFamily: font["--font-code"],
    lineHeight: 1.5,
    margin: 0,
    minInlineSize: 0,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  preInverse: {
    backgroundColor: "transparent",
    color: colors["--on-inverse"],
    fontSize: "clamp(1rem, 0.5cqi + 0.875rem, 1.25rem)",
    padding: 0,
  },
  preLight: {
    backgroundColor: "transparent",
    color: colors["--ink"],
    fontSize: "0.9375rem",
    padding: 0,
  },
  prompt: {
    color: colors["--on-inverse-muted"],
  },
});

export type CommandTone = "inverse" | "light";

const isCopied = (model: AppModel, command: string): boolean =>
  Schema.is(CopyState.Copied)(model.copy) && model.copy.key === command;

const isFailed = (model: AppModel, command: string): boolean =>
  Schema.is(CopyState.Failed)(model.copy) && model.copy.key === command;

const announcement = (model: AppModel, command: string): string => {
  if (isCopied(model, command)) {
    return "Command copied";
  }

  return isFailed(model, command)
    ? "Copy failed. Select the command and copy it."
    : "";
};

export const commandBlock = (
  model: AppModel,
  command: string,
  tone: CommandTone,
  h: HtmlBuilder<AppMessage>
): Html => {
  const isInverse = tone === "inverse";

  return h.div(
    [sx(h, block.box, isInverse ? block.boxInverse : block.boxLight)],
    [
      h.pre(
        [sx(h, block.pre, isInverse ? block.preInverse : block.preLight)],
        [
          h.code(
            [],
            isInverse
              ? [
                  h.span([h.AriaHidden(true), sx(h, block.prompt)], ["$ "]),
                  command,
                ]
              : [command]
          ),
        ]
      ),
      h.button(
        [
          h.Type("button"),
          h.OnClick(Message.ClickedCopyCommand({ command })),
          sx(
            h,
            block.button,
            isInverse ? block.buttonInverse : block.buttonLight
          ),
        ],
        [copyIcon(h), isCopied(model, command) ? "Copied" : "Copy"]
      ),
      h.span(
        [h.Role("status"), sx(h, reportStyles.visuallyHidden)],
        [announcement(model, command)]
      ),
    ]
  );
};
