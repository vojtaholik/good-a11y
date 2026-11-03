import { BlockList, isIP } from "node:net";

const RESERVED_V4 = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const;

const RESERVED_V6 = [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const;

const reserved = new BlockList();

for (const [network, prefix] of RESERVED_V4) {
  reserved.addSubnet(network, prefix, "ipv4");
}

for (const [network, prefix] of RESERVED_V6) {
  reserved.addSubnet(network, prefix, "ipv6");
}

const MAPPED_V4 = /^::ffff:(?<v4>\d{1,3}(?:\.\d{1,3}){3})$/iu;

const MAPPED_V4_HEX = /^::ffff:(?<high>[\da-f]{1,4}):(?<low>[\da-f]{1,4})$/iu;

const bytesOf = (group: string): number[] => {
  const value = Number.parseInt(group, 16);

  return [Math.floor(value / 256), value % 256];
};

const v4OfHex = (high: string, low: string): string =>
  [...bytesOf(high), ...bytesOf(low)].join(".");

const unmapped = (address: string): string => {
  const dotted = MAPPED_V4.exec(address)?.groups?.v4;

  if (dotted !== undefined) {
    return dotted;
  }

  const hex = MAPPED_V4_HEX.exec(address)?.groups;

  return hex?.high === undefined || hex.low === undefined
    ? address
    : v4OfHex(hex.high, hex.low);
};

export const isPublicAddress = (raw: string): boolean => {
  const address = unmapped(raw);
  const family = isIP(address);

  if (family === 4) {
    return !reserved.check(address, "ipv4");
  }

  return family === 6 && !reserved.check(address, "ipv6");
};
