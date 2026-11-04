import { Data } from "effect";

import { GITHUB_URL } from "./shell.js";

export type InfoBlock = Data.TaggedEnum<{
  Link: {
    readonly before: string;
    readonly href: string;
    readonly label: string;
  };
  List: { readonly items: readonly string[] };
  Table: {
    readonly caption: string;
    readonly head: readonly string[];
    readonly rows: readonly (readonly string[])[];
  };
  Text: { readonly text: string };
}>;

export const Blocks = Data.taggedEnum<InfoBlock>();

export interface InfoSection {
  readonly blocks: readonly InfoBlock[];
  readonly heading: string;
  readonly id: string;
}

export interface InfoPage {
  readonly lead: string;
  readonly sections: readonly InfoSection[];
  readonly title: string;
}

export const ISSUES_URL = `${GITHUB_URL}/issues`;

export const ABOUT: InfoPage = {
  lead: "good-a11y gives a coding agent a short accessibility guide for the UI pattern it is about to build, and checks the page it built. The guides, the checker and this site are open source.",
  sections: [
    {
      blocks: [
        Blocks.Text({
          text: "Vojta Holík builds good-a11y, with coding agents doing much of the work under the rules in its repository. The code, every guide and every source are public on GitHub.",
        }),
      ],
      heading: "Who makes it",
      id: "who",
    },
    {
      blocks: [
        Blocks.Text({
          text: "Agents write much of today's UI, from patterns they have seen. A dialog that keeps focus inside, a form that announces its errors, a menu that works with arrow keys: each takes a few rules that are easy to miss and costly to add later. A guide the agent reads before it builds puts those rules in the first version.",
        }),
      ],
      heading: "Why guides for agents",
      id: "why",
    },
    {
      blocks: [
        Blocks.List({
          items: [
            "Each guide has a working demo. A grader drives it in Chrome and tests every claim the guide makes, one test per claim.",
            "Our own checker runs on every demo and on every page of this site, in a real browser, before each commit and in CI. A page with an issue fails the build.",
            "Every WCAG and EN 301 549 reference traces to a verified fact with its primary source. A reference without one is left out.",
          ],
        }),
      ],
      heading: "How the guides are tested",
      id: "tested",
    },
    {
      blocks: [
        Blocks.Link({
          before: "Report a problem with a guide or the checker on",
          href: ISSUES_URL,
          label: "GitHub issues",
        }),
      ],
      heading: "Get in touch",
      id: "contact",
    },
  ],
  title: "About good-a11y",
};

export const PRIVACY: InfoPage = {
  lead: "The checker stores what it needs to show a report at its own address and to keep the service within its daily limits. This page lists all of it. The site sets no cookies and loads no analytics.",
  sections: [
    {
      blocks: [
        Blocks.Table({
          caption: "What we store when you check a page",
          head: ["Data", "Why", "Kept for"],
          rows: [
            [
              "The scanned address",
              "The report lives at an address made from it. A new check of the same address within an hour shows the report already made.",
              "Until the report is removed",
            ],
            [
              "The report, with samples of failing elements",
              "So the report opens again at its address and can be shared. Each sample is the HTML of one failing element, as the page served it.",
              "Until the report is removed",
            ],
            [
              "The page evidence",
              "What the checks read from the page and the browser, so a stored scan can be checked again under newer checks.",
              "30 days",
            ],
            [
              "Your IP address, for the daily limit",
              "Each address may check one site a limited number of times a day. For IPv6 we keep only the first 64 bits.",
              "Until the report is removed",
            ],
          ],
        }),
        Blocks.Text({
          text: "The scanner also writes operational logs to Cloudflare, which keeps them for a short period it sets.",
        }),
      ],
      heading: "What we store when you check a page",
      id: "store",
    },
    {
      blocks: [
        Blocks.Text({
          text: "When a report has a “Judged by a model” section, parts of the scanned page went to Cloudflare Clef (@cf/cloudflare/clef) on Cloudflare Workers AI: link texts, headings and labels, text alternatives of images, the start of the visible text, error messages of a form, and the text of an accessibility statement. Its answers are stored with the report.",
        }),
      ],
      heading: "What we send to a model",
      id: "model",
    },
    {
      blocks: [
        Blocks.Link({
          before:
            "To remove a report, with its evidence and the IP address stored with it, open an issue with the report's address. Issues are public, so leave out anything personal. Open one on",
          href: ISSUES_URL,
          label: "GitHub issues",
        }),
      ],
      heading: "Removing a report",
      id: "remove",
    },
  ],
  title: "Privacy",
};
