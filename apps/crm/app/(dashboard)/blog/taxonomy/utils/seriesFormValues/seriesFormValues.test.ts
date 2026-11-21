import { describe, expect, test } from "bun:test";
import type { SeriesDto } from "@ancla/contracts";
import {
  toSeriesFormValues,
  toUpdateSeriesBody,
  toUpsertSeriesBody,
  validateSeriesForm,
} from "./seriesFormValues";

const LOCALES = ["es", "en"] as const;
const series: SeriesDto = {
  id: "11111111-1111-4111-8111-111111111111",
  version: 3,
  translations: {
    es: { name: "Hebreos", slug: "hebreos", description: "Un recorrido." },
    en: { name: "Hebrews", slug: "hebrews", description: null },
  },
};

describe("series form values", () => {
  test("round trips: the unedited form sends every language, with null for no description", () => {
    const body = toUpsertSeriesBody(toSeriesFormValues(series, LOCALES), "es");
    expect(body.translations).toEqual(series.translations);
  });

  test("a blank non-default language is removed; the update body carries the version", () => {
    const values = toSeriesFormValues(series, LOCALES);
    values.translations.en = { name: "", slug: "", slugEdited: false, description: "" };
    const body = toUpdateSeriesBody(values, "es", 3);
    expect(Object.keys(body.translations)).toEqual(["es"]);
    expect(body.version).toBe(3);
  });

  test("requires the default language and valid slugs", () => {
    const values = toSeriesFormValues(null, LOCALES);
    expect(validateSeriesForm(values, "es").translations.es?.name).toBeDefined();
    values.translations.es = {
      name: "Fe",
      slug: "No valido",
      slugEdited: true,
      description: "",
    };
    expect(validateSeriesForm(values, "es").translations.es?.slug).toBeDefined();
  });

  test("caps the description at 300 characters", () => {
    const values = toSeriesFormValues(series, LOCALES);
    const es = values.translations.es;
    if (es) es.description = "d".repeat(301);
    expect(validateSeriesForm(values, "es").translations.es?.description).toBeDefined();
  });
});
