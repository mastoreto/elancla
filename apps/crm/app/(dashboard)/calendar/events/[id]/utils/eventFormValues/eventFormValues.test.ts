import { describe, expect, test } from "bun:test";
import { eventSnapshot } from "@ancla/contracts";
import { toEventFormValues, toEventSnapshot } from "./eventFormValues";

const LOCALES = ["es", "en", "pt"];
const PLACE_ID = "11111111-1111-4111-8111-111111111111";
const MINISTRY_ID = "22222222-2222-4222-8222-222222222222";
const IMAGE_ID = "33333333-3333-4333-8333-333333333333";

const stored = {
  translations: {
    es: { title: "Retiro de jóvenes", description: "Un fin de semana juntos" },
  },
  startDate: "2027-03-12",
  startTime: "18:00",
  endDate: "2027-03-14",
  endTime: "12:00",
  allDay: false,
  placeMode: "place",
  placeId: PLACE_ID,
  ministryIds: [MINISTRY_ID],
  imageId: IMAGE_ID,
  linkUrl: "https://example.org/retiro",
  status: "scheduled",
};

describe("toEventFormValues", () => {
  test("a null snapshot gives blank values for every language", () => {
    const values = toEventFormValues(null, LOCALES);
    expect(Object.keys(values.translations)).toEqual(LOCALES);
    expect(values.translations.es).toEqual({ title: "", description: "" });
    expect(values.startDate).toBe("");
    expect(values.placeMode).toBe("tbc");
    expect(values.status).toBe("scheduled");
    expect(values.ministryIds).toEqual([]);
  });

  test("an invalid snapshot is treated as blank instead of crashing", () => {
    expect(toEventFormValues({ startDate: "nope" }, LOCALES).startDate).toBe("");
  });

  test("a stored snapshot fills the form, with the missing languages blank", () => {
    const values = toEventFormValues(stored, LOCALES);
    expect(values.translations.es).toEqual({
      title: "Retiro de jóvenes",
      description: "Un fin de semana juntos",
    });
    expect(values.translations.en).toEqual({ title: "", description: "" });
    expect(values).toMatchObject({
      startDate: "2027-03-12",
      startTime: "18:00",
      endDate: "2027-03-14",
      endTime: "12:00",
      placeMode: "place",
      placeId: PLACE_ID,
      ministryIds: [MINISTRY_ID],
      imageId: IMAGE_ID,
      linkUrl: "https://example.org/retiro",
    });
  });

  test("absent optional fields become empty strings", () => {
    const values = toEventFormValues(
      { translations: { es: { title: "Cena" } }, startDate: "2027-05-01", placeMode: "tbc" },
      LOCALES,
    );
    expect(values.translations.es?.description).toBe("");
    expect(values.endDate).toBe("");
    expect(values.imageId).toBe("");
    expect(values.linkUrl).toBe("");
  });
});

describe("toEventSnapshot", () => {
  test("round-trips a stored snapshot", () => {
    const values = toEventFormValues(stored, LOCALES);
    expect(toEventSnapshot(values, "es")).toEqual(eventSnapshot.parse(stored));
  });

  test("the result always passes the strict contract when the form is complete", () => {
    const values = toEventFormValues(stored, LOCALES);
    expect(eventSnapshot.safeParse(toEventSnapshot(values, "es")).success).toBe(true);
  });

  test("blank optional values are not sent", () => {
    const values = toEventFormValues(null, LOCALES);
    values.translations.es = { title: "  Cena  ", description: "   " };
    values.startDate = "2027-05-01";
    const snapshot = toEventSnapshot(values, "es");
    expect(snapshot).toEqual({
      translations: { es: { title: "Cena" } },
      startDate: "2027-05-01",
      allDay: false,
      placeMode: "tbc",
      ministryIds: [],
      status: "scheduled",
    });
  });

  test("an all-day event sends no hours", () => {
    const values = toEventFormValues(stored, LOCALES);
    values.allDay = true;
    const snapshot = toEventSnapshot(values, "es");
    expect(snapshot).not.toHaveProperty("startTime");
    expect(snapshot).not.toHaveProperty("endTime");
    expect(snapshot.allDay).toBe(true);
  });

  test("only the field of the place mode travels", () => {
    const values = toEventFormValues(stored, LOCALES);
    values.externalAddress = "Calle 1";
    expect(toEventSnapshot(values, "es")).not.toHaveProperty("externalAddress");

    values.placeMode = "external";
    const external = toEventSnapshot(values, "es");
    expect(external.externalAddress).toBe("Calle 1");
    expect(external).not.toHaveProperty("placeId");

    values.placeMode = "tbc";
    const toBeConfirmed = toEventSnapshot(values, "es");
    expect(toBeConfirmed).not.toHaveProperty("placeId");
    expect(toBeConfirmed).not.toHaveProperty("externalAddress");
  });

  test("the default language always goes, other blank languages are left out", () => {
    const values = toEventFormValues(null, LOCALES);
    values.translations.en = { title: "Dinner", description: "" };
    const translations = toEventSnapshot(values, "es").translations as Record<string, unknown>;
    expect(Object.keys(translations).sort()).toEqual(["en", "es"]);
  });
});
