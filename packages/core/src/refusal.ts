import { challengeDetail, challengeIn } from "./challenge.js";
import type { ChallengeSystem } from "./challenge.js";
import type { FetchResult, FetchSuccess } from "./fetch-result.js";
import type { HeaderMap } from "./hop-transport.js";

const CHALLENGE_MARKERS = [
  "just a moment",
  "attention required",
  "cf-challenge",
  "challenge-platform",
  "captcha",
  "access denied",
  "request blocked",
  "are you a robot",
];

const REFUSAL_HEADERS = ["cf-mitigated", "x-amzn-waf-action"];

const REFUSAL_STATUSES = new Set([401, 403, 429]);

const CHALLENGE_STATUSES = new Set([406, 503]);

const CHALLENGE_SNIFF_CHARACTERS = 20_000;

const NOT_THERE_STATUSES = new Set([404, 410]);

export const refusalDetail = (status: number): string =>
  `The server refused the request (HTTP ${status}).`;

export const refusesAPlainRequest = (status: number): boolean =>
  status >= 400 && status < 500 && !NOT_THERE_STATUSES.has(status);

export const looksBlocked = (
  status: number,
  headers: HeaderMap,
  body: string
): boolean => {
  if (REFUSAL_HEADERS.some((name) => headers[name] !== undefined)) {
    return true;
  }

  if (REFUSAL_STATUSES.has(status)) {
    return true;
  }

  if (CHALLENGE_STATUSES.has(status)) {
    const head = body.slice(0, CHALLENGE_SNIFF_CHARACTERS).toLowerCase();

    return CHALLENGE_MARKERS.some((marker) => head.includes(marker));
  }

  return false;
};

const refusalOf = (
  fetch: FetchSuccess,
  detail: string,
  challenge?: ChallengeSystem
): FetchResult => ({
  ...(challenge === undefined ? undefined : { challenge }),
  detail,
  observedAt: fetch.observedAt,
  ok: false,
  reason: "blocked",
  redirects: fetch.redirects,
  requestedUrl: fetch.requestedUrl,
  status: fetch.status,
});

export const unmasked = (fetch: FetchResult): FetchResult => {
  if (!fetch.ok) {
    return fetch;
  }

  const challenge = challengeIn(fetch.headers, fetch.body);

  return challenge === undefined
    ? fetch
    : refusalOf(fetch, challengeDetail(challenge, fetch.status), challenge);
};

export const unmaskedAtTheTestedAddress = (fetch: FetchResult): FetchResult => {
  const answered = unmasked(fetch);

  return answered.ok && refusesAPlainRequest(answered.status)
    ? refusalOf(answered, refusalDetail(answered.status))
    : answered;
};
