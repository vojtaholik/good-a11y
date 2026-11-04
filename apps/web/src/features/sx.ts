import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { HtmlBuilder } from "foldkit/html";

export const sx = <M>(
  h: HtmlBuilder<M>,
  ...rules: readonly (StyleXStyles | null)[]
) => h.Class(stylex.props(...rules).className ?? "");
