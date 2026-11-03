import { blank, counted } from "../check.js";
import type { Check } from "../check.js";
import type { ImageEvidence } from "../page-evidence.js";

const PLACEHOLDERS = new Set([
  "alt",
  "alt text",
  "graphic",
  "image",
  "img",
  "insert alt text",
  "photo",
  "pic",
  "picture",
  "placeholder",
  "spacer",
  "untitled",
]);

const IMAGE_FILE = /^\S+\.(?:avif|bmp|gif|jpe?g|png|svg|tiff?|webp)$/iu;

const CAMERA_NAME = /^(?:dsc|dscn|img|pxl)[_-]?\d{3,}$/iu;

const normalized = (text: string): string =>
  text.trim().replaceAll(/\s+/gu, " ").toLowerCase();

const decodeFileName = (file: string): string => {
  try {
    return decodeURIComponent(file);
  } catch {
    return file;
  }
};

const sameAsFile = (alt: string, file: string | null): boolean => {
  if (file === null || file === "") {
    return false;
  }

  return alt === normalized(decodeFileName(file));
};

const isPlaceholder = (image: ImageEvidence): boolean => {
  const alt = normalized(image.alt ?? "");

  return (
    PLACEHOLDERS.has(alt) ||
    IMAGE_FILE.test(alt) ||
    CAMERA_NAME.test(alt) ||
    sameAsFile(alt, image.file)
  );
};

const hasAltText = (image: ImageEvidence): boolean =>
  !blank(image.alt) && !image.labelled && !image.presentational;

export const altPlaceholder: Check = {
  evaluate: ({ images }) =>
    counted(
      "alt-placeholder",
      images.filter(hasAltText),
      isPlaceholder,
      (image) => image.snippet
    ),
  howToFix:
    'Replace the alt text with what the image shows or does, or use alt="" if the image is decorative.',
  id: "alt-placeholder",
  title: "Alt text is not a file name or placeholder",
  whatFails:
    'An image\'s alt text is its file name, ends in an image file extension, is a camera file name such as IMG_1234, or is a placeholder word such as "image", "photo" or "picture".',
};
