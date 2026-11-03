import { Schema } from "effect";

export class ScanStoreError extends Schema.TaggedError<ScanStoreError>()(
  "ScanStoreError",
  {
    cause: Schema.Defect(),
    operation: Schema.Literals([
      "begin",
      "enter",
      "publish",
      "fail",
      "latest",
      "reserve",
      "keep",
    ]),
  }
) {
  override get message(): string {
    return `The scan store failed during ${this.operation}. Check the D1 binding and that its migrations ran.`;
  }
}

export const failedDuring =
  (operation: ScanStoreError["operation"]) =>
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- A driver or decoding failure of any type becomes the cause of one typed store error.
  (cause: unknown) =>
    new ScanStoreError({ cause, operation });
