export const CHECK_GUIDES = {
  "alt-placeholder": ["image-alt"],
  "autocomplete-valid": ["required-and-hints"],
  "axe:aria-input-field-name": ["combobox-autocomplete"],
  "axe:bypass": ["skip-link-landmarks"],
  "axe:focus-obscured": ["focus-visible"],
  "axe:focus-visible": ["focus-visible"],
  "button-name": ["icon-buttons"],
  "document-title": ["spa-route-change"],
  "form-labels": ["required-and-hints", "custom-select"],
  "image-alt": ["image-alt"],
  "link-name": ["icon-buttons"],
  "title-generic": ["spa-route-change"],
} as const satisfies Readonly<Record<string, readonly string[]>>;

const GUIDES_BY_CHECK: ReadonlyMap<string, readonly string[]> = new Map(
  Object.entries(CHECK_GUIDES)
);

export const guidesForCheck = (key: string): readonly string[] =>
  GUIDES_BY_CHECK.get(key) ?? [];
