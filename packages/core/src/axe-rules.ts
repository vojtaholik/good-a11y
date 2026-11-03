interface AxeRuleSpec {
  readonly criteria: readonly string[];
  readonly title: string;
}

const RULES = {
  "area-alt": {
    criteria: ["2.4.4", "4.1.2"],
    title: "Image map areas without a text alternative",
  },
  "aria-allowed-attr": {
    criteria: ["4.1.2"],
    title: "ARIA attributes the element's role does not support",
  },
  "aria-braille-equivalent": {
    criteria: ["4.1.2"],
    title: "Braille ARIA attributes without a plain equivalent",
  },
  "aria-command-name": {
    criteria: ["4.1.2"],
    title: "ARIA buttons, links or menu items without a name",
  },
  "aria-conditional-attr": {
    criteria: ["4.1.2"],
    title: "ARIA attributes used against their role's rules",
  },
  "aria-deprecated-role": {
    criteria: ["4.1.2"],
    title: "Deprecated ARIA roles",
  },
  "aria-hidden-body": {
    criteria: ["1.3.1", "4.1.2"],
    title: 'aria-hidden="true" on the page body',
  },
  "aria-hidden-focus": {
    criteria: ["4.1.2"],
    title: "Hidden elements that can still take focus",
  },
  "aria-input-field-name": {
    criteria: ["4.1.2"],
    title: "ARIA input fields without a name",
  },
  "aria-meter-name": {
    criteria: ["1.1.1"],
    title: "ARIA meters without a name",
  },
  "aria-progressbar-name": {
    criteria: ["1.1.1"],
    title: "ARIA progress bars without a name",
  },
  "aria-prohibited-attr": {
    criteria: ["4.1.2"],
    title: "ARIA attributes the element's role prohibits",
  },
  "aria-required-attr": {
    criteria: ["4.1.2"],
    title: "ARIA roles missing an attribute they need",
  },
  "aria-required-children": {
    criteria: ["1.3.1"],
    title: "ARIA roles missing the children they need",
  },
  "aria-required-parent": {
    criteria: ["1.3.1"],
    title: "ARIA roles outside the parent they need",
  },
  "aria-roles": {
    criteria: ["4.1.2"],
    title: "Invalid ARIA role values",
  },
  "aria-tab-name": {
    criteria: ["4.1.2"],
    title: "ARIA tabs without a name",
  },
  "aria-toggle-field-name": {
    criteria: ["4.1.2"],
    title: "ARIA toggles without a name",
  },
  "aria-tooltip-name": {
    criteria: ["4.1.2"],
    title: "ARIA tooltips without a name",
  },
  "aria-valid-attr": {
    criteria: ["4.1.2"],
    title: "Misspelled or unknown ARIA attributes",
  },
  "aria-valid-attr-value": {
    criteria: ["4.1.2"],
    title: "ARIA attributes with invalid values",
  },
  "autocomplete-valid": {
    criteria: ["1.3.5"],
    title: "Fields with an invalid autocomplete value",
  },
  "avoid-inline-spacing": {
    criteria: ["1.4.12"],
    title: "Text spacing locked by inline styles",
  },
  blink: {
    criteria: ["2.2.2"],
    title: "Blinking text (<blink>)",
  },
  "button-name": {
    criteria: ["4.1.2"],
    title: "Buttons without a name",
  },
  bypass: {
    criteria: ["2.4.1"],
    title: "No way to skip repeated blocks",
  },
  "color-contrast": {
    criteria: ["1.4.3"],
    title: "Text with low contrast against its background",
  },
  "definition-list": {
    criteria: ["1.3.1"],
    title: "Definition lists with invalid children",
  },
  dlitem: {
    criteria: ["1.3.1"],
    title: "Definition terms or details outside a <dl>",
  },
  "document-title": {
    criteria: ["2.4.2"],
    title: "Page without a title",
  },
  "duplicate-id-aria": {
    criteria: ["4.1.2"],
    title: "Duplicate IDs referenced by ARIA or labels",
  },
  "form-field-multiple-labels": {
    criteria: ["3.3.2"],
    title: "Fields with more than one label",
  },
  "frame-focusable-content": {
    criteria: ["2.1.1"],
    title: "Frames with focusable content taken out of the tab order",
  },
  "frame-title": {
    criteria: ["4.1.2"],
    title: "Frames without a name",
  },
  "frame-title-unique": {
    criteria: ["4.1.2"],
    title: "Frames that share the same title",
  },
  "html-has-lang": {
    criteria: ["3.1.1"],
    title: "Page without a language",
  },
  "html-lang-valid": {
    criteria: ["3.1.1"],
    title: "Page language that is not a valid language tag",
  },
  "html-xml-lang-mismatch": {
    criteria: ["3.1.1"],
    title: "lang and xml:lang naming different languages",
  },
  "image-alt": {
    criteria: ["1.1.1"],
    title: "Images without a text alternative",
  },
  "input-button-name": {
    criteria: ["4.1.2"],
    title: "Input buttons without a name",
  },
  "input-image-alt": {
    criteria: ["1.1.1", "4.1.2"],
    title: "Image buttons without a text alternative",
  },
  label: {
    criteria: ["4.1.2"],
    title: "Form fields without a label",
  },
  "label-content-name-mismatch": {
    criteria: ["2.5.3"],
    title: "Visible label missing from the accessible name",
  },
  "link-in-text-block": {
    criteria: ["1.4.1"],
    title: "Links told apart from text by colour alone",
  },
  "link-name": {
    criteria: ["2.4.4", "4.1.2"],
    title: "Links without a name",
  },
  list: {
    criteria: ["1.3.1"],
    title: "Lists with invalid children",
  },
  listitem: {
    criteria: ["1.3.1"],
    title: "List items outside a list",
  },
  marquee: {
    criteria: ["2.2.2"],
    title: "Scrolling text (<marquee>)",
  },
  "meta-refresh": {
    criteria: ["2.2.1"],
    title: "Timed page refresh",
  },
  "meta-viewport": {
    criteria: ["1.4.4"],
    title: "Zoom disabled on the page",
  },
  "nested-interactive": {
    criteria: ["4.1.2"],
    title: "Interactive controls nested inside each other",
  },
  "no-autoplay-audio": {
    criteria: ["1.4.2"],
    title: "Audio or video that plays sound on its own",
  },
  "object-alt": {
    criteria: ["1.1.1"],
    title: "Embedded objects without a text alternative",
  },
  "role-img-alt": {
    criteria: ["1.1.1"],
    title: 'Elements with role="img" without a text alternative',
  },
  "scrollable-region-focusable": {
    criteria: ["2.1.1", "2.1.3"],
    title: "Scrolling areas the keyboard cannot reach",
  },
  "select-name": {
    criteria: ["4.1.2"],
    title: "Drop-down lists without a name",
  },
  "server-side-image-map": {
    criteria: ["2.1.1"],
    title: "Server-side image maps",
  },
  "summary-name": {
    criteria: ["4.1.2"],
    title: "Disclosure summaries without a name",
  },
  "svg-img-alt": {
    criteria: ["1.1.1"],
    title: "SVG images without a text alternative",
  },
  "td-headers-attr": {
    criteria: ["1.3.1"],
    title: "Table cells whose headers attribute points elsewhere",
  },
  "th-has-data-cells": {
    criteria: ["1.3.1"],
    title: "Table headers with no data cells",
  },
  "valid-lang": {
    criteria: ["3.1.2"],
    title: "lang attributes with an invalid value",
  },
  "video-caption": {
    criteria: ["1.2.2"],
    title: "Video without captions",
  },
} satisfies Record<string, AxeRuleSpec>;

export const AXE_CORE_VERSION = "4.14.0";

export const AXE_RULES: ReadonlyMap<string, AxeRuleSpec> = new Map(
  Object.entries(RULES)
);

export const AXE_REPORTS = "axe-core reports:";

export const axeTitleOf = (rule: string): string =>
  AXE_RULES.get(rule)?.title ?? `axe-core rule ${rule}`;
