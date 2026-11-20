import { describe, expect, test } from "bun:test";
import { headingId, uniqueHeadingIds } from "./headingId";

describe("headingId", () => {
  test.each([
    ["Esperanza y ancla", "esperanza-y-ancla"],
    ["¿Qué es la fe?", "que-es-la-fe"],
    ["  Ñandú — 1 Pedro 3:15  ", "nandu-1-pedro-3-15"],
    ["Hebreos 6", "hebreos-6"],
  ])("slugifies %p", (text, expected) => {
    expect(headingId(text)).toBe(expected);
  });

  test("falls back when nothing usable is left", () => {
    expect(headingId("¿¿??")).toBe("seccion");
    expect(headingId("")).toBe("seccion");
  });

  test("is bounded and never ends with a hyphen", () => {
    const id = headingId(`${"a".repeat(79)} bbb`);
    expect(id.length).toBeLessThanOrEqual(80);
    expect(id.endsWith("-")).toBe(false);
  });
});

describe("uniqueHeadingIds", () => {
  test("numbers repeated headings from the second one", () => {
    expect(uniqueHeadingIds(["Fe", "Esperanza", "Fe", "fe"])).toEqual([
      "fe",
      "esperanza",
      "fe-2",
      "fe-3",
    ]);
  });
});
