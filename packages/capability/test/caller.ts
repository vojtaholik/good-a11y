import { Context } from "effect";

export class Caller extends Context.Service<
  Caller,
  { readonly name: string }
>()("@eaa-check/capability/test/Caller") {}
