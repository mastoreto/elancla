import { describe, expect, test } from "bun:test";
import { calendarDate } from "./calendarConstants";
import { upsertPlaceBody } from "./placeDto";
import { upsertRecurringActivityBody } from "./recurringActivityDto";
import { upsertScheduleExceptionBody } from "./scheduleExceptionDto";
import { upsertScheduleSetBody } from "./scheduleSetDto";

const ID = "0197f1a0-0000-7000-8000-000000000001";

describe("calendarDate", () => {
  test("accepts real dates only", () => {
    expect(calendarDate.safeParse("2028-02-29").success).toBe(true);
    expect(calendarDate.safeParse("2027-02-29").success).toBe(false);
    expect(calendarDate.safeParse("2027-13-01").success).toBe(false);
    expect(calendarDate.safeParse("27-01-01").success).toBe(false);
  });
});

describe("upsertScheduleSetBody", () => {
  const body = (overrides: Record<string, unknown> = {}) => ({
    validFrom: null,
    validTo: null,
    isDefault: false,
    forcedActive: false,
    order: 0,
    translations: { es: { name: "Verano" } },
    ...overrides,
  });

  test("accepts a set with no validity window", () => {
    expect(upsertScheduleSetBody.safeParse(body()).success).toBe(true);
  });

  test("rejects a window that ends before it starts, accepts a one-day window", () => {
    const backwards = body({ validFrom: "2027-02-01", validTo: "2027-01-01" });
    expect(upsertScheduleSetBody.safeParse(backwards).success).toBe(false);
    const oneDay = body({ validFrom: "2027-01-01", validTo: "2027-01-01" });
    expect(upsertScheduleSetBody.safeParse(oneDay).success).toBe(true);
  });

  test("requires a name of at most 60 characters in at least one language", () => {
    expect(
      upsertScheduleSetBody.safeParse(body({ translations: {} })).success,
    ).toBe(false);
    const long = body({ translations: { es: { name: "x".repeat(61) } } });
    expect(upsertScheduleSetBody.safeParse(long).success).toBe(false);
  });
});

describe("upsertRecurringActivityBody", () => {
  const body = (overrides: Record<string, unknown> = {}) => ({
    scheduleSetId: ID,
    weekday: 0,
    start: "10:00",
    end: null,
    placeId: null,
    serviceKind: null,
    isPublic: true,
    year: null,
    annualReview: false,
    ministryIds: [],
    translations: { es: { title: "Escuela bíblica" } },
    ...overrides,
  });

  test("accepts a fixed activity and one of a year", () => {
    expect(upsertRecurringActivityBody.safeParse(body()).success).toBe(true);
    expect(
      upsertRecurringActivityBody.safeParse(body({ year: 2027 })).success,
    ).toBe(true);
  });

  test("an annual review only makes sense on a fixed activity", () => {
    const reviewed = body({ annualReview: true });
    expect(upsertRecurringActivityBody.safeParse(reviewed).success).toBe(true);
    const ofAYear = body({ annualReview: true, year: 2027 });
    expect(upsertRecurringActivityBody.safeParse(ofAYear).success).toBe(false);
  });

  test("rejects an end that is not after the start and bad weekdays or hours", () => {
    expect(
      upsertRecurringActivityBody.safeParse(body({ end: "10:00" })).success,
    ).toBe(false);
    expect(
      upsertRecurringActivityBody.safeParse(body({ weekday: 7 })).success,
    ).toBe(false);
    expect(
      upsertRecurringActivityBody.safeParse(body({ start: "9:00" })).success,
    ).toBe(false);
  });

  test("allows at most 6 ministries", () => {
    const ministryIds = Array.from({ length: 7 }, () => ID);
    expect(
      upsertRecurringActivityBody.safeParse(body({ ministryIds })).success,
    ).toBe(false);
  });
});

describe("upsertScheduleExceptionBody", () => {
  test("needs a date and a message", () => {
    const valid = {
      date: "2027-12-25",
      replacementSetId: null,
      translations: { es: { message: "Sin reunión por Navidad" } },
    };
    expect(upsertScheduleExceptionBody.safeParse(valid).success).toBe(true);
    expect(
      upsertScheduleExceptionBody.safeParse({ ...valid, translations: {} })
        .success,
    ).toBe(false);
  });
});

describe("upsertPlaceBody", () => {
  const body = (overrides: Record<string, unknown> = {}) => ({
    address: null,
    mapsUrl: null,
    order: 0,
    translations: { es: { name: "Templo" } },
    ...overrides,
  });

  test("the maps link must be https", () => {
    expect(upsertPlaceBody.safeParse(body()).success).toBe(true);
    const https = body({ mapsUrl: "https://maps.example/x" });
    expect(upsertPlaceBody.safeParse(https).success).toBe(true);
    const http = body({ mapsUrl: "http://maps.example/x" });
    expect(upsertPlaceBody.safeParse(http).success).toBe(false);
  });
});
