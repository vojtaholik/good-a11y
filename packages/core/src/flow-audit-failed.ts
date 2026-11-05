import { Schema } from "effect";

export class FlowAuditFailed extends Schema.TaggedError<FlowAuditFailed>()(
  "FlowAuditFailed",
  { detail: Schema.String }
) {
  override get message(): string {
    return `The flows could not run: ${this.detail}`;
  }
}
