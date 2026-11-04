import { Context } from "effect";

export class Caller extends Context.Service<
  Caller,
  { readonly name: string }
>()("@good-a11y/capability/test/Caller") {}
