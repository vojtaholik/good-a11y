import type { LookupAddress, LookupOptions } from "node:dns";
import type { LookupFunction } from "node:net";

import { describe, expect, it } from "@effect/vitest";

import {
  NOT_PUBLIC_CODE,
  isPublicAddress,
  publicLookupWith,
} from "../src/node.js";

const REFUSED = [
  "127.0.0.1",
  "10.1.2.3",
  "172.16.0.1",
  "192.168.1.1",
  "169.254.169.254",
  "100.64.0.1",
  "0.0.0.0",
  "224.0.0.1",
  "255.255.255.255",
  "::1",
  "::",
  "fe80::1",
  "fd00::1",
  "ff02::1",
  "::ffff:127.0.0.1",
  "::ffff:7f00:1",
  "::ffff:a9fe:a9fe",
  "64:ff9b::a9fe:a9fe",
  "2002:7f00:1::",
];

const ALLOWED = [
  "93.184.215.14",
  "1.1.1.1",
  "2606:4700::1111",
  "::ffff:1.1.1.1",
];

type Answer = readonly [
  string | undefined,
  string | LookupAddress[] | undefined,
  number | undefined,
];

const answersOf = (
  lookup: LookupFunction,
  hostname: string,
  options: LookupOptions
): Answer[] => {
  const answers: Answer[] = [];

  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- node:net's lookup contract is a callback; the fake resolver answers synchronously.
  lookup(hostname, options, (error, address, family) => {
    answers.push([error?.code, address, family]);
  });

  return answers;
};

const resolving =
  (addresses: LookupAddress[]) =>
  (
    _hostname: string,
    done: (error: NodeJS.ErrnoException | null, found?: LookupAddress[]) => void
  ) => {
    done(null, addresses);
  };

const failing =
  (code: string) =>
  (
    hostname: string,
    done: (error: NodeJS.ErrnoException | null, found?: LookupAddress[]) => void
  ) => {
    done(Object.assign(new Error(`getaddrinfo ${code} ${hostname}`), { code }));
  };

describe("the Node hop transport", () => {
  it("passes a DNS failure on as an error, with no address", () => {
    expect(
      answersOf(
        publicLookupWith(failing("ENOTFOUND")),
        "no-such-host-zz9-eaa.com",
        { all: true }
      )
    ).toEqual([["ENOTFOUND", "", undefined]]);
  });

  it.each(REFUSED)("refuses the address %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(ALLOWED)("allows the public address %s", (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  it("refuses a name when any address it resolves to is private", () => {
    const lookup = publicLookupWith(
      resolving([
        { address: "93.184.215.14", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ])
    );

    expect(answersOf(lookup, "localtest.me", { all: true })[0]?.[0]).toBe(
      NOT_PUBLIC_CODE
    );
  });

  it("hands a public name's vetted address to the socket", () => {
    const lookup = publicLookupWith(
      resolving([{ address: "93.184.215.14", family: 4 }])
    );

    expect(answersOf(lookup, "example.com", {})).toEqual([
      [undefined, "93.184.215.14", 4],
    ]);
  });

  it("passes a DNS failure through", () => {
    const lookup = publicLookupWith((_hostname, done) => {
      done(Object.assign(new Error("not found"), { code: "ENOTFOUND" }), []);
    });

    expect(answersOf(lookup, "never.example", {})[0]?.[0]).toBe("ENOTFOUND");
  });
});
