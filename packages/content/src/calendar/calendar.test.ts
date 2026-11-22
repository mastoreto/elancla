import { describe, expect, test } from "bun:test";
import type { PublicCalendarDto } from "@ancla/contracts";
import type { PublicClient } from "../publicClient";
import { createCalendarLoader } from "./calendar";

const CALENDAR: PublicCalendarDto = {
  year: 2026,
  published: true,
  timezone: "America/Montevideo",
  ministries: [],
  weekly: [],
  exceptions: [],
  events: [],
};

interface Call {
  locale: string;
  year: number | undefined;
}

function clientFor(
  results: (PublicCalendarDto | Error)[],
  calls: Call[],
): PublicClient {
  const client: Pick<PublicClient, "getCalendar"> = {
    async getCalendar(locale, year) {
      const result = results[Math.min(calls.length, results.length - 1)];
      calls.push({ locale, year });
      if (result instanceof Error) throw result;
      return result as PublicCalendarDto;
    },
  };
  return client as PublicClient;
}

function optionsFor(client: PublicClient | null, clock: { now: number }) {
  const warnings: string[] = [];
  return {
    options: {
      client,
      now: () => clock.now,
      ttlMs: 60_000,
      warn: (message: string) => warnings.push(message),
    },
    warnings,
  };
}

describe("createCalendarLoader", () => {
  test("asks the API by locale and year and caches each pair", async () => {
    const calls: Call[] = [];
    const { options } = optionsFor(clientFor([CALENDAR], calls), { now: 0 });
    const getCalendar = createCalendarLoader(options);
    expect(await getCalendar("es")).toEqual(CALENDAR);
    expect(await getCalendar("es")).toEqual(CALENDAR);
    await getCalendar("es", 2027);
    await getCalendar("en");
    expect(calls).toEqual([
      { locale: "es", year: undefined },
      { locale: "es", year: 2027 },
      { locale: "en", year: undefined },
    ]);
  });

  test("before the first success serves an empty unpublished calendar", async () => {
    const { options, warnings } = optionsFor(
      clientFor([new Error("down")], []),
      { now: Date.UTC(2026, 5, 1) },
    );
    const calendar = await createCalendarLoader(options)("es", 2027);
    expect(calendar).toMatchObject({
      year: 2027,
      published: false,
      weekly: [],
      exceptions: [],
      events: [],
    });
    expect(warnings).toHaveLength(1);
  });

  test("the fallback year is the current one in the church zone", async () => {
    // 2027-01-01 02:00 UTC is still 2026-12-31 in Montevideo (UTC-3).
    const { options } = optionsFor(clientFor([new Error("down")], []), {
      now: Date.UTC(2027, 0, 1, 2),
    });
    expect((await createCalendarLoader(options)("es")).year).toBe(2026);
  });

  test("keeps the last good calendar when the API fails later", async () => {
    const clock = { now: 0 };
    const { options } = optionsFor(
      clientFor([CALENDAR, new Error("down")], []),
      clock,
    );
    const getCalendar = createCalendarLoader(options);
    await getCalendar("es");
    clock.now = 61_000;
    expect(await getCalendar("es")).toEqual(CALENDAR);
  });

  test("without a client serves the empty calendar and does not touch the network", async () => {
    const { options } = optionsFor(null, { now: Date.UTC(2026, 5, 1) });
    expect(await createCalendarLoader(options)("pt")).toMatchObject({
      year: 2026,
      published: false,
      events: [],
    });
  });
});
