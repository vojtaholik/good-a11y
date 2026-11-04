import Scanner from "@good-a11y/scanner/worker";
import * as Cloudflare from "alchemy/Cloudflare";
import { Stack } from "alchemy/Stack";

import {
  MESSAGE_LIMIT_NAMESPACE,
  MESSAGES_PER_MINUTE,
  SCAN_LIMIT_NAMESPACE,
  SCANS_PER_MINUTE,
} from "./server/limits.js";

export const PRODUCTION_STAGE = "prod";

export const SITE_DOMAIN = "good-a11y.com";

const SETTINGS = {
  assets: {
    notFoundHandling: "none" as const,
    runWorkerFirst: ["/*", "!/assets/*"],
  },
  compatibility: { date: "2026-09-01" },
  env: {
    BACKEND: Scanner,
    MESSAGE_LIMIT: Cloudflare.RateLimit("MESSAGE_LIMIT", {
      namespaceId: MESSAGE_LIMIT_NAMESPACE,
      simple: { limit: MESSAGES_PER_MINUTE, period: 60 },
    }),
    SCAN_LIMIT: Cloudflare.RateLimit("SCAN_LIMIT", {
      namespaceId: SCAN_LIMIT_NAMESPACE,
      simple: { limit: SCANS_PER_MINUTE, period: 60 },
    }),
    SITE_ORIGIN: Cloudflare.Worker.URL,
  },
  main: "src/worker.ts",
  observability: { enabled: true },
  rootDir: "../web",
};

const ON_THE_DOMAIN = {
  ...SETTINGS,
  domain: { name: SITE_DOMAIN, redirects: [`www.${SITE_DOMAIN}`] },
};

export class Website extends Cloudflare.Website.Foldkit<Website>()(
  "Website",
  Stack.useSync(({ stage }) =>
    stage === PRODUCTION_STAGE ? ON_THE_DOMAIN : SETTINGS
  )
) {}
