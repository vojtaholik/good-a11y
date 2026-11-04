import * as Cloudflare from "alchemy/Cloudflare";
import { Effect } from "effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

export { DEV_STAGE as CANARY_STAGE } from "./browser-limits.js";

export const CANARY_HIT = "Canary hit";

const SCRIPT_CHANNELS = `
const hit = (via) => new URL("/hit/" + via, location.href).href;
document.querySelector("#scripted").addEventListener("submit", (event) => {
  event.preventDefault();
  fetch(hit("fetch"), { body: "x", keepalive: true, method: "POST", mode: "no-cors" }).catch(() => {});
  navigator.sendBeacon(hit("beacon"), "x");
  const xhr = new XMLHttpRequest();
  xhr.open("POST", hit("xhr"));
  xhr.send("x");
  new Image().src = hit("image");
  try { const socket = new WebSocket(hit("websocket").replace(/^http/u, "ws")); socket.addEventListener("open", () => socket.send("x")); } catch {}
  try { new EventSource(hit("event-source")); } catch {}
  const frame = document.createElement("iframe");
  frame.src = hit("iframe");
  document.body.append(frame);
  const prefetch = document.createElement("link");
  prefetch.rel = "prefetch";
  prefetch.href = hit("prefetch");
  document.head.append(prefetch);
  document.body.style.backgroundImage = "url(" + hit("css") + ")";
  window.open(hit("window-open"));
  const anchor = document.createElement("a");
  anchor.href = hit("anchor-blank");
  anchor.target = "_blank";
  document.body.append(anchor);
  anchor.click();
  setTimeout(() => {
    const refresh = document.createElement("meta");
    refresh.httpEquiv = "refresh";
    refresh.content = "0;url=" + hit("meta-refresh");
    document.head.append(refresh);
  }, 300);
});
document.querySelector("#retargeted").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  form.target = "_blank";
  form.action = hit("form-target-blank");
  HTMLFormElement.prototype.submit.call(form);
  setTimeout(() => { location.href = hit("location"); }, 500);
});
`;

export const CANARY_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Request blocking canary</title>
<link rel="icon" href="data:,">
</head>
<body>
<main>
<h1>Request blocking canary</h1>
<p>Each form below tries to send a request to this Worker when it is submitted. While the scanner submits forms, none may arrive.</p>
<form id="native" action="/hit/native-submit" method="post">
<label>Name <input name="name" type="text"></label>
<button type="submit">Send natively</button>
</form>
<form id="scripted" action="/hit/scripted-default" method="post">
<label>Email <input name="email" type="email"></label>
<button type="submit">Send by script</button>
</form>
<form id="retargeted" action="/hit/retargeted-default" method="post">
<label>Phone <input name="phone" type="tel"></label>
<button type="submit">Send to a new window</button>
</form>
</main>
<script>${SCRIPT_CHANNELS}</script>
</body>
</html>`;

export default class Canary extends Cloudflare.Worker<Canary>()(
  "Canary",
  {
    compatibility: { date: "2026-09-01" },
    main: import.meta.url,
    observability: { enabled: true },
  },
  Effect.succeed({
    fetch: Effect.gen(function* serveCanary() {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const path = new URL(request.url, "https://canary.invalid").pathname;

      if (path === "/" && request.method === "GET") {
        return HttpServerResponse.html(CANARY_PAGE);
      }

      yield* Effect.logWarning(CANARY_HIT).pipe(
        Effect.annotateLogs({
          method: request.method,
          path,
          userAgent: request.headers["user-agent"] ?? "",
        })
      );

      return HttpServerResponse.empty({ status: 204 });
    }),
  })
) {}
