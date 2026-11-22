import { describe, expect, test } from "bun:test";
import type { ScheduleSetDto } from "@ancla/contracts";
import {
  hasScheduleSetErrors,
  toForcedActiveBody,
  toScheduleSetFormValues,
  toUpdateScheduleSetBody,
  toUpsertScheduleSetBody,
  validateScheduleSetForm,
} from "./scheduleSetFormValues";

const LOCALES = ["es", "en", "pt"] as const;

const set: ScheduleSetDto = {
  id: "11111111-1111-4111-8111-111111111111",
  validFrom: "2026-12-01",
  validTo: null,
  isDefault: false,
  forcedActive: true,
  order: 2,
  version: 3,
  translations: { es: { name: "Verano" }, en: { name: "Summer" } },
};

describe("schedule set form values", () => {
  test("fills every locale from the set and leaves the missing ones blank", () => {
    const values = toScheduleSetFormValues(set, LOCALES);
    expect(values.names).toEqual({ es: "Verano", en: "Summer", pt: "" });
    expect(values).toMatchObject({
      validFrom: "2026-12-01",
      validTo: "",
      forcedActive: true,
      order: "2",
    });
  });

  test("a new set starts after the existing ones and without flags", () => {
    const values = toScheduleSetFormValues(null, LOCALES, [0, 3]);
    expect(values).toMatchObject({
      order: "4",
      isDefault: false,
      forcedActive: false,
      validFrom: "",
    });
  });

  test("blank dates travel as null and the translations are trimmed", () => {
    const values = {
      ...toScheduleSetFormValues(set, LOCALES),
      validFrom: " ",
      names: { es: " Verano ", en: "", pt: "" },
    };
    expect(toUpsertScheduleSetBody(values, "es")).toEqual({
      validFrom: null,
      validTo: null,
      isDefault: false,
      forcedActive: true,
      order: 2,
      translations: { es: { name: "Verano" } },
    });
  });

  test("the update body carries the version read", () => {
    const body = toUpdateScheduleSetBody(toScheduleSetFormValues(set, LOCALES), "es", 3);
    expect(body.version).toBe(3);
  });

  test("the manual switch resends the whole set with only that flag changed", () => {
    expect(toForcedActiveBody(set, false)).toEqual({
      validFrom: "2026-12-01",
      validTo: null,
      isDefault: false,
      forcedActive: false,
      order: 2,
      translations: set.translations,
      version: 3,
    });
  });

  test("accepts a valid form", () => {
    expect(
      hasScheduleSetErrors(validateScheduleSetForm(toScheduleSetFormValues(set, LOCALES), "es")),
    ).toBe(false);
  });

  test("rejects a missing name, an impossible date, an inverted window and a bad order", () => {
    const base = toScheduleSetFormValues(set, LOCALES);
    const errors = validateScheduleSetForm(
      { ...base, names: { es: "", en: "", pt: "" }, validFrom: "2027-02-30", order: "x" },
      "es",
    );
    expect(errors.names.es).toBeDefined();
    expect(errors.validFrom).toBeDefined();
    expect(errors.order).toBeDefined();

    const inverted = validateScheduleSetForm(
      { ...base, validFrom: "2027-02-01", validTo: "2027-01-01" },
      "es",
    );
    expect(inverted.validTo).toContain("anterior");
    expect(hasScheduleSetErrors(inverted)).toBe(true);
  });
});
