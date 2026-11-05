import type { Grader } from "./grader.js";
import { grader as comboboxAutocomplete } from "./guides/combobox-autocomplete.js";
import { grader as confirmBeforePurchase } from "./guides/confirm-before-purchase.js";
import { grader as customSelect } from "./guides/custom-select.js";
import { grader as dialogModal } from "./guides/dialog-modal.js";
import { grader as disclosureAccordion } from "./guides/disclosure-accordion.js";
import { grader as focusVisible } from "./guides/focus-visible.js";
import { grader as formErrorsValidation } from "./guides/form-errors-validation.js";
import { grader as hoverPopups } from "./guides/hover-popups.js";
import { grader as iconButtons } from "./guides/icon-buttons.js";
import { grader as imageAlt } from "./guides/image-alt.js";
import { grader as inputPurpose } from "./guides/input-purpose.js";
import { grader as menuButton } from "./guides/menu-button.js";
import { grader as orientation } from "./guides/orientation.js";
import { grader as reducedMotion } from "./guides/reduced-motion.js";
import { grader as redundantEntry } from "./guides/redundant-entry.js";
import { grader as requiredAndHints } from "./guides/required-and-hints.js";
import { grader as signInWithoutPuzzles } from "./guides/sign-in-without-puzzles.js";
import { grader as skipLinkLandmarks } from "./guides/skip-link-landmarks.js";
import { grader as spaRouteChange } from "./guides/spa-route-change.js";
import { grader as statusMessagesToast } from "./guides/status-messages-toast.js";
import { grader as swipeAndDrag } from "./guides/swipe-and-drag.js";
import { grader as tabs } from "./guides/tabs.js";
import { grader as timeoutsAndWarnings } from "./guides/timeouts-and-warnings.js";

export const GRADERS: readonly Grader[] = [
  comboboxAutocomplete,
  confirmBeforePurchase,
  customSelect,
  dialogModal,
  disclosureAccordion,
  focusVisible,
  formErrorsValidation,
  hoverPopups,
  iconButtons,
  imageAlt,
  inputPurpose,
  menuButton,
  orientation,
  reducedMotion,
  redundantEntry,
  requiredAndHints,
  signInWithoutPuzzles,
  skipLinkLandmarks,
  spaRouteChange,
  statusMessagesToast,
  swipeAndDrag,
  tabs,
  timeoutsAndWarnings,
];

export const graderFor = (guide: string): Grader | undefined =>
  GRADERS.find((grader) => grader.guide === guide);
