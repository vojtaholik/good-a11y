import { Schema } from "effect";

export class ScanStepFailed extends Schema.TaggedError<ScanStepFailed>()(
  "ScanStepFailed",
  {
    detail: Schema.String,
    scanId: Schema.String,
    step: Schema.Literals(["scan", "render", "judge", "store", "fail"]),
  }
) {
  override get message(): string {
    return `Scan ${this.scanId} failed in its ${this.step} step: ${this.detail}. The step's own retries are spent; read the Workflow instance for each attempt.`;
  }
}
