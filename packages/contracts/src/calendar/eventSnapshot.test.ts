import { describe, expect, test } from "bun:test";
import { copyYearBody } from "./calendarYearDto";
import { createEventBody, eventSettingsBody } from "./eventDto";
import { eventSnapshot } from "./eventSnapshot";

const ID = "0197f1a0-0000-7000-8000-000000000001";
const OTHER_ID = "0197f1a0-0000-7000-8000-000000000002";

const snapshot = (overrides: Record<string, unknown> = {}) => ({
  translations: { es: { title: "Noche de oración" } },
  startDate: "2027-05-21",
  startTime: "20:00",
  placeMode: "tbc",
  ...overrides,
});

describe("eventSnapshot", () => {
  test("accepts a one-day event and fills the defaults", () => {
    const parsed = eventSnapshot.parse(snapshot());
    expect(parsed.allDay).toBe(false);
    expect(parsed.status).toBe("scheduled");
    expect(parsed.ministryIds).toEqual([]);
  });

  test("an all-day event carries no hours", () => {
    expect(eventSnapshot.safeParse(snapshot({ allDay: true })).success).toBe(
      false,
    );
    expect(
      eventSnapshot.safeParse(snapshot({ allDay: true, startTime: undefined }))
        .success,
    ).toBe(true);
  });

  test("a multi-day event ends on or after it starts", () => {
    const multiDay = snapshot({ endDate: "2027-05-23", endTime: "12:00" });
    expect(eventSnapshot.safeParse(multiDay).success).toBe(true);
    const backwards = snapshot({ endDate: "2027-05-20" });
    expect(eventSnapshot.safeParse(backwards).success).toBe(false);
  });

  test("on the same day the end hour is after the start hour", () => {
    expect(
      eventSnapshot.safeParse(snapshot({ endTime: "20:00" })).success,
    ).toBe(false);
    expect(
      eventSnapshot.safeParse(snapshot({ endTime: "21:30" })).success,
    ).toBe(true);
  });

  test("an end hour needs a start hour", () => {
    const noStart = snapshot({ startTime: undefined, endTime: "21:00" });
    expect(eventSnapshot.safeParse(noStart).success).toBe(false);
  });

  test("the place fields follow the place mode", () => {
    expect(
      eventSnapshot.safeParse(snapshot({ placeMode: "place" })).success,
    ).toBe(false);
    expect(
      eventSnapshot.safeParse(snapshot({ placeMode: "place", placeId: ID }))
        .success,
    ).toBe(true);
    expect(
      eventSnapshot.safeParse(snapshot({ placeMode: "external" })).success,
    ).toBe(false);
    expect(
      eventSnapshot.safeParse(
        snapshot({ placeMode: "external", externalAddress: "Calle 1" }),
      ).success,
    ).toBe(true);
    expect(
      eventSnapshot.safeParse(snapshot({ placeMode: "tbc", placeId: ID }))
        .success,
    ).toBe(false);
  });

  test("at most 6 distinct ministries", () => {
    const six = Array.from({ length: 6 }, (_, index) =>
      ID.replace(/1$/, String(index + 1)),
    );
    expect(
      eventSnapshot.safeParse(snapshot({ ministryIds: six })).success,
    ).toBe(true);
    expect(
      eventSnapshot.safeParse(snapshot({ ministryIds: [...six, OTHER_ID] }))
        .success,
    ).toBe(false);
    expect(
      eventSnapshot.safeParse(snapshot({ ministryIds: [ID, ID] })).success,
    ).toBe(false);
  });

  test("the link is https and an unknown key is refused", () => {
    expect(
      eventSnapshot.safeParse(snapshot({ linkUrl: "http://x.org" })).success,
    ).toBe(false);
    expect(
      eventSnapshot.safeParse(snapshot({ linkUrl: "https://x.org" })).success,
    ).toBe(true);
    expect(eventSnapshot.safeParse(snapshot({ extra: 1 })).success).toBe(false);
  });

  test("title is limited to 120 characters and description to 1000", () => {
    const longTitle = snapshot({
      translations: { es: { title: "x".repeat(121) } },
    });
    expect(eventSnapshot.safeParse(longTitle).success).toBe(false);
    const longDescription = snapshot({
      translations: { es: { title: "x", description: "y".repeat(1001) } },
    });
    expect(eventSnapshot.safeParse(longDescription).success).toBe(false);
  });
});

describe("event bodies", () => {
  test("only internal events have an audience", () => {
    const publicWithAudience = {
      year: 2027,
      visibility: "public",
      audienceRoleIds: [ID],
    };
    expect(createEventBody.safeParse(publicWithAudience).success).toBe(false);
    const internal = { ...publicWithAudience, visibility: "internal" };
    expect(createEventBody.safeParse(internal).success).toBe(true);
    expect(
      eventSettingsBody.safeParse({
        visibility: "internal",
        audienceRoleIds: [ID, ID],
        version: 1,
      }).success,
    ).toBe(false);
  });
});

describe("copyYearBody", () => {
  test("needs something selected", () => {
    const empty = {
      fromYear: 2026,
      activityIds: [],
      eventIds: [],
      keepExactDates: false,
    };
    expect(copyYearBody.safeParse(empty).success).toBe(false);
    expect(copyYearBody.safeParse({ ...empty, eventIds: [ID] }).success).toBe(
      true,
    );
  });
});
