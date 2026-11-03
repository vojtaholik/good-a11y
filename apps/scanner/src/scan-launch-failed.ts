import { Schema } from "effect";

export class ScanLaunchFailed extends Schema.TaggedError<ScanLaunchFailed>()(
  "ScanLaunchFailed",
  {
    cause: Schema.Defect(),
    scanId: Schema.String,
  }
) {
  override get message(): string {
    return `Could not start the Workflow instance for scan ${this.scanId}. Check the ScanWorkflow binding and the account's Workflows limits.`;
  }
}
