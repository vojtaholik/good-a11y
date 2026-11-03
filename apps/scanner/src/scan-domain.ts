import { SafeFetch } from "@eaa-check/core";
import { htmlPageReaderLayer } from "@eaa-check/html-reader";
import { httpHopTransportLayer } from "@eaa-check/http-transport";
import { Layer } from "effect";

export const scanDomainLayer = Layer.mergeAll(
  SafeFetch.layer.pipe(Layer.provide(httpHopTransportLayer)),
  htmlPageReaderLayer
);
