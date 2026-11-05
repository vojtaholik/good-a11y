import { Result, Schema } from "effect";

import { AxeResultsJson } from "./axe-results.js";
import { MAX_SAMPLES } from "./check.js";
import { verifiedText } from "./reference.js";
import type { Sourced } from "./reference.js";

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

const ReflowMeasuredSchema = Schema.Struct({
  clientWidth: Count,
  offenders: Schema.Array(
    Schema.Struct({
      exempt: Schema.Boolean,
      right: Schema.Number,
      snippet: Schema.String,
    })
  ),
  scrollWidth: Count,
});

const StopSchema = Schema.Struct({
  changed: Schema.optional(Count),
  coverShare: Schema.optional(Schema.NullOr(Schema.Number)),
  judged: Schema.Boolean,
  key: Schema.Int,
  modal: Schema.optional(Schema.Boolean),
  obscuredBy: Schema.optional(Schema.NullOr(Schema.String)),
  snippet: Schema.String,
});

type Stop = typeof StopSchema.Type;

const CandidateSchema = Schema.Struct({
  clippedAway: Schema.Boolean,
  composite: Schema.Boolean,
  hidden: Schema.Boolean,
  key: Count,
  radioGroup: Schema.NullOr(Schema.String),
  snippet: Schema.String,
  tabindex: Schema.NullOr(Schema.String),
});

const WalkMeasuredSchema = Schema.Struct({
  backward: Schema.NullOr(Schema.Array(StopSchema)),
  candidates: Schema.Array(CandidateSchema),
  cycled: Schema.Boolean,
  forward: Schema.Array(StopSchema),
  navigated: Schema.Boolean,
  onFocus: Schema.NullOr(
    Schema.Struct({ snippet: Schema.String, to: Schema.String })
  ),
  presses: Count,
});

type WalkMeasured = typeof WalkMeasuredSchema.Type;

const LowSchema = Schema.Struct({
  ratio: Schema.Finite,
  snippet: Schema.String,
});

const ContrastPartSchema = Schema.Struct({
  judged: Count,
  low: Schema.Array(LowSchema),
});

const OrientationRuleSchema = Schema.Struct({
  active: Schema.Boolean,
  hide: Schema.Boolean,
  media: Schema.String,
  rotate: Schema.Boolean,
  selector: Schema.String,
  share: Schema.Finite,
});

const OrientationReadSchema = Schema.Struct({
  rules: Schema.Array(OrientationRuleSchema),
  text: Count,
});

const KeyReadSchema = Schema.Struct({
  changed: Schema.Array(Schema.String),
  focus: Schema.NullOr(Schema.String),
  snippet: Schema.NullOr(Schema.String),
});

const KeyTrialSchema = Schema.Struct({
  control: Schema.NullOr(KeyReadSchema),
  navigated: Schema.Boolean,
  pressed: Schema.NullOr(KeyReadSchema),
});

const KeyMeasuredSchema = Schema.Struct({
  key: Schema.String,
  trials: Schema.Array(KeyTrialSchema),
});

const HoverMeasuredSchema = Schema.Struct({
  closedOnLeave: Schema.Boolean,
  escapeClosed: Schema.Boolean,
  focusEscapeClosed: Schema.NullOr(Schema.Boolean),
  focusShown: Schema.Boolean,
  obscures: Schema.Boolean,
  persisted: Schema.Boolean,
  reshown: Schema.Boolean,
  snippet: Schema.String,
  stayedOnHover: Schema.Boolean,
  trigger: Schema.String,
});

export const InteractionMeasuredSchema = Schema.Struct({
  contrast: Schema.NullOr(
    Schema.Struct({ fields: ContrastPartSchema, icons: ContrastPartSchema })
  ),
  hover: Schema.NullOr(Schema.Array(HoverMeasuredSchema)),
  keys: Schema.NullOr(Schema.Array(KeyMeasuredSchema)),
  orientation: Schema.NullOr(
    Schema.Struct({
      landscape: OrientationReadSchema,
      portrait: OrientationReadSchema,
    })
  ),
});

export type InteractionMeasured = typeof InteractionMeasuredSchema.Type;

export const ProbesMeasuredSchema = Schema.Struct({
  interaction: Schema.NullOr(InteractionMeasuredSchema),
  reflow: Schema.NullOr(ReflowMeasuredSchema),
  targetSize: Schema.NullOr(Schema.String),
  walk: Schema.NullOr(WalkMeasuredSchema),
});

export type ProbesMeasured = typeof ProbesMeasuredSchema.Type;

export const ProbesJson = Schema.fromJsonString(ProbesMeasuredSchema);

export const ProbeIdSchema = Schema.Literals([
  "reflow",
  "focus-visible",
  "keyboard-reach",
  "keyboard-trap",
  "focus-obscured",
  "on-focus",
  "target-size",
  "character-keys",
  "hover-content",
  "orientation",
  "non-text-contrast",
]);

export type ProbeId = typeof ProbeIdSchema.Type;

export const ProbeResultSchema = Schema.Struct({
  criterion: Schema.String,
  failing: Count,
  newer: Schema.Boolean,
  probe: ProbeIdSchema,
  samples: Schema.Array(Schema.String).check(Schema.isMaxLength(MAX_SAMPLES)),
  status: Schema.Literals(["pass", "fail", "not_applicable"]),
});

export type ProbeResult = typeof ProbeResultSchema.Type;

interface ProbeSpec {
  readonly criterion: string;
  readonly help: string;
  readonly newer: boolean;
  readonly title: string;
}

export const PROBES: Readonly<Record<ProbeId, ProbeSpec>> = {
  "character-keys": {
    criterion: "2.1.4",
    help: "With no field focused, pressing one letter, number or symbol key moved focus, changed the page or sent it elsewhere, the same way twice.",
    newer: false,
    title: "Single-key shortcuts that fire with no field focused",
  },
  "focus-obscured": {
    criterion: "2.4.11",
    help: "A focused control was fully hidden behind a fixed or sticky layer.",
    newer: true,
    title: "Focused controls hidden behind a fixed layer",
  },
  "focus-visible": {
    criterion: "2.4.7",
    help: "A control reached with the Tab key showed no visible change when it got focus.",
    newer: false,
    title: "Focus that cannot be seen",
  },
  "hover-content": {
    criterion: "1.4.13",
    help: "Content that appeared on hover or focus vanished when the pointer moved onto it or while it rested there, or covered other content and Escape did not close it.",
    newer: false,
    title: "Hover content that cannot be reached or dismissed",
  },
  "keyboard-reach": {
    criterion: "2.1.1",
    help: "A visible control was never reached with the Tab key.",
    newer: false,
    title: "Controls the Tab key never reaches",
  },
  "keyboard-trap": {
    criterion: "2.1.2",
    help: "The Tab key kept cycling among a few controls and never left them, in both directions.",
    newer: false,
    title: "Keyboard focus that cannot leave",
  },
  "non-text-contrast": {
    criterion: "1.4.11",
    help: "A form field's border, or the one solid colour of an icon-only control, has less than 3:1 contrast with the solid background next to it.",
    newer: false,
    title: "Field borders and icons below 3:1 contrast",
  },
  "on-focus": {
    criterion: "3.2.1",
    help: "Moving focus to a control with the Tab key sent the page to another address.",
    newer: false,
    title: "Focus that moves the page elsewhere",
  },
  orientation: {
    criterion: "1.3.4",
    help: "A style for one screen orientation hides or turns most of the page, so the page works in one orientation only.",
    newer: false,
    title: "Content locked to one screen orientation",
  },
  reflow: {
    criterion: "1.4.10",
    help: "At 320 CSS pixels wide the page scrolls sideways.",
    newer: false,
    title: "Sideways scrolling at 320 CSS pixels",
  },
  "target-size": {
    criterion: "2.5.8",
    help: "A target is smaller than 24 by 24 CSS pixels and has too little space around it.",
    newer: true,
    title: "Targets smaller than 24 by 24 CSS pixels",
  },
};

export const FOCUS_JUDGED_STOPS = 50;

export const TRAP_PRESSES = 50;

export const TRAP_SIZE = 3;

export const OVERLAY_SHARE = 0.5;

const behindOverlay = (stop: Stop): boolean =>
  (stop.coverShare ?? 0) >= OVERLAY_SHARE;

export const scFactOf = (probe: ProbeId): string => {
  const { criterion, newer } = PROBES[probe];

  return newer ? `STD-SC22-${criterion}` : `STD-SC-${criterion}`;
};

export const probeFact = (probe: ProbeId): Sourced | null =>
  verifiedText(scFactOf(probe));

const result = (
  probe: ProbeId,
  failing: readonly string[],
  status: ProbeResult["status"]
): ProbeResult => ({
  criterion: PROBES[probe].criterion,
  failing: failing.length,
  newer: PROBES[probe].newer,
  probe,
  samples: failing.slice(0, MAX_SAMPLES),
  status,
});

const judged = (probe: ProbeId, failing: readonly string[]): ProbeResult =>
  result(probe, failing, failing.length > 0 ? "fail" : "pass");

const notApplicable = (probe: ProbeId): ProbeResult =>
  result(probe, [], "not_applicable");

export const decideReflow = (
  measured: typeof ReflowMeasuredSchema.Type
): ProbeResult => {
  if (measured.scrollWidth <= measured.clientWidth + 1) {
    return judged("reflow", []);
  }

  const [widest] = measured.offenders;

  if (widest === undefined) {
    return notApplicable("reflow");
  }

  if (widest.exempt) {
    return judged("reflow", []);
  }

  return {
    ...judged(
      "reflow",
      measured.offenders
        .filter((offender) => !offender.exempt)
        .map((offender) => offender.snippet)
    ),
    failing: 1,
  };
};

const firstOfEachKey = (stops: readonly Stop[]): readonly Stop[] => {
  const seen = new Set<number>();

  return stops.filter((stop) => {
    if (stop.key < 0 || seen.has(stop.key)) {
      return false;
    }

    seen.add(stop.key);

    return true;
  });
};

export const decideFocusVisible = (walk: WalkMeasured): ProbeResult => {
  const stops = firstOfEachKey(walk.forward)
    .filter((stop) => stop.judged && (stop.obscuredBy ?? null) === null)
    .slice(0, FOCUS_JUDGED_STOPS);

  return stops.length === 0
    ? notApplicable("focus-visible")
    : judged(
        "focus-visible",
        stops.filter((stop) => stop.changed === 0).map((stop) => stop.snippet)
      );
};

export const decideFocusObscured = (walk: WalkMeasured): ProbeResult => {
  const stops = firstOfEachKey(walk.forward).filter(
    (stop) => stop.judged && stop.modal !== true && !behindOverlay(stop)
  );

  return stops.length === 0
    ? notApplicable("focus-obscured")
    : judged(
        "focus-obscured",
        stops.flatMap((stop) =>
          (stop.obscuredBy ?? null) === null
            ? []
            : [
                `${stop.snippet.slice(0, 120)} | under ${(stop.obscuredBy ?? "").slice(0, 70)}`,
              ]
        )
      );
};

export const decideKeyboardReach = (walk: WalkMeasured): ProbeResult => {
  const reachedStops = firstOfEachKey(walk.forward);

  if (
    !walk.cycled ||
    walk.candidates.length === 0 ||
    reachedStops.filter((stop) => stop.modal === true).length * 2 >=
      reachedStops.length
  ) {
    return notApplicable("keyboard-reach");
  }

  const reached = new Set(reachedStops.map((stop) => stop.key));

  const reachedGroups = new Set(
    walk.candidates.flatMap((candidate) =>
      candidate.radioGroup !== null && reached.has(candidate.key)
        ? [candidate.radioGroup]
        : []
    )
  );

  return judged(
    "keyboard-reach",
    walk.candidates
      .filter(
        (candidate) =>
          !reached.has(candidate.key) &&
          !candidate.clippedAway &&
          !candidate.composite &&
          !candidate.hidden &&
          (candidate.radioGroup === null ||
            !reachedGroups.has(candidate.radioGroup))
      )
      .map((candidate) => candidate.snippet)
  );
};

const trappedIn = (stops: readonly Stop[]): readonly Stop[] | null => {
  if (stops.length < TRAP_PRESSES) {
    return null;
  }

  const tail = stops.slice(-TRAP_PRESSES);
  const distinct = firstOfEachKey(tail);

  return distinct.length > 0 &&
    distinct.length <= TRAP_SIZE &&
    distinct.length === new Set(tail.map((stop) => stop.key)).size &&
    distinct.every((stop) => stop.modal !== true)
    ? distinct
    : null;
};

export const decideKeyboardTrap = (walk: WalkMeasured): ProbeResult => {
  if (walk.cycled) {
    return judged("keyboard-trap", []);
  }

  const forward = trappedIn(walk.forward);
  const backward = walk.backward === null ? null : trappedIn(walk.backward);

  if (
    forward === null ||
    backward === null ||
    walk.candidates.length <= forward.length
  ) {
    return notApplicable("keyboard-trap");
  }

  return judged(
    "keyboard-trap",
    forward.map((stop) => stop.snippet)
  );
};

export const decideOnFocus = (walk: WalkMeasured): ProbeResult => {
  if (walk.onFocus !== null) {
    return judged("on-focus", [
      `${walk.onFocus.snippet.slice(0, 120)} | goes to ${walk.onFocus.to.slice(0, 80)}`,
    ]);
  }

  return walk.cycled && !walk.navigated
    ? judged("on-focus", [])
    : notApplicable("on-focus");
};

const decodeAxe = Schema.decodeUnknownResult(AxeResultsJson);

export const decideTargetSize = (axeJson: string): ProbeResult | null => {
  const decoded = decodeAxe(axeJson);

  if (Result.isFailure(decoded)) {
    return null;
  }

  const { passes, violations } = decoded.success;

  const failing = violations
    .filter((rule) => rule.id === "target-size")
    .flatMap((rule) => rule.nodes.map((node) => node.html));

  if (failing.length > 0) {
    return judged("target-size", failing);
  }

  return passes.some((rule) => rule.id === "target-size")
    ? judged("target-size", [])
    : notApplicable("target-size");
};

type KeyTrial = typeof KeyTrialSchema.Type;

const effectOf = (trial: KeyTrial): string | null => {
  const { control, navigated, pressed } = trial;

  if (
    control === null ||
    pressed === null ||
    control.focus !== null ||
    control.changed.length > 0
  ) {
    return null;
  }

  if (navigated) {
    return "sends the page to another address";
  }

  if (pressed.focus !== null) {
    return `moves focus to ${pressed.snippet ?? pressed.focus}`;
  }

  return pressed.changed.length > 0
    ? `changes the page: ${pressed.changed.toSorted().join(", ")}`
    : "";
};

const cleanTrial = (trial: KeyTrial): boolean => effectOf(trial) !== null;

export const decideCharacterKeys = (
  keys: NonNullable<InteractionMeasured["keys"]>
): ProbeResult => {
  const judgedKeys = keys.filter(({ trials }) => trials.some(cleanTrial));

  if (judgedKeys.length === 0) {
    return notApplicable("character-keys");
  }

  return judged(
    "character-keys",
    judgedKeys.flatMap(({ key, trials }) => {
      const [first, second] = trials.map(effectOf);

      return first !== undefined &&
        first !== null &&
        first !== "" &&
        first === second
        ? [`Pressing "${key}" with no field focused ${first}`]
        : [];
    })
  );
};

type HoverMeasured = typeof HoverMeasuredSchema.Type;

const hoverFailure = (hover: HoverMeasured): string | null => {
  if (!hover.stayedOnHover) {
    return "disappears when the pointer moves onto it";
  }

  if (!hover.persisted) {
    return "disappears by itself while the pointer rests on it";
  }

  if (hover.obscures && !hover.escapeClosed) {
    return "covers other content and Escape does not close it";
  }

  return hover.obscures && hover.focusEscapeClosed === false
    ? "opens on focus, covers other content and Escape does not close it"
    : null;
};

export const decideHoverContent = (
  hovers: readonly HoverMeasured[]
): ProbeResult => {
  const confirmed = hovers.filter(
    (hover) => hover.closedOnLeave && hover.reshown
  );

  if (confirmed.length === 0) {
    return notApplicable("hover-content");
  }

  return judged(
    "hover-content",
    confirmed.flatMap((hover) => {
      const failure = hoverFailure(hover);

      return failure === null
        ? []
        : [
            `${hover.snippet} (shown on hover over ${hover.trigger}) ${failure}`,
          ];
    })
  );
};

export const LOCKED_SHARE = 0.5;

type OrientationRead = typeof OrientationReadSchema.Type;

const lockedIn = (
  name: string,
  here: OrientationRead,
  there: OrientationRead
): readonly string[] =>
  here.rules.flatMap((rule) => {
    if (!rule.active) {
      return [];
    }

    const elsewhere =
      there.rules.find(
        (other) =>
          other.selector === rule.selector && other.media === rule.media
      )?.share ?? 0;

    const rotated =
      rule.rotate && Math.max(rule.share, elsewhere) >= LOCKED_SHARE;

    const hidden =
      rule.hide &&
      elsewhere >= LOCKED_SHARE &&
      here.text < there.text * LOCKED_SHARE;

    return rotated || hidden
      ? [
          `In ${name} orientation, @media ${rule.media} ${rotated ? "turns" : "hides"} ${rule.selector}`,
        ]
      : [];
  });

export const decideOrientation = (
  orientation: NonNullable<InteractionMeasured["orientation"]>
): ProbeResult => {
  const { landscape, portrait } = orientation;

  if (landscape.text === 0 && portrait.text === 0) {
    return notApplicable("orientation");
  }

  return judged("orientation", [
    ...lockedIn("portrait", portrait, landscape),
    ...lockedIn("landscape", landscape, portrait),
  ]);
};

export const decideNonTextContrast = (
  contrast: NonNullable<InteractionMeasured["contrast"]>
): ProbeResult => {
  const { fields, icons } = contrast;

  if (fields.judged + icons.judged === 0) {
    return notApplicable("non-text-contrast");
  }

  return judged("non-text-contrast", [
    ...fields.low.map(
      (low) =>
        `Field border ${low.ratio}:1 against its background: ${low.snippet}`
    ),
    ...icons.low.map(
      (low) => `Icon ${low.ratio}:1 against its background: ${low.snippet}`
    ),
  ]);
};

export const interactionResults = (
  interaction: InteractionMeasured
): readonly ProbeResult[] => [
  ...(interaction.contrast === null
    ? []
    : [decideNonTextContrast(interaction.contrast)]),
  ...(interaction.hover === null
    ? []
    : [decideHoverContent(interaction.hover)]),
  ...(interaction.keys === null ? [] : [decideCharacterKeys(interaction.keys)]),
  ...(interaction.orientation === null
    ? []
    : [decideOrientation(interaction.orientation)]),
];

export const probeResults = (
  measured: ProbesMeasured
): readonly ProbeResult[] => [
  ...(measured.reflow === null ? [] : [decideReflow(measured.reflow)]),
  ...(measured.walk === null
    ? []
    : [
        decideFocusVisible(measured.walk),
        decideKeyboardReach(measured.walk),
        decideKeyboardTrap(measured.walk),
        decideFocusObscured(measured.walk),
        decideOnFocus(measured.walk),
      ]),
  ...(measured.targetSize === null
    ? []
    : [decideTargetSize(measured.targetSize)].filter(
        (decided): decided is ProbeResult => decided !== null
      )),
  ...(measured.interaction === null
    ? []
    : interactionResults(measured.interaction)),
];
