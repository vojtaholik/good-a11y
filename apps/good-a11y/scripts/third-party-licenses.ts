export interface BundledPackage {
  readonly license: string;
  readonly name: string;
  readonly texts: readonly string[];
  readonly version: string;
}

const section = (bundled: BundledPackage): readonly string[] => [
  `## ${bundled.name} ${bundled.version}`,
  "",
  `License: ${bundled.license}`,
  "",
  ...(bundled.texts.length === 0
    ? ["The package ships no license file.", ""]
    : bundled.texts.flatMap((text) => ["```text", text.trimEnd(), "```", ""])),
];

export const renderLicenses = (packages: readonly BundledPackage[]): string =>
  [
    "# Third-party licenses",
    "",
    "`good-a11y.mjs` bundles the packages below. axe-core runs unmodified inside the checked page; its source is at https://github.com/dequelabs/axe-core. `playwright` and `puppeteer-core` are installed as dependencies and keep their own license files.",
    "",
    ...packages
      .toSorted(
        (left, right) =>
          left.name.localeCompare(right.name) ||
          left.version.localeCompare(right.version)
      )
      .flatMap(section),
  ].join("\n");
