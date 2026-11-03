import { Schema } from "effect";

export const MAX_MESSAGE_LENGTH = 5000;

export const ContactMessageSchema = Schema.Struct({
  email: Schema.String.check(
    Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/u),
    Schema.isMaxLength(254)
  ).annotate({ description: "Where to answer" }),
  message: Schema.String.check(
    Schema.isMinLength(1),
    Schema.isMaxLength(MAX_MESSAGE_LENGTH)
  ).annotate({ description: "What the sender wants to say" }),
  name: Schema.optionalKey(
    Schema.String.check(
      Schema.isMinLength(1),
      Schema.isMaxLength(120)
    ).annotate({ description: "Who is writing" })
  ),
  url: Schema.optionalKey(
    Schema.String.check(Schema.isMaxLength(2048)).annotate({
      description: "The scanned page the message was sent from, if any",
    })
  ),
});

export type ContactMessage = typeof ContactMessageSchema.Type;
