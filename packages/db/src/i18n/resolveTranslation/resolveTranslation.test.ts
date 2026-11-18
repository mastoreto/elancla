import { describe, expect, test } from "bun:test";
import { resolveTranslation } from "./resolveTranslation";

const rows = [
  { locale: "es", title: "Hola" },
  { locale: "en", title: "Hello" },
];

describe("resolveTranslation", () => {
  test("returns the requested locale", () => {
    expect(resolveTranslation(rows, "en", "es")?.title).toBe("Hello");
  });

  test("falls back to the default locale", () => {
    expect(resolveTranslation(rows, "pt", "es")?.title).toBe("Hola");
  });

  test("returns null when nothing matches", () => {
    expect(resolveTranslation([{ locale: "en" }], "pt", "es")).toBeNull();
    expect(resolveTranslation([], "es", "es")).toBeNull();
  });
});
