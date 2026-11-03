import { describe, expect, it } from "@effect/vitest";
import { Result, Schema } from "effect";

import { vetUrl } from "../src/index.js";

const Octet = Schema.Int.check(Schema.isBetween({ maximum: 255, minimum: 0 }));

const Ipv4 = Schema.Struct({
  first: Octet,
  fourth: Octet,
  notation: Schema.Literals([
    "dotted",
    "decimal",
    "hex",
    "octal",
    "three-part",
    "two-part",
    "trailing-dot",
  ]),
  second: Octet,
  third: Octet,
});

const Word = Schema.Int.check(
  Schema.isBetween({ maximum: 65_535, minimum: 0 })
);

const Label = Schema.String.check(Schema.isPattern(/^[a-z][a-z0-9]{0,8}$/u));

const PUBLIC_TLDS = ["cz", "sk", "com", "eu", "org", "io", "shop", "dev"];

const NEVER_PUBLIC_TLDS = [
  "localhost",
  "local",
  "internal",
  "intranet",
  "lan",
  "home",
  "corp",
  "onion",
  "test",
  "example",
  "invalid",
  "alt",
  "arpa",
  "private",
  "localdomain",
];

const Address = Schema.Struct({
  credentials: Schema.Literals(["", "user@", "user:secret@"]),
  fragment: Schema.Literals(["", "#kontakt"]),
  host: Schema.Union([
    Schema.Struct({
      kind: Schema.Literal("public"),
      labels: Schema.Array(Label).check(
        Schema.isMinLength(1),
        Schema.isMaxLength(3)
      ),
      tld: Schema.Literals(PUBLIC_TLDS),
      uppercase: Schema.Boolean,
    }),
    Schema.Struct({
      kind: Schema.Literal("never-public"),
      labels: Schema.Array(Label).check(
        Schema.isMinLength(1),
        Schema.isMaxLength(2)
      ),
      tld: Schema.Literals(NEVER_PUBLIC_TLDS),
    }),
    Schema.Struct({ kind: Schema.Literal("single-label"), label: Label }),
    Schema.Struct({ ip: Ipv4, kind: Schema.Literal("ipv4") }),
  ]),
  path: Schema.Literals(["", "/", "/kontakt?x=1"]),
  port: Schema.Literals(["", ":80", ":443", ":8080", ":8443"]),
  scheme: Schema.Literals(["http", "https", "ftp", "file", "ws", "gopher"]),
});

type Ipv4Literal = typeof Ipv4.Type;

type AddressParts = typeof Address.Type;

const writeIpv4 = ({ first, fourth, notation, second, third }: Ipv4Literal) => {
  const value = first * 16_777_216 + second * 65_536 + third * 256 + fourth;

  const notations: Record<Ipv4Literal["notation"], string> = {
    decimal: String(value),
    dotted: `${first}.${second}.${third}.${fourth}`,
    hex: `0x${value.toString(16)}`,
    octal: [first, second, third, fourth]
      .map((octet) => `0${octet.toString(8)}`)
      .join("."),
    "three-part": `0x${first.toString(16)}.${second}.${third * 256 + fourth}`,
    "trailing-dot": `${first}.${second}.${third}.${fourth}.`,
    "two-part": `${first}.${second * 65_536 + third * 256 + fourth}`,
  };

  return notations[notation];
};

const writeHost = (host: AddressParts["host"]): string => {
  if (host.kind === "ipv4") {
    return writeIpv4(host.ip);
  }

  if (host.kind === "single-label") {
    return host.label;
  }

  const name = [...host.labels, host.tld].join(".");

  return host.kind === "public" && host.uppercase ? name.toUpperCase() : name;
};

const DEFAULT_PORTS = new Map([
  ["http", ":80"],
  ["https", ":443"],
]);

const isPublicAddress = (parts: AddressParts): boolean =>
  (parts.scheme === "http" || parts.scheme === "https") &&
  parts.credentials === "" &&
  (parts.port === "" || parts.port === DEFAULT_PORTS.get(parts.scheme)) &&
  parts.host.kind === "public";

describe("vetUrl", () => {
  it.prop(
    "accepts exactly the public http and https addresses without credentials or a foreign port",
    { parts: Address },
    ({ parts }) => {
      const raw = `${parts.scheme}://${parts.credentials}${writeHost(parts.host)}${parts.port}${parts.path}${parts.fragment}`;

      expect(Result.isSuccess(vetUrl(raw))).toBe(isPublicAddress(parts));
    },
    { arbitrary: { runs: 2000 } }
  );

  it.prop(
    "refuses an IPv4 address in every notation a URL parser reads as one",
    { ip: Ipv4, scheme: Schema.Literals(["http", "https"]) },
    ({ ip, scheme }) => {
      expect(Result.isFailure(vetUrl(`${scheme}://${writeIpv4(ip)}/`))).toBe(
        true
      );
    },
    { arbitrary: { runs: 1000 } }
  );

  it.prop(
    "refuses every IPv6 literal, mapped IPv4 included",
    {
      ip: Ipv4,
      words: Schema.Tuple([Word, Word, Word, Word, Word, Word, Word, Word]),
    },
    ({ ip, words }) => {
      const full = words.map((word) => word.toString(16)).join(":");
      const mapped = `::ffff:${ip.first}.${ip.second}.${ip.third}.${ip.fourth}`;

      expect(Result.isFailure(vetUrl(`http://[${full}]/`))).toBe(true);
      expect(Result.isFailure(vetUrl(`https://[${mapped}]/`))).toBe(true);
    }
  );

  it.prop(
    "hands the transport one canonical address: lowercase host, no fragment, and vetting it again changes nothing",
    {
      labels: Schema.Array(Label).check(
        Schema.isMinLength(1),
        Schema.isMaxLength(3)
      ),
      path: Schema.Literals(["", "/", "/Kontakt?x=1"]),
      tld: Schema.Literals(PUBLIC_TLDS),
    },
    ({ labels, path, tld }) => {
      const host = [...labels, tld].join(".");
      const vetted = vetUrl(`HTTPS://${host.toUpperCase()}${path}#top`);

      expect(Result.isSuccess(vetted)).toBe(true);

      if (Result.isSuccess(vetted)) {
        const url = new URL(vetted.success);

        expect(url.hostname).toBe(host);
        expect(url.hash).toBe("");
        expect(vetUrl(vetted.success)).toStrictEqual(vetted);
      }
    }
  );

  it.each([
    // oxlint-disable-next-line no-script-url -- An address the scanner must refuse; it is data here and never runs.
    "javascript:alert(1)",
    "not a url",
    "",
    "http://localhost/",
    "http://firma.cz./",
    "http://a..cz/",
    `https://firma.cz/${"a".repeat(3000)}`,
  ])("refuses %s", (raw) => {
    expect(Result.isFailure(vetUrl(raw))).toBe(true);
  });

  it("accepts an internationalized domain in its punycode form", () => {
    expect(Result.isSuccess(vetUrl("https://xn--hkyrky-ptac70bc.cz/"))).toBe(
      true
    );
    expect(Result.isSuccess(vetUrl("https://háčkyčárky.cz/"))).toBe(true);
  });
});
