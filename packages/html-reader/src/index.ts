import { PageReader } from "@eaa-check/core";
import { Layer } from "effect";

import { readPage } from "./read-page.js";

export { readPage } from "./read-page.js";

export const htmlPageReaderLayer = Layer.succeed(
  PageReader,
  PageReader.of({ read: readPage })
);
