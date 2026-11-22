import { describe, expect, test } from "bun:test";
import type { ScheduleSetDto } from "@ancla/contracts";
import { pickSelectedSet } from "./pickSelectedSet";

function set(id: string, isDefault = false): ScheduleSetDto {
  return {
    id,
    validFrom: null,
    validTo: null,
    isDefault,
    forcedActive: false,
    order: 0,
    version: 1,
    translations: { es: { name: id } },
  };
}

describe("pickSelectedSet", () => {
  const sets = [set("a"), set("b", true), set("c")];

  test("the requested set wins", () => {
    expect(pickSelectedSet(sets, "c")?.id).toBe("c");
  });

  test("an unknown or missing request falls back to the default set", () => {
    expect(pickSelectedSet(sets, "zzz")?.id).toBe("b");
    expect(pickSelectedSet(sets, undefined)?.id).toBe("b");
  });

  test("without a default it takes the first, and without sets there is none", () => {
    expect(pickSelectedSet([set("a"), set("c")], undefined)?.id).toBe("a");
    expect(pickSelectedSet([], undefined)).toBeNull();
  });
});
