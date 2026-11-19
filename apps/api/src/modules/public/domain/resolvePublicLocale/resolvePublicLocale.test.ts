import { describe, expect, test } from "bun:test";
import { resolvePublicLocale } from "./resolvePublicLocale";

const ENABLED = ["es", "en", "pt"];

describe("resolvePublicLocale", () => {
  test("serves an enabled locale", () => {
    expect(resolvePublicLocale("pt", ENABLED, "es")).toBe("pt");
  });

  test("falls back to the default when the locale is missing or not enabled", () => {
    expect(resolvePublicLocale(undefined, ENABLED, "es")).toBe("es");
    expect(resolvePublicLocale("fr", ENABLED, "es")).toBe("es");
  });
});
