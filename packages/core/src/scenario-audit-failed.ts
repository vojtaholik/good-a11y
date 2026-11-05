import { Schema } from "effect";

export class ScenarioAuditFailed extends Schema.TaggedError<ScenarioAuditFailed>()(
  "ScenarioAuditFailed",
  { detail: Schema.String }
) {
  override get message(): string {
    return `The scenarios could not run: ${this.detail}`;
  }
}
