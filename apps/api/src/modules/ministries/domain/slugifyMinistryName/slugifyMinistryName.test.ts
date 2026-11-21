import { describe, expect, test } from "bun:test";
import { slugifyMinistryName } from "./slugifyMinistryName";

describe("slugifyMinistryName", () => {
  test("drops accents and joins words with dashes", () => {
    expect(slugifyMinistryName("Enseñanza")).toBe("ensenanza");
    expect(slugifyMinistryName("Espacio  Mujer!")).toBe("espacio-mujer");
  });

  test("never returns an empty slug and caps the length", () => {
    expect(slugifyMinistryName("???")).toBe("ministry");
    expect(slugifyMinistryName("a".repeat(200))).toHaveLength(80);
  });
});
