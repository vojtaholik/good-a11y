import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../client/message.js";
import type { AppMessage } from "../client/message.js";
import { StartState } from "../client/model.js";
import type { AppModel } from "../client/model.js";
import { buttons } from "./controls.js";
import { warningIcon } from "./icons.js";
import { sx } from "./sx.js";
import { colors, radius, space } from "./tokens.stylex.js";

const INPUT_ID = "scan-url";

const HINT_ID = "scan-url-hint";

const PROBLEM_ID = "scan-url-problem";

const form = stylex.create({
  button: {
    flexGrow: { "@container (max-width: 479px)": 1, default: 0 },
    flexShrink: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: space["--s2"],
  },
  hint: {
    color: colors["--ink-muted"],
    fontSize: "0.9375rem",
  },
  input: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--control"],
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    color: colors["--ink"],
    flexBasis: "220px",
    flexGrow: 1,
    font: "inherit",
    minBlockSize: "48px",
    minInlineSize: 0,
    paddingInline: "14px",
  },
  invalid: {
    borderColor: colors["--issue"],
  },
  label: {
    fontWeight: 600,
  },
  problem: {
    alignItems: "flex-start",
    color: colors["--issue"],
    display: "flex",
    fontWeight: 600,
    gap: space["--s2"],
    margin: 0,
  },
  problemIcon: {
    display: "flex",
    flexShrink: 0,
    marginBlockStart: "3px",
  },
  progress: {
    margin: 0,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["--s2"],
  },
});

const problemOf = (model: AppModel): string | null =>
  StartState.match<string | null>(model.start, {
    Idle: () => null,
    Refused: ({ message }) => message,
    Submitting: () => null,
    Unavailable: () =>
      "the server did not answer. Your address is still here; try again.",
  });

const buttonLabel = (model: AppModel): string =>
  StartState.match<string>(model.start, {
    Idle: () => "Check the page",
    Refused: () => "Check the page",
    Submitting: () => "Starting…",
    Unavailable: () => "Try again",
  });

const isSubmitting = (model: AppModel): boolean =>
  StartState.matchOrElse<boolean>(
    model.start,
    { Submitting: () => true },
    () => false
  );

const isRefused = (model: AppModel): boolean =>
  StartState.matchOrElse<boolean>(
    model.start,
    { Refused: () => true },
    () => false
  );

const problemView = (problem: string, h: HtmlBuilder<AppMessage>): Html =>
  h.p(
    [h.Id(PROBLEM_ID), h.Role("alert"), sx(h, form.problem)],
    [
      h.span([sx(h, form.problemIcon)], [warningIcon(h, 18)]),
      h.span([], [`Error: ${problem}`]),
    ]
  );

export const scanForm = (model: AppModel, h: HtmlBuilder<AppMessage>): Html => {
  const problem = problemOf(model);
  const isInvalid = isRefused(model);

  return h.form(
    [
      h.Role("search"),
      h.AriaLabel("Check a page"),
      h.Novalidate(true),
      h.OnSubmit(Message.SubmittedScanForm()),
      sx(h, form.form),
    ],
    [
      h.label([h.For(INPUT_ID), sx(h, form.label)], ["Page address"]),
      h.span(
        [h.Id(HINT_ID), sx(h, form.hint)],
        ["A public address, like https://example.com/pricing"]
      ),
      h.div(
        [sx(h, form.row)],
        [
          h.input([
            h.Id(INPUT_ID),
            h.Name("url"),
            h.Type("url"),
            h.InputMode("url"),
            h.Autocomplete("url"),
            h.Value(model.url),
            h.AriaDescribedBy(
              problem === null ? HINT_ID : `${HINT_ID} ${PROBLEM_ID}`
            ),
            h.AriaInvalid(isInvalid),
            h.OnInput((value) => Message.UpdatedScanUrl({ value })),
            sx(h, form.input, isInvalid ? form.invalid : null),
          ]),
          h.button(
            [
              h.Type("submit"),
              h.Disabled(isSubmitting(model)),
              sx(h, buttons.base, buttons.primary, form.button),
            ],
            [buttonLabel(model)]
          ),
        ]
      ),
      h.p(
        [h.Role("status"), sx(h, form.progress)],
        isSubmitting(model)
          ? [h.b([], ["In progress:"]), " Starting the scan…"]
          : []
      ),
      ...(problem === null ? [] : [problemView(problem, h)]),
    ]
  );
};
