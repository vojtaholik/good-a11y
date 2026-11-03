import type { Observation, Report } from "@eaa-check/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/model.js";
import { judged as judgedStyles } from "./judged-styles.js";
import { referenceList } from "./report-references.js";
import { report as styles } from "./report-styles.js";
import { sx } from "./sx.js";

const percent = (probability: number): string =>
  `${Math.round(probability * 100)}%`;

const countText = (observation: Observation): string =>
  `Noted for ${observation.noted} of ${observation.asked} ${observation.asked === 1 ? "item" : "items"} the model was asked about`;

const observationCard = (
  observation: Observation,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.keyed("li")(
    observation.id,
    [sx(h, judgedStyles.card)],
    [
      h.h3([sx(h, styles.cardTitle)], [observation.title]),
      h.p([sx(h, styles.meta)], [countText(observation)]),
      h.p([sx(h, styles.text)], [observation.about]),
      h.ul(
        [sx(h, styles.samples), h.AriaLabel("What the model noted")],
        observation.notes.map((note) =>
          h.li(
            [],
            [
              h.code([sx(h, styles.sample)], [note.sample]),
              h.span(
                [sx(h, judgedStyles.confidence)],
                [`Model confidence ${percent(note.confidence)}`]
              ),
            ]
          )
        )
      ),
      ...(observation.relatesTo.length === 0
        ? []
        : [
            h.p([sx(h, styles.meta)], ["The question relates to:"]),
            ...referenceList(observation.relatesTo, h),
          ]),
    ]
  );

const TITLE = "Judged by a model";

export const judgedSection = (
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html[] => {
  const { judged } = report;

  if (judged === null) {
    return [];
  }

  const heading = h.h2([h.Id("judged"), sx(h, styles.sectionTitle)], [TITLE]);

  if (judged.status === "skipped") {
    return [
      h.section(
        [sx(h, styles.section), h.AriaLabelledBy("judged")],
        [heading, h.p([sx(h, judgedStyles.label)], [judged.reason])]
      ),
    ];
  }

  const noted = judged.observations.filter(
    (observation) => observation.noted > 0
  );

  const asked = judged.observations.reduce(
    (total, observation) => total + observation.asked,
    0
  );

  return [
    h.section(
      [sx(h, styles.section), h.AriaLabelledBy("judged")],
      [
        heading,
        h.p([sx(h, judgedStyles.label)], [judged.label]),
        noted.length === 0
          ? h.p(
              [sx(h, styles.text)],
              [
                `The model noted nothing in the ${asked} ${asked === 1 ? "item" : "items"} it was asked about.`,
              ]
            )
          : h.ul(
              [sx(h, styles.samples)],
              noted.map((observation) => observationCard(observation, h))
            ),
      ]
    ),
  ];
};
