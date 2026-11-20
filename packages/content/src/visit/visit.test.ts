import { describe, expect, test } from "bun:test";
import type { PublicClient } from "../publicClient";
import { createVisitLoader, type VisitContent } from "./visit";

const VISIT: VisitContent = {
  directions: {
    parking: "Hay lugar en la calle",
    transit: null,
    accessibility: null,
  },
  faqs: [{ question: "Q", answer: "A" }],
};
const EMPTY: VisitContent = {
  directions: { parking: null, transit: null, accessibility: null },
  faqs: [],
};

function clientReturning(
  results: (VisitContent | Error)[],
  locales: string[],
): PublicClient {
  return {
    getSettings: async () => {
      throw new Error("not used");
    },
    getPeople: async () => [],
    async getVisit(locale) {
      const result = results[Math.min(locales.length, results.length - 1)];
      locales.push(locale);
      if (result instanceof Error) throw result;
      return result as VisitContent;
    },
  };
}

function loaderFor(client: PublicClient | null, clock: { now: number }) {
  const warnings: string[] = [];
  const load = createVisitLoader({
    client,
    now: () => clock.now,
    ttlMs: 60_000,
    warn: (message) => warnings.push(message),
  });
  return { load, warnings };
}

describe("createVisitLoader", () => {
  test("returns the visit the API sends", async () => {
    const { load } = loaderFor(clientReturning([VISIT], []), { now: 0 });
    expect(await load("es")).toEqual(VISIT);
  });

  test("caches per locale and expires after the TTL", async () => {
    const locales: string[] = [];
    const clock = { now: 1_000 };
    const { load } = loaderFor(clientReturning([VISIT], locales), clock);
    await load("es");
    await load("es");
    await load("en");
    expect(locales).toEqual(["es", "en"]);
    clock.now += 61_000;
    await load("es");
    expect(locales).toEqual(["es", "en", "es"]);
  });

  test("serves the empty visit when the API fails, then the last good one", async () => {
    const clock = { now: 0 };
    const { load, warnings } = loaderFor(
      clientReturning([new Error("down"), VISIT, new Error("down")], []),
      clock,
    );
    expect(await load("es")).toEqual(EMPTY);
    clock.now += 61_000;
    expect(await load("es")).toEqual(VISIT);
    clock.now += 61_000;
    expect(await load("es")).toEqual(VISIT);
    expect(warnings).toHaveLength(2);
  });

  test("without a client (env missing) it serves the empty visit and never fetches", async () => {
    const { load } = loaderFor(null, { now: 0 });
    expect(await load("es")).toEqual(EMPTY);
  });
});
