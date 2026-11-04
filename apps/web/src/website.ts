import Scanner from "@good-a11y/scanner/worker";
import * as Cloudflare from "alchemy/Cloudflare";

import {
  MESSAGE_LIMIT_NAMESPACE,
  MESSAGES_PER_MINUTE,
  SCAN_LIMIT_NAMESPACE,
  SCANS_PER_MINUTE,
} from "./server/limits.js";

export class Website extends Cloudflare.Website.Foldkit<Website>()("Website", {
  assets: { runWorkerFirst: ["/rpc", "/rpc/*"] },
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
  },
  main: "src/worker.ts",
  observability: { enabled: true },
  rootDir: "../web",
}) {}
