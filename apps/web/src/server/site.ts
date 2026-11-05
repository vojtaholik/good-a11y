import { GUIDES } from "@good-a11y/guides/data";
import { withGuideIndex } from "@good-a11y/guides/skill-index";
import { Effect, Option } from "effect";
import { Server } from "foldkit/experimental";
import { fromString } from "foldkit/url";

import skill from "../../../../skills/good-a11y/SKILL.md?raw";
import { SKILL_PATH, SKILL_URL_PATH } from "../features/agent-links.js";
import { isMissing } from "../features/missing.js";
import { pageMetaOf } from "../features/page-meta.js";
import { AppRoute, parseRoute } from "../features/route.js";
import { withBeacon } from "./beacon.js";
import { checkPage, checkUsage } from "./check-markdown.js";
import type { CheckAnswer } from "./check-markdown.js";
import { callerOf } from "./handler.js";
import type { CallerLimit } from "./handler.js";
import {
  CHECK_PATH,
  GUIDE_MARKDOWN_PATH,
  SEARCH_PATH,
  SEARCH_USAGE,
  guideMarkdown,
  guideOf,
  llmsTxt,
  pageMarkdown,
  robotsTxt,
  searchMarkdown,
  sitemapXml,
} from "./markdown.js";
import { renderPage, scanOf, withPageMeta } from "./render.js";
import type { BackendFetch } from "./rpc.js";

const DEMO_PATH = /^\/(?<id>[a-z\d-]+)\/demo\.html$/u;

const OLD_GUIDES_PATH = /^\/guides(?:\/(?<rest>.*))?$/u;

export const movedGuide = (url: URL): string | null => {
  const match = OLD_GUIDES_PATH.exec(url.pathname);

  return match === null ? null : `/${match.groups?.rest ?? ""}${url.search}`;
};

const REFERENCE_PATH =
  /^\/skills\/good-a11y\/references\/(?<id>[a-z\d-]+)\.md$/u;

export const REFERENCES_PATH = "/skills/good-a11y/references";

export const DEMO_POLICY =
  "sandbox allow-scripts allow-forms; frame-ancestors 'self'; default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:";

const MARKDOWN = "text/markdown; charset=utf-8";

const qualityOf = (accept: string, type: string): number => {
  const [major] = type.split("/");

  return (
    accept
      .split(",")
      .map((part) => part.trim().split(";"))
      .filter(([range]) => {
        const name = range?.trim().toLowerCase();

        return name === type || name === `${major}/*` || name === "*/*";
      })
      .map(([range, ...parameters]) => {
        const q = parameters
          .map((parameter) => parameter.trim())
          .find((parameter) => parameter.startsWith("q="));

        const specific = range?.trim().toLowerCase() === type ? 1 : 0;

        return {
          quality: q === undefined ? 1 : Number(q.slice(2)),
          specific,
        };
      })
      .toSorted((left, right) => right.specific - left.specific)
      .at(0)?.quality ?? 0
  );
};

export const prefersMarkdown = (accept: string | null): boolean => {
  if (accept === null) {
    return false;
  }

  const markdown = qualityOf(accept, "text/markdown");

  return (
    accept.toLowerCase().includes("text/markdown") &&
    markdown > 0 &&
    markdown >= qualityOf(accept, "text/html")
  );
};

const textResponse = (
  body: string,
  contentType: string,
  status = 200,
  headers: Record<string, string> = {}
): Response =>
  new Response(body, {
    headers: {
      "cache-control": "public, max-age=300",
      "content-type": contentType,
      "x-content-type-options": "nosniff",
      ...headers,
    },
    status,
  });

const notFound = (): Response =>
  textResponse("Not found. See /llms.txt.\n", MARKDOWN, 404);

export const skillMarkdown = (origin: string): string =>
  withGuideIndex(skill, GUIDES, (id) => `${origin}/${id}.md`);

const agentFile = (url: URL, siteOrigin: string): Response | null => {
  if (url.pathname === "/llms.txt") {
    return textResponse(llmsTxt(siteOrigin), "text/plain; charset=utf-8");
  }

  if (url.pathname === "/sitemap.xml") {
    return textResponse(
      sitemapXml(siteOrigin),
      "application/xml; charset=utf-8"
    );
  }

  if (url.pathname === "/robots.txt") {
    return textResponse(robotsTxt(siteOrigin), "text/plain; charset=utf-8");
  }

  if (url.pathname === SKILL_PATH || url.pathname === SKILL_URL_PATH) {
    return textResponse(skillMarkdown(siteOrigin), MARKDOWN);
  }

  if (url.pathname === SEARCH_PATH) {
    const query = url.searchParams.get("q")?.trim() ?? "";

    return query === ""
      ? textResponse(SEARCH_USAGE(siteOrigin), MARKDOWN, 400)
      : textResponse(searchMarkdown(query, siteOrigin), MARKDOWN);
  }

  const reference =
    REFERENCE_PATH.exec(url.pathname)?.groups?.id ??
    GUIDE_MARKDOWN_PATH.exec(url.pathname)?.groups?.id;

  if (reference !== undefined) {
    return Option.match(guideOf(reference), {
      onNone: notFound,
      onSome: (guide) =>
        textResponse(guideMarkdown(guide, siteOrigin).join("\n"), MARKDOWN),
    });
  }

  const demo = DEMO_PATH.exec(url.pathname)?.groups?.id;

  return demo === undefined
    ? null
    : Option.match(guideOf(demo), {
        onNone: notFound,
        onSome: (guide) =>
          textResponse(guide.demo, "text/html; charset=utf-8", 200, {
            "content-security-policy": DEMO_POLICY,
          }),
      });
};

const checkResponse = ({ body, retryAfter, status }: CheckAnswer) => {
  const response = textResponse(body, MARKDOWN, status, {
    "cache-control": "no-store",
  });

  if (retryAfter !== null) {
    response.headers.set("retry-after", String(retryAfter));
  }

  return response;
};

export const siteHandler =
  (
    backend: BackendFetch,
    assets: BackendFetch,
    siteOrigin: string,
    allow: CallerLimit,
    pageViewsToken: string
  ): BackendFetch =>
  // @effect-diagnostics-next-line asyncFunction:off -- A Worker fetch handler is a Promise boundary.
  async (request) => {
    const url = new URL(request.url);
    const isRead = request.method === "GET" || request.method === "HEAD";

    if (isRead && url.pathname === CHECK_PATH) {
      const input = url.searchParams.get("url")?.trim() ?? "";

      return checkResponse(
        input === ""
          ? checkUsage(siteOrigin)
          : await Effect.runPromise(
              checkPage(backend, allow, callerOf(request), siteOrigin, input)
            )
      );
    }

    const moved = movedGuide(url);

    if (moved !== null) {
      return new Response(null, {
        headers: {
          "cache-control": "public, max-age=86400",
          location: moved,
        },
        status: 308,
      });
    }

    const file = isRead ? agentFile(url, siteOrigin) : null;

    if (file !== null) {
      return file;
    }

    const route = Option.match(fromString(request.url), {
      onNone: () => AppRoute.NotFound({ path: url.pathname }),
      onSome: parseRoute,
    });

    if (isRead && prefersMarkdown(request.headers.get("accept"))) {
      const maybeScan = await Effect.runPromise(scanOf(backend, route));

      return textResponse(
        pageMarkdown(route, siteOrigin, maybeScan),
        MARKDOWN,
        isMissing(route) ? 404 : 200,
        {
          "cache-control": Option.isSome(maybeScan)
            ? "no-store"
            : "public, max-age=300",
          vary: "Accept",
        }
      );
    }

    const shell = await assets(new Request(new URL("/", url.origin)));

    const template = withBeacon(
      withPageMeta(await shell.text(), pageMetaOf(route), route, siteOrigin),
      pageViewsToken
    );

    return await Server.handleRequest(request, {
      // @effect-diagnostics-next-line asyncFunction:off -- Foldkit's server entry is a Promise boundary.
      renderPage: async () =>
        await Effect.runPromise(
          scanOf(backend, route).pipe(
            Effect.flatMap((maybeScan) =>
              renderPage(request, route, maybeScan, siteOrigin)
            )
          )
        ),
      template,
    });
  };
