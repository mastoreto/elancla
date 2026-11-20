import { describe, expect, test } from "bun:test";
import { blogPostSnapshot } from "./blogPostSnapshot";

const ID = (n: number) => `0197f1a0-0000-7000-8000-00000000000${n}`;
const body = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hola" }] }],
};
const translation = (overrides: Record<string, unknown> = {}) => ({
  title: "Esperar bien",
  slug: "esperar-bien",
  excerpt: "Un extracto",
  body,
  ...overrides,
});
const post = (overrides: Record<string, unknown> = {}) => ({
  translations: { es: translation() },
  authorProfileId: ID(1),
  categoryId: ID(2),
  cover: { kind: "design", glyph: "anchor", tint: "paper" },
  writtenAt: "2026-11-01",
  ...overrides,
});
const ok = (value: unknown) => blogPostSnapshot.safeParse(value).success;

describe("blogPostSnapshot", () => {
  test("accepts a minimal post and fills the defaults", () => {
    const parsed = blogPostSnapshot.parse(post());
    expect(parsed.featured).toBe(false);
    expect(parsed.relatedPostIds).toEqual([]);
    expect(parsed.translations.es?.tags).toEqual([]);
  });

  test("accepts a complete post", () => {
    expect(
      ok(
        post({
          translations: {
            es: translation({
              tags: ["fe"],
              seoTitle: "SEO",
              seoDescription: "Desc",
            }),
            en: translation({ slug: "waiting-well" }),
          },
          seriesId: ID(3),
          seriesOrder: 2,
          featured: true,
          relatedPostIds: [ID(4), ID(5)],
          publishAt: "2026-12-01T10:00:00Z",
        }),
      ),
    ).toBe(true);
  });

  test("requires seriesId and seriesOrder together", () => {
    expect(ok(post({ seriesId: ID(3) }))).toBe(false);
    expect(ok(post({ seriesOrder: 1 }))).toBe(false);
    expect(ok(post({ seriesId: ID(3), seriesOrder: 0 }))).toBe(false);
  });

  test("rejects more than 3 or repeated related posts", () => {
    expect(ok(post({ relatedPostIds: [ID(1), ID(2), ID(3), ID(4)] }))).toBe(
      false,
    );
    expect(ok(post({ relatedPostIds: [ID(1), ID(1)] }))).toBe(false);
  });

  test("rejects no translations, a bad locale key and unknown fields", () => {
    expect(ok(post({ translations: {} }))).toBe(false);
    expect(ok(post({ translations: { "not a locale": translation() } }))).toBe(
      false,
    );
    expect(ok(post({ translations: { es: translation({ extra: 1 }) } }))).toBe(
      false,
    );
    expect(ok(post({ extra: 1 }))).toBe(false);
  });

  test.each([
    "Mayusculas",
    "con espacio",
    "-guion",
    "doble--guion",
    "ñandú",
    "",
  ])("rejects the slug %p", (slug) => {
    expect(ok(post({ translations: { es: translation({ slug }) } }))).toBe(
      false,
    );
  });

  test("bounds title, excerpt, tags and SEO fields", () => {
    const withTranslation = (overrides: Record<string, unknown>) =>
      ok(post({ translations: { es: translation(overrides) } }));
    expect(withTranslation({ title: "x".repeat(141) })).toBe(false);
    expect(withTranslation({ excerpt: "x".repeat(301) })).toBe(false);
    expect(
      withTranslation({ tags: Array.from({ length: 9 }, (_, i) => `t${i}`) }),
    ).toBe(false);
    expect(withTranslation({ tags: ["x".repeat(41)] })).toBe(false);
    expect(withTranslation({ seoTitle: "x".repeat(71) })).toBe(false);
    expect(withTranslation({ seoDescription: "x".repeat(161) })).toBe(false);
  });

  test("rejects an invalid youtubeId, a javascript: card and an unknown node in the body", () => {
    const withBody = (...content: unknown[]) =>
      ok(
        post({
          translations: { es: translation({ body: { type: "doc", content } }) },
        }),
      );
    expect(
      withBody({ type: "video", attrs: { youtubeId: "nope", title: "V" } }),
    ).toBe(false);
    expect(
      withBody({
        type: "linkCards",
        attrs: { items: [{ title: "T", href: "javascript:alert(1)" }] },
      }),
    ).toBe(false);
    expect(withBody({ type: "reactions" })).toBe(false);
  });

  test("rejects a bad cover, a non-uuid author and bad dates", () => {
    expect(
      ok(post({ cover: { kind: "design", glyph: "anchor", tint: "#fff" } })),
    ).toBe(false);
    expect(ok(post({ authorProfileId: "x" }))).toBe(false);
    expect(ok(post({ writtenAt: "01/11/2026" }))).toBe(false);
    expect(ok(post({ publishAt: "tomorrow" }))).toBe(false);
  });
});
