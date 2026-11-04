import { Context } from "effect";

export const CALLER_HEADER = "x-eaa-caller";

export const UNKNOWN_CALLER = "unknown";

export class Caller extends Context.Service<Caller, { readonly key: string }>()(
  "@good-a11y/scanner/Caller"
) {}
