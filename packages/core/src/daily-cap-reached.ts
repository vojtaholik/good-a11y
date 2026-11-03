import { Schema } from "effect";

export class DailyCapReached extends Schema.TaggedError<DailyCapReached>()(
  "DailyCapReached",
  {
    limit: Schema.Int,
  }
) {
  override get message(): string {
    return `Today's cap of ${this.limit} new scans is reached. It resets on its own within a day; try again tomorrow.`;
  }
}
