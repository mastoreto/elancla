import { describe, expect, test } from "bun:test";
import { sortLanding } from "./sortLanding";

const item = (name: string, showOnLanding: boolean, landingOrder: number) => ({
  name,
  showOnLanding,
  landingOrder,
});

describe("sortLanding", () => {
  test("landing ministries come first, by position", () => {
    const sorted = sortLanding(
      [item("C", true, 3), item("A", true, 1), item("B", true, 2)],
      "es",
    );
    expect(sorted.map((entry) => entry.name)).toEqual(["A", "B", "C"]);
  });

  test("ties go by name and the ones off the landing by name after them", () => {
    const sorted = sortLanding(
      [
        item("Zeta", false, 0),
        item("Beta", true, 1),
        item("Alfa", true, 1),
        item("Ángel", false, 9),
      ],
      "es",
    );
    expect(sorted.map((entry) => entry.name)).toEqual([
      "Alfa",
      "Beta",
      "Ángel",
      "Zeta",
    ]);
  });

  test("does not mutate the input", () => {
    const input = [item("B", true, 2), item("A", true, 1)];
    sortLanding(input, "es");
    expect(input[0]?.name).toBe("B");
  });
});
