import { describe, expect, test } from "bun:test";
import { slugify } from "./slugify";

describe("slugify", () => {
  test("lowercases and drops accents", () => {
    expect(slugify("¿Quiénes Somos?")).toBe("quienes-somos");
  });

  test("collapses runs of symbols and trims the edges", () => {
    expect(slugify("  --Política   de  privacidad!! ")).toBe("politica-de-privacidad");
  });

  test("keeps digits and turns the ñ into n", () => {
    expect(slugify("Año 2026")).toBe("ano-2026");
  });

  test("gives an empty slug when nothing usable is left", () => {
    expect(slugify("¿?!")).toBe("");
  });
});
