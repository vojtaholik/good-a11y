import { Runtime, Schema } from "effect";

export class ScanTargetRejected extends Schema.TaggedError<ScanTargetRejected>()(
  "ScanTargetRejected",
  {
    input: Schema.String,
    reason: Schema.String,
    rule: Schema.Literals([
      "not_a_url",
      "scheme",
      "credentials",
      "port",
      "ip_address",
      "not_public",
    ]),
  }
) {
  override readonly [Runtime.errorExitCode] = 1;
  override readonly [Runtime.errorReported] = false;

  override get message(): string {
    return `Cannot scan "${this.input}" (${this.rule}). Pass a public http or https address without a port or credentials, for example example.com.`;
  }
}
