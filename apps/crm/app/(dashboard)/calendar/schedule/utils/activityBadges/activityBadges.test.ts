import { describe, expect, test } from "bun:test";
import type { RecurringActivityDto } from "@ancla/contracts";
import { describeActivityBadges } from "./activityBadges";

const base: RecurringActivityDto = {
  id: "11111111-1111-4111-8111-111111111111",
  scheduleSetId: "22222222-2222-4222-8222-222222222222",
  weekday: 0,
  start: "10:00",
  end: null,
  placeId: null,
  serviceKind: null,
  isPublic: true,
  isFixed: true,
  year: null,
  annualReview: false,
  needsReview: false,
  ministryIds: [],
  version: 1,
  translations: { es: { title: "Culto" } },
};

function labels(activity: RecurringActivityDto): string[] {
  return describeActivityBadges(activity).map((badge) => badge.label);
}

describe("describeActivityBadges", () => {
  test("a plain fixed public activity", () => {
    expect(labels(base)).toEqual(["Pública", "Fija"]);
  });

  test("a worship time, internal, tied to a year and pending review", () => {
    const activity = {
      ...base,
      serviceKind: "worship",
      isPublic: false,
      year: 2027,
      needsReview: true,
    } as const;
    expect(labels(activity)).toEqual(["Culto", "Interna", "Año 2027", "A revisar"]);
  });

  test("the bible school and the annual review", () => {
    const activity = { ...base, serviceKind: "bibleSchool", annualReview: true } as const;
    expect(labels(activity)).toEqual(["Escuela bíblica", "Pública", "Fija", "Revisión anual"]);
  });
});
