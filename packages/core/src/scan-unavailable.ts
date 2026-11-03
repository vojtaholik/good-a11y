import { Schema } from "effect";

export class ScanUnavailable extends Schema.TaggedError<ScanUnavailable>()(
  "ScanUnavailable",
  {
    operation: Schema.Literals(["startScan", "getScan", "sendMessage"]),
  }
) {
  override get message(): string {
    return `The scan service could not reach its storage during ${this.operation}. Try again in a few minutes.`;
  }
}
