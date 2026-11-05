import { Schema } from "effect";

export class ScenarioDriverFailed extends Schema.TaggedError<ScenarioDriverFailed>()(
  "ScenarioDriverFailed",
  { detail: Schema.String }
) {
  override get message(): string {
    return `The model driving the scenario did not answer: ${this.detail}`;
  }
}
