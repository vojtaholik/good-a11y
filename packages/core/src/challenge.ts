import { Schema } from "effect";

import type { HeaderMap } from "./hop-transport.js";

export const ChallengeSystemSchema = Schema.Literals([
  "anubis",
  "aws_waf",
  "baleen",
  "cloudflare",
  "datadome",
  "human",
  "vercel",
]);

export type ChallengeSystem = typeof ChallengeSystemSchema.Type;

export const CHALLENGE_SYSTEM_NAMES: Readonly<Record<ChallengeSystem, string>> =
  {
    anubis: "Anubis",
    aws_waf: "AWS WAF",
    baleen: "Baleen",
    cloudflare: "Cloudflare",
    datadome: "DataDome",
    human: "HUMAN (PerimeterX)",
    vercel: "Vercel",
  };

export const CHALLENGE_SNIFF_CHARACTERS = 100_000;

interface HeaderMarker {
  readonly name: string;
  readonly system: ChallengeSystem;
  readonly value?: string;
}

interface BodyMarker {
  readonly parts: readonly string[];
  readonly system: ChallengeSystem;
}

export const CHALLENGE_HEADERS: readonly HeaderMarker[] = [
  { name: "cf-mitigated", system: "cloudflare", value: "challenge" },
  { name: "x-amzn-waf-action", system: "aws_waf" },
  { name: "x-vercel-mitigated", system: "vercel", value: "challenge" },
  { name: "x-dd-b", system: "datadome" },
  { name: "x-px-blocked", system: "human" },
];

export const CHALLENGE_BODIES: readonly BodyMarker[] = [
  {
    parts: ['id="anubis_challenge"', "/.within.website/x/cmd/anubis/"],
    system: "anubis",
  },
  {
    parts: ["/cdn-cgi/challenge-platform/h/", "/orchestrate/chl_page/"],
    system: "cloudflare",
  },
  { parts: ["AwsWafIntegration", "/challenge.js"], system: "aws_waf" },
  { parts: ["__blnChallengeStore"], system: "baleen" },
  { parts: ["captcha-delivery.com/c.js"], system: "datadome" },
  { parts: ["window._pxAppId", "px-captcha"], system: "human" },
];

const headerSays = (headers: HeaderMap, marker: HeaderMarker): boolean => {
  const value = headers[marker.name];

  return (
    value !== undefined &&
    (marker.value === undefined || value.trim().toLowerCase() === marker.value)
  );
};

const sniffedPartHolds = (body: string, part: string): boolean =>
  body.lastIndexOf(part, CHALLENGE_SNIFF_CHARACTERS - part.length) >= 0;

export const challengeIn = (
  headers: HeaderMap,
  body: string
): ChallengeSystem | undefined => {
  const named = CHALLENGE_HEADERS.find((marker) => headerSays(headers, marker));

  if (named !== undefined) {
    return named.system;
  }

  return CHALLENGE_BODIES.find((marker) =>
    marker.parts.every((part) => sniffedPartHolds(body, part))
  )?.system;
};

export const challengeDetail = (
  system: ChallengeSystem,
  status: number
): string =>
  `The server sent a bot check (${CHALLENGE_SYSTEM_NAMES[system]}) in place of the page (HTTP ${status}).`;
