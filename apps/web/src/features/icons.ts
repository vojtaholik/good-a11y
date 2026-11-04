import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import { sx } from "./sx.js";
import { colors } from "./tokens.stylex.js";

const mark = stylex.create({ inner: { fill: colors["--accent"] } });

type Icon = <M>(h: HtmlBuilder<M>, size: number) => Html;

const frame = <M>(
  h: HtmlBuilder<M>,
  size: number,
  strokeWidth: string,
  children: readonly Html[]
): Html =>
  h.svg(
    [
      h.AriaHidden(true),
      h.Width(String(size)),
      h.Height(String(size)),
      h.ViewBox("0 0 24 24"),
      h.Fill("none"),
      h.Stroke("currentColor"),
      h.StrokeWidth(strokeWidth),
    ],
    [...children]
  );

export const wordmarkIcon = <M>(h: HtmlBuilder<M>, size: number): Html =>
  h.svg(
    [
      h.AriaHidden(true),
      h.Width(String(size)),
      h.Height(String(size)),
      h.ViewBox("0 0 32 32"),
    ],
    [
      h.rect([
        h.X("1.5"),
        h.Y("1.5"),
        h.Width("29"),
        h.Height("29"),
        h.Rx("7"),
        h.Fill("none"),
        h.Stroke("currentColor"),
        h.StrokeWidth("3"),
      ]),
      h.rect([
        h.X("8"),
        h.Y("8"),
        h.Width("16"),
        h.Height("16"),
        h.Rx("3"),
        sx(h, mark.inner),
      ]),
    ]
  );

export const infoIcon: Icon = (h, size) =>
  frame(h, size, "2", [
    h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]),
    h.path([h.D("M12 11v6M12 7.5v.5")]),
  ]);

export const progressIcon: Icon = (h, size) =>
  frame(h, size, "2", [h.path([h.D("M12 3a9 9 0 1 0 9 9")])]);

export const warningIcon: Icon = (h, size) =>
  frame(h, size, "2", [
    h.path([h.D("M12 3 2 20h20L12 3Z")]),
    h.path([h.D("M12 10v4M12 17v.5")]),
  ]);

export const checkIcon: Icon = (h, size) =>
  frame(h, size, "2.5", [h.path([h.D("M4 12.5 9.5 18 20 6")])]);

export const crossIcon: Icon = (h, size) =>
  frame(h, size, "2.5", [h.path([h.D("M6 6l12 12M18 6 6 18")])]);

export const copyIcon = <M>(h: HtmlBuilder<M>): Html =>
  frame(h, 16, "2.2", [
    h.rect([h.X("8"), h.Y("8"), h.Width("12"), h.Height("12"), h.Rx("2")]),
    h.path([h.D("M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3")]),
  ]);
