import { describe, expect, test } from "bun:test";
import type { EventListItemDto, RecurringActivityDto } from "@ancla/contracts";
import { toActivityItems, toEventItems } from "./copyItems";

const SET_ID = "22222222-2222-4222-8222-222222222222";
const MINISTRY_ID = "44444444-4444-4444-8444-444444444444";

function activity(overrides: Partial<RecurringActivityDto>): RecurringActivityDto {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    scheduleSetId: SET_ID,
    weekday: 3,
    start: "19:00",
    end: "20:30",
    placeId: null,
    serviceKind: null,
    isPublic: true,
    isFixed: false,
    year: 2026,
    annualReview: false,
    needsReview: false,
    ministryIds: [MINISTRY_ID],
    version: 1,
    translations: { es: { title: "Ensayo" }, en: { title: "Rehearsal" } },
    ...overrides,
  };
}

function event(overrides: Partial<EventListItemDto>): EventListItemDto {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    year: 2026,
    visibility: "public",
    audienceRoleIds: [],
    needsReview: false,
    sequence: 1,
    version: 1,
    editorialState: null,
    isLive: false,
    titles: { es: "Retiro" },
    startDate: "2026-05-09",
    startTime: "09:00",
    endDate: null,
    allDay: false,
    status: "scheduled",
    ministryIds: [],
    ...overrides,
  };
}

describe("toActivityItems", () => {
  test("lists only the non-fixed activities of the source year", () => {
    const items = toActivityItems(
      [
        activity({ id: "a" }),
        activity({ id: "fixed", isFixed: true, year: null }),
        activity({ id: "other-year", year: 2025 }),
      ],
      2026,
      "es",
    );
    expect(items.map((item) => item.id)).toEqual(["a"]);
  });

  test("describes the day and the hours, and keeps the ministries", () => {
    const [item] = toActivityItems([activity({})], 2026, "es");
    expect(item).toMatchObject({
      kind: "activity",
      title: "Ensayo",
      detail: "Miércoles · 19:00 – 20:30",
      ministryIds: [MINISTRY_ID],
    });
  });
});

describe("toEventItems", () => {
  test("describes the date and time of an event", () => {
    expect(toEventItems([event({})], "es")[0]).toMatchObject({
      kind: "event",
      title: "Retiro",
      detail: "09/05/2026 · 09:00",
    });
  });

  test("falls back when the event has no date or no title in the default language", () => {
    const [item] = toEventItems(
      [event({ titles: { en: "Retreat" }, startDate: null, startTime: null })],
      "es",
    );
    expect(item).toMatchObject({ title: "Retreat", detail: "Sin fecha" });
    expect(toEventItems([event({ titles: {} })], "es")[0]?.title).toBe("Sin título");
  });
});
