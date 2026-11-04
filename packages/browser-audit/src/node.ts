import { vetLocalUrl } from "@eaa-check/core";
import { launch } from "puppeteer-core";

import { sessionOn } from "./puppeteer-session.js";
import { renderedAuditLayer } from "./rendered-audit.js";

export interface LocalChrome {
  readonly executablePath: string | null;
}

const LOCAL_CHROME_ARGS = ["--no-first-run", "--no-default-browser-check"];

export const localChromeSession = ({ executablePath }: LocalChrome) =>
  sessionOn(
    launch.bind(undefined, {
      args: LOCAL_CHROME_ARGS,
      headless: true,
      ...(executablePath === null
        ? { channel: "chrome" as const }
        : { executablePath }),
    }),
    { emptySubmits: false, vet: vetLocalUrl }
  );

export const localRenderedAuditLayer = (chrome: LocalChrome) =>
  renderedAuditLayer(localChromeSession(chrome), vetLocalUrl);
