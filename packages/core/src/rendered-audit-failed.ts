import { Schema } from "effect";

export class RenderedAuditFailed extends Schema.TaggedError<RenderedAuditFailed>()(
  "RenderedAuditFailed",
  {
    detail: Schema.String,
    kind: Schema.Literals(["timeout", "browser", "audit"]),
  }
) {
  override get message(): string {
    return `Rendered audit failed (${this.kind}): ${this.detail}`;
  }
}
