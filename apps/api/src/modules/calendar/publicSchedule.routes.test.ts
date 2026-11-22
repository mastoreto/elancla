import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type PublicMinistryDto,
  type PublicSiteSettingsDto,
  publicMinistryDto,
  publicSiteSettingsDto,
} from "@ancla/contracts";
import { db, type ServiceKind } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createMinistryWorld,
  type MinistryWorld,
} from "../../../test/support/ministryWorld";
import {
  addDays,
  localDateIn,
  parseDateOnly,
  weekdayOf,
  yearOf,
} from "./domain";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const TIMEZONE = "America/Montevideo";
const SUNDAY = 0;

let world: MinistryWorld;
let today = "";
let regularSetId = "";

beforeAll(async () => {
  world = await createMinistryWorld(fixtures);
  today = localDateIn(TIMEZONE, new Date());
  await db.siteSettings.create({
    data: {
      organizationId: world.organizationId,
      name: "Iglesia de prueba",
      url: "https://example.org",
    },
  });
  regularSetId = (await createSet({ isDefault: true, name: "Habitual" })).id;
  await createActivity(regularSetId, {
    title: "Culto",
    weekday: SUNDAY,
    start: "11:15",
    end: "13:00",
    serviceKind: "WORSHIP",
  });
  await createActivity(regularSetId, {
    title: "Escuela bíblica",
    weekday: SUNDAY,
    start: "10:00",
    serviceKind: "BIBLE_SCHOOL",
  });
});

afterAll(async () => {
  await world.cleanup();
  await fixtures.cleanup();
});

async function createSet(options: {
  name: string;
  isDefault?: boolean;
  forcedActive?: boolean;
  validFrom?: string;
  validTo?: string;
}) {
  return db.scheduleSet.create({
    data: {
      organizationId: world.organizationId,
      isDefault: options.isDefault ?? false,
      forcedActive: options.forcedActive ?? false,
      validFrom: options.validFrom ? parseDateOnly(options.validFrom) : null,
      validTo: options.validTo ? parseDateOnly(options.validTo) : null,
      translations: { create: [{ locale: "es", name: options.name }] },
    },
  });
}

async function createActivity(
  scheduleSetId: string,
  options: {
    title: string;
    weekday: number;
    start: string;
    end?: string;
    serviceKind?: ServiceKind;
    isPublic?: boolean;
    year?: number;
    ministryId?: string;
  },
) {
  return db.recurringActivity.create({
    data: {
      organizationId: world.organizationId,
      scheduleSetId,
      weekday: options.weekday,
      start: options.start,
      end: options.end ?? null,
      serviceKind: options.serviceKind ?? null,
      isPublic: options.isPublic ?? true,
      isFixed: options.year === undefined,
      year: options.year ?? null,
      translations: { create: [{ locale: "es", title: options.title }] },
      ministries: options.ministryId
        ? { create: [{ ministryId: options.ministryId }] }
        : undefined,
    },
  });
}

async function settings(): Promise<PublicSiteSettingsDto> {
  const res = await call("GET", `/public/v1/${world.slug}/settings`, {
    headers: { Authorization: `Bearer ${world.key}` },
  });
  expect(res.status).toBe(200);
  return publicSiteSettingsDto.parse(await res.json());
}

async function ministry(slug: string): Promise<PublicMinistryDto> {
  const res = await call("GET", `/public/v1/${world.slug}/ministries/${slug}`, {
    headers: { Authorization: `Bearer ${world.key}` },
  });
  expect(res.status).toBe(200);
  return publicMinistryDto.parse(await res.json());
}

const startsOf = (times: PublicSiteSettingsDto["serviceTimes"]): string[] =>
  times.map((time) => time.start);

describe("public settings: timezone and derived service times", () => {
  test("carries the church time zone and the regular worship times", async () => {
    const body = await settings();
    expect(body.timezone).toBe(TIMEZONE);
    expect(body.serviceTimes).toEqual([
      { kind: "bibleSchool", weekday: SUNDAY, start: "10:00", end: null },
      { kind: "worship", weekday: SUNDAY, start: "11:15", end: "13:00" },
    ]);
    expect("id" in body).toBe(false);
  });

  test("a summer set in force today replaces the regular hours", async () => {
    const summer = await createSet({
      name: "Verano",
      validFrom: addDays(today, -1),
      validTo: addDays(today, 30),
    });
    await createActivity(summer.id, {
      title: "Culto de verano",
      weekday: SUNDAY,
      start: "09:30",
      end: "11:00",
      serviceKind: "WORSHIP",
    });
    const body = await settings();
    expect(body.serviceTimes).toEqual([
      { kind: "worship", weekday: SUNDAY, start: "09:30", end: "11:00" },
    ]);
    await db.scheduleSet.delete({ where: { id: summer.id } });
    expect(startsOf((await settings()).serviceTimes)).toEqual([
      "10:00",
      "11:15",
    ]);
  });

  test("the manual switch wins over the regular set", async () => {
    const forced = await createSet({ name: "Especial", forcedActive: true });
    await createActivity(forced.id, {
      title: "Culto especial",
      weekday: SUNDAY,
      start: "20:00",
      serviceKind: "WORSHIP",
    });
    expect(startsOf((await settings()).serviceTimes)).toEqual(["20:00"]);
    await db.scheduleSet.delete({ where: { id: forced.id } });
  });

  test("an exception with no meeting empties that weekday for the week", async () => {
    const exception = await db.scheduleException.create({
      data: {
        organizationId: world.organizationId,
        date: parseDateOnly(today),
      },
    });
    const todayWeekday = weekdayOf(today);
    // Put a worship on today's weekday so the exception has something to hide.
    const activity = await createActivity(regularSetId, {
      title: "Hoy",
      weekday: todayWeekday,
      start: "07:00",
      serviceKind: "WORSHIP",
    });
    const hidden = (await settings()).serviceTimes.filter(
      (time) => time.weekday === todayWeekday && time.start === "07:00",
    );
    expect(hidden).toEqual([]);
    await db.scheduleException.delete({ where: { id: exception.id } });
    const shown = (await settings()).serviceTimes.filter(
      (time) => time.weekday === todayWeekday && time.start === "07:00",
    );
    expect(shown).toHaveLength(1);
    await db.recurringActivity.delete({ where: { id: activity.id } });
  });

  test("an internal activity never appears", async () => {
    const internal = await createActivity(regularSetId, {
      title: "Interna",
      weekday: SUNDAY,
      start: "08:00",
      serviceKind: "WORSHIP",
      isPublic: false,
    });
    expect(startsOf((await settings()).serviceTimes)).not.toContain("08:00");
    await db.recurringActivity.delete({ where: { id: internal.id } });
  });

  test("an activity of the year needs that year published", async () => {
    const year = yearOf(today);
    const ofYear = await createActivity(regularSetId, {
      title: "Del año",
      weekday: SUNDAY,
      start: "17:00",
      serviceKind: "WORSHIP",
      year,
    });
    expect(startsOf((await settings()).serviceTimes)).not.toContain("17:00");

    const calendarYear = await db.calendarYear.create({
      data: { organizationId: world.organizationId, year, status: "DRAFT" },
    });
    expect(startsOf((await settings()).serviceTimes)).not.toContain("17:00");

    await db.calendarYear.update({
      where: { id: calendarYear.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    expect(startsOf((await settings()).serviceTimes)).toContain("17:00");

    await db.calendarYear.delete({ where: { id: calendarYear.id } });
    await db.recurringActivity.delete({ where: { id: ofYear.id } });
  });
});

describe("public ministry: schedule", () => {
  test("a linked public activity shows; an internal one and one of an unpublished year do not", async () => {
    const ministryId = await world.createMinistry({
      slugs: { es: "jovenes-cal" },
    });
    await createActivity(regularSetId, {
      title: "Reunión de jóvenes",
      weekday: 5,
      start: "20:00",
      end: "22:00",
      ministryId,
    });
    await createActivity(regularSetId, {
      title: "Interna",
      weekday: 2,
      start: "19:00",
      isPublic: false,
      ministryId,
    });
    await createActivity(regularSetId, {
      title: "De otro año",
      weekday: 3,
      start: "18:00",
      year: yearOf(today),
      ministryId,
    });
    await createActivity(regularSetId, {
      title: "Sin ministerio",
      weekday: 4,
      start: "17:00",
    });

    const body = await ministry("jovenes-cal");
    expect(body.schedule).toEqual([
      { weekday: 5, start: "20:00", end: "22:00" },
    ]);
  });

  test("a ministry without activities has an empty schedule", async () => {
    await world.createMinistry({ slugs: { es: "sin-horario" } });
    expect((await ministry("sin-horario")).schedule).toEqual([]);
  });
});
