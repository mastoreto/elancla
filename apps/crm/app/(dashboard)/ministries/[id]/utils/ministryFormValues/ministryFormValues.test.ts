import { describe, expect, test } from "bun:test";
import type { RichTextDoc } from "@ancla/contracts";
import {
  EMPTY_ABOUT,
  isAboutEmpty,
  toMinistryFormValues,
  toMinistrySnapshot,
} from "./ministryFormValues";

const LOCALES = ["es", "en", "pt"];
const MEDIA_ID = "11111111-1111-4111-8111-111111111111";
const SOCIAL_ID = "22222222-2222-4222-8222-222222222222";
const about: RichTextDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Servimos con alegría" }] }],
};

const stored = {
  translations: {
    es: {
      name: "Alabanza",
      slug: "alabanza",
      tagline: "Adoramos juntos",
      about,
      values: [{ title: "Gozo", description: "Cantamos con ganas" }],
      place: "Templo",
      seoTitle: "Alabanza | El Ancla",
    },
  },
  coverMediaId: MEDIA_ID,
};

describe("isAboutEmpty", () => {
  test("a doc of empty paragraphs is empty", () => {
    expect(isAboutEmpty(EMPTY_ABOUT)).toBe(true);
    expect(isAboutEmpty({ type: "doc", content: [] })).toBe(true);
  });

  test("text counts as content", () => {
    expect(isAboutEmpty(about)).toBe(false);
  });
});

describe("toMinistryFormValues", () => {
  test("gives blank translations and no pictures when there is no snapshot", () => {
    const values = toMinistryFormValues(null, LOCALES);
    expect(Object.keys(values.translations)).toEqual(LOCALES);
    expect(values.translations.es?.name).toBe("");
    expect(values.translations.es?.slugEdited).toBe(false);
    expect(values.coverMediaId).toBe("");
    expect(values.socialImageId).toBe("");
  });

  test("loads what the snapshot holds and treats the stored slug as edited", () => {
    const values = toMinistryFormValues(stored, LOCALES);
    expect(values.translations.es).toMatchObject({
      name: "Alabanza",
      slug: "alabanza",
      slugEdited: true,
      place: "Templo",
      audience: "",
      seoTitle: "Alabanza | El Ancla",
    });
    expect(values.translations.es?.values).toEqual([
      { title: "Gozo", description: "Cantamos con ganas" },
    ]);
    expect(values.translations.en?.name).toBe("");
    expect(values.coverMediaId).toBe(MEDIA_ID);
  });

  test("ignores a snapshot that does not parse", () => {
    expect(toMinistryFormValues({ translations: 3 }, LOCALES).translations.es?.name).toBe("");
  });
});

describe("toMinistrySnapshot", () => {
  test("round trips: the unedited form sends what the snapshot held", () => {
    const snapshot = toMinistrySnapshot(toMinistryFormValues(stored, LOCALES), "es");
    expect(snapshot).toEqual({
      translations: {
        es: {
          name: "Alabanza",
          slug: "alabanza",
          tagline: "Adoramos juntos",
          about,
          values: [{ title: "Gozo", description: "Cantamos con ganas" }],
          place: "Templo",
          seoTitle: "Alabanza | El Ancla",
        },
      },
      coverMediaId: MEDIA_ID,
    });
  });

  test("trims the texts and leaves out the blank optional ones", () => {
    const values = toMinistryFormValues(null, LOCALES);
    const es = {
      ...values.translations.es,
      name: " Jóvenes ",
      slug: "jovenes",
      tagline: " Hola ",
      place: "  ",
    };
    const snapshot = toMinistrySnapshot(
      { ...values, translations: { ...values.translations, es } } as typeof values,
      "es",
    );
    expect(snapshot.translations).toEqual({
      es: { name: "Jóvenes", slug: "jovenes", tagline: "Hola", about: EMPTY_ABOUT, values: [] },
    });
  });

  test("always sends the default language, even blank, and drops the blank others", () => {
    const snapshot = toMinistrySnapshot(toMinistryFormValues(null, LOCALES), "es");
    expect(Object.keys(snapshot.translations as object)).toEqual(["es"]);
  });

  test("keeps a non-default language with any content", () => {
    const values = toMinistryFormValues(null, LOCALES);
    const en = { ...values.translations.en, tagline: "Hi" };
    const snapshot = toMinistrySnapshot(
      { ...values, translations: { ...values.translations, en } } as typeof values,
      "es",
    );
    expect(Object.keys(snapshot.translations as object)).toEqual(["es", "en"]);
  });

  test("sends the social image only when there is one", () => {
    const values = toMinistryFormValues(stored, LOCALES);
    expect(toMinistrySnapshot(values, "es").socialImageId).toBeUndefined();
    const withSocial = { ...values, socialImageId: SOCIAL_ID };
    expect(toMinistrySnapshot(withSocial, "es").socialImageId).toBe(SOCIAL_ID);
  });
});
