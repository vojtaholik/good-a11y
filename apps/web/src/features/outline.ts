import type { Html } from "foldkit/html";

export interface OutlineItem {
  readonly count: number | null;
  readonly id: string;
  readonly label: string;
  readonly level: 2 | 3;
}

export interface PageLayout {
  readonly index: readonly OutlineItem[] | null;
  readonly main: Html;
  readonly outline: readonly OutlineItem[];
  readonly railExtra: readonly Html[];
}

export const item = (
  id: string,
  label: string,
  level: 2 | 3 = 2,
  count: number | null = null
): OutlineItem => ({ count, id, label, level });

export const plainPage = (
  main: Html,
  outline: readonly OutlineItem[] = []
): PageLayout => ({ index: null, main, outline, railExtra: [] });

export const slugOf = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[^a-z\d]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");

export const uniqueIds = (labels: readonly string[]): readonly string[] => {
  const seen = new Map<string, number>();

  return labels.map((label) => {
    const base = slugOf(label) || "section";
    const count = (seen.get(base) ?? 0) + 1;

    seen.set(base, count);

    return count === 1 ? base : `${base}-${count}`;
  });
};
