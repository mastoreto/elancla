import { describe, expect, test } from "bun:test";
import type { EventFormValues } from "../../types";
import { hasEventFormErrors, validateEventForm } from "./validateEventForm";

const YEAR = 2027;
const OPTIONS = { defaultLocale: "es", year: YEAR };
const PLACE_ID = "11111111-1111-4111-8111-111111111111";

function validValues(patch: Partial<EventFormValues> = {}): EventFormValues {
  return {
    translations: {
      es: { title: "Retiro", description: "" },
      en: { title: "", description: "" },
    },
    startDate: "2027-03-12",
    startTime: "18:00",
    endDate: "",
    endTime: "",
    allDay: false,
    placeMode: "tbc",
    placeId: "",
    externalAddress: "",
    ministryIds: [],
    imageId: "",
    linkUrl: "",
    status: "scheduled",
    ...patch,
  };
}

const errorsOf = (patch: Partial<EventFormValues>) =>
  validateEventForm(validValues(patch), OPTIONS);

describe("validateEventForm", () => {
  test("a complete event has no errors", () => {
    expect(hasEventFormErrors(errorsOf({}))).toBe(false);
  });

  test("the default language needs a title", () => {
    const errors = errorsOf({ translations: { es: { title: "  ", description: "" } } });
    expect(errors.translations.es?.title).toBeDefined();
  });

  test("another language with only a description needs a title too", () => {
    const errors = errorsOf({
      translations: {
        es: { title: "Retiro", description: "" },
        en: { title: "", description: "Weekend" },
      },
    });
    expect(errors.translations.en?.title).toBeDefined();
    expect(errors.translations.es).toBeUndefined();
  });

  test("a title over the limit fails", () => {
    const errors = errorsOf({ translations: { es: { title: "x".repeat(121), description: "" } } });
    expect(errors.translations.es?.title).toBeDefined();
  });

  test("the start date is required and must exist", () => {
    expect(errorsOf({ startDate: "" }).general.startDate).toBeDefined();
    expect(errorsOf({ startDate: "2027-02-30" }).general.startDate).toBeDefined();
  });

  test("the start date must fall in the year of the event", () => {
    const errors = errorsOf({ startDate: "2028-01-02" });
    expect(errors.general.startDate).toContain(String(YEAR));
  });

  test("the event cannot end before it starts", () => {
    expect(errorsOf({ endDate: "2027-03-11" }).general.endDate).toBeDefined();
    expect(errorsOf({ endDate: "2027-03-13" }).general.endDate).toBeUndefined();
  });

  test("on a single day the end hour must be after the start hour", () => {
    // The contract reports "ends before it starts" on `endDate`, whatever the cause.
    expect(errorsOf({ endTime: "17:00" }).general.endDate).toBeDefined();
    expect(errorsOf({ endTime: "18:00" }).general.endDate).toBeDefined();
    expect(hasEventFormErrors(errorsOf({ endTime: "20:00" }))).toBe(false);
  });

  test("on a later day any end hour is fine", () => {
    expect(errorsOf({ endDate: "2027-03-13", endTime: "09:00" }).general.endTime).toBeUndefined();
  });

  test("an end hour needs a start hour", () => {
    const errors = errorsOf({ startTime: "", endTime: "20:00" });
    expect(errors.general.endTime).toBeDefined();
  });

  test("an all-day event ignores the hours instead of failing", () => {
    const errors = errorsOf({ allDay: true, startTime: "18:00", endTime: "17:00" });
    expect(hasEventFormErrors(errors)).toBe(false);
  });

  test("a place mode needs its place", () => {
    expect(errorsOf({ placeMode: "place" }).general.placeId).toBeDefined();
    expect(errorsOf({ placeMode: "place", placeId: PLACE_ID }).general.placeId).toBeUndefined();
    expect(errorsOf({ placeMode: "external" }).general.externalAddress).toBeDefined();
    expect(
      errorsOf({ placeMode: "external", externalAddress: "Calle 1" }).general.externalAddress,
    ).toBeUndefined();
  });

  test("a place to be confirmed needs nothing", () => {
    expect(hasEventFormErrors(errorsOf({ placeMode: "tbc", placeId: PLACE_ID }))).toBe(false);
  });

  test("the link must be https", () => {
    expect(errorsOf({ linkUrl: "http://example.org" }).general.linkUrl).toBeDefined();
    expect(errorsOf({ linkUrl: "https://example.org/a" }).general.linkUrl).toBeUndefined();
  });

  test("at most six ministries, without repeats", () => {
    const ids = Array.from(
      { length: 7 },
      (_, index) => `00000000-0000-4000-8000-00000000000${index}`,
    );
    expect(errorsOf({ ministryIds: ids }).general.ministryIds).toBeDefined();
    expect(
      errorsOf({ ministryIds: [ids[0] ?? "", ids[0] ?? ""] }).general.ministryIds,
    ).toBeDefined();
    expect(errorsOf({ ministryIds: ids.slice(0, 6) }).general.ministryIds).toBeUndefined();
  });
});
