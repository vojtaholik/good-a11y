import { MAX_MESSAGE_LENGTH } from "@good-a11y/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import { ContactState, Message } from "../client/model.js";
import type {
  AppMessage,
  AppModel,
  ContactFieldName,
} from "../client/model.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";

const FIELD_PROBLEMS: Readonly<Record<ContactFieldName, string>> = {
  email: "Type an email address we can answer.",
  message: `Write a message of at most ${MAX_MESSAGE_LENGTH} characters.`,
};

const statusOf = (model: AppModel): string =>
  ContactState.match<string>(model.contact.state, {
    Editing: () => "",
    Invalid: () => "The message was not sent. Fix the marked fields.",
    Refused: ({ message }) => message,
    Sending: () => "Sending…",
    Sent: () => "Your message arrived. Thank you.",
    Unavailable: () =>
      "The message could not be sent because the server did not answer. What you wrote is still in the form; try again.",
  });

const problemOf = (model: AppModel, field: ContactFieldName): string =>
  ContactState.matchOrElse<string>(
    model.contact.state,
    {
      Invalid: ({ fields }) =>
        fields.includes(field) ? FIELD_PROBLEMS[field] : "",
    },
    () => ""
  );

const isSending = (model: AppModel): boolean =>
  ContactState.matchOrElse<boolean>(
    model.contact.state,
    { Sending: () => true },
    () => false
  );

export const contactView = (
  model: AppModel,
  url: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.form(
    [h.OnSubmit(Message.SubmittedContactForm({ url }))],
    [
      h.p(
        [],
        [
          "studio9 keeps your e-mail, name, message and the scanned address only to answer you. Ask us to delete them at any time.",
        ]
      ),
      h.p([], [`The scanned page (${url}) is sent with your message.`]),
      h.label([h.For("contact-name")], ["Name (optional)"]),
      h.input([
        h.Id("contact-name"),
        h.Name("name"),
        h.Autocomplete("name"),
        h.Value(model.contact.name),
        h.OnInput((value) => Message.UpdatedContactName({ value })),
        sx(h, styles.input),
      ]),
      h.label([h.For("contact-email")], ["Email"]),
      h.input([
        h.Id("contact-email"),
        h.Name("email"),
        h.Type("email"),
        h.Autocomplete("email"),
        h.Value(model.contact.email),
        h.AriaDescribedBy("contact-email-problem"),
        h.OnInput((value) => Message.UpdatedContactEmail({ value })),
        sx(h, styles.input),
      ]),
      h.p([h.Id("contact-email-problem")], [problemOf(model, "email")]),
      h.label([h.For("contact-message")], ["Message"]),
      h.textarea([
        h.Id("contact-message"),
        h.Name("message"),
        h.Rows(5),
        h.Value(model.contact.message),
        h.AriaDescribedBy("contact-message-problem"),
        h.OnInput((value) => Message.UpdatedContactMessage({ value })),
        sx(h, styles.input),
      ]),
      h.p([h.Id("contact-message-problem")], [problemOf(model, "message")]),
      h.button(
        [h.Type("submit"), h.Disabled(isSending(model)), sx(h, styles.button)],
        ["Send message"]
      ),
      h.p([h.Role("status")], [statusOf(model)]),
    ]
  );
