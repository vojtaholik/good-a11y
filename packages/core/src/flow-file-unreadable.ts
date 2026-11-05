import { Schema } from "effect";

export class FlowFileUnreadable extends Schema.TaggedError<FlowFileUnreadable>()(
  "FlowFileUnreadable",
  { detail: Schema.String, file: Schema.String }
) {
  override get message(): string {
    return `The flow file ${this.file} could not be read as a flow or a list of flows: ${this.detail}. Each flow needs a "guide" id and may have "path", "setup", "requires" and "targets".`;
  }
}
