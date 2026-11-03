import Scanner from "@eaa-check/scanner/worker";
import * as Cloudflare from "alchemy/Cloudflare";

export class Website extends Cloudflare.Website.Foldkit<Website>()("Website", {
  assets: { runWorkerFirst: ["/rpc", "/rpc/*"] },
  compatibility: { date: "2026-09-01" },
  env: { BACKEND: Scanner },
  main: "src/worker.ts",
  observability: { enabled: true },
  rootDir: "../web",
}) {}
