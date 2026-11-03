import { Clock, Effect, Random } from "effect";

const NONCE_SPACE = 36 ** 8;

export const newId = Effect.fn("newId")(function* newId(prefix: string) {
  const at = yield* Clock.currentTimeMillis;
  const nonce = yield* Random.nextIntBetween(0, NONCE_SPACE - 1);

  return `${prefix}-${at.toString(36)}-${nonce.toString(36).padStart(8, "0")}`;
});
