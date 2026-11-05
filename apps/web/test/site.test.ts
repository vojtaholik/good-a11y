import { describe, expect, it } from "@effect/vitest";
import { CONTACT_SHOWN } from "@good-a11y/core/contracts";
import { GUIDES } from "@good-a11y/guides/data";
import { Effect } from "effect";

import SHELL from "../index.html?raw";
import type { BackendFetch } from "../src/server/rpc.js";
import {
  DEMO_POLICY,
  prefersMarkdown,
  siteHandler,
} from "../src/server/site.js";

const ORIGIN = "https://good-a11y.example";

const SERVED_AT = "https://good-a11y-website.example.workers.dev";

// @effect-diagnostics-next-line asyncFunction:off -- The fakes stand in for Promise-returning Worker bindings.
const assets: BackendFetch = async (request) =>
  await Promise.resolve(
    new URL(request.url).pathname === "/"
      ? new Response(SHELL, { headers: { "content-type": "text/html" } })
      : new Response(null, { status: 404 })
  );

// @effect-diagnostics-next-line asyncFunction:off -- The fakes stand in for Promise-returning Worker bindings.
const backendDown: BackendFetch = async () =>
  await Promise.resolve(new Response(null, { status: 503 }));

const site = siteHandler(backendDown, assets, ORIGIN);

const get = (path: string, accept = "text/html") =>
  // @effect-diagnostics-next-line asyncFunction:off -- The handler under test is a Promise boundary.
  Effect.promise(async () => {
    const response = await site(
      new Request(`${SERVED_AT}${path}`, { headers: { accept } })
    );

    return { body: await response.text(), response };
  });

const MARKDOWN = "text/markdown";

const [firstGuide] = GUIDES;

describe("content negotiation", () => {
  it("serves Markdown only when the client prefers it", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.9")).toBe(true);
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
    expect(
      prefersMarkdown(
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      )
    ).toBe(false);
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });
});

describe("the site for agents", () => {
  it.effect("renders the start page on the server, with its metadata", () =>
    Effect.gen(function* serverPage() {
      const { body, response } = yield* get("/");

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/html");
      expect(body).toContain('<html lang="en"');
      expect(body).toContain(`<link rel="canonical" href="${ORIGIN}/"`);
      expect(body).toContain(`<meta property="og:url" content="${ORIGIN}/"`);
      expect(body).toMatch(
        /<meta property="og:title" content="good-a11y[^"]+"/u
      );
      expect(body).toMatch(
        /<meta name="description" content="Accessibility guides[^"]+"/u
      );
      expect(body).toContain("Accessibility guides for coding agents</h1>");
      expect(body).toContain("data-foldkit-app");
      expect(body).toContain(
        `<meta property="og:image" content="${ORIGIN}/assets/og.png"`
      );
      expect(body).toContain('<script type="application/ld+json">');
      expect(body).toContain('"@type":"SoftwareApplication"');
      expect(body).toContain(`href="/guides/${firstGuide?.id ?? ""}"`);
    })
  );

  it.effect("serves every page as Markdown on Accept: text/markdown", () =>
    Effect.gen(function* markdownPages() {
      const home = yield* get("/", MARKDOWN);
      const check = yield* get("/check", MARKDOWN);
      const guide = yield* get(`/guides/${firstGuide?.id ?? ""}`, MARKDOWN);
      const missing = yield* get("/nowhere", MARKDOWN);

      expect(home.response.headers.get("content-type")).toContain(MARKDOWN);
      expect(home.response.headers.get("vary")).toBe("Accept");
      expect(home.body).toContain("# good-a11y");
      expect(home.body).toContain(`${ORIGIN}/guides/`);
      expect(check.body).toContain("## What we check");
      expect(check.body).toContain("1.1.1 Non-text Content (Level A)");
      expect(guide.body).toContain(`# ${firstGuide?.name ?? ""}`);
      expect(guide.body).toContain("## WCAG success criteria");
      expect(guide.body).toContain(`retrieve ${firstGuide?.id ?? ""}`);
      expect(guide.body).not.toMatch(/^---/u);
      expect(missing.response.status).toBe(404);
    })
  );

  it.effect("names every guide in llms.txt and the served skill", () =>
    Effect.gen(function* agentFiles() {
      const llms = yield* get("/llms.txt");
      const skill = yield* get("/skills/good-a11y/SKILL.md");

      const reference = yield* get(
        `/skills/good-a11y/references/${firstGuide?.id ?? ""}.md`
      );

      expect(llms.body.startsWith("# good-a11y\n\n> ")).toBe(true);
      expect(llms.body).toContain("## When to use");
      expect(skill.response.headers.get("content-type")).toContain(MARKDOWN);
      expect(skill.body).toContain("name: good-a11y");

      for (const guide of GUIDES) {
        expect(llms.body).toContain(`${ORIGIN}/guides/${guide.id}`);
        expect(skill.body).toContain(
          `${ORIGIN}/skills/good-a11y/references/${guide.id}.md`
        );
      }

      expect(reference.body).toContain(`# ${firstGuide?.name ?? ""}`);
    })
  );

  it.effect(
    "serves the skill at /skill.md too, the address agents are given",
    () =>
      Effect.gen(function* shortSkill() {
        const home = yield* get("/skills/good-a11y/SKILL.md");
        const short = yield* get("/skill.md");

        expect(short.response.status).toBe(200);
        expect(short.response.headers.get("content-type")).toContain(MARKDOWN);
        expect(short.body).toBe(home.body);
      })
  );

  it.effect(
    "lists every indexable page in the sitemap, named by robots.txt",
    () =>
      Effect.gen(function* sitemap() {
        const map = yield* get("/sitemap.xml");
        const robots = yield* get("/robots.txt");

        expect(map.response.headers.get("content-type")).toContain("xml");
        expect(map.body).toContain(`<loc>${ORIGIN}/</loc>`);
        expect(map.body).toContain(`<loc>${ORIGIN}/check</loc>`);

        for (const guide of GUIDES) {
          expect(map.body).toContain(`<loc>${ORIGIN}/guides/${guide.id}</loc>`);
        }

        expect(robots.body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
      })
  );

  it.effect("serves a demo sandboxed, framed only by the site", () =>
    Effect.gen(function* demo() {
      const { body, response } = yield* get(
        `/guides/${firstGuide?.id ?? ""}/demo.html`
      );

      expect(response.headers.get("content-security-policy")).toBe(DEMO_POLICY);
      expect(DEMO_POLICY).toContain("sandbox allow-scripts");
      expect(DEMO_POLICY).toContain("frame-ancestors 'self'");
      expect(body).toBe(firstGuide?.demo);
    })
  );

  it.effect("answers an unknown page with 404 and a report with no scan", () =>
    Effect.gen(function* missing() {
      const page = yield* get("/nowhere");
      const guide = yield* get("/guides/no-such-guide");
      const report = yield* get("/check/example.com", MARKDOWN);

      expect(page.response.status).toBe(404);
      expect(guide.response.status).toBe(404);
      expect(report.body).toContain("No scan of example.com is stored.");
    })
  );

  it.effect("hides the contact page while the contact switch is off", () =>
    Effect.gen(function* hiddenContact() {
      const page = yield* get("/contact");
      const markdown = yield* get("/contact", MARKDOWN);
      const home = yield* get("/");

      expect(CONTACT_SHOWN).toBe(false);
      expect(page.response.status).toBe(404);
      expect(page.body).toContain("This page does not exist");
      expect(markdown.response.status).toBe(404);
      expect(home.body).not.toContain('href="/contact"');
    })
  );
});
