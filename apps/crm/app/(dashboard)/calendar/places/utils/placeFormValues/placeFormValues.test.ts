import { describe, expect, test } from "bun:test";
import { type PlaceDto, updatePlaceBody, upsertPlaceBody } from "@ancla/contracts";
import {
  hasPlaceErrors,
  toPlaceFormValues,
  toUpdatePlaceBody,
  toUpsertPlaceBody,
  validatePlaceForm,
} from "./placeFormValues";

const LOCALES = ["es", "en", "pt"] as const;

const place: PlaceDto = {
  id: "11111111-1111-4111-8111-111111111111",
  address: "Av. Siempreviva 742",
  mapsUrl: "https://maps.example.com/abc",
  order: 2,
  version: 4,
  translations: { es: { name: "Templo" }, en: { name: "Temple" } },
};

describe("place form values", () => {
  test("fills every locale from the place and leaves the missing ones blank", () => {
    const values = toPlaceFormValues(place, LOCALES);
    expect(values).toEqual({
      names: { es: "Templo", en: "Temple", pt: "" },
      address: "Av. Siempreviva 742",
      mapsUrl: "https://maps.example.com/abc",
      order: "2",
    });
  });

  test("a new place has no address or link and goes after the existing ones", () => {
    expect(toPlaceFormValues(null, LOCALES, [0, 5])).toMatchObject({
      address: "",
      mapsUrl: "",
      order: "6",
    });
  });

  test("builds bodies the API contract accepts", () => {
    const values = toPlaceFormValues(place, LOCALES);
    expect(upsertPlaceBody.safeParse(toUpsertPlaceBody(values, "es")).success).toBe(true);
    const update = toUpdatePlaceBody(values, "es", 4);
    expect(update.version).toBe(4);
    expect(updatePlaceBody.safeParse(update).success).toBe(true);
  });

  test("blank address and link travel as null, and blank non-default names are left out", () => {
    const values = { ...toPlaceFormValues(place, LOCALES), address: " ", mapsUrl: "" };
    expect(toUpsertPlaceBody(values, "es")).toEqual({
      address: null,
      mapsUrl: null,
      order: 2,
      translations: { es: { name: "Templo" }, en: { name: "Temple" } },
    });
  });
});

describe("validatePlaceForm", () => {
  const valid = toPlaceFormValues(place, LOCALES);

  test("accepts a valid form", () => {
    expect(hasPlaceErrors(validatePlaceForm(valid, "es"))).toBe(false);
  });

  test("requires the name in the default language", () => {
    const errors = validatePlaceForm({ ...valid, names: { es: "", en: "Temple", pt: "" } }, "es");
    expect(errors.names.es).toBeDefined();
    expect(hasPlaceErrors(errors)).toBe(true);
  });

  test("the map link must be https", () => {
    expect(
      validatePlaceForm({ ...valid, mapsUrl: "http://maps.example.com" }, "es").mapsUrl,
    ).toBeDefined();
    expect(validatePlaceForm({ ...valid, mapsUrl: "not a url" }, "es").mapsUrl).toBeDefined();
    expect(validatePlaceForm({ ...valid, mapsUrl: "" }, "es").mapsUrl).toBeUndefined();
  });

  test("limits the address and requires a valid order", () => {
    expect(validatePlaceForm({ ...valid, address: "x".repeat(201) }, "es").address).toBeDefined();
    expect(validatePlaceForm({ ...valid, order: "-1" }, "es").order).toBeDefined();
  });
});
