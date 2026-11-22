import { describe, expect, test } from "bun:test";
import type { CalendarMinistry } from "../../types";
import { resolveEventMinistries } from "./resolveEventMinistries";

const youth: CalendarMinistry = { id: "a", name: "Jóvenes", color: "obra-red" };
const worship: CalendarMinistry = { id: "b", name: "Alabanza", color: "obra-ink" };

describe("resolveEventMinistries", () => {
  test("keeps the order of the event, not the one of the ministries", () => {
    expect(resolveEventMinistries(["b", "a"], [youth, worship])).toEqual([worship, youth]);
  });

  test("drops ids the user cannot see and returns nothing for the whole church", () => {
    expect(resolveEventMinistries(["a", "zzz"], [youth])).toEqual([youth]);
    expect(resolveEventMinistries([], [youth])).toEqual([]);
  });
});
