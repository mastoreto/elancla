import { describe, expect, test } from "bun:test";
import { resolveMinistryHref } from "./resolveMinistryHref";

const base = {
  slug: "alabanza",
  externalUrl: null,
  locale: "es",
  defaultLocale: "es",
} as const;

describe("resolveMinistryHref", () => {
  test("a page in the default language has no prefix", () => {
    expect(resolveMinistryHref({ ...base, destination: "page" })).toBe(
      "/ministerios/alabanza",
    );
  });

  test("a page in another language carries the locale prefix", () => {
    expect(
      resolveMinistryHref({ ...base, destination: "page", locale: "en" }),
    ).toBe("/en/ministerios/alabanza");
  });

  test("an external destination is the URL, whatever the language", () => {
    expect(
      resolveMinistryHref({
        ...base,
        destination: "external",
        slug: undefined,
        externalUrl: "https://emujer.elancla.uy/",
        locale: "pt",
      }),
    ).toBe("https://emujer.elancla.uy/");
  });

  test("none and a page without slug have no link", () => {
    expect(
      resolveMinistryHref({ ...base, destination: "none" }),
    ).toBeUndefined();
    expect(
      resolveMinistryHref({ ...base, destination: "page", slug: undefined }),
    ).toBeUndefined();
    expect(
      resolveMinistryHref({ ...base, destination: "external" }),
    ).toBeUndefined();
  });
});
