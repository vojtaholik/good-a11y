import {
  NOT_SELLING_LEAD,
  notSellingBasis,
  sellsLine,
} from "@good-a11y/core/contracts";
import type { ProfileLine, Report, StateRef } from "@good-a11y/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { flagOf } from "./flags.js";
import { report as styles } from "./report-styles.js";
import { sx } from "./sx.js";

const flagView = (code: string, h: HtmlBuilder<AppMessage>): Html[] => {
  const flag = flagOf(code);

  return flag === undefined
    ? []
    : [h.img([h.Src(flag), h.Alt(""), h.AriaHidden(true), sx(h, styles.flag)])];
};

const lineView = (line: ProfileLine, h: HtmlBuilder<AppMessage>): Html[] => [
  h.dt([sx(h, styles.factTerm)], [line.label]),
  ...(line.values.length === 0
    ? [h.dd([sx(h, styles.factValue)], ["Unknown: no verified source yet"])]
    : line.values.map((value) =>
        h.dd(
          [sx(h, styles.factValue)],
          [
            `${value.text} `,
            h.a([h.Href(value.source), sx(h, styles.sourceLink)], ["source"]),
          ]
        )
      )),
];

const stateView = (state: StateRef, h: HtmlBuilder<AppMessage>): Html =>
  h.li(
    [],
    [
      h.details(
        [sx(h, styles.stateBox)],
        [
          h.summary(
            [sx(h, styles.state)],
            [...flagView(state.code, h), state.name]
          ),
          h.div(
            [sx(h, styles.stateBody)],
            [
              ...(state.reason === null
                ? []
                : [h.p([sx(h, styles.meta)], [state.reason])]),
              h.dl(
                [sx(h, styles.facts)],
                state.profile.flatMap((line) => [h.div([], lineView(line, h))])
              ),
            ]
          ),
        ]
      ),
    ]
  );

const groupView = (
  id: string,
  title: string,
  states: readonly StateRef[],
  h: HtmlBuilder<AppMessage>
): Html[] =>
  states.length === 0
    ? []
    : [
        h.h3([h.Id(id), sx(h, styles.cardTitle)], [title]),
        h.ul(
          [
            sx(h, styles.states),
            h.AriaLabelledBy(id),
            h.DataAttribute("states", ""),
          ],
          states.map((state) => stateView(state, h))
        ),
      ];

export const statesSection = (
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html => {
  const { applies, exemption, unknown } = report.applicability;

  const sells = sellsLine(report);

  const basis = notSellingBasis(report);

  return h.section(
    [sx(h, styles.section), h.AriaLabelledBy("states")],
    [
      h.h2(
        [h.Id("states"), sx(h, styles.sectionTitle)],
        ["Where the EAA applies"]
      ),
      h.p(
        [],
        [
          "This depends on each member state's law, not on the issue, so it is the same for every issue above. Open a state to see its law, dates, enforcement body and penalties, each linked to its source.",
        ]
      ),
      ...(sells === null ? [] : [h.p([sx(h, styles.meta)], [sells])]),
      ...(basis === null
        ? []
        : [
            h.p(
              [sx(h, styles.meta)],
              [
                `${NOT_SELLING_LEAD} Definition: `,
                h.a([h.Href(basis.source), sx(h, styles.link)], [basis.text]),
                ` (${basis.factId}).`,
              ]
            ),
          ]),
      ...(exemption === null
        ? []
        : [
            h.p(
              [],
              [
                h.a(
                  [h.Href(exemption.source), sx(h, styles.link)],
                  [exemption.text]
                ),
                ` (${exemption.factId}).`,
              ]
            ),
          ]),
      ...groupView(
        "states-covered",
        `Covers e-commerce services (${applies.length})`,
        applies,
        h
      ),
      ...(applies.length === 0
        ? [h.p([], ["No member state is confirmed yet from verified sources."])]
        : []),
      ...groupView("states-unknown", `Unknown (${unknown.length})`, unknown, h),
    ]
  );
};
