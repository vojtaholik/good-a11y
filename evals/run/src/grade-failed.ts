import { Schema } from "effect";

export class GradeFailed extends Schema.TaggedError<GradeFailed>()(
  "GradeFailed",
  {
    grader: Schema.Literals(["check", "playwright"]),
    problem: Schema.String,
  }
) {
  override get message(): string {
    return `The ${this.grader} grader did not produce a result: ${this.problem}`;
  }
}
