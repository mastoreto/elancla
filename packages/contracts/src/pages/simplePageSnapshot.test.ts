import { describe, expect, test } from "bun:test";
import { RESERVED_ROOT_SLUGS, simplePageSnapshot } from "./simplePageSnapshot";

const body = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hola" }] }],
};
const page = (overrides: Record<string, unknown> = {}) => ({
  translations: {
    es: { title: "Privacidad", slug: "privacidad", body, ...overrides },
  },
});

describe("simplePageSnapshot", () => {
  test("accepts a valid page and drops empty SEO fields", () => {
    const parsed = simplePageSnapshot.parse(
      page({ seoTitle: "  ", seoDescription: "" }),
    );
    expect(parsed.translations.es?.seoTitle).toBeUndefined();
  });

  test.each(RESERVED_ROOT_SLUGS)("rejects the reserved slug %p", (slug) => {
    expect(simplePageSnapshot.safeParse(page({ slug })).success).toBe(false);
  });

  test.each([
    "Mayusculas",
    "con espacio",
    "-guion",
    "doble--guion",
    "ñandú",
    "",
  ])("rejects the slug %p", (slug) => {
    expect(simplePageSnapshot.safeParse(page({ slug })).success).toBe(false);
  });

  test("rejects a dangerous link in the body", () => {
    const evil = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "x",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    };
    expect(simplePageSnapshot.safeParse(page({ body: evil })).success).toBe(
      false,
    );
  });

  test("rejects no translations, a bad locale key and unknown fields", () => {
    expect(simplePageSnapshot.safeParse({ translations: {} }).success).toBe(
      false,
    );
    expect(
      simplePageSnapshot.safeParse({
        translations: { "not a locale": page().translations.es },
      }).success,
    ).toBe(false);
    expect(simplePageSnapshot.safeParse(page({ extra: 1 })).success).toBe(
      false,
    );
  });

  test("bounds title and SEO lengths", () => {
    expect(
      simplePageSnapshot.safeParse(page({ title: "x".repeat(121) })).success,
    ).toBe(false);
    expect(
      simplePageSnapshot.safeParse(page({ seoDescription: "x".repeat(161) }))
        .success,
    ).toBe(false);
  });
});
