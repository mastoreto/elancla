import { describe, expect, test } from "bun:test";
import { pickLocalizedValue } from "./pickLocalizedValue";

const rows = [
  { locale: "es", name: "Hola", note: "nota" },
  { locale: "en", name: "Hello", note: null },
];
const read = (row: (typeof rows)[number]) => row.note;

describe("pickLocalizedValue", () => {
  test("takes the requested language", () => {
    expect(
      pickLocalizedValue(
        rows,
        { locale: "en", defaultLocale: "es" },
        (r) => r.name,
      ),
    ).toBe("Hello");
  });

  test("falls back to the default when the value is null or the row is missing", () => {
    const locales = { locale: "en", defaultLocale: "es" };
    expect(pickLocalizedValue(rows, locales, read)).toBe("nota");
    expect(
      pickLocalizedValue(rows, { locale: "pt", defaultLocale: "es" }, read),
    ).toBe("nota");
  });

  test("is null when neither language has it", () => {
    expect(
      pickLocalizedValue(rows, { locale: "en", defaultLocale: "pt" }, read),
    ).toBeNull();
  });
});
