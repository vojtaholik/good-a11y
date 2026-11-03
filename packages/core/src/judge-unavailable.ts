import { Schema } from "effect";

import { JUDGE_MODEL } from "./judge.js";

export class JudgeUnavailable extends Schema.TaggedError<JudgeUnavailable>()(
  "JudgeUnavailable",
  {
    detail: Schema.String,
    kind: Schema.Literals(["timeout", "service", "unreadable"]),
  }
) {
  override get message(): string {
    return `The decision model ${JUDGE_MODEL} was unavailable (${this.kind}): ${this.detail}. The judged step is skipped; the scan's other results stand.`;
  }
}
