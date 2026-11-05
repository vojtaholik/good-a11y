const TOKEN = /^[\w-]{1,100}$/u;

const BODY_END = "</body>";

const BEACON_SOURCE = "https://static.cloudflareinsights.com/beacon.min.js";

export const withBeacon = (template: string, token: string): string =>
  TOKEN.test(token)
    ? template.replace(
        BODY_END,
        `<script defer src="${BEACON_SOURCE}" data-cf-beacon='{"token":"${token}"}'></script>${BODY_END}`
      )
    : template;
