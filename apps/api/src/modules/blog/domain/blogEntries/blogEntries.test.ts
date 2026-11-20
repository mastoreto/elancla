import { describe, expect, test } from "bun:test";
import {
  buildBlogEntries,
  findVisibleEntryBySlug,
  pickBlogTranslation,
} from "./blogEntries";

const NOW = new Date("2026-06-10T12:00:00Z");
const translation = (slug: string) => ({
  title: slug,
  slug,
  excerpt: "x",
  body: { type: "doc", content: [] },
  tags: [],
});
const revision = (
  entityId: string,
  extra: Record<string, unknown> = {},
  slugs: Record<string, string> = { es: entityId },
) => ({
  entityId,
  publishedAt: null,
  snapshot: {
    translations: Object.fromEntries(
      Object.entries(slugs).map(([locale, slug]) => [
        locale,
        translation(slug),
      ]),
    ),
    ...extra,
  },
});
const firstLive = new Map([
  ["a", new Date("2026-06-01T10:00:00Z")],
  ["b", new Date("2026-06-20T10:00:00Z")],
]);

describe("buildBlogEntries", () => {
  test("marks scheduled posts, shows publishAt as the date and skips posts without firstLiveAt", () => {
    const entries = buildBlogEntries(
      [
        revision("a"),
        revision("b", { publishAt: "2026-06-20T10:00:00Z" }),
        revision("orphan"),
      ],
      firstLive,
      NOW,
    );
    expect(entries.map((entry) => entry.postId)).toEqual(["a", "b"]);
    expect(entries[0]?.visible).toBe(true);
    expect(entries[0]?.displayedAt).toEqual(firstLive.get("a") as Date);
    expect(entries[1]?.visible).toBe(false);
    expect(entries[1]?.displayedAt.toISOString()).toBe(
      "2026-06-20T10:00:00.000Z",
    );
  });
});

describe("findVisibleEntryBySlug", () => {
  const entries = buildBlogEntries(
    [
      revision("a", {}, { es: "hola", en: "hello" }),
      revision("b", { publishAt: "2026-06-20T10:00:00Z" }, { es: "pronto" }),
    ],
    firstLive,
    NOW,
  );

  test("finds a slug in any language", () => {
    expect(findVisibleEntryBySlug(entries, "hello")?.postId).toBe("a");
  });

  test("a scheduled post and an unknown slug are not found", () => {
    expect(findVisibleEntryBySlug(entries, "pronto")).toBeNull();
    expect(findVisibleEntryBySlug(entries, "nada")).toBeNull();
  });
});

describe("pickBlogTranslation", () => {
  const [entry] = buildBlogEntries([revision("a")], firstLive, NOW);
  const snapshot = entry?.snapshot as NonNullable<typeof entry>["snapshot"];

  test("falls back to the default language and gives up without both", () => {
    expect(
      pickBlogTranslation(snapshot, { locale: "en", defaultLocale: "es" })
        ?.locale,
    ).toBe("es");
    expect(
      pickBlogTranslation(snapshot, { locale: "en", defaultLocale: "pt" }),
    ).toBeNull();
  });
});
