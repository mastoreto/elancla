import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type EventSnapshot,
  type PublicCalendarDto,
  publicCalendarDto,
} from "@ancla/contracts";
import { db, type EditorialState } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createMinistryWorld,
  type MinistryWorld,
} from "../../../test/support/ministryWorld";
import { localDateIn, parseDateOnly, yearOf } from "./domain";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const TIMEZONE = "America/Montevideo";
const SUNDAY = 0;
const OTHER_YEAR_OFFSET = 7;

let world: MinistryWorld;
let year = 0;
let otherYear = 0;
let ministryId = "";
let placeId = "";
let revisionNumber = 0;
const eventIds: Record<string, string> = {};

const calendar = async (query = ""): Promise<PublicCalendarDto> => {
  const res = await call("GET", `/public/v1/${world.slug}/calendar${query}`, {
    headers: { Authorization: `Bearer ${world.key}` },
  });
  expect(res.status).toBe(200);
  return publicCalendarDto.parse(await res.json());
};

async function createEvent(
  name: string,
  options: {
    snapshot: Partial<EventSnapshot>;
    visibility?: "PUBLIC" | "INTERNAL";
    state?: EditorialState;
    year?: number;
    sequence?: number;
  },
): Promise<void> {
  const eventYear = options.year ?? year;
  const event = await db.event.create({
    data: {
      organizationId: world.organizationId,
      year: eventYear,
      visibility: options.visibility ?? "PUBLIC",
      sequence: options.sequence ?? 1,
      liveAt: new Date("2026-01-02T03:04:05.000Z"),
    },
  });
  eventIds[name] = event.id;
  revisionNumber += 1;
  const snapshot: EventSnapshot = {
    translations: { es: { title: `Evento ${name}` } },
    startDate: `${eventYear}-06-06`,
    allDay: false,
    placeMode: "tbc",
    ministryIds: [],
    status: "scheduled",
    ...options.snapshot,
  };
  await db.contentRevision.create({
    data: {
      organizationId: world.organizationId,
      contentType: "EVENT",
      entityId: event.id,
      number: revisionNumber,
      state: options.state ?? "PUBLISHED",
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      authorId: world.userId,
      publishedAt: new Date(),
    },
  });
}

beforeAll(async () => {
  world = await createMinistryWorld(fixtures);
  year = yearOf(localDateIn(TIMEZONE, new Date()));
  otherYear = year + OTHER_YEAR_OFFSET;
  ministryId = await world.createMinistry({
    slugs: { es: "jovenes", en: "youth" },
    color: "obra-red",
  });
  const place = await db.place.create({
    data: {
      organizationId: world.organizationId,
      address: "Calle Falsa 123",
      translations: {
        create: [
          { locale: "es", name: "Templo" },
          { locale: "en", name: "Sanctuary" },
        ],
      },
    },
  });
  placeId = place.id;

  const set = await db.scheduleSet.create({
    data: {
      organizationId: world.organizationId,
      isDefault: true,
      translations: { create: [{ locale: "es", name: "Habitual" }] },
    },
  });
  const activity = (
    title: string,
    options: { isPublic?: boolean; year?: number; ministry?: boolean },
  ) =>
    db.recurringActivity.create({
      data: {
        organizationId: world.organizationId,
        scheduleSetId: set.id,
        weekday: SUNDAY,
        start: "11:15",
        end: "13:00",
        placeId,
        serviceKind: "WORSHIP",
        isPublic: options.isPublic ?? true,
        isFixed: options.year === undefined,
        year: options.year ?? null,
        translations: { create: [{ locale: "es", title }] },
        ministries: options.ministry ? { create: [{ ministryId }] } : undefined,
      },
    });
  await activity("Culto fijo", { ministry: true });
  await activity("Fijo interno", { isPublic: false });
  await activity("Actividad del año", { year });

  await db.scheduleException.create({
    data: {
      organizationId: world.organizationId,
      date: parseDateOnly(`${year}-12-25`),
      translations: { create: [{ locale: "es", message: "Sin reunión" }] },
    },
  });

  await createEvent("publico", {
    snapshot: {
      translations: {
        es: { title: "Cena", description: "Una cena" },
        en: { title: "Dinner" },
      },
      startTime: "20:00",
      endTime: "22:00",
      placeMode: "place",
      placeId,
      ministryIds: [ministryId],
      linkUrl: "https://example.org/cena",
    },
    sequence: 3,
  });
  await createEvent("cancelado", {
    snapshot: { status: "cancelled", allDay: true, startDate: `${year}-07-07` },
  });
  await createEvent("externo", {
    snapshot: {
      placeMode: "external",
      externalAddress: "Plaza Central",
      startDate: `${year}-05-05`,
    },
  });
  await createEvent("interno", { snapshot: {}, visibility: "INTERNAL" });
  await createEvent("pausado", { snapshot: {}, state: "PAUSED" });
  await createEvent("borrador", { snapshot: {}, state: "DRAFT" });
  await createEvent("de otro año", {
    snapshot: { startDate: `${otherYear}-06-06` },
    year: otherYear,
  });
});

afterAll(async () => {
  await world.cleanup();
  await fixtures.cleanup();
});

describe("the calendar of a year that is not published", () => {
  test("shows only the fixed public activities and no events", async () => {
    const body = await calendar();
    expect(body).toMatchObject({
      year,
      published: false,
      timezone: TIMEZONE,
      events: [],
    });
    expect(body.weekly.map((slot) => slot.title)).toEqual(["Culto fijo"]);
  });

  test("an unpublished year asked by number is the same", async () => {
    const body = await calendar(`?year=${otherYear}`);
    expect(body).toMatchObject({ year: otherYear, published: false });
    expect(body.events).toEqual([]);
    expect(body.weekly.map((slot) => slot.title)).toEqual(["Culto fijo"]);
  });
});

describe("the calendar of a published year", () => {
  beforeAll(async () => {
    await db.calendarYear.create({
      data: {
        organizationId: world.organizationId,
        year,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  });

  test("adds the activities of the year and the public events that are live", async () => {
    const body = await calendar();
    expect(body.published).toBe(true);
    expect(body.weekly.map((slot) => slot.title).sort()).toEqual([
      "Actividad del año",
      "Culto fijo",
    ]);
    expect(body.events.map((event) => event.title)).toEqual([
      "Evento externo",
      "Cena",
      "Evento cancelado",
    ]);
  });

  test("an internal, paused, draft or other-year event is never there", async () => {
    const body = await calendar();
    const titles = body.events.map((event) => event.title);
    for (const hidden of ["interno", "pausado", "borrador", "de otro año"]) {
      expect(titles).not.toContain(`Evento ${hidden}`);
    }
    const uids = body.events.map((event) => event.uid);
    expect(uids).not.toContain(eventIds.interno);
  });

  test("an event carries its stable uid, sequence, last modification, place and ministry", async () => {
    const body = await calendar();
    const dinner = body.events.find((event) => event.uid === eventIds.publico);
    expect(dinner).toMatchObject({
      uid: eventIds.publico,
      sequence: 3,
      lastModified: "2026-01-02T03:04:05.000Z",
      description: "Una cena",
      startDate: `${year}-06-06`,
      startTime: "20:00",
      endTime: "22:00",
      place: { name: "Templo", address: "Calle Falsa 123" },
      ministries: ["Nombre jovenes"],
      color: "obra-red",
      linkUrl: "https://example.org/cena",
      status: "scheduled",
    });
    const cancelled = body.events.find((event) => event.status === "cancelled");
    expect(cancelled).toMatchObject({ allDay: true, uid: eventIds.cancelado });
    const external = body.events.find(
      (event) => event.title === "Evento externo",
    );
    expect(external?.place).toEqual({ name: "Plaza Central" });
    expect(cancelled?.place).toBe("tbc");
  });

  test("the language falls back to the default one text by text", async () => {
    const body = await calendar("?locale=en");
    const dinner = body.events.find((event) => event.uid === eventIds.publico);
    expect(dinner?.title).toBe("Dinner");
    // No English description: the Spanish one is served.
    expect(dinner?.description).toBeUndefined();
    expect(dinner?.place).toMatchObject({ name: "Sanctuary" });
    expect(body.ministries).toEqual([
      { name: "Nombre youth", slug: "youth", color: "obra-red" },
    ]);
  });

  test("lists the weekly slots with place, ministry, color and worship kind, and the exceptions", async () => {
    const body = await calendar();
    const fixed = body.weekly.find((slot) => slot.title === "Culto fijo");
    expect(fixed).toEqual({
      weekday: SUNDAY,
      start: "11:15",
      end: "13:00",
      title: "Culto fijo",
      place: { name: "Templo", address: "Calle Falsa 123" },
      ministries: ["Nombre jovenes"],
      color: "obra-red",
      serviceKind: "worship",
    });
    expect(body.exceptions).toEqual([
      { date: `${year}-12-25`, message: "Sin reunión", noMeeting: true },
    ]);
  });

  test("the published calendar can be cached and a bad year is a 400", async () => {
    const res = await call("GET", `/public/v1/${world.slug}/calendar`, {
      headers: { Authorization: `Bearer ${world.key}` },
    });
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=60");
    const bad = await call(
      "GET",
      `/public/v1/${world.slug}/calendar?year=1999`,
      { headers: { Authorization: `Bearer ${world.key}` } },
    );
    expect(bad.status).toBe(400);
    const noKey = await call("GET", `/public/v1/${world.slug}/calendar`);
    expect(noKey.status).toBe(401);
  });
});
