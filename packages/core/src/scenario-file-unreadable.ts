import { Schema } from "effect";

export class ScenarioFileUnreadable extends Schema.TaggedError<ScenarioFileUnreadable>()(
  "ScenarioFileUnreadable",
  { detail: Schema.String, file: Schema.String }
) {
  override get message(): string {
    return `The scenario file ${this.file} could not be read as a scenario or a list of scenarios: ${this.detail}. Each scenario needs an "id", a "goal", "keys" (each { "press": key } or { "type": input name }) and a "success" with at least one "present" target, and may have "path" and "inputs".`;
  }
}
