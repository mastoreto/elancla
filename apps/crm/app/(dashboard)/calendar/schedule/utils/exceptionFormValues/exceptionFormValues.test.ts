import { describe, expect, test } from "bun:test";
import type { ScheduleExceptionDto } from "@ancla/contracts";
import {
  hasExceptionErrors,
  toExceptionFormValues,
  toUpdateExceptionBody,
  toUpsertExceptionBody,
  validateExceptionForm,
} from "./exceptionFormValues";

const LOCALES = ["es", "en", "pt"] as const;
const SET_ID = "22222222-2222-4222-8222-222222222222";

const exception: ScheduleExceptionDto = {
  id: "11111111-1111-4111-8111-111111111111",
  date: "2026-12-25",
  replacementSetId: SET_ID,
  version: 2,
  translations: { es: { message: "Culto de Navidad" } },
};

describe("exception form values", () => {
  test("fills the form from the exception", () => {
    expect(toExceptionFormValues(exception, LOCALES)).toEqual({
      date: "2026-12-25",
      replacementSetId: SET_ID,
      messages: { es: "Culto de Navidad", en: "", pt: "" },
    });
  });

  test("a new exception is blank", () => {
    expect(toExceptionFormValues(null, LOCALES)).toMatchObject({ date: "", replacementSetId: "" });
  });

  test("a blank replacement means no meeting", () => {
    const values = { ...toExceptionFormValues(exception, LOCALES), replacementSetId: "" };
    expect(toUpsertExceptionBody(values, "es")).toEqual({
      date: "2026-12-25",
      replacementSetId: null,
      translations: { es: { message: "Culto de Navidad" } },
    });
  });

  test("the update body carries the version read", () => {
    const body = toUpdateExceptionBody(toExceptionFormValues(exception, LOCALES), "es", 2);
    expect(body).toMatchObject({ replacementSetId: SET_ID, version: 2 });
  });

  test("requires an existing date and a message in the default language", () => {
    const valid = toExceptionFormValues(exception, LOCALES);
    expect(hasExceptionErrors(validateExceptionForm(valid, "es"))).toBe(false);
    expect(validateExceptionForm({ ...valid, date: "2026-02-30" }, "es").date).toBeDefined();
    expect(validateExceptionForm({ ...valid, date: "" }, "es").date).toBeDefined();
    const errors = validateExceptionForm({ ...valid, messages: { es: "", en: "", pt: "" } }, "es");
    expect(errors.messages.es).toBeDefined();
    expect(hasExceptionErrors(errors)).toBe(true);
  });
});
