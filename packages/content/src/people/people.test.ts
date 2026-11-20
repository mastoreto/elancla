import { describe, expect, test } from "bun:test";
import type { PersonContext } from "@ancla/contracts";
import type { PublicClient } from "../publicClient";
import { createPeopleLoader, type PublicPerson } from "./people";

const PERSON: PublicPerson = {
  name: "Maria Jose Perez",
  initials: "MP",
  photo: null,
  bio: "Bio",
  title: "Pastora",
};

interface Call {
  context: PersonContext;
  locale: string;
}

function clientReturning(
  results: (PublicPerson[] | Error)[],
  calls: Call[],
): PublicClient {
  return {
    getSettings: async () => {
      throw new Error("not used");
    },
    async getPeople(context, locale) {
      const result = results[Math.min(calls.length, results.length - 1)];
      calls.push({ context, locale });
      if (result instanceof Error) throw result;
      return result as PublicPerson[];
    },
  };
}

function loaderFor(client: PublicClient | null, clock: { now: number }) {
  const warnings: string[] = [];
  const load = createPeopleLoader({
    client,
    now: () => clock.now,
    ttlMs: 60_000,
    warn: (message) => warnings.push(message),
  });
  return { load, warnings };
}

describe("createPeopleLoader", () => {
  test("returns the people the API sends", async () => {
    const { load } = loaderFor(clientReturning([[PERSON]], []), { now: 0 });
    expect(await load("team", "es")).toEqual([PERSON]);
  });

  test("the TTL avoids a second fetch and expires after the window", async () => {
    const calls: Call[] = [];
    const clock = { now: 1_000 };
    const { load } = loaderFor(clientReturning([[PERSON]], calls), clock);
    await load("team", "es");
    clock.now += 59_000;
    await load("team", "es");
    expect(calls).toHaveLength(1);
    clock.now += 2_000;
    await load("team", "es");
    expect(calls).toHaveLength(2);
  });

  test("caches per context and locale and asks the client for each", async () => {
    const calls: Call[] = [];
    const { load } = loaderFor(clientReturning([[PERSON]], calls), { now: 0 });
    await load("team", "es");
    await load("team", "en");
    await load("preacher", "es");
    await load("team", "en");
    expect(calls).toEqual([
      { context: "team", locale: "es" },
      { context: "team", locale: "en" },
      { context: "preacher", locale: "es" },
    ]);
  });

  test("serves [] when the API fails before any success, then the last good list", async () => {
    const calls: Call[] = [];
    const clock = { now: 0 };
    const { load, warnings } = loaderFor(
      clientReturning([new Error("down"), [PERSON], new Error("down")], calls),
      clock,
    );
    expect(await load("team", "es")).toEqual([]);
    clock.now += 61_000;
    expect(await load("team", "es")).toEqual([PERSON]);
    clock.now += 61_000;
    expect(await load("team", "es")).toEqual([PERSON]);
    expect(warnings).toHaveLength(2);
  });

  test("without a client (env missing) it serves [] and never fetches", async () => {
    const { load } = loaderFor(null, { now: 0 });
    expect(await load("team", "es")).toEqual([]);
  });
});
