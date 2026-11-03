import { Schema } from "effect";

export class DailyCapReached extends Schema.TaggedError<DailyCapReached>()(
  "DailyCapReached",
  {
    limit: Schema.Int,
    what: Schema.Literals(["scans", "messages"]),
  }
) {
  override get message(): string {
    return `Today's cap of ${this.limit} new ${this.what} is reached. It resets on its own within a day; try again tomorrow.`;
  }
}
