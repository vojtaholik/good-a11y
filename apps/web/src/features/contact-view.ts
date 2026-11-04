import { MAX_MESSAGE_LENGTH } from "@good-a11y/core/contracts";
import * as stylex from "@stylexjs/stylex";
import { Option, Schema } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../client/message.js";
import type { AppMessage } from "../client/message.js";
import { ContactState } from "../client/model.js";
import type { AppModel, ContactFieldName } from "../client/model.js";
import { buttons, statusMessage } from "./controls.js";
import { checkIcon, warningIcon } from "./icons.js";
import { ISSUES_URL } from "./info-pages.js";
import {
  CONTACT_ALERT_ID,
  CONTACT_PROBLEMS_ID,
  CONTACT_SENT_ID,
  MAIN_ID,
} from "./landmarks.js";
import { homeRouter } from "./route.js";
import { sx } from "./sx.js";
import { colors, layout, radius, space } from "./tokens.stylex.js";

const contact = stylex.create({
  card: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--line"],
    borderRadius: radius["--radius-lg"],
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    display: "flex",
    flexBasis: "480px",
    flexDirection: "column",
    flexGrow: 1,
    gap: "24px",
    maxInlineSize: "640px",
    minInlineSize: 0,
    padding: "clamp(20px, 2.5cqi, 32px)",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: space["--s2"],
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  hint: {
    color: colors["--ink-muted"],
    fontSize: "0.9375rem",
    margin: 0,
  },
  input: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--control"],
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    color: colors["--ink"],
    font: "inherit",
    inlineSize: "100%",
    minBlockSize: "48px",
    paddingBlock: "10px",
    paddingInline: "14px",
  },
  intro: {
    display: "flex",
    flexBasis: "320px",
    flexDirection: "column",
    flexGrow: 1,
    gap: "20px",
    maxInlineSize: "440px",
  },
  invalid: {
    borderColor: colors["--issue"],
    borderWidth: "2px",
  },
  label: {
    fontWeight: 600,
  },
  labelNote: {
    color: colors["--ink-muted"],
    fontWeight: 400,
  },
  lead: {
    lineHeight: 1.7,
    margin: 0,
  },
  link: {
    color: colors["--accent"],
    textUnderlineOffset: "3px",
  },
  main: {
    alignItems: "flex-start",
    boxSizing: "content-box",
    display: "flex",
    flexWrap: "wrap",
    gap: "40px 64px",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: "clamp(48px, 6cqi, 88px)",
    paddingInline: layout["--gutter"],
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
  sent: {
    borderColor: colors["--ok"],
    borderRadius: radius["--radius-lg"],
    borderStyle: "solid",
    borderWidth: "2px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "24px",
  },
  sentTitle: {
    alignItems: "center",
    color: colors["--ok"],
    display: "flex",
    fontSize: "1.375rem",
    fontWeight: 800,
    gap: "10px",
    margin: 0,
  },
  submit: {
    alignSelf: "flex-start",
  },
  summary: {
    backgroundColor: colors["--issue-soft"],
    borderColor: colors["--issue"],
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "2px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "18px 20px",
  },
  summaryLink: {
    color: colors["--ink"],
    fontWeight: 600,
    textUnderlineOffset: "3px",
  },
  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    margin: 0,
    paddingInlineStart: "1.25rem",
  },
  summaryTitle: {
    color: colors["--issue"],
    fontSize: "1.125rem",
    fontWeight: 800,
    margin: 0,
  },
  textarea: {
    minBlockSize: "180px",
    resize: "vertical",
  },
  title: {
    fontSize: "clamp(2.25rem, 2.8cqi + 1.375rem, 3.75rem)",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    lineHeight: 1.05,
    margin: 0,
  },
});

const FIELD_IDS: Readonly<Record<ContactFieldName, string>> = {
  email: "contact-email",
  message: "contact-message",
};

const FIELD_LABELS: Readonly<Record<ContactFieldName, string>> = {
  email: "Email",
  message: "Message",
};

const fieldProblem = (model: AppModel, field: ContactFieldName): string => {
  if (field === "email") {
    return "enter an address like name@example.com";
  }

  return model.contact.message.trim() === ""
    ? "write at least one sentence"
    : `keep it to ${MAX_MESSAGE_LENGTH} characters`;
};

const invalidFields = (model: AppModel): readonly ContactFieldName[] =>
  ContactState.matchOrElse<readonly ContactFieldName[]>(
    model.contact.state,
    { Invalid: ({ fields }) => fields },
    () => []
  );

const isSending = (model: AppModel): boolean =>
  ContactState.matchOrElse<boolean>(
    model.contact.state,
    { Sending: () => true },
    () => false
  );

const alertOf = (model: AppModel): Option.Option<string> =>
  ContactState.matchOrElse<Option.Option<string>>(
    model.contact.state,
    {
      Refused: ({ message }) => Option.some(message),
      Unavailable: () =>
        Option.some(
          "the server did not answer. Your message is still here. Send it again in a minute."
        ),
    },
    () => Option.none()
  );

const buttonLabel = (model: AppModel): string =>
  ContactState.match<string>(model.contact.state, {
    Editing: () => "Send message",
    Invalid: () => "Send message",
    Refused: () => "Send again",
    Sending: () => "Sending…",
    Sent: () => "Send message",
    Unavailable: () => "Send again",
  });

const counted = (count: number): string =>
  count === 1 ? "1 field needs a fix" : `${count} fields need a fix`;

const summaryView = (
  model: AppModel,
  fields: readonly ContactFieldName[],
  h: HtmlBuilder<AppMessage>
): Html =>
  h.div(
    [h.Id(CONTACT_PROBLEMS_ID), sx(h, contact.summary)],
    [
      h.h2([sx(h, contact.summaryTitle)], [counted(fields.length)]),
      h.ul(
        [sx(h, contact.summaryList)],
        fields.map((field) =>
          h.li(
            [],
            [
              h.a(
                [h.Href(`#${FIELD_IDS[field]}`), sx(h, contact.summaryLink)],
                [`${FIELD_LABELS[field]}: ${fieldProblem(model, field)}`]
              ),
            ]
          )
        )
      ),
    ]
  );

const problemView = (
  id: string,
  problem: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.p(
    [h.Id(id), sx(h, contact.problem)],
    [
      h.span([sx(h, contact.problemIcon)], [warningIcon(h, 18)]),
      h.span([], [`Error: ${problem}`]),
    ]
  );

const describedBy = (ids: readonly (string | null)[]): string =>
  ids.filter((id) => id !== null).join(" ");

const fieldView = (
  model: AppModel,
  field: ContactFieldName,
  hint: string | null,
  h: HtmlBuilder<AppMessage>
): Html => {
  const id = FIELD_IDS[field];
  const isInvalid = invalidFields(model).includes(field);
  const hintId = hint === null ? null : `${id}-hint`;
  const problemId = isInvalid ? `${id}-problem` : null;

  const common = [
    h.Id(id),
    h.Name(field),
    h.AriaInvalid(isInvalid),
    ...(hintId === null && problemId === null
      ? []
      : [h.AriaDescribedBy(describedBy([hintId, problemId]))]),
  ];

  return h.div(
    [sx(h, contact.field)],
    [
      h.label([h.For(id), sx(h, contact.label)], [FIELD_LABELS[field]]),
      ...(hint === null || hintId === null
        ? []
        : [h.p([h.Id(hintId), sx(h, contact.hint)], [hint])]),
      ...(problemId === null
        ? []
        : [problemView(problemId, fieldProblem(model, field), h)]),
      field === "email"
        ? h.input([
            ...common,
            h.Type("email"),
            h.Autocomplete("email"),
            h.Value(model.contact.email),
            h.OnInput((value) => Message.UpdatedContactEmail({ value })),
            sx(h, contact.input, isInvalid ? contact.invalid : null),
          ])
        : h.textarea([
            ...common,
            h.Rows(6),
            h.Value(model.contact.message),
            h.OnInput((value) => Message.UpdatedContactMessage({ value })),
            sx(
              h,
              contact.input,
              contact.textarea,
              isInvalid ? contact.invalid : null
            ),
          ]),
    ]
  );
};

const sentView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [sx(h, contact.sent)],
    [
      h.h2(
        [h.Id(CONTACT_SENT_ID), sx(h, contact.sentTitle)],
        [checkIcon(h, 22), "Message sent"]
      ),
      h.p([sx(h, contact.lead)], [`We reply to ${model.contact.email}.`]),
      h.p(
        [sx(h, contact.lead)],
        [
          h.a(
            [h.Href(`${homeRouter()}#guides`), sx(h, contact.link)],
            ["Back to the guides"]
          ),
        ]
      ),
    ]
  );

export const contactForm = (
  model: AppModel,
  maybeUrl: Option.Option<string>,
  h: HtmlBuilder<AppMessage>
): Html => {
  const fields = invalidFields(model);
  const sending = isSending(model);

  return h.form(
    [
      h.OnSubmit(Message.SubmittedContactForm({ maybeUrl })),
      h.Novalidate(true),
      sx(h, contact.form),
    ],
    [
      ...Option.match(alertOf(model), {
        onNone: () => [],
        onSome: (text) => [
          h.div([h.Id(CONTACT_ALERT_ID)], [statusMessage(h, "error", text)]),
        ],
      }),
      ...(fields.length === 0 ? [] : [summaryView(model, fields, h)]),
      ...Option.match(maybeUrl, {
        onNone: () => [],
        onSome: (url) => [
          h.p(
            [sx(h, contact.hint)],
            [`The scanned page (${url}) is sent with your message.`]
          ),
        ],
      }),
      h.div(
        [sx(h, contact.field)],
        [
          h.label(
            [h.For("contact-name"), sx(h, contact.label)],
            ["Name ", h.span([sx(h, contact.labelNote)], ["(optional)"])]
          ),
          h.input([
            h.Id("contact-name"),
            h.Name("name"),
            h.Autocomplete("name"),
            h.Value(model.contact.name),
            h.OnInput((value) => Message.UpdatedContactName({ value })),
            sx(h, contact.input),
          ]),
        ]
      ),
      fieldView(model, "email", "Only used to reply to you.", h),
      fieldView(model, "message", null, h),
      h.button(
        [
          h.Type("submit"),
          h.Disabled(sending),
          sx(h, buttons.base, buttons.primary, contact.submit),
        ],
        [buttonLabel(model)]
      ),
      h.div(
        [h.Role("status")],
        sending
          ? [
              h.p(
                [sx(h, contact.lead)],
                [h.b([], ["In progress:"]), " sending your message"]
              ),
            ]
          : []
      ),
    ]
  );
};

export const contactView = (
  model: AppModel,
  maybeUrl: Option.Option<string>,
  h: HtmlBuilder<AppMessage>
): Html =>
  Schema.is(ContactState.Sent)(model.contact.state)
    ? sentView(model, h)
    : contactForm(model, maybeUrl, h);

export const contactPageView = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.main(
    [h.Id(MAIN_ID), sx(h, contact.main)],
    [
      h.div(
        [sx(h, contact.intro)],
        [
          h.h1([sx(h, contact.title)], ["Contact"]),
          h.p(
            [sx(h, contact.lead)],
            [
              "Questions about a guide or a report. For bugs, ",
              h.a([h.Href(ISSUES_URL), sx(h, contact.link)], ["GitHub issues"]),
              " is faster.",
            ]
          ),
        ]
      ),
      h.section(
        [h.AriaLabel("Message"), sx(h, contact.card)],
        [contactView(model, Option.none(), h)]
      ),
    ]
  );
