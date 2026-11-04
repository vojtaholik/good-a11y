import { Brand, Result } from "effect";

export type PublicUrl = Brand.Branded<string, "PublicUrl">;

export type LocalUrl = Brand.Branded<string, "LocalUrl">;

export type VettedUrl = PublicUrl | LocalUrl;

export type UrlRule =
  | "not_a_url"
  | "scheme"
  | "credentials"
  | "port"
  | "ip_address"
  | "not_public";

export interface UrlRejection {
  readonly reason: string;
  readonly rule: UrlRule;
}

export const MAX_URL_LENGTH = 2048;

const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/u;

const PUBLIC_TLD = /^(?:[a-z]{2,63}|xn--[a-z\d-]{1,59})$/u;

const NEVER_PUBLIC_TLDS = new Set([
  "alt",
  "arpa",
  "corp",
  "example",
  "home",
  "internal",
  "intranet",
  "invalid",
  "lan",
  "local",
  "localdomain",
  "localhost",
  "onion",
  "private",
  "test",
]);

const toPublicUrl = Brand.nominal<PublicUrl>();

const toLocalUrl = Brand.nominal<LocalUrl>();

export type UrlVet = (raw: string) => Result.Result<VettedUrl, UrlRejection>;

const reject = (
  rule: UrlRule,
  reason: string
): Result.Result<never, UrlRejection> => Result.fail({ reason, rule });

export const vetUrl = (raw: string): Result.Result<PublicUrl, UrlRejection> => {
  if (raw.length > MAX_URL_LENGTH || !URL.canParse(raw)) {
    return reject("not_a_url", "The address is not a valid URL.");
  }

  const url = new URL(raw);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return reject("scheme", `The ${url.protocol} scheme is not allowed.`);
  }

  if (url.username !== "" || url.password !== "") {
    return reject("credentials", "An address with credentials is not allowed.");
  }

  if (url.port !== "") {
    return reject("port", `Port ${url.port} is not allowed.`);
  }

  const host = url.hostname.toLowerCase();

  if (host.startsWith("[") || IPV4.test(host)) {
    return reject(
      "ip_address",
      "An IP address in place of a domain is not allowed."
    );
  }

  const labels = host.split(".");
  const topLevel = labels.at(-1) ?? "";

  if (labels.length < 2 || labels.includes("")) {
    return reject("not_public", "The domain must be public.");
  }

  if (!PUBLIC_TLD.test(topLevel) || NEVER_PUBLIC_TLDS.has(topLevel)) {
    return reject("not_public", "The domain is not public.");
  }

  url.hash = "";

  return url.href.length > MAX_URL_LENGTH
    ? reject("not_a_url", "The address is not a valid URL.")
    : Result.succeed(toPublicUrl(url.href));
};

export const vetLocalUrl = (
  raw: string
): Result.Result<LocalUrl, UrlRejection> => {
  if (raw.length > MAX_URL_LENGTH || !URL.canParse(raw)) {
    return reject("not_a_url", "The address is not a valid URL.");
  }

  const url = new URL(raw);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return reject("scheme", `The ${url.protocol} scheme is not allowed.`);
  }

  if (url.username !== "" || url.password !== "") {
    return reject("credentials", "An address with credentials is not allowed.");
  }

  url.hash = "";

  return url.href.length > MAX_URL_LENGTH
    ? reject("not_a_url", "The address is not a valid URL.")
    : Result.succeed(toLocalUrl(url.href));
};
