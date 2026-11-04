import { Option } from "effect";
import { fromString } from "foldkit/url";
import type { Url } from "foldkit/url";

import type { AppModel } from "../src/client/model.js";
import { init } from "../src/features/update.js";

export const ORIGIN = "https://good-a11y.example";

export const urlOf = (path: string): Url =>
  Option.getOrThrow(fromString(`${ORIGIN}${path}`));

export const modelAt = (path: string): AppModel =>
  init({ maybeScan: Option.none(), origin: ORIGIN }, urlOf(path)).model;
