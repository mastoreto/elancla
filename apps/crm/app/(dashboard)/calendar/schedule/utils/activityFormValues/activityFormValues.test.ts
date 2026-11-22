import { describe, expect, test } from "bun:test";
import {
  type RecurringActivityDto,
  updateRecurringActivityBody,
  upsertRecurringActivityBody,
} from "@ancla/contracts";
import {
  hasActivityErrors,
  toActivityFormValues,
  toggleMinistry,
  toUpdateActivityBody,
  toUpsertActivityBody,
  validateActivityForm,
} from "./activityFormValues";

const LOCALES = ["es", "en", "pt"] as const;
const SET_ID = "22222222-2222-4222-8222-222222222222";
const PLACE_ID = "33333333-3333-4333-8333-333333333333";
const MINISTRY_ID = "44444444-4444-4444-8444-444444444444";

const activity: RecurringActivityDto = {
  id: "11111111-1111-4111-8111-111111111111",
  scheduleSetId: SET_ID,
  weekday: 0,
  start: "10:00",
  end: "12:00",
  placeId: PLACE_ID,
  serviceKind: "worship",
  isPublic: true,
  isFixed: true,
  year: null,
  annualReview: true,
  needsReview: true,
  ministryIds: [MINISTRY_ID],
  version: 5,
  translations: { es: { title: "Culto" }, en: { title: "Service" } },
};

describe("activity form values", () => {
  test("fills the form from the activity", () => {
    const values = toActivityFormValues(activity, LOCALES);
    expect(values).toMatchObject({
      weekday: "0",
      start: "10:00",
      end: "12:00",
      placeId: PLACE_ID,
      serviceKind: "worship",
      scope: "fixed",
      year: "",
      annualReview: true,
      ministryIds: [MINISTRY_ID],
    });
    expect(values.titles).toEqual({ es: "Culto", en: "Service", pt: "" });
  });

  test("an activity of a year opens in the year scope", () => {
    const values = toActivityFormValues(
      { ...activity, isFixed: false, year: 2027, annualReview: false },
      LOCALES,
    );
    expect(values).toMatchObject({ scope: "year", year: "2027" });
  });

  test("a new activity is fixed, public and without kind, place or ministries", () => {
    expect(toActivityFormValues(null, LOCALES)).toMatchObject({
      scope: "fixed",
      isPublic: true,
      serviceKind: "none",
      placeId: "",
      ministryIds: [],
      end: "",
    });
  });

  test("builds a body the API contract accepts", () => {
    const values = toActivityFormValues(activity, LOCALES);
    const body = toUpsertActivityBody(values, SET_ID, "es");
    expect(body).toMatchObject({ year: null, annualReview: true, serviceKind: "worship" });
    expect(upsertRecurringActivityBody.safeParse(body).success).toBe(true);
    const update = toUpdateActivityBody(values, SET_ID, { defaultLocale: "es", version: 5 });
    expect(updateRecurringActivityBody.safeParse(update).success).toBe(true);
  });

  test("blank end, place and kind travel as null", () => {
    const values = {
      ...toActivityFormValues(activity, LOCALES),
      end: "",
      placeId: "",
      serviceKind: "none",
    } as const;
    expect(toUpsertActivityBody(values, SET_ID, "es")).toMatchObject({
      end: null,
      placeId: null,
      serviceKind: null,
    });
  });

  test("an activity of a year is never sent with an annual review", () => {
    const values = {
      ...toActivityFormValues(activity, LOCALES),
      scope: "year",
      year: "2027",
    } as const;
    const body = toUpsertActivityBody(values, SET_ID, "es");
    expect(body).toMatchObject({ year: 2027, annualReview: false });
    expect(upsertRecurringActivityBody.safeParse(body).success).toBe(true);
  });
});

describe("validateActivityForm", () => {
  const valid = toActivityFormValues(activity, LOCALES);

  test("accepts a valid form", () => {
    expect(hasActivityErrors(validateActivityForm(valid, "es"))).toBe(false);
  });

  test("requires a start time and a title in the default language", () => {
    const errors = validateActivityForm(
      { ...valid, start: "", titles: { es: "", en: "", pt: "" } },
      "es",
    );
    expect(errors.start).toBeDefined();
    expect(errors.titles.es).toBeDefined();
  });

  test("the end must come after the start", () => {
    expect(validateActivityForm({ ...valid, end: "10:00" }, "es").end).toContain("posterior");
    expect(validateActivityForm({ ...valid, end: "09:00" }, "es").end).toBeDefined();
    expect(validateActivityForm({ ...valid, end: "25:00" }, "es").end).toBeDefined();
    expect(validateActivityForm({ ...valid, end: "" }, "es").end).toBeUndefined();
  });

  test("an activity of a year needs a valid year", () => {
    expect(validateActivityForm({ ...valid, scope: "year", year: "" }, "es").year).toBeDefined();
    expect(
      validateActivityForm({ ...valid, scope: "year", year: "1999" }, "es").year,
    ).toBeDefined();
    expect(
      validateActivityForm({ ...valid, scope: "year", year: "2027" }, "es").year,
    ).toBeUndefined();
    expect(validateActivityForm({ ...valid, scope: "fixed", year: "" }, "es").year).toBeUndefined();
  });

  test("at most six ministries", () => {
    const ministryIds = Array.from({ length: 7 }, (_, index) => `m${index}`);
    expect(validateActivityForm({ ...valid, ministryIds }, "es").ministryIds).toBeDefined();
  });
});

describe("toggleMinistry", () => {
  test("adds and removes one ministry keeping the others", () => {
    expect(toggleMinistry(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleMinistry(["a", "b"], "a")).toEqual(["b"]);
  });
});
