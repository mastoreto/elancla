import { describe, expect, test } from "bun:test";
import { BIBLE_BOOK_CODES, BIBLE_BOOKS, bibleBookChapters } from "./bibleBooks";
import { sermonPassage } from "./sermonPassage";
import { sermonSnapshot } from "./sermonSnapshot";

const ID = "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b";
const OTHER_ID = "0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2c";

const sermon = (overrides: Record<string, unknown> = {}) => ({
  translations: { es: { title: "La gracia", slug: "la-gracia" } },
  preachedOn: "2026-03-08",
  ...overrides,
});

describe("BIBLE_BOOKS", () => {
  test("has the 66 books of the canon, once each, and 1189 chapters", () => {
    expect(BIBLE_BOOKS).toHaveLength(66);
    expect(new Set(BIBLE_BOOK_CODES).size).toBe(66);
    const chapters = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);
    expect(chapters).toBe(1189);
  });

  test("knows the chapters of a book", () => {
    expect(bibleBookChapters("Ps")).toBe(150);
    expect(bibleBookChapters("Jude")).toBe(1);
  });
});

describe("sermonPassage", () => {
  test.each([
    { book: "John", chapter: 3 },
    { book: "John", chapter: 3, verseFrom: 16 },
    { book: "John", chapter: 3, verseFrom: 16, verseTo: 18 },
    { book: "Rom", chapter: 8, chapterTo: 9 },
    { book: "John", chapter: 3, verseFrom: 16, chapterTo: 4, verseTo: 2 },
  ])("accepts %p", (passage) => {
    expect(sermonPassage.safeParse(passage).success).toBe(true);
  });

  test.each([
    { book: "Hezekiah", chapter: 1 },
    { book: "John", chapter: 22 },
    { book: "Jude", chapter: 2 },
    { book: "John", chapter: 0 },
    { book: "John", chapter: 3, chapterTo: 22 },
    { book: "John", chapter: 3, chapterTo: 3 },
    { book: "John", chapter: 3, verseTo: 18 },
    { book: "John", chapter: 3, verseFrom: 18, verseTo: 16 },
    { book: "John", chapter: 3, verseFrom: 16, chapterTo: 4 },
    { book: "John", chapter: 3, chapterTo: 4, verseTo: 2 },
    { book: "John", chapter: 3, verseFrom: 177 },
    { book: "John", chapter: 3, extra: true },
  ])("rejects %p", (passage) => {
    expect(sermonPassage.safeParse(passage).success).toBe(false);
  });
});

describe("sermonSnapshot", () => {
  test("accepts the minimum and fills the defaults", () => {
    const parsed = sermonSnapshot.parse(sermon());
    expect(parsed.featured).toBe(false);
    expect(parsed.passages).toEqual([]);
    expect(parsed.attachmentMediaIds).toEqual([]);
    expect(parsed.translations.es?.tags).toEqual([]);
  });

  test("drops empty optional text", () => {
    const parsed = sermonSnapshot.parse(
      sermon({
        translations: {
          es: { title: "A", slug: "a", summary: "  ", seoTitle: "" },
        },
      }),
    );
    expect(parsed.translations.es?.summary).toBeUndefined();
    expect(parsed.translations.es?.seoTitle).toBeUndefined();
  });

  test("seriesId and seriesOrder go together", () => {
    expect(
      sermonSnapshot.safeParse(sermon({ seriesId: ID, seriesOrder: 2 }))
        .success,
    ).toBe(true);
    expect(sermonSnapshot.safeParse(sermon({ seriesId: ID })).success).toBe(
      false,
    );
    expect(sermonSnapshot.safeParse(sermon({ seriesOrder: 2 })).success).toBe(
      false,
    );
  });

  test("rejects more than 6 passages, 3 attachments or repeated attachments", () => {
    const passage = { book: "John", chapter: 3 };
    expect(
      sermonSnapshot.safeParse(sermon({ passages: Array(7).fill(passage) }))
        .success,
    ).toBe(false);
    expect(
      sermonSnapshot.safeParse(
        sermon({ attachmentMediaIds: [ID, OTHER_ID, ID] }),
      ).success,
    ).toBe(false);
    expect(
      sermonSnapshot.safeParse(
        sermon({ attachmentMediaIds: [ID, OTHER_ID, OTHER_ID, ID] }),
      ).success,
    ).toBe(false);
  });

  test("rejects a bad date, long tags and unknown keys", () => {
    expect(
      sermonSnapshot.safeParse(sermon({ preachedOn: "2026-02-30" })).success,
    ).toBe(false);
    expect(
      sermonSnapshot.safeParse(
        sermon({
          translations: {
            es: { title: "A", slug: "a", tags: ["x".repeat(41)] },
          },
        }),
      ).success,
    ).toBe(false);
    expect(sermonSnapshot.safeParse(sermon({ views: 3 })).success).toBe(false);
  });

  test("rejects a dangerous link in the outline (base rich text)", () => {
    const outline = {
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
    const translations = {
      es: { title: "A", slug: "a", outline },
    };
    expect(sermonSnapshot.safeParse(sermon({ translations })).success).toBe(
      false,
    );
  });
});
