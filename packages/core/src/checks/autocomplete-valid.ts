import { counted } from "../check.js";
import type { Check } from "../check.js";

const FIELD_NAMES = new Set([
  "additional-name",
  "address-level1",
  "address-level2",
  "address-level3",
  "address-level4",
  "address-line1",
  "address-line2",
  "address-line3",
  "bday",
  "bday-day",
  "bday-month",
  "bday-year",
  "cc-additional-name",
  "cc-csc",
  "cc-exp",
  "cc-exp-month",
  "cc-exp-year",
  "cc-family-name",
  "cc-given-name",
  "cc-name",
  "cc-number",
  "cc-type",
  "country",
  "country-name",
  "current-password",
  "family-name",
  "given-name",
  "honorific-prefix",
  "honorific-suffix",
  "language",
  "name",
  "new-password",
  "nickname",
  "one-time-code",
  "organization",
  "organization-title",
  "photo",
  "postal-code",
  "sex",
  "street-address",
  "transaction-amount",
  "transaction-currency",
  "url",
  "username",
]);

const CONTACT_NAMES = new Set([
  "email",
  "impp",
  "tel",
  "tel-area-code",
  "tel-country-code",
  "tel-extension",
  "tel-local",
  "tel-local-prefix",
  "tel-local-suffix",
  "tel-national",
]);

const CONTACT_KINDS = new Set(["fax", "home", "mobile", "pager", "work"]);

const ADDRESS_KINDS = new Set(["billing", "shipping"]);

const TOGGLES = new Set(["off", "on"]);

const SEPARATOR = /\s+/u;

const tokensOf = (value: string): readonly string[] =>
  value.trim().toLowerCase().split(SEPARATOR);

export const isToggle = (value: string): boolean => {
  const tokens = tokensOf(value);

  return tokens.length === 1 && TOGGLES.has(tokens[0] ?? "");
};

const fieldEnd = (
  tokens: readonly string[],
  at: number
): number | undefined => {
  const token = tokens[at] ?? "";

  if (CONTACT_KINDS.has(token)) {
    return CONTACT_NAMES.has(tokens[at + 1] ?? "") ? at + 2 : undefined;
  }

  return FIELD_NAMES.has(token) || CONTACT_NAMES.has(token)
    ? at + 1
    : undefined;
};

export const isAutofillDetail = (value: string): boolean => {
  const tokens = tokensOf(value);

  const afterSection = tokens[0]?.startsWith("section-") === true ? 1 : 0;

  const afterAddress = ADDRESS_KINDS.has(tokens[afterSection] ?? "")
    ? afterSection + 1
    : afterSection;

  const end = fieldEnd(tokens, afterAddress);

  if (end === undefined) {
    return false;
  }

  return (
    end === tokens.length ||
    (end === tokens.length - 1 && tokens[end] === "webauthn")
  );
};

export const autocompleteValid: Check = {
  evaluate: ({ controls }) =>
    counted(
      "autocomplete-valid",
      controls.filter(
        ({ autocomplete }) =>
          autocomplete !== null &&
          autocomplete.trim() !== "" &&
          !isToggle(autocomplete)
      ),
      ({ autocomplete }) => !isAutofillDetail(autocomplete ?? ""),
      ({ snippet }) => snippet
    ),
  id: "autocomplete-valid",
  title: "Autocomplete values on form fields are valid",
  whatFails:
    'A form field has an autocomplete value that is not a valid HTML autofill token list, for example a made-up value such as autocomplete="nope".',
};
