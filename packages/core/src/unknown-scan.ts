import { Schema } from "effect";

export class UnknownScan extends Schema.TaggedError<UnknownScan>()(
  "UnknownScan",
  {
    slug: Schema.String,
  }
) {
  override get message(): string {
    return `No scan exists for "${this.slug}". Start one with startScan.`;
  }
}
