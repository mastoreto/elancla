import { describe, expect, test } from "bun:test";
import { blogPostSnapshot } from "@ancla/contracts";
import { parseTags, toPostFormValues, toPostSnapshot } from "./postFormValues";

const LOCALES = ["es", "en"] as const;
const AUTHOR_ID = "0190a0b2-4c1d-7000-8000-000000000001";
const CATEGORY_ID = "0190a0b2-4c1d-7000-8000-000000000002";
const SERIES_ID = "0190a0b2-4c1d-7000-8000-000000000003";
const TODAY = "2030-01-05";

function filledForm() {
  const values = toPostFormValues(null, LOCALES, TODAY);
  const es = values.translations.es;
  if (!es) throw new Error("expected the es translation");
  es.title = "Una esperanza viva";
  es.slug = "una-esperanza-viva";
  es.excerpt = "Un extracto.";
  es.tagsText = "fe, esperanza,, fe";
  values.authorProfileId = AUTHOR_ID;
  values.categoryId = CATEGORY_ID;
  return values;
}

describe("parseTags", () => {
  test("trims, drops blanks and repeats", () => {
    expect(parseTags("fe, esperanza,, fe ")).toEqual(["fe", "esperanza"]);
    expect(parseTags("")).toEqual([]);
  });
});

describe("toPostFormValues", () => {
  test("a blank form has every language, a design cover and today as the written date", () => {
    const values = toPostFormValues(null, LOCALES, TODAY);
    expect(Object.keys(values.translations)).toEqual(["es", "en"]);
    expect(values.cover.kind).toBe("design");
    expect(values.writtenAt).toBe(TODAY);
    expect(values.seriesId).toBe("");
  });

  test("a stored snapshot goes back to the form and out again unchanged", () => {
    const snapshot = {
      ...toPostSnapshot(filledForm(), "es"),
      seriesId: SERIES_ID,
      seriesOrder: 2,
      featured: true,
      publishAt: "2031-06-01T15:30:00.000Z",
    };
    expect(blogPostSnapshot.safeParse(snapshot).success).toBe(true);
    const values = toPostFormValues(snapshot, LOCALES, TODAY);
    expect(values.translations.es?.slugEdited).toBe(true);
    expect(values.seriesOrder).toBe("2");
    expect(toPostSnapshot(values, "es")).toEqual(snapshot);
  });
});

describe("toPostSnapshot", () => {
  test("the result is exactly what the strict snapshot schema accepts", () => {
    const snapshot = toPostSnapshot(filledForm(), "es");
    expect(blogPostSnapshot.safeParse(snapshot).success).toBe(true);
  });

  test("a blank secondary language is left out, the default one always goes", () => {
    const snapshot = toPostSnapshot(filledForm(), "es");
    expect(Object.keys(snapshot.translations as object)).toEqual(["es"]);
  });

  test("series and order go together or not at all", () => {
    const values = filledForm();
    expect(toPostSnapshot(values, "es")).not.toHaveProperty("seriesId");
    values.seriesId = SERIES_ID;
    values.seriesOrder = "3";
    expect(toPostSnapshot(values, "es")).toMatchObject({ seriesId: SERIES_ID, seriesOrder: 3 });
  });

  test("a photo cover sends its media id and alt, a design one its glyph and tint", () => {
    const values = filledForm();
    values.cover = { ...values.cover, kind: "photo", mediaId: AUTHOR_ID, alt: " Una foto " };
    expect(toPostSnapshot(values, "es").cover).toEqual({
      kind: "photo",
      mediaId: AUTHOR_ID,
      alt: "Una foto",
    });
    values.cover = { ...values.cover, kind: "design" };
    expect(toPostSnapshot(values, "es").cover).toEqual({
      kind: "design",
      glyph: "anchor",
      tint: "paper",
    });
  });
});
