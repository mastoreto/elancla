import { describe, expect, test } from "bun:test";
import { findLockedLocale } from "./assertSlugsLocked";

const snapshotOf = (slugs: Record<string, string>) => ({
  translations: Object.fromEntries(
    Object.entries(slugs).map(([locale, slug]) => [locale, { slug }]),
  ),
});

describe("findLockedLocale", () => {
  test("a changed slug of a published language is locked", () => {
    expect(
      findLockedLocale(
        snapshotOf({ es: "a", en: "b" }),
        snapshotOf({ es: "a", en: "c" }),
      ),
    ).toBe("en");
  });

  test("unchanged slugs and new languages are fine", () => {
    expect(
      findLockedLocale(
        snapshotOf({ es: "a" }),
        snapshotOf({ es: "a", en: "new" }),
      ),
    ).toBeUndefined();
  });

  test("dropping a language is not a change", () => {
    expect(
      findLockedLocale(
        snapshotOf({ es: "a", en: "b" }),
        snapshotOf({ es: "a" }),
      ),
    ).toBeUndefined();
  });
});
