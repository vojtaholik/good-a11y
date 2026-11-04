import { SafeFetch } from "@good-a11y/core";
import { htmlPageReaderLayer } from "@good-a11y/html-reader";
import { httpHopTransportLayer } from "@good-a11y/http-transport";
import { Layer } from "effect";

export const scanDomainLayer = Layer.mergeAll(
  SafeFetch.layer.pipe(Layer.provide(httpHopTransportLayer)),
  htmlPageReaderLayer
);
