import { describe, expect, test } from "bun:test";
import { BLOG_SLUG_PATTERN } from "@ancla/contracts";
import { pickFreeSlug, slugifyTitle } from "./slugifyTitle";

describe("slugifyTitle", () => {
  test("drops accents, punctuation and case", () => {
    expect(slugifyTitle("La fe que permanece | Serie: Firmes")).toBe(
      "la-fe-que-permanece-serie-firmes",
    );
    expect(slugifyTitle("¡Enseñanza y Oración!")).toBe("ensenanza-y-oracion");
  });

  test("is never empty and always a valid slug", () => {
    expect(slugifyTitle("🙏🙏")).toBe("sermon");
    expect(slugifyTitle("🙏", "series")).toBe("series");
    expect(BLOG_SLUG_PATTERN.test(slugifyTitle("a".repeat(200)))).toBe(true);
    expect(slugifyTitle("a".repeat(200)).length).toBe(80);
  });
});

describe("pickFreeSlug", () => {
  test("keeps a free slug and numbers a taken one", () => {
    expect(pickFreeSlug("romanos", new Set())).toBe("romanos");
    expect(pickFreeSlug("romanos", new Set(["romanos"]))).toBe("romanos-2");
    expect(pickFreeSlug("romanos", new Set(["romanos", "romanos-2"]))).toBe(
      "romanos-3",
    );
  });

  test("stays within the length limit", () => {
    const long = "a".repeat(80);
    const picked = pickFreeSlug(long, new Set([long]));
    expect(picked.length).toBeLessThanOrEqual(80);
    expect(picked.endsWith("-2")).toBe(true);
  });
});
