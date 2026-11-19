import { test as base } from "@playwright/test";

const FORWARDED_FOR_HEADER = "x-forwarded-for";
const TEST_NET_PREFIX = "10.251";
const OCTET_RANGE = 250;

/** A client address no other test uses: the auth rate limits are keyed by IP. */
export function uniqueClientAddress(): string {
  const octet = () => Math.floor(Math.random() * OCTET_RANGE) + 1;
  return `${TEST_NET_PREFIX}.${octet()}.${octet()}`;
}

/** Every test (and extra context) gets its own address so the suite never trips a rate limit. */
export function clientAddressHeaders(): Record<string, string> {
  return { [FORWARDED_FOR_HEADER]: uniqueClientAddress() };
}

export const test = base.extend({
  extraHTTPHeaders: async ({}, use) => {
    await use(clientAddressHeaders());
  },
});

export { expect } from "@playwright/test";
