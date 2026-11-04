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

export const ProbesMeasuredSchema = Schema.Struct({
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
  "on-focus": {
    criterion: "3.2.1",
    help: "Moving focus to a control with the Tab key sent the page to another address.",
    newer: false,
    title: "Focus that moves the page elsewhere",
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
];
