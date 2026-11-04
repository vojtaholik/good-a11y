import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("index.html", "utf-8");

if (html.includes("BROKEN")) {
  console.error("build error: BROKEN marker");
  process.exit(1);
}

mkdirSync("dist", { recursive: true });

writeFileSync("dist/index.html", html.replace("Mini site", "Built mini site"));
