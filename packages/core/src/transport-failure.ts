import { Schema } from "effect";

export class TransportFailure extends Schema.TaggedError<TransportFailure>()(
  "TransportFailure",
  {
    detail: Schema.String,
    kind: Schema.Literals(["dns", "tls", "connection", "unknown"]),
  }
) {
  override get message(): string {
    return `Transport failed (${this.kind}): ${this.detail}`;
  }
}
