import { lookup } from "node:dns";
import type { LookupAddress } from "node:dns";
import type { LookupFunction } from "node:net";

import { isPublicAddress } from "./public-address.js";

export const NOT_PUBLIC_CODE = "ERR_GOOD_A11Y_NOT_PUBLIC_ADDRESS";

const coded = (message: string, code: string): NodeJS.ErrnoException =>
  Object.assign(new Error(message), { code });

const refusalOf = (
  hostname: string,
  addresses: readonly LookupAddress[]
): NodeJS.ErrnoException | null => {
  const refused = addresses.find(({ address }) => !isPublicAddress(address));

  if (refused !== undefined) {
    return coded(
      `${hostname} resolves to ${refused.address}, a private or reserved address. Only public addresses are scanned.`,
      NOT_PUBLIC_CODE
    );
  }

  return addresses.length === 0
    ? coded(`${hostname} has no address.`, "ENOTFOUND")
    : null;
};

/* oxlint-disable promise/prefer-await-to-callbacks, node/callback-return -- node:net calls a lookup with a callback; this wraps dns.lookup and refuses the name when any address it resolves to is not public. */
export type Resolve = (
  hostname: string,
  done: (
    error: NodeJS.ErrnoException | null,
    addresses?: LookupAddress[]
  ) => void
) => void;

const resolveAll: Resolve = (hostname, done) => {
  lookup(hostname, { all: true, order: "verbatim" }, done);
};

export const publicLookupWith =
  (resolve: Resolve): LookupFunction =>
  (hostname, options, callback) => {
    resolve(hostname, (error, addresses) => {
      if (error !== null || addresses === undefined) {
        callback(
          error ?? coded(`${hostname} has no address.`, "ENOTFOUND"),
          ""
        );

        return;
      }

      const refusal = refusalOf(hostname, addresses);
      const [first] = addresses;

      if (refusal !== null || first === undefined) {
        callback(refusal, "");
      } else if (options.all === true) {
        callback(null, addresses);
      } else {
        callback(null, first.address, first.family);
      }
    });
  };

export const publicLookup: LookupFunction = publicLookupWith(resolveAll);
/* oxlint-enable promise/prefer-await-to-callbacks, node/callback-return */
