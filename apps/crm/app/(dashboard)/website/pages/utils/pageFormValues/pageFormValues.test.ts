import { describe, expect, test } from "bun:test";
import type { RichTextDoc } from "@ancla/contracts";
import { EMPTY_BODY, isBodyEmpty, toPageFormValues, toPageSnapshot } from "./pageFormValues";

const LOCALES = ["es", "en"];
const body: RichTextDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hola" }] }],
};

describe("isBodyEmpty", () => {
  test("a doc of empty paragraphs is empty", () => {
    expect(isBodyEmpty(EMPTY_BODY)).toBe(true);
    expect(isBodyEmpty({ type: "doc", content: [] })).toBe(true);
  });

  test("text, or any other block, is content", () => {
    expect(isBodyEmpty(body)).toBe(false);
    expect(isBodyEmpty({ type: "doc", content: [{ type: "horizontalRule" }] })).toBe(false);
  });
});

describe("toPageFormValues", () => {
  test("gives blank translations when there is no snapshot", () => {
    const values = toPageFormValues(null, LOCALES);
    expect(Object.keys(values)).toEqual(LOCALES);
    expect(values.es?.title).toBe("");
    expect(values.es?.slugEdited).toBe(false);
  });

  test("loads what the snapshot holds and treats the stored slug as edited", () => {
    const values = toPageFormValues(
      { translations: { es: { title: "Hola", slug: "hola", body, seoTitle: "SEO" } } },
      LOCALES,
    );
    expect(values.es).toMatchObject({ title: "Hola", slug: "hola", slugEdited: true });
    expect(values.es?.seoTitle).toBe("SEO");
    expect(values.en?.title).toBe("");
  });

  test("ignores a snapshot that does not parse", () => {
    expect(toPageFormValues({ translations: 3 }, LOCALES).es?.title).toBe("");
  });
});

describe("toPageSnapshot", () => {
  test("omits blank non-default languages and empty SEO fields", () => {
    const values = toPageFormValues(null, LOCALES);
    const es = { ...values.es, title: " Hola ", slug: "hola", body, seoDescription: "  " };
    const snapshot = toPageSnapshot({ ...values, es } as typeof values, "es");
    expect(snapshot).toEqual({ translations: { es: { title: "Hola", slug: "hola", body } } });
  });

  test("always sends the default language, even blank", () => {
    const snapshot = toPageSnapshot(toPageFormValues(null, LOCALES), "es");
    expect(Object.keys(snapshot.translations)).toEqual(["es"]);
  });

  test("keeps a non-default language with any content", () => {
    const values = toPageFormValues(null, LOCALES);
    const en = { ...values.en, title: "Hi" };
    const snapshot = toPageSnapshot({ ...values, en } as typeof values, "es");
    expect(Object.keys(snapshot.translations)).toEqual(["es", "en"]);
  });
});
